import React, { useState } from 'react';
import { Gamepad2, Coins, ArrowLeft, Trophy, Check, ArrowRight, ShieldAlert } from 'lucide-react';

const ADVENTURES = [
  {
    id: "market",
    title: "Mercado de Comida (Salad Run)",
    desc: "Spend 10 pesos to buy correct ingredients for a salad (la lechuga, el tomate, el pepino) without going broke.",
    icon: "🛒"
  },
  {
    id: "nat",
    title: "Conociendo a Nat (Cafe Introduction)",
    desc: "Introduce a classmate to your partner Nat at a local cafe using correct pronouns and polite greetings.",
    icon: "☕"
  },
  {
    id: "narfy",
    title: "Entrenando a Narfy (Dog Training)",
    desc: "Type action verbs in Spanish to teach your energetic dog Narfy all 5 of his tricks.",
    icon: "🐕"
  }
];

export default function MiniGames({ state, addXp, addGold, completeAdventure, setView }) {
  const [activeGame, setActiveGame] = useState("market");
  
  // Game states
  // 1. Market State
  const [marketMoney, setMarketMoney] = useState(10);
  const [marketCart, setMarketCart] = useState([]);
  const [marketSuccess, setMarketSuccess] = useState(false);
  const [marketError, setMarketError] = useState("");

  // 2. Nat State
  const [natStep, setNatStep] = useState(1); // 1 = greeting, 2 = intro, 3 = drink, 4 = finished
  const [natLog, setNatLog] = useState([]);
  const [natFinished, setNatFinished] = useState(false);
  const [natSuccess, setNatSuccess] = useState(false);

  // 3. Narfy State
  const [narfyInput, setNarfyInput] = useState("");
  const [narfyTaught, setNarfyTaught] = useState([]); // Array of actions: correr, andar, comer, dormir, hablar
  const [narfyAnim, setNarfyAnim] = useState("🐕");
  const [narfyFeedback, setNarfyFeedback] = useState("Narfy is waiting for your command... Type 'correr', 'andar', 'comer', 'dormir', or 'hablar'.");
  const [narfySuccess, setNarfySuccess] = useState(false);

  // Restart functions
  const restartMarket = () => {
    setMarketMoney(10);
    setMarketCart([]);
    setMarketSuccess(false);
    setMarketError("");
  };

  const restartNat = () => {
    setNatStep(1);
    setNatLog([]);
    setNatFinished(false);
    setNatSuccess(false);
  };

  const restartNarfy = () => {
    setNarfyInput("");
    setNarfyTaught([]);
    setNarfyAnim("🐕");
    setNarfyFeedback("Narfy is waiting for your command...");
    setNarfySuccess(false);
  };

  // Game Handlers
  // 1. Market Handlers
  const MARKET_ITEMS = [
    { name: "la lechuga (lettuce)", cost: 3, id: "la lechuga" },
    { name: "el tomate (tomato)", cost: 2, id: "el tomate" },
    { name: "el pepino (cucumber)", cost: 2, id: "el pepino" },
    { name: "el durazno (peach)", cost: 3, id: "el durazno" },
    { name: "el bistec (steak)", cost: 6, id: "el bistec" },
    { name: "la cebolla (onion)", cost: 2, id: "la cebolla" },
    { name: "el jamón (ham)", cost: 5, id: "el jamón" }
  ];

  const handleBuyMarketItem = (item) => {
    if (marketCart.includes(item.id)) return;
    if (marketMoney < item.cost) {
      setMarketError("¡No tienes pesos suficientes! (Not enough money!)");
      return;
    }
    setMarketMoney(prev => prev - item.cost);
    setMarketCart(prev => [...prev, item.id]);
    setMarketError("");
  };

  const handleRemoveMarketItem = (itemId) => {
    const item = MARKET_ITEMS.find(i => i.id === itemId);
    if (!item) return;
    setMarketCart(prev => prev.filter(id => id !== itemId));
    setMarketMoney(prev => prev + item.cost);
    setMarketError("");
  };

  const checkMarketSuccess = () => {
    // Needs: la lechuga, el tomate, el pepino
    const hasLettuce = marketCart.includes("la lechuga");
    const hasTomato = marketCart.includes("el tomate");
    const hasCucumber = marketCart.includes("el pepino");

    if (hasLettuce && hasTomato && hasCucumber) {
      setMarketSuccess(true);
      addXp(50);
      addGold(10);
      completeAdventure("market");
    } else {
      setMarketError("Oh no! Your salad is incomplete. You need: la lechuga, el tomate, and el pepino.");
    }
  };

  // 2. Nat Branch Dialogue Handlers
  const handleNatChoice = (choiceIdx, step) => {
    if (step === 1) {
      if (choiceIdx === 0) {
        setNatLog(prev => [
          ...prev,
          { speaker: "You", text: "¡Hola Nat! Buenos días. Ella es mi amiga Sofía." },
          { speaker: "Nat", text: "Mucho gusto, Sofía. ¿Cómo te llamas?" },
          { speaker: "Sofía", text: "Me llamo Sofía. Igualmente." }
        ]);
        setNatStep(2);
      } else {
        setNatLog(prev => [
          ...prev,
          { speaker: "You", text: "Mal. ¿Qué tal?" },
          { speaker: "Nat", text: "Oh, lo siento... (Nat looks confused and awkward. The meeting ends early.)" }
        ]);
        setNatFinished(true);
        setNatSuccess(false);
      }
    } else if (step === 2) {
      if (choiceIdx === 0) {
        setNatLog(prev => [
          ...prev,
          { speaker: "You", text: "Sofía estudia biología y matemáticas conmigo. Ella es inteligente y simpática." },
          { speaker: "Nat", text: "¡Qué bien! Bienvenidos al café. ¿Tienen sed? ¿Quieren café o té?" }
        ]);
        setNatStep(3);
      } else {
        setNatLog(prev => [
          ...prev,
          { speaker: "You", text: "Sofía es tonta y aburrida." },
          { speaker: "Sofía", text: "¡Oye! ¡Qué horror! (Sofía gets angry and leaves. The meeting is ruined.)" }
        ]);
        setNatFinished(true);
        setNatSuccess(false);
      }
    } else if (step === 3) {
      if (choiceIdx === 0) {
        setNatLog(prev => [
          ...prev,
          { speaker: "You", text: "Por favor, Sofía prefiere té frío y yo quiero café con leche." },
          { speaker: "Nat", text: "Excelente. La mesera trae las bebidas ahora. Me gusta conversar con ustedes." },
          { speaker: "System", text: "Successful introduction! Nat and Sofía hit it off, and you enjoy a pleasant afternoon conversation." }
        ]);
        setNatFinished(true);
        setNatSuccess(true);
        addXp(50);
        addGold(10);
        completeAdventure("nat");
      } else {
        setNatLog(prev => [
          ...prev,
          { speaker: "You", text: "Sofía prefiere comer bistec y beber cerveza." },
          { speaker: "Nat", text: "But this is a cafe... we don't serve steak... (Awkward silence follows.)" }
        ]);
        setNatFinished(true);
        setNatSuccess(false);
      }
    }
  };

  // 3. Narfy Commands Handlers
  const handleNarfyCommand = (e) => {
    e.preventDefault();
    const cmd = narfyInput.trim().toLowerCase();
    setNarfyInput("");

    let response = "";
    let animation = "🐕";
    let valid = false;

    if (cmd === "correr") {
      response = "🏃‍♂️🐕 Narfy wagged his tail and ran around the garden! (correr taught)";
      animation = "🐕💨💨";
      valid = true;
    } else if (cmd === "andar") {
      response = "🚶‍♂️🐕 Narfy sits by your heel and walks slowly next to you. (andar taught)";
      animation = "🐕🚶‍♂️";
      valid = true;
    } else if (cmd === "comer") {
      response = "🍖🐕 Yum! Narfy eats his dog food happily. (comer taught)";
      animation = "🐕🍖😋";
      valid = true;
    } else if (cmd === "dormir") {
      response = "💤🐕 Zzz... Narfy curls up on the ground and falls asleep. (dormir taught)";
      animation = "💤🐕💤";
      valid = true;
    } else if (cmd === "hablar") {
      response = "🗣️🐕 ¡Guau! ¡Guau! Narfy barks on command! (hablar taught)";
      animation = "🐕🗣️🔊";
      valid = true;
    } else {
      response = `"${cmd}" is not a recognized command verb. Try 'correr', 'andar', 'comer', 'dormir', or 'hablar'.`;
      animation = "🐕❓";
    }

    setNarfyFeedback(response);
    setNarfyAnim(animation);

    if (valid) {
      setNarfyTaught(prev => {
        if (prev.includes(cmd)) return prev;
        const next = [...prev, cmd];
        if (next.length === 5) {
          setNarfySuccess(true);
          addXp(50);
          addGold(10);
          completeAdventure("narfy");
        }
        return next;
      });
    }
  };

  return (
    <div className="view-container">
      <div className="view-header">
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem' }}>Aventuras Textuales (Context Adventures)</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Solve problems in small, text-based scenarios using Spanish 101 words.</p>
        </div>
        <button className="btn btn-secondary" onClick={() => setView('dashboard')}>
          <ArrowLeft size={16} /> Back to Hub
        </button>
      </div>

      <div className="games-layout">
        {/* Left selector */}
        <div className="game-list-panel">
          {ADVENTURES.map(adv => {
            const isCompleted = state.completedAdventures.includes(adv.id);
            const isActive = activeGame === adv.id;

            return (
              <div 
                key={adv.id} 
                className={`glass-panel game-select-card ${isActive ? 'active' : ''}`}
                onClick={() => setActiveGame(adv.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '1.2rem' }}>{adv.icon} {adv.title}</span>
                  {isCompleted && (
                    <span style={{ color: 'var(--accent)', fontSize: '0.75rem', fontWeight: 'bold', border: '1px solid rgba(16,185,129,0.3)', padding: '2px 6px', borderRadius: '6px', background: 'rgba(16,185,129,0.05)' }}>
                      Completed
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{adv.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Right Active Game Console */}
        <div className="glass-panel game-console">
          
          {/* 1. SHOPPING MARKET ADVENTURE */}
          {activeGame === "market" && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
                <span style={{ fontWeight: 'bold' }}>🛒 Mercado de la Ciudad</span>
                <span style={{ color: 'var(--gold)', fontWeight: 'bold' }}>Budget: {marketMoney} Pesos</span>
              </div>

              {!marketSuccess ? (
                <>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Objective: Buy ingredients for a salad (<strong>la lechuga, el tomate, el pepino</strong>). Do not spend more than your 10 pesos budget!
                  </p>
                  
                  {marketError && (
                    <div style={{ color: 'var(--danger)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ShieldAlert size={14} /> {marketError}
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', margin: '8px 0' }}>
                    {MARKET_ITEMS.map(item => {
                      const bought = marketCart.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          className={`btn ${bought ? 'btn-secondary' : 'btn-primary'}`}
                          style={{ padding: '8px 12px', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}
                          onClick={() => handleBuyMarketItem(item)}
                          disabled={bought}
                        >
                          <span style={{ fontSize: '0.9rem' }}>{item.id}</span>
                          <span style={{ color: 'var(--gold)' }}>{item.cost} Pesos</span>
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.1)', padding: '16px', borderRadius: '12px' }}>
                    <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Your Shopping Cart:</h4>
                    {marketCart.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {marketCart.map(itemId => {
                          return (
                            <span 
                              key={itemId} 
                              onClick={() => handleRemoveMarketItem(itemId)}
                              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              {itemId} (Remove)
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Your cart is empty.</span>
                    )}
                  </div>

                  <button className="btn btn-accent" onClick={checkMarketSuccess} style={{ alignSelf: 'flex-end', marginTop: 'auto' }}>
                    Complete Purchase (Completar compra)
                  </button>
                </>
              ) : (
                <div style={{ textAlign: 'center', margin: 'auto' }}>
                  <Trophy size={48} color="var(--gold)" style={{ margin: '0 auto 12px', animation: 'float 3s ease-in-out infinite' }} />
                  <h3 style={{ fontSize: '1.4rem', color: 'var(--accent)', marginBottom: '8px' }}>¡Victoria en el Mercado!</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px', maxWidth: '350px' }}>
                    You purchased all the correct salad ingredients under budget! Elena is proud. You gained 50 XP, 10 Gold, and the "Market Trader" Badge.
                  </p>
                  <button className="btn btn-secondary" onClick={restartMarket}>Play Again</button>
                </div>
              )}
            </div>
          )}

          {/* 2. MEETING NAT ADVENTURE */}
          {activeGame === "nat" && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
                <span style={{ fontWeight: 'bold' }}>☕ Reunión en el Café</span>
              </div>

              {!natFinished ? (
                <>
                  <div style={{ flex: 1, background: 'rgba(0,0,0,0.15)', padding: '16px', borderRadius: '12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '220px' }}>
                    {natLog.length === 0 ? (
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                        You walk into the cafe with your classmate Sofía. Your partner Nat smiles and greets you: "¡Hola! ¿Cómo estás?"
                      </span>
                    ) : (
                      natLog.map((log, idx) => (
                        <div key={idx} style={{ fontSize: '0.85rem' }}>
                          <strong style={{ color: log.speaker === 'You' ? 'var(--primary)' : 'var(--gold)' }}>{log.speaker}:</strong> {log.text}
                        </div>
                      ))
                    )}
                  </div>

                  <div className="game-choices-container">
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Choose your response:</span>
                    
                    {natStep === 1 && (
                      <>
                        <button className="btn btn-secondary" onClick={() => handleNatChoice(0, 1)} style={{ textAlign: 'left', justifyContent: 'flex-start' }}>
                          1. "¡Hola, Nat! Buenos días. Ella es mi amiga Sofía."
                        </button>
                        <button className="btn btn-secondary" onClick={() => handleNatChoice(1, 1)} style={{ textAlign: 'left', justifyContent: 'flex-start' }}>
                          2. "Mal. ¿Qué tal?"
                        </button>
                      </>
                    )}

                    {natStep === 2 && (
                      <>
                        <button className="btn btn-secondary" onClick={() => handleNatChoice(0, 2)} style={{ textAlign: 'left', justifyContent: 'flex-start' }}>
                          1. "Sofía estudia biología y matemáticas conmigo. Ella es inteligente y simpática."
                        </button>
                        <button className="btn btn-secondary" onClick={() => handleNatChoice(1, 2)} style={{ textAlign: 'left', justifyContent: 'flex-start' }}>
                          2. "Sofía es tonta y aburrida."
                        </button>
                      </>
                    )}

                    {natStep === 3 && (
                      <>
                        <button className="btn btn-secondary" onClick={() => handleNatChoice(0, 3)} style={{ textAlign: 'left', justifyContent: 'flex-start' }}>
                          1. "Por favor, Sofía prefiere té frío y yo quiero café con leche."
                        </button>
                        <button className="btn btn-secondary" onClick={() => handleNatChoice(1, 3)} style={{ textAlign: 'left', justifyContent: 'flex-start' }}>
                          2. "Sofía prefiere comer bistec y beber cerveza."
                        </button>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', margin: 'auto' }}>
                  {natSuccess ? (
                    <>
                      <Trophy size={48} color="var(--gold)" style={{ margin: '0 auto 12px', animation: 'float 3s ease-in-out infinite' }} />
                      <h3 style={{ fontSize: '1.4rem', color: 'var(--accent)', marginBottom: '8px' }}>¡Amistad Exitosa!</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px', maxWidth: '350px' }}>
                        You introduced Sofía politely using correct adjectives, pronouns, and greetings! Nat was impressed. You gained 50 XP, 10 Gold, and the "Nat's Ally" Badge.
                      </p>
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: '3rem' }}>🤦‍♂️</span>
                      <h3 style={{ fontSize: '1.4rem', color: 'var(--danger)', marginBottom: '8px', marginTop: '12px' }}>Fallo de Conversación</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px', maxWidth: '350px' }}>
                        Your introduction was impolite or awkward, and Sofía or Nat felt uncomfortable. Dialogue ended. Try again!
                      </p>
                    </>
                  )}
                  <button className="btn btn-secondary" onClick={restartNat}>Try Again</button>
                </div>
              )}
            </div>
          )}

          {/* 3. TRAINING NARFY ADVENTURE */}
          {activeGame === "narfy" && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
                <span style={{ fontWeight: 'bold' }}>🐕 Entrenando a Narfy</span>
                <span style={{ color: 'var(--gold)', fontWeight: 'bold' }}>Tricks Taught: {narfyTaught.length} / 5</span>
              </div>

              {!narfySuccess ? (
                <>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Objective: Type Spanish verbs to command Narfy. Teach him all 5 actions: <strong>correr, andar, comer, dormir, hablar</strong>.
                  </p>

                  <div className="game-graphics-box">
                    <pre className="dog-narfy-ascii">{narfyAnim}</pre>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic', background: 'rgba(0,0,0,0.1)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.02)' }}>
                    {narfyFeedback}
                  </p>

                  <form onSubmit={handleNarfyCommand} className="game-input-row">
                    <input
                      type="text"
                      placeholder="Type Spanish verb command..."
                      value={narfyInput}
                      onChange={(e) => setNarfyInput(e.target.value)}
                      className="form-input"
                      style={{ flex: 1 }}
                    />
                    <button type="submit" className="btn btn-primary">
                      Command
                    </button>
                  </form>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                    <span>Tricks learned:</span>
                    {narfyTaught.length > 0 ? (
                      narfyTaught.map(t => (
                        <span key={t} style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', padding: '2px 8px', borderRadius: '4px', color: 'var(--accent)', fontWeight: 'bold' }}>
                          ✓ {t}
                        </span>
                      ))
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>None yet.</span>
                    )}
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', margin: 'auto' }}>
                  <Trophy size={48} color="var(--gold)" style={{ margin: '0 auto 12px', animation: 'float 3s ease-in-out infinite' }} />
                  <h3 style={{ fontSize: '1.4rem', color: 'var(--accent)', marginBottom: '8px' }}>¡Narfy es un Perro Bueno!</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px', maxWidth: '350px' }}>
                    You successfully taught Narfy all 5 verb commands: correr, andar, comer, dormir, and hablar! He barks happily. You gained 50 XP, 10 Gold, and the "Dog Whisperer" Badge.
                  </p>
                  <button className="btn btn-secondary" onClick={restartNarfy}>Play Again</button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
