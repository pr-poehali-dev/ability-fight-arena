import json
import os
import uuid
import urllib.request
import base64


def handler(event: dict, context) -> dict:
    """Создаёт платёж в ЮKassa для покупки бонуса за победу (x2 рейтинг) за 49 рублей."""
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400',
            },
            'body': ''
        }

    shop_id = os.environ['YUKASSA_SHOP_ID']
    secret_key = os.environ['YUKASSA_SECRET_KEY']

    body = json.loads(event.get('body') or '{}')
    return_url = body.get('return_url', 'https://poehali.dev')

    idempotence_key = str(uuid.uuid4())

    payload = {
        "amount": {
            "value": "49.00",
            "currency": "RUB"
        },
        "confirmation": {
            "type": "redirect",
            "return_url": return_url
        },
        "capture": True,
        "description": "Бонус за победу x2 рейтинг — АРЕНА",
        "metadata": {
            "product": "victory_bonus"
        }
    }

    credentials = base64.b64encode(f"{shop_id}:{secret_key}".encode()).decode()
    data = json.dumps(payload).encode('utf-8')

    req = urllib.request.Request(
        'https://api.yookassa.ru/v3/payments',
        data=data,
        headers={
            'Authorization': f'Basic {credentials}',
            'Content-Type': 'application/json',
            'Idempotence-Key': idempotence_key,
        },
        method='POST'
    )

    with urllib.request.urlopen(req) as resp:
        result = json.loads(resp.read().decode('utf-8'))

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'payment_id': result['id'],
            'confirmation_url': result['confirmation']['confirmation_url']
        })
    }
