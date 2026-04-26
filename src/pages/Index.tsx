import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

type Page = "home" | "game" | "profile" | "abilities" | "rating" | "achievements";

const ABILITIES = [
  { id: 0, name: "Мини удар", key: "Z", type: "Атака", damage: 15, cooldown: 1, desc: "Быстрый удар без замаха. Малый урон, почти нет отката", color: "#FF6B6B", icon: "MousePointerClick" },
  { id: 1, name: "Удар молнии", key: "Q", type: "Атака", damage: 45, cooldown: 3, desc: "Наносит мгновенный урон с оглушением на 1 сек", color: "#29B6F6", icon: "Zap" },
  { id: 2, name: "Огненный шар", key: "W", type: "Атака", damage: 70, cooldown: 5, desc: "Область поражения 3м, поджигает врага", color: "#F0B429", icon: "Flame" },
  { id: 3, name: "Щит теней", key: "E", type: "Защита", damage: 0, cooldown: 8, desc: "Поглощает 120 урона в течение 4 сек", color: "#9C27B0", icon: "Shield" },
  { id: 4, name: "Рывок", key: "R", type: "Движение", damage: 20, cooldown: 6, desc: "Телепорт на 5м + урон при приземлении", color: "#4CAF50", icon: "Wind" },
  { id: 5, name: "Разрыв земли", key: "F", type: "Контроль", damage: 35, cooldown: 10, desc: "Замедляет всех врагов в радиусе 5м", color: "#E53935", icon: "Mountain" },
  { id: 6, name: "Исцеление", key: "G", type: "Поддержка", damage: -50, cooldown: 12, desc: "Восстанавливает 50 HP мгновенно", color: "#26C6DA", icon: "Heart" },
];

const PLAYERS_RATING = [
  { rank: 1, name: "ShadowKnight", level: 87, wins: 1420, losses: 231, rating: 4820, streak: 12 },
  { rank: 2, name: "FireStorm", level: 82, wins: 1280, losses: 198, rating: 4650, streak: 8 },
  { rank: 3, name: "IceBreaker", level: 79, wins: 1150, losses: 224, rating: 4410, streak: 5 },
  { rank: 4, name: "ThunderBolt", level: 75, wins: 980, losses: 245, rating: 4180, streak: 3 },
  { rank: 5, name: "DarkViper", level: 71, wins: 870, losses: 280, rating: 3940, streak: 0 },
  { rank: 6, name: "BloodMoon", level: 68, wins: 750, losses: 310, rating: 3720, streak: 7 },
  { rank: 7, name: "StormCaller", level: 65, wins: 620, losses: 298, rating: 3510, streak: 2 },
  { rank: 8, name: "АрхиМаг", level: 61, wins: 540, losses: 287, rating: 3300, streak: 4 },
  { rank: 9, name: "Берсеркер", level: 58, wins: 480, losses: 320, rating: 3100, streak: 1 },
  { rank: 10, name: "Призрак", level: 54, wins: 410, losses: 295, rating: 2950, streak: 6 },
];

const ACHIEVEMENTS = [
  { id: 1, name: "Первая кровь", desc: "Победи в первом поединке", icon: "Sword", done: true, rarity: "Обычное" },
  { id: 2, name: "Ветеран", desc: "Проведи 100 боёв", icon: "Shield", done: true, rarity: "Необычное" },
  { id: 3, name: "Серия побед", desc: "5 побед подряд", icon: "Flame", done: true, rarity: "Редкое" },
  { id: 4, name: "Мастер способностей", desc: "Изучи все 6 способностей", icon: "Zap", done: true, rarity: "Необычное" },
  { id: 5, name: "Чемпион турнира", desc: "Победи в официальном турнире", icon: "Trophy", done: false, rarity: "Эпическое" },
  { id: 6, name: "10 серия", desc: "10 побед без поражений", icon: "Star", done: false, rarity: "Эпическое" },
  { id: 7, name: "Легенда", desc: "Достигни рейтинга 5000", icon: "Crown", done: false, rarity: "Легендарное" },
  { id: 8, name: "Командный игрок", desc: "Победи в 50 командных боях", icon: "Users", done: false, rarity: "Редкое" },
];

const RARITY_COLORS: Record<string, string> = {
  "Обычное": "#888",
  "Необычное": "#4CAF50",
  "Редкое": "#29B6F6",
  "Эпическое": "#9C27B0",
  "Легендарное": "#F0B429",
};

export default function Index() {
  const [page, setPage] = useState<Page>("home");
  const [gameState, setGameState] = useState<"lobby" | "matchmaking" | "battle" | "result">("lobby");
  const [playerHP, setPlayerHP] = useState(100);
  const [enemyHP, setEnemyHP] = useState(100);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [cooldowns, setCooldowns] = useState<Record<number, number>>({});
  const [matchTime, setMatchTime] = useState(0);
  const [winner, setWinner] = useState<"player" | "enemy" | null>(null);
  const [lastHit, setLastHit] = useState<"player" | "enemy" | null>(null);
  const [selectedMode, setSelectedMode] = useState<"1v1" | "team" | "tournament">("1v1");
  const [megaShieldActive, setMegaShieldActive] = useState(false);
  const [megaShieldTime, setMegaShieldTime] = useState(0);
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [donateLoading, setDonateLoading] = useState(false);
  const [donateError, setDonateError] = useState<string | null>(null);

  const CREATE_PAYMENT_URL = "https://functions.poehali.dev/6881dfa1-7ce2-4aa1-a09d-57b4d8d77ec7";
  const CHECK_PAYMENT_URL = "https://functions.poehali.dev/98fed9d5-f6df-478e-b1d9-aef40a67323e";

  const handleBuyShield = async () => {
    setDonateLoading(true);
    setDonateError(null);
    try {
      const returnUrl = window.location.href + (window.location.href.includes('?') ? '&' : '?') + 'shield_paid=1';
      const res = await fetch(CREATE_PAYMENT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ return_url: returnUrl }),
      });
      const data = await res.json();
      if (data.confirmation_url) {
        localStorage.setItem('arena_pending_payment', data.payment_id);
        window.location.href = data.confirmation_url;
      } else {
        setDonateError('Не удалось создать платёж. Попробуй ещё раз.');
      }
    } catch {
      setDonateError('Ошибка соединения. Попробуй ещё раз.');
    } finally {
      setDonateLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentId = localStorage.getItem('arena_pending_payment');
    if (params.get('shield_paid') === '1' && paymentId) {
      fetch(`${CHECK_PAYMENT_URL}?payment_id=${paymentId}`)
        .then(r => r.json())
        .then(data => {
          if (data.paid) {
            localStorage.removeItem('arena_pending_payment');
            setMegaShieldActive(true);
            setMegaShieldTime(5);
            setShowDonateModal(false);
            setBattleLog(log => ["🛡️ МЕГА ЩИТ активирован на 5 секунд!", ...log.slice(0, 5)]);
          }
        })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (gameState === "matchmaking") {
      const t = setTimeout(() => {
        setGameState("battle");
        setBattleLog(["⚔️ Бой начался! Используй способности для победы"]);
        setPlayerHP(100);
        setEnemyHP(100);
        setCooldowns({});
        setMatchTime(0);
        setWinner(null);
      }, 2500);
      return () => clearTimeout(t);
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState !== "battle") return;
    const interval = setInterval(() => {
      setMatchTime(t => t + 1);
      setMegaShieldTime(t => {
        if (t > 0) {
          if (t === 1) setMegaShieldActive(false);
          return Math.max(0, t - 1);
        }
        return 0;
      });
      if (Math.random() < 0.35) {
        const dmg = Math.floor(Math.random() * 18) + 8;
        setMegaShieldActive(shield => {
          if (shield) {
            setBattleLog(log => [`🛡️ МЕГА ЩИТ поглотил ${dmg} урона!`, ...log.slice(0, 5)]);
            return shield;
          }
          setPlayerHP(hp => {
            const next = Math.max(0, hp - dmg);
            if (next <= 0) {
              setWinner("enemy");
              setGameState("result");
            }
            return next;
          });
          setBattleLog(log => [`💥 Враг атаковал — ${dmg} урона!`, ...log.slice(0, 5)]);
          setLastHit("player");
          setTimeout(() => setLastHit(null), 300);
          return shield;
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState]);

  useEffect(() => {
    if (Object.keys(cooldowns).length === 0) return;
    const interval = setInterval(() => {
      setCooldowns(cd => {
        const next = { ...cd };
        let changed = false;
        Object.keys(next).forEach(k => {
          if (next[+k] > 0) { next[+k]--; changed = true; }
          if (next[+k] === 0) delete next[+k];
        });
        return changed ? next : cd;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldowns]);

  const activateAbility = (ability: typeof ABILITIES[0]) => {
    if (gameState !== "battle") return;
    if (cooldowns[ability.id]) return;

    if (ability.type === "Поддержка") {
      setPlayerHP(hp => Math.min(100, hp + 50));
      setBattleLog(log => [`💚 ${ability.name}: +50 HP`, ...log.slice(0, 5)]);
    } else if (ability.type === "Защита") {
      setBattleLog(log => [`🛡️ ${ability.name}: Щит активирован!`, ...log.slice(0, 5)]);
    } else {
      const dmg = Math.floor(ability.damage * (0.8 + Math.random() * 0.4));
      setEnemyHP(hp => {
        const next = Math.max(0, hp - dmg);
        if (next <= 0) {
          setWinner("player");
          setGameState("result");
        }
        return next;
      });
      setBattleLog(log => [`⚡ ${ability.name}: ${dmg} урона врагу!`, ...log.slice(0, 5)]);
      setLastHit("enemy");
      setTimeout(() => setLastHit(null), 300);
    }
    setCooldowns(cd => ({ ...cd, [ability.id]: ability.cooldown }));
  };

  const nav = [
    { id: "home", label: "Главная", icon: "Home" },
    { id: "game", label: "Игра", icon: "Sword" },
    { id: "abilities", label: "Способности", icon: "Zap" },
    { id: "rating", label: "Рейтинг", icon: "Trophy" },
    { id: "profile", label: "Профиль", icon: "User" },
    { id: "achievements", label: "Достижения", icon: "Star" },
  ] as const;

  return (
    <div className="min-h-screen bg-surface grid-bg flex flex-col">
      {/* Header */}
      <header className="border-b border-subtle bg-surface-2 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-primary flex items-center justify-center" style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}>
              <span className="text-xs font-display font-bold text-black">A</span>
            </div>
            <span className="font-display text-xl font-bold text-gradient-gold tracking-widest">АРЕНА</span>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            {nav.map(n => (
              <button
                key={n.id}
                onClick={() => { setPage(n.id as Page); if (n.id === "game") setGameState("lobby"); }}
                className={`px-3 py-2 font-display text-xs tracking-wider uppercase transition-all ${
                  page === n.id
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {n.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <div className="rank-badge border-primary/50 text-primary text-xs px-2 py-1">
              ⭐ 2847
            </div>
          </div>
        </div>
        {/* Mobile nav */}
        <div className="md:hidden flex border-t border-subtle">
          {nav.map(n => (
            <button
              key={n.id}
              onClick={() => { setPage(n.id as Page); if (n.id === "game") setGameState("lobby"); }}
              className={`flex-1 flex flex-col items-center py-2 gap-0.5 transition-all ${
                page === n.id ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon name={n.icon} size={16} />
              <span className="text-[9px] font-display uppercase tracking-wider">{n.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">

        {/* ===== HOME ===== */}
        {page === "home" && (
          <div className="animate-fade-in">
            <div className="relative py-16 text-center mb-12 overflow-hidden" style={{ background: "linear-gradient(180deg, rgba(229,57,53,0.08) 0%, transparent 100%)" }}>
              <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                <div className="w-[600px] h-[600px] rounded-full border border-red-600" />
              </div>
              <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(229,57,53,0.12) 0%, transparent 70%)" }} />
              <p className="font-display tracking-[0.4em] text-sm uppercase mb-4 animate-slide-up stagger-1" style={{ color: "#e53935" }}>
                Онлайн Битвы
              </p>
              <h1 className="font-display text-7xl md:text-9xl font-bold mb-6 animate-slide-up stagger-2" style={{ background: "linear-gradient(135deg, #e53935 0%, #ff6b6b 50%, #c62828 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                АРЕНА
              </h1>
              <p className="text-muted-foreground font-body text-lg max-w-md mx-auto mb-10 animate-slide-up stagger-3">
                1v1 поединки · Командные бои · Турниры с рейтингом
              </p>
              <div className="flex gap-3 justify-center flex-wrap animate-slide-up stagger-4">
                <button
                  onClick={() => { setPage("game"); setGameState("lobby"); }}
                  className="btn-battle text-white px-8 py-3 text-sm hover:brightness-110"
                  style={{ background: "#e53935", boxShadow: "0 0 20px rgba(229,57,53,0.4), 0 0 40px rgba(229,57,53,0.15)" }}
                >
                  В бой
                </button>
                <button
                  onClick={() => setPage("rating")}
                  className="btn-battle border text-foreground px-8 py-3 text-sm hover:brightness-110"
                  style={{ borderColor: "rgba(229,57,53,0.5)" }}
                >
                  Рейтинг
                </button>
                <button
                  onClick={() => setShowDonateModal(true)}
                  className="btn-battle text-white px-8 py-3 text-sm hover:brightness-110"
                  style={{ background: "linear-gradient(135deg, #880e4f, #c62828)", boxShadow: "0 0 20px rgba(136,14,79,0.4)" }}
                >
                  🛡️ Мега щит — 49₽
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border mb-12">
              {[
                { val: "12,847", label: "Игроков онлайн", color: "#4CAF50" },
                { val: "2,341", label: "Боёв сейчас", color: "#F0B429" },
                { val: "847", label: "Турниров сыграно", color: "#29B6F6" },
                { val: "148K", label: "Всего сражений", color: "#E53935" },
              ].map((s, i) => (
                <div key={i} className="bg-surface-2 p-6 text-center border border-subtle">
                  <div className="font-display text-3xl font-bold mb-1" style={{ color: s.color }}>{s.val}</div>
                  <div className="text-muted-foreground text-xs font-body uppercase tracking-wider">{s.label}</div>
                </div>
              ))}
            </div>

            <h2 className="font-display text-2xl font-bold mb-6 uppercase tracking-wider">Режимы игры</h2>
            <div className="grid md:grid-cols-3 gap-4 mb-12">
              {[
                { title: "1v1 Поединок", icon: "Sword", desc: "Классический бой один на один. Выбери способности и докажи превосходство.", tag: "Быстрый матч", color: "#F0B429" },
                { title: "Командный бой", icon: "Users", desc: "3 vs 3. Координация и тактика решают исход сражения.", tag: "5–15 мин", color: "#29B6F6" },
                { title: "Турнир", icon: "Trophy", desc: "Сетка на 16 игроков. Рейтинговые очки и особые награды для победителей.", tag: "Раз в неделю", color: "#E53935" },
              ].map((m, i) => (
                <div
                  key={i}
                  onClick={() => { setPage("game"); setGameState("lobby"); }}
                  className="bg-surface-2 border border-subtle p-6 cursor-pointer group hover:border-primary/30 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 flex items-center justify-center border border-subtle group-hover:border-primary/40 transition-all">
                      <Icon name={m.icon} size={20} style={{ color: m.color }} />
                    </div>
                    <span className="text-[10px] font-display tracking-wider uppercase px-2 py-1 border" style={{ borderColor: m.color + "40", color: m.color }}>
                      {m.tag}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-bold mb-2 uppercase tracking-wide">{m.title}</h3>
                  <p className="text-muted-foreground text-sm font-body leading-relaxed">{m.desc}</p>
                </div>
              ))}
            </div>

            <h2 className="font-display text-2xl font-bold mb-6 uppercase tracking-wider">Последние бои</h2>
            <div className="space-y-2">
              {[
                { p1: "ShadowKnight", p2: "FireStorm", result: "2:0", time: "2 мин назад", mode: "1v1" },
                { p1: "IceBreaker", p2: "ThunderBolt", result: "2:1", time: "5 мин назад", mode: "1v1" },
                { p1: "Команда Альфа", p2: "Команда Бета", result: "3:1", time: "12 мин назад", mode: "Командный" },
              ].map((b, i) => (
                <div key={i} className="bg-surface-2 border border-subtle px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="text-[10px] font-display tracking-wider text-muted-foreground uppercase border border-subtle px-2 py-0.5">{b.mode}</span>
                    <span className="font-body text-sm">{b.p1}</span>
                    <span className="font-display text-primary font-bold">{b.result}</span>
                    <span className="font-body text-sm">{b.p2}</span>
                  </div>
                  <span className="text-muted-foreground text-xs">{b.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== GAME ===== */}
        {page === "game" && (
          <div className="animate-fade-in">
            {gameState === "lobby" && (
              <div>
                <h1 className="font-display text-4xl font-bold uppercase tracking-wider mb-8">Выбор режима</h1>
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                  {(["1v1", "team", "tournament"] as const).map(mode => (
                    <button
                      key={mode}
                      onClick={() => setSelectedMode(mode)}
                      className={`p-6 border transition-all text-left ${
                        selectedMode === mode
                          ? "border-primary bg-primary/5 glow-gold"
                          : "border-subtle bg-surface-2 hover:border-primary/30"
                      }`}
                    >
                      <div className="font-display text-xl font-bold uppercase mb-2">
                        {mode === "1v1" ? "1v1 Поединок" : mode === "team" ? "Командный бой" : "Турнир"}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        {mode === "1v1" ? "Быстрый матч, 2–5 мин" : mode === "team" ? "3 vs 3, 10–15 мин" : "16 игроков, ~2 часа"}
                      </div>
                      {selectedMode === mode && (
                        <div className="mt-3 text-primary text-xs font-display tracking-wider uppercase">✓ Выбран</div>
                      )}
                    </button>
                  ))}
                </div>

                <div className="bg-surface-2 border border-subtle p-6 mb-6">
                  <h3 className="font-display text-lg uppercase tracking-wider mb-4">Твои способности (5 активных)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {ABILITIES.slice(0, 5).map(a => (
                      <div key={a.id} className="border border-subtle p-3 text-center">
                        <div className="font-display text-2xl font-bold mb-1" style={{ color: a.color }}>{a.key}</div>
                        <div className="text-xs font-body text-muted-foreground">{a.name}</div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setPage("abilities")} className="mt-3 text-xs text-primary font-display tracking-wider uppercase hover:underline">
                    Изменить набор →
                  </button>
                </div>

                <button
                  onClick={() => setGameState("matchmaking")}
                  className="btn-battle bg-primary text-primary-foreground w-full py-4 text-lg glow-gold"
                >
                  Найти противника
                </button>
              </div>
            )}

            {gameState === "matchmaking" && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 border-2 border-primary rounded-full flex items-center justify-center mb-8 animate-pulse-glow">
                  <div className="w-12 h-12 border-t-2 border-primary rounded-full animate-spin" />
                </div>
                <h2 className="font-display text-3xl font-bold uppercase tracking-wider mb-3">Поиск противника</h2>
                <p className="text-muted-foreground font-body">Подбираем игрока твоего уровня...</p>
                <div className="mt-6 flex gap-4 text-sm text-muted-foreground">
                  <span className="font-display tracking-wider">РЕЖИМ: {selectedMode.toUpperCase()}</span>
                  <span>·</span>
                  <span className="font-display tracking-wider">РЕЙТИНГ: ~2847</span>
                </div>
              </div>
            )}

            {gameState === "battle" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="font-display text-sm text-muted-foreground uppercase tracking-wider">
                    Раунд 1 · {Math.floor(matchTime / 60)}:{String(matchTime % 60).padStart(2, "0")}
                  </div>
                  <div className="font-display text-xs text-primary tracking-wider uppercase border border-primary/30 px-3 py-1">
                    {selectedMode === "1v1" ? "1v1 ПОЕДИНОК" : "КОМАНДНЫЙ БОЙ"}
                  </div>
                </div>

                <div className="bg-surface-2 border border-subtle p-6 mb-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`flex-1 ${lastHit === "player" ? "animate-strike" : ""}`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-display font-bold uppercase tracking-wide">ТЫ</span>
                        <span className="font-display text-primary font-bold">{playerHP} HP</span>
                      </div>
                      <div className="hp-bar">
                        <div className="hp-fill" style={{ width: `${playerHP}%`, background: "linear-gradient(90deg, #E53935, #F0B429)" }} />
                      </div>
                    </div>
                    <div className="font-display text-2xl font-bold text-muted-foreground px-2">VS</div>
                    <div className={`flex-1 ${lastHit === "enemy" ? "animate-strike" : ""}`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-display font-bold uppercase tracking-wide">DarkViper</span>
                        <span className="font-display text-accent font-bold">{enemyHP} HP</span>
                      </div>
                      <div className="hp-bar">
                        <div className="hp-fill" style={{ width: `${enemyHP}%`, background: "linear-gradient(90deg, #E53935, #E53935)" }} />
                      </div>
                    </div>
                  </div>

                  <div className="relative h-32 bg-surface border border-subtle overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 grid-bg opacity-50" />
                    <div className="relative flex items-center justify-between w-full px-12">
                      <div className="w-12 h-12 border-2 border-primary flex items-center justify-center font-display font-bold text-primary animate-float" style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}>
                        Я
                      </div>
                      <div className="text-muted-foreground font-display text-xs tracking-widest uppercase">— АРЕНА —</div>
                      <div className="w-12 h-12 border-2 border-accent flex items-center justify-center font-display font-bold text-accent animate-float" style={{ animationDelay: "1.5s", clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}>
                        В
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-2 border border-subtle p-4 mb-4 h-28 overflow-hidden">
                  {battleLog.map((log, i) => (
                    <div key={i} className="text-sm font-body text-muted-foreground mb-1" style={{ opacity: 1 - i * 0.18 }}>
                      {log}
                    </div>
                  ))}
                </div>

                {megaShieldActive && (
                  <div className="mb-3 px-4 py-2 border text-center font-display text-sm tracking-wider uppercase animate-pulse" style={{ borderColor: "#c62828", background: "rgba(198,40,40,0.15)", color: "#ff6b6b" }}>
                    🛡️ МЕГА ЩИТ АКТИВЕН — {megaShieldTime} СЕК
                  </div>
                )}

                <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
                  <button
                    onClick={() => setShowDonateModal(true)}
                    className="border p-3 text-center transition-all col-span-1"
                    style={{ borderColor: "#c62828", background: "rgba(198,40,40,0.1)" }}
                  >
                    <div className="text-lg mb-1">🛡️</div>
                    <div className="text-[9px] font-body leading-tight" style={{ color: "#ff6b6b" }}>Мега щит</div>
                    <div className="text-[9px] font-display mt-1" style={{ color: "#e53935" }}>49 ₽</div>
                  </button>
                  {ABILITIES.map(a => {
                    const cd = cooldowns[a.id] || 0;
                    return (
                      <button
                        key={a.id}
                        onClick={() => activateAbility(a)}
                        disabled={!!cd}
                        className={`relative border p-3 text-center transition-all ${
                          cd ? "border-subtle opacity-40 cursor-not-allowed" : "border-subtle hover:border-primary/50 cursor-pointer"
                        }`}
                        style={!cd ? { borderColor: a.color + "40" } : {}}
                      >
                        {cd > 0 && (
                          <div className="absolute inset-0 flex items-center justify-center bg-surface/80 font-display text-xl font-bold text-muted-foreground">
                            {cd}
                          </div>
                        )}
                        <div className="font-display text-lg font-bold mb-1" style={{ color: a.color }}>{a.key}</div>
                        <div className="text-[9px] font-body text-muted-foreground leading-tight">{a.name}</div>
                        <div className="text-[9px] font-display mt-1" style={{ color: a.color }}>
                          {a.type === "Поддержка" ? "+50 HP" : a.type === "Защита" ? "ЩИТ" : `${a.damage} ДМГ`}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {gameState === "result" && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className={`font-display text-8xl font-bold mb-4 ${winner === "player" ? "text-gradient-gold" : "neon-red"}`}>
                  {winner === "player" ? "ПОБЕДА" : "ПОРАЖЕНИЕ"}
                </div>
                <p className="text-muted-foreground font-body mb-8">
                  {winner === "player"
                    ? "Отличная игра! +120 очков рейтинга"
                    : "Не сдавайся! Следующий бой будет за тобой"}
                </p>
                <div className="flex gap-6 mb-8 font-body text-sm">
                  <div className="text-center">
                    <div className="font-display text-2xl font-bold text-foreground">{100 - playerHP}</div>
                    <div className="text-muted-foreground text-xs">Получено урона</div>
                  </div>
                  <div className="w-px bg-border" />
                  <div className="text-center">
                    <div className="font-display text-2xl font-bold text-foreground">{100 - enemyHP}</div>
                    <div className="text-muted-foreground text-xs">Нанесено урона</div>
                  </div>
                  <div className="w-px bg-border" />
                  <div className="text-center">
                    <div className="font-display text-2xl font-bold text-foreground">{Math.floor(matchTime / 60)}:{String(matchTime % 60).padStart(2, "0")}</div>
                    <div className="text-muted-foreground text-xs">Время боя</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setGameState("matchmaking")}
                    className="btn-battle bg-primary text-primary-foreground px-8 py-3 text-sm glow-gold"
                  >
                    Реванш
                  </button>
                  <button
                    onClick={() => setGameState("lobby")}
                    className="btn-battle border border-subtle text-foreground px-8 py-3 text-sm hover:border-primary/30"
                  >
                    В лобби
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== ABILITIES ===== */}
        {page === "abilities" && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-8">
              <h1 className="font-display text-4xl font-bold uppercase tracking-wider">Способности</h1>
              <span className="text-muted-foreground font-body text-sm">7 доступно</span>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {ABILITIES.map((a, i) => (
                <div
                  key={a.id}
                  className="ability-card bg-surface-2 border border-subtle p-5 animate-slide-up"
                  style={{ animationDelay: `${i * 0.08}s`, opacity: 0, borderLeft: `3px solid ${a.color}` }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 flex items-center justify-center flex-shrink-0 font-display text-xl font-bold"
                      style={{ background: a.color + "15", color: a.color, border: `1px solid ${a.color}40` }}
                    >
                      {a.key}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-display text-lg font-bold uppercase tracking-wide">{a.name}</h3>
                        <span className="text-[10px] font-display px-2 py-0.5 border tracking-wider uppercase"
                          style={{ color: a.color, borderColor: a.color + "40" }}>
                          {a.type}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm font-body mb-3">{a.desc}</p>
                      <div className="flex gap-4 text-xs font-body">
                        <span>
                          {a.type === "Поддержка" ? (
                            <span className="text-green-400">+50 HP</span>
                          ) : a.type === "Защита" ? (
                            <span style={{ color: a.color }}>120 блок</span>
                          ) : (
                            <span style={{ color: a.color }}>{a.damage} урона</span>
                          )}
                        </span>
                        <span className="text-muted-foreground">· КД: {a.cooldown}с</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 bg-surface-2 border border-primary/20 p-4">
              <p className="text-muted-foreground text-sm font-body">
                <span className="text-primary font-display uppercase tracking-wider">Подсказка</span> — В бою нажимай{" "}
                <span className="text-foreground font-display">Z Q W E R F G</span> для быстрого применения способностей.{" "}
                <span style={{ color: "#FF6B6B" }} className="font-display">Z</span> — мини удар, всегда под рукой!
              </p>
            </div>
          </div>
        )}

        {/* ===== RATING ===== */}
        {page === "rating" && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-8">
              <h1 className="font-display text-4xl font-bold uppercase tracking-wider">Рейтинг</h1>
              <div className="text-muted-foreground text-sm font-body">Сезон 4 · Обновлено только что</div>
            </div>

            <div className="grid grid-cols-3 gap-px mb-8 bg-border">
              {PLAYERS_RATING.slice(0, 3).map((p, i) => (
                <div key={p.rank} className={`bg-surface-2 p-6 text-center ${i === 0 ? "border-t-2 border-primary" : ""}`}>
                  <div className="font-display text-4xl font-bold mb-2" style={{ color: i === 0 ? "#F0B429" : i === 1 ? "#C0C0C0" : "#CD7F32" }}>
                    {i === 0 ? "👑" : `#${p.rank}`}
                  </div>
                  <div className="font-display text-lg font-bold uppercase mb-1">{p.name}</div>
                  <div className="font-display text-2xl" style={{ color: i === 0 ? "#F0B429" : i === 1 ? "#C0C0C0" : "#CD7F32" }}>
                    {p.rating.toLocaleString()}
                  </div>
                  <div className="text-muted-foreground text-xs font-body mt-1">{p.wins}W · {p.losses}L</div>
                </div>
              ))}
            </div>

            <div className="border border-subtle">
              <div className="grid grid-cols-6 px-4 py-2 border-b border-subtle bg-surface-2">
                {["#", "Игрок", "Рейтинг", "W/L", "Сер.", "Ур."].map(h => (
                  <div key={h} className="text-[10px] font-display uppercase tracking-wider text-muted-foreground">{h}</div>
                ))}
              </div>
              {PLAYERS_RATING.map((p, i) => (
                <div
                  key={p.rank}
                  className={`grid grid-cols-6 px-4 py-3 border-b border-subtle last:border-0 transition-colors hover:bg-surface-2 ${i < 3 ? "bg-surface-2/50" : ""}`}
                >
                  <div className="font-display font-bold" style={{ color: i < 3 ? (i === 0 ? "#F0B429" : i === 1 ? "#C0C0C0" : "#CD7F32") : "#555" }}>
                    {p.rank}
                  </div>
                  <div className="font-body text-sm font-medium">{p.name}</div>
                  <div className="font-display font-bold text-primary text-sm">{p.rating.toLocaleString()}</div>
                  <div className="font-body text-xs text-muted-foreground">
                    <span className="text-green-400">{p.wins}</span>/<span className="text-red-400">{p.losses}</span>
                  </div>
                  <div className="font-display text-sm">
                    {p.streak > 0 ? <span className="text-primary">🔥{p.streak}</span> : <span className="text-muted-foreground">—</span>}
                  </div>
                  <div className="font-display text-sm text-muted-foreground">{p.level}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 bg-surface-2 border border-primary/30 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="font-display font-bold text-primary">#247</span>
                <span className="font-body text-sm font-medium">Ты</span>
              </div>
              <div className="flex items-center gap-6 text-sm font-body">
                <span className="font-display text-primary font-bold">2847</span>
                <span><span className="text-green-400">48</span>/<span className="text-red-400">31</span></span>
                <span className="font-display text-primary">🔥5</span>
                <span className="text-muted-foreground">Ур. 32</span>
              </div>
            </div>
          </div>
        )}

        {/* ===== PROFILE ===== */}
        {page === "profile" && (
          <div className="animate-fade-in">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <div className="bg-surface-2 border border-subtle p-6 text-center mb-4">
                  <div className="w-20 h-20 mx-auto mb-4 border-2 border-primary flex items-center justify-center font-display text-3xl font-bold text-primary animate-pulse-glow" style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}>
                    М
                  </div>
                  <h2 className="font-display text-2xl font-bold uppercase mb-1">Мой Персонаж</h2>
                  <div className="rank-badge border-primary/50 text-primary mx-auto inline-block mb-4">
                    Воин · Уровень 32
                  </div>
                  <div className="space-y-2 text-left">
                    {[
                      { label: "Рейтинг", val: "2847", color: "text-primary" },
                      { label: "Победы", val: "48", color: "text-green-400" },
                      { label: "Поражения", val: "31", color: "text-red-400" },
                      { label: "Серия", val: "🔥 5 побед", color: "text-primary" },
                    ].map((s, i) => (
                      <div key={i} className="flex justify-between text-sm font-body">
                        <span className="text-muted-foreground">{s.label}</span>
                        <span className={`font-display font-bold ${s.color}`}>{s.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => { setPage("game"); setGameState("lobby"); }}
                  className="btn-battle bg-primary text-primary-foreground w-full py-3 text-sm glow-gold"
                >
                  В бой
                </button>
              </div>

              <div className="md:col-span-2 space-y-4">
                <div className="bg-surface-2 border border-subtle p-5">
                  <h3 className="font-display text-lg uppercase tracking-wider mb-4">Статистика</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Всего боёв", val: "79", color: "#F0B429" },
                      { label: "Процент побед", val: "61%", color: "#4CAF50" },
                      { label: "Сред. урон/бой", val: "284", color: "#29B6F6" },
                      { label: "Любимая", val: "Молния", color: "#E53935" },
                    ].map((s, i) => (
                      <div key={i} className="border border-subtle p-3">
                        <div className="font-display text-2xl font-bold mb-1" style={{ color: s.color }}>{s.val}</div>
                        <div className="text-muted-foreground text-xs font-body uppercase tracking-wider">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-surface-2 border border-subtle p-5">
                  <h3 className="font-display text-lg uppercase tracking-wider mb-4">Прогресс уровня</h3>
                  <div className="flex justify-between text-sm font-body mb-2">
                    <span className="text-muted-foreground">Ур. 32</span>
                    <span className="text-primary">4,200 / 5,000 XP</span>
                  </div>
                  <div className="hp-bar mb-2">
                    <div className="hp-fill" style={{ width: "84%", background: "linear-gradient(90deg, #29B6F6, #F0B429)" }} />
                  </div>
                  <p className="text-muted-foreground text-xs font-body">800 XP до уровня 33</p>
                </div>

                <div className="bg-surface-2 border border-subtle p-5">
                  <h3 className="font-display text-lg uppercase tracking-wider mb-4">История боёв</h3>
                  <div className="space-y-2">
                    {[
                      { opp: "DarkViper", result: "ПОБЕДА", rating: "+32", time: "5 мин назад" },
                      { opp: "BloodMoon", result: "ПОБЕДА", rating: "+28", time: "18 мин назад" },
                      { opp: "StormCaller", result: "ПОРАЖЕНИЕ", rating: "-15", time: "1 час назад" },
                      { opp: "ThunderBolt", result: "ПОБЕДА", rating: "+35", time: "2 часа назад" },
                    ].map((h, i) => (
                      <div key={i} className="flex items-center justify-between text-sm font-body border-b border-subtle last:border-0 pb-2 last:pb-0">
                        <span className="text-muted-foreground">vs <span className="text-foreground">{h.opp}</span></span>
                        <span className={`font-display text-xs tracking-wider ${h.result === "ПОБЕДА" ? "text-green-400" : "text-red-400"}`}>{h.result}</span>
                        <span className={`font-display font-bold ${h.result === "ПОБЕДА" ? "text-primary" : "text-muted-foreground"}`}>{h.rating}</span>
                        <span className="text-muted-foreground text-xs">{h.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== ACHIEVEMENTS ===== */}
        {page === "achievements" && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-8">
              <h1 className="font-display text-4xl font-bold uppercase tracking-wider">Достижения</h1>
              <div className="font-display text-sm text-muted-foreground">
                <span className="text-primary font-bold">4</span> / {ACHIEVEMENTS.length} получено
              </div>
            </div>

            <div className="bg-surface-2 border border-subtle p-4 mb-8">
              <div className="flex justify-between text-sm font-body mb-2">
                <span className="text-muted-foreground">Общий прогресс</span>
                <span className="text-primary font-display">50%</span>
              </div>
              <div className="hp-bar">
                <div className="hp-fill" style={{ width: "50%", background: "linear-gradient(90deg, #F0B429, #FF8C00)" }} />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              {ACHIEVEMENTS.map((ach, i) => (
                <div
                  key={ach.id}
                  className={`border p-4 flex items-center gap-4 transition-all animate-slide-up ${
                    ach.done ? "bg-surface-2 border-subtle" : "bg-surface border-subtle"
                  }`}
                  style={{
                    animationDelay: `${i * 0.07}s`,
                    opacity: 0,
                    borderLeft: `3px solid ${ach.done ? RARITY_COLORS[ach.rarity] : "#333"}`,
                  }}
                >
                  <div
                    className="w-12 h-12 flex items-center justify-center flex-shrink-0"
                    style={{
                      background: ach.done ? RARITY_COLORS[ach.rarity] + "15" : "#1a1a1a",
                      border: `1px solid ${ach.done ? RARITY_COLORS[ach.rarity] + "40" : "#333"}`,
                    }}
                  >
                    <Icon name={ach.icon} size={20} style={{ color: ach.done ? RARITY_COLORS[ach.rarity] : "#444" }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className={`font-display font-bold uppercase tracking-wide text-sm ${ach.done ? "" : "text-muted-foreground"}`}>
                        {ach.done ? ach.name : "???"}
                      </h3>
                      <span
                        className="text-[9px] font-display tracking-wider uppercase px-1.5 py-0.5 border"
                        style={{ color: RARITY_COLORS[ach.rarity], borderColor: RARITY_COLORS[ach.rarity] + "40" }}
                      >
                        {ach.rarity}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-xs font-body">
                      {ach.done ? ach.desc : "Продолжай играть, чтобы разблокировать"}
                    </p>
                  </div>
                  {ach.done && (
                    <div style={{ color: RARITY_COLORS[ach.rarity] }}>
                      <Icon name="CheckCircle" size={18} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      <footer className="border-t border-subtle py-4 text-center">
        <span className="text-muted-foreground text-xs font-display tracking-widest uppercase">АРЕНА · Сезон 4 · 2026</span>
      </footer>

      {showDonateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setShowDonateModal(false)}>
          <div
            className="relative max-w-sm w-full mx-4 border p-8 text-center"
            style={{ background: "#111", borderColor: "#c62828", boxShadow: "0 0 40px rgba(229,57,53,0.3)" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: "linear-gradient(90deg, transparent, #e53935, transparent)" }} />
            <div className="text-5xl mb-4">🛡️</div>
            <h2 className="font-display text-3xl font-bold uppercase tracking-wider mb-2" style={{ color: "#e53935" }}>Мега щит</h2>
            <p className="text-muted-foreground font-body text-sm mb-6 leading-relaxed">
              Неуязвимость на <span className="text-white font-bold">5 секунд</span> — ни один удар врага не пройдёт сквозь щит. Активируется прямо в бою!
            </p>
            <div className="border border-subtle p-4 mb-6" style={{ background: "#0a0a0a" }}>
              <div className="font-display text-5xl font-bold mb-1" style={{ color: "#e53935" }}>49 ₽</div>
              <div className="text-muted-foreground text-xs font-body uppercase tracking-wider">разовая покупка · 1 бой</div>
            </div>
            {donateError && (
              <div className="mb-3 text-sm font-body px-3 py-2 border border-red-800 bg-red-950/40" style={{ color: "#ff6b6b" }}>
                {donateError}
              </div>
            )}
            <button
              onClick={handleBuyShield}
              disabled={donateLoading}
              className="btn-battle w-full py-4 text-lg text-white mb-3 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #c62828, #e53935)", boxShadow: "0 0 20px rgba(229,57,53,0.4)" }}
            >
              {donateLoading ? "Переходим к оплате..." : "Купить за 49 ₽"}
            </button>
            <button
              onClick={() => setShowDonateModal(false)}
              className="text-muted-foreground text-xs font-display tracking-wider uppercase hover:text-foreground transition-colors"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
}