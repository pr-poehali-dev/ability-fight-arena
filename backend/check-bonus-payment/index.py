import json
import os
import urllib.request
import base64


def handler(event: dict, context) -> dict:
    """Проверяет статус платежа ЮKassa за бонус за победу по payment_id."""
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400',
            },
            'body': ''
        }

    shop_id = os.environ['YUKASSA_SHOP_ID']
    secret_key = os.environ['YUKASSA_SECRET_KEY']

    params = event.get('queryStringParameters') or {}
    payment_id = params.get('payment_id', '')

    if not payment_id:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'payment_id is required'})
        }

    credentials = base64.b64encode(f"{shop_id}:{secret_key}".encode()).decode()

    req = urllib.request.Request(
        f'https://api.yookassa.ru/v3/payments/{payment_id}',
        headers={
            'Authorization': f'Basic {credentials}',
            'Content-Type': 'application/json',
        },
        method='GET'
    )

    with urllib.request.urlopen(req) as resp:
        result = json.loads(resp.read().decode('utf-8'))

    status = result.get('status')
    paid = status == 'succeeded'

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'payment_id': payment_id,
            'status': status,
            'paid': paid
        })
    }
