import React, { useState } from 'react';
import { Gamepad2, Coins, ArrowLeft, Trophy, Check, ArrowRight, ShieldAlert } from 'lucide-react';

const ADVENTURES = [
  {
    id: "market",
    title: "Mercado de Comida (Salad Run)",
    desc: "Translate English hints to purchase the correct salad ingredients (lettuce, tomato, cucumber) on a 10 peso budget.",
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
    desc: "Translate English commands to teach your dog Narfy all 5 of his tricks.",
    icon: "🐕"
  },
  {
    id: "directions",
    title: "Direcciones en la Ciudad (City Navigation)",
    desc: "Help a lost tourist navigate a grid map using prepositions (cerca de, al lado de, a la derecha).",
    icon: "🗺️"
  },
  {
    id: "restaurant",
    title: "En el Restaurante (Table Ordering)",
    desc: "Converse with a waiter to order a meal using formal polite structures (quisiera, me gustaría, la cuenta).",
    icon: "🍷"
  },
  {
    id: "medical",
    title: "La Consulta del Médico (Doctor Visit)",
    desc: "Describe physical ailments (me duele, tengo fiebre) to a clinic doctor using body vocabulary.",
    icon: "🩺"
  }
];

export default function MiniGames({ state, addXp, addGold, completeAdventure, incrementBountyCount, setView }) {
  const [activeGame, setActiveGame] = useState("market");
  
  // Track mistakes per game session to award "Victoria Impecable" bounty
  const [mistakeCount, setMistakeCount] = useState(0);

  // Game states
  // 1. Market State
  const [marketMoney, setMarketMoney] = useState(10);
  const [marketCart, setMarketCart] = useState([]);
  const [marketSuccess, setMarketSuccess] = useState(false);
  const [marketError, setMarketError] = useState("");

  // 2. Nat State
  const [natStep, setNatStep] = useState(1);
  const [natLog, setNatLog] = useState([]);
  const [natFinished, setNatFinished] = useState(false);
  const [natSuccess, setNatSuccess] = useState(false);

  // 3. Narfy State
  const [narfyInput, setNarfyInput] = useState("");
  const [narfyTaught, setNarfyTaught] = useState([]); // correr, andar, comer, dormir, hablar
  const [narfyAnim, setNarfyAnim] = useState("🐕");
  const [narfyTargetTrick, setNarfyTargetTrick] = useState("run"); // run, walk, eat, sleep, speak
  const [narfyFeedback, setNarfyFeedback] = useState("Narfy is sitting. Teach him to: run (Type the Spanish command!)");
  const [narfySuccess, setNarfySuccess] = useState(false);

  // 4. City Directions State
  const [dirStep, setDirStep] = useState(1);
  const [dirLog, setDirLog] = useState([]);
  const [dirFinished, setDirFinished] = useState(false);
  const [dirSuccess, setDirSuccess] = useState(false);

  // 5. Restaurant State
  const [restStep, setRestStep] = useState(1);
  const [restLog, setRestLog] = useState([]);
  const [restFinished, setRestFinished] = useState(false);
  const [restSuccess, setRestSuccess] = useState(false);

  // 6. Medical State
  const [medStep, setMedStep] = useState(1);
  const [medLog, setMedLog] = useState([]);
  const [medFinished, setMedFinished] = useState(false);
  const [medSuccess, setMedSuccess] = useState(false);

  // Restart functions
  const restartMarket = () => {
    setMarketMoney(10);
    setMarketCart([]);
    setMarketSuccess(false);
    setMarketError("");
    setMistakeCount(0);
  };

  const restartNat = () => {
    setNatStep(1);
    setNatLog([]);
    setNatFinished(false);
    setNatSuccess(false);
    setMistakeCount(0);
  };

  const restartNarfy = () => {
    setNarfyInput("");
    setNarfyTaught([]);
    setNarfyAnim("🐕");
    setNarfyTargetTrick("run");
    setNarfyFeedback("Narfy is sitting. Teach him to: run (Type the Spanish command!)");
    setNarfySuccess(false);
    setMistakeCount(0);
  };

  const restartDirections = () => {
    setDirStep(1);
    setDirLog([]);
    setDirFinished(false);
    setDirSuccess(false);
    setMistakeCount(0);
  };

  const restartRestaurant = () => {
    setRestStep(1);
    setRestLog([]);
    setRestFinished(false);
    setRestSuccess(false);
    setMistakeCount(0);
  };

  const restartMedical = () => {
    setMedStep(1);
    setMedLog([]);
    setMedFinished(false);
    setMedSuccess(false);
    setMistakeCount(0);
  };

  // Game Handlers
  // 1. Market Handlers (Requires matching English hints internally)
  const MARKET_ITEMS = [
    { name: "la lechuga", cost: 3, id: "la lechuga", english: "lettuce" },
    { name: "el tomate", cost: 2, id: "el tomate", english: "tomato" },
    { name: "el pepino", cost: 2, id: "el pepino", english: "cucumber" },
    { name: "el durazno", cost: 3, id: "el durazno", english: "peach" },
    { name: "el bistec", cost: 6, id: "el bistec", english: "steak" },
    { name: "la cebolla", cost: 2, id: "la cebolla", english: "onion" },
    { name: "el jamón", cost: 5, id: "el jamón", english: "ham" }
  ];

  const handleBuyMarketItem = (item) => {
    if (marketCart.includes(item.id)) return;
    
    // Check if the item is an incorrect ingredient for a salad
    const isCorrectSaladItem = ["la lechuga", "el tomate", "el pepino"].includes(item.id);
    if (!isCorrectSaladItem) {
      setMistakeCount(prev => prev + 1);
    }

    if (marketMoney < item.cost) {
      setMarketError("¡No tienes pesos suficientes! (Not enough money!)");
      setMistakeCount(prev => prev + 1);
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
    const hasLettuce = marketCart.includes("la lechuga");
    const hasTomato = marketCart.includes("el tomate");
    const hasCucumber = marketCart.includes("el pepino");

    if (hasLettuce && hasTomato && hasCucumber && marketCart.length === 3) {
      setMarketSuccess(true);
      addXp(50);
      addGold(10);
      completeAdventure("market");
      
      // Perfect Run Bounty trigger
      if (mistakeCount === 0 && incrementBountyCount) {
        incrementBountyCount("minigame");
      }
    } else {
      setMistakeCount(prev => prev + 1);
      setMarketError("Oh no! Your salad must contain exactly: lettuce, tomato, and cucumber. Remove other items first.");
    }
  };

  // 2. Nat Dialogue Handlers
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
        setMistakeCount(prev => prev + 1);
        setNatLog(prev => [
          ...prev,
          { speaker: "You", text: "Mal. ¿Qué tal?" },
          { speaker: "Nat", text: "Oh, lo siento... (Nat looks confused. Conversation fails.)" }
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
        setMistakeCount(prev => prev + 1);
        setNatLog(prev => [
          ...prev,
          { speaker: "You", text: "Sofía es tonta y aburrida." },
          { speaker: "Sofía", text: "¡Oye! ¡Qué horror! (Sofía leaves in anger.)" }
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
          { speaker: "System", text: "Introduction completed successfully!" }
        ]);
        setNatFinished(true);
        setNatSuccess(true);
        addXp(50);
        addGold(10);
        completeAdventure("nat");

        if (mistakeCount === 0 && incrementBountyCount) {
          incrementBountyCount("minigame");
        }
      } else {
        setMistakeCount(prev => prev + 1);
        setNatLog(prev => [
          ...prev,
          { speaker: "You", text: "Sofía prefiere comer bistec y beber cerveza." },
          { speaker: "Nat", text: "We do not serve steak here... (Meeting fails.)" }
        ]);
        setNatFinished(true);
        setNatSuccess(false);
      }
    }
  };

  // 3. Narfy Commands Handlers (Requires Translating from English Commands)
  const TRICK_FLOW = ["run", "walk", "eat", "sleep", "speak"];
  
  const handleNarfyCommand = (e) => {
    e.preventDefault();
    const cmd = narfyInput.trim().toLowerCase();
    setNarfyInput("");

    let correctSpanish = "";
    if (narfyTargetTrick === "run") correctSpanish = "correr";
    else if (narfyTargetTrick === "walk") correctSpanish = "andar";
    else if (narfyTargetTrick === "eat") correctSpanish = "comer";
    else if (narfyTargetTrick === "sleep") correctSpanish = "dormir";
    else if (narfyTargetTrick === "speak") correctSpanish = "hablar";

    if (cmd === correctSpanish) {
      let anim = "🐕";
      let desc = "";
      if (cmd === "correr") { anim = "🐕💨"; desc = "Narfy zooms around!"; }
      else if (cmd === "andar") { anim = "🐕🚶‍♂️"; desc = "Narfy walks politely next to you!"; }
      else if (cmd === "comer") { anim = "🐕🍖"; desc = "Narfy gobbles up a treat!"; }
      else if (cmd === "dormir") { anim = "💤🐕"; desc = "Narfy curls up and snoozes!"; }
      else if (cmd === "hablar") { anim = "🐕🗣️"; desc = "Narfy barks: ¡Guau! ¡Guau!"; }

      setNarfyTaught(prev => [...prev, cmd]);
      setNarfyAnim(anim);

      const nextIndex = TRICK_FLOW.indexOf(narfyTargetTrick) + 1;
      if (nextIndex < TRICK_FLOW.length) {
        const nextTrick = TRICK_FLOW[nextIndex];
        setNarfyTargetTrick(nextTrick);
        setNarfyFeedback(`${desc} Correct! Next, teach him to: ${nextTrick} (Type Spanish translation!)`);
      } else {
        setNarfySuccess(true);
        addXp(50);
        addGold(10);
        completeAdventure("narfy");
        if (mistakeCount === 0 && incrementBountyCount) {
          incrementBountyCount("minigame");
        }
      }
    } else {
      setMistakeCount(prev => prev + 1);
      setNarfyAnim("🐕❓");
      setNarfyFeedback(`Incorrect. Narfy tilts his head. How do you say "${narfyTargetTrick}" in Spanish?`);
    }
  };

  // 4. City Directions Dialogue Handlers
  const handleDirChoice = (choiceIdx, step) => {
    if (step === 1) {
      if (choiceIdx === 0) {
        setDirLog(prev => [
          ...prev,
          { speaker: "Tourist", text: "Excuse me, where is the library? Is it near the school?" },
          { speaker: "You", text: "La biblioteca está al lado de la escuela." },
          { speaker: "Tourist", text: "¡Ah! Next to it! Thank you. And how about the cafe?" }
        ]);
        setDirStep(2);
      } else {
        setMistakeCount(prev => prev + 1);
        setDirLog(prev => [
          ...prev,
          { speaker: "You", text: "La biblioteca está en mi mochila." },
          { speaker: "Tourist", text: "In your backpack? That makes no sense. Excuse me..." }
        ]);
        setDirFinished(true);
        setDirSuccess(false);
      }
    } else if (step === 2) {
      if (choiceIdx === 0) {
        setDirLog(prev => [
          ...prev,
          { speaker: "You", text: "El café está a la derecha del museo. Cerca de aquí." },
          { speaker: "Tourist", text: "Perfect, to the right of the museum! One last thing, where is the bank?" }
        ]);
        setDirStep(3);
      } else {
        setMistakeCount(prev => prev + 1);
        setDirLog(prev => [
          ...prev,
          { speaker: "You", text: "El café come verduras." },
          { speaker: "Tourist", text: "The cafe eats vegetables? Are you okay? Goodbye..." }
        ]);
        setDirFinished(true);
        setDirSuccess(false);
      }
    } else if (step === 3) {
      if (choiceIdx === 0) {
        setDirLog(prev => [
          ...prev,
          { speaker: "You", text: "El banco está lejos de la plaza, a la izquierda del hospital." },
          { speaker: "Tourist", text: "Far from the plaza, left of the hospital. I found it! ¡Muchísimas gracias por la ayuda!" },
          { speaker: "System", text: "Tourist successfully navigated!" }
        ]);
        setDirFinished(true);
        setDirSuccess(true);
        addXp(50);
        addGold(10);
        completeAdventure("directions");
        if (mistakeCount === 0 && incrementBountyCount) {
          incrementBountyCount("minigame");
        }
      } else {
        setMistakeCount(prev => prev + 1);
        setDirLog(prev => [
          ...prev,
          { speaker: "You", text: "El banco vive en el bosque." },
          { speaker: "Tourist", text: "The bank lives in the forest? Okay, I'll ask someone else..." }
        ]);
        setDirFinished(true);
        setDirSuccess(false);
      }
    }
  };

  // 5. Restaurant Dialogue Handlers
  const handleRestChoice = (choiceIdx, step) => {
    if (step === 1) {
      if (choiceIdx === 0) {
        setRestLog(prev => [
          ...prev,
          { speaker: "Waiter", text: "Buenas tardes. ¿Qué desean tomar para empezar?" },
          { speaker: "You", text: "Para beber, me gustaría agua fría por favor." },
          { speaker: "Waiter", text: "Excelente elección. ¿Y de plato principal?" }
        ]);
        setRestStep(2);
      } else {
        setMistakeCount(prev => prev + 1);
        setRestLog(prev => [
          ...prev,
          { speaker: "You", text: "Quiero dormir en la mesa." },
          { speaker: "Waiter", text: "Uh... you cannot sleep on the table, sir. Please exit." }
        ]);
        setRestFinished(true);
        setRestSuccess(false);
      }
    } else if (step === 2) {
      if (choiceIdx === 0) {
        setRestLog(prev => [
          ...prev,
          { speaker: "You", text: "Quisiera el pollo con ensalada de lechuga y tomate." },
          { speaker: "Waiter", text: "Pollo con ensalada, muy bien. ¿Desean algo de postre?" }
        ]);
        setRestStep(3);
      } else {
        setMistakeCount(prev => prev + 1);
        setRestLog(prev => [
          ...prev,
          { speaker: "You", text: "Me gustaría una bicicleta roja con queso." },
          { speaker: "Waiter", text: "We do not cook red bicycles, sir. Let me fetch the manager." }
        ]);
        setRestFinished(true);
        setRestSuccess(false);
      }
    } else if (step === 3) {
      if (choiceIdx === 0) {
        setRestLog(prev => [
          ...prev,
          { speaker: "You", text: "No gracias. La cuenta, por favor." },
          { speaker: "Waiter", text: "Enseguida. Aquí tiene. ¡Buen provecho y feliz tarde!" },
          { speaker: "System", text: "Meal successfully ordered!" }
        ]);
        setRestFinished(true);
        setRestSuccess(true);
        addXp(50);
        addGold(10);
        completeAdventure("restaurant");
        if (mistakeCount === 0 && incrementBountyCount) {
          incrementBountyCount("minigame");
        }
      } else {
        setMistakeCount(prev => prev + 1);
        setRestLog(prev => [
          ...prev,
          { speaker: "You", text: "Dame todo tu dinero." },
          { speaker: "Waiter", text: "Is this a robbery?! Guardias! ¡Llamen a la policía!" }
        ]);
        setRestFinished(true);
        setRestSuccess(false);
      }
    }
  };

  // 6. Medical Consultation Dialogue Handlers
  const handleMedChoice = (choiceIdx, step) => {
    if (step === 1) {
      if (choiceIdx === 0) {
        setMedLog(prev => [
          ...prev,
          { speaker: "Doctor Martínez", text: "Hola, ¿qué síntomas tienes hoy?" },
          { speaker: "You", text: "Me duele la cabeza y tengo fiebre." },
          { speaker: "Doctor Martínez", text: "Entiendo. ¿Te duele el estómago o la garganta también?" }
        ]);
        setMedStep(2);
      } else {
        setMistakeCount(prev => prev + 1);
        setMedLog(prev => [
          ...prev,
          { speaker: "You", text: "Mi perro corre rápido." },
          { speaker: "Doctor Martínez", text: "I treat humans, not dogs. Please seek a veterinarian." }
        ]);
        setMedFinished(true);
        setMedSuccess(false);
      }
    } else if (step === 2) {
      if (choiceIdx === 0) {
        setMedLog(prev => [
          ...prev,
          { speaker: "You", text: "Sí, me duele mucho el estómago después de almorzar." },
          { speaker: "Doctor Martínez", text: "Entendido. Vamos a revisar. ¿Tienes dolor en los brazos o piernas?" }
        ]);
        setMedStep(3);
      } else {
        setMistakeCount(prev => prev + 1);
        setMedLog(prev => [
          ...prev,
          { speaker: "You", text: "Tengo un coche verde en la cocina." },
          { speaker: "Doctor Martínez", text: "Delirium? Let's check you in for cognitive examination..." }
        ]);
        setMedFinished(true);
        setMedSuccess(false);
      }
    } else if (step === 3) {
      if (choiceIdx === 0) {
        setMedLog(prev => [
          ...prev,
          { speaker: "You", text: "No, las piernas están bien, pero me duelen los ojos." },
          { speaker: "Doctor Martínez", text: "Parece una gripe común. Reposa en casa, bebe agua y toma esta receta. ¡Que te mejores!" },
          { speaker: "System", text: "Diagnosis complete!" }
        ]);
        setMedFinished(true);
        setMedSuccess(true);
        addXp(50);
        addGold(10);
        completeAdventure("medical");
        if (mistakeCount === 0 && incrementBountyCount) {
          incrementBountyCount("minigame");
        }
      } else {
        setMistakeCount(prev => prev + 1);
        setMedLog(prev => [
          ...prev,
          { speaker: "You", text: "Mis ojos comen manzanas." },
          { speaker: "Doctor Martínez", text: "Eating apples with eyes is medically impossible. Sending you to psychiatry..." }
        ]);
        setMedFinished(true);
        setMedSuccess(false);
      }
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
                onClick={() => {
                  setActiveGame(adv.id);
                  setMistakeCount(0);
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 'bold' }}>{adv.icon} {adv.title}</span>
                  {isCompleted && (
                    <span style={{ color: 'var(--accent)', fontSize: '0.7rem', fontWeight: 'bold', border: '1px solid rgba(16,185,129,0.3)', padding: '1px 5px', borderRadius: '6px', background: 'rgba(16,185,129,0.05)' }}>
                      Done
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.3' }}>{adv.desc}</p>
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
                    Objective (Translate): Buy exactly <strong>lettuce</strong>, <strong>tomato</strong>, and <strong>cucumber</strong>. Don't go broke! (Current mistakes this run: {mistakeCount})
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
                          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{item.id}</span>
                          <span style={{ color: 'var(--gold)', fontSize: '0.75rem' }}>{item.cost} Pesos</span>
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
                    You translated and purchased lettuce, tomato, and cucumber within the budget!
                    {mistakeCount === 0 ? " Perfect Run! (Victoria Impecable checklist ticked)" : ` You completed it with ${mistakeCount} mistakes.`}
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
                        You introduced Sofía politely! {mistakeCount === 0 ? "Perfect introduction!" : `You passed with ${mistakeCount} errors.`}
                      </p>
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: '3rem' }}>🤦‍♂️</span>
                      <h3 style={{ fontSize: '1.4rem', color: 'var(--danger)', marginBottom: '8px', marginTop: '12px' }}>Fallo de Conversación</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px', maxWidth: '350px' }}>
                        Your introduction was impolite or awkward. Dialogue ended. Try again!
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
                    Translate the requested English command to teach Narfy. Target command: <strong style={{ color: 'var(--primary)' }}>{narfyTargetTrick}</strong>.
                  </p>

                  <div className="game-graphics-box">
                    <pre className="dog-narfy-ascii" style={{ fontSize: '2.5rem', margin: '0' }}>{narfyAnim}</pre>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic', background: 'rgba(0,0,0,0.1)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.02)' }}>
                    {narfyFeedback}
                  </p>

                  <form onSubmit={handleNarfyCommand} className="game-input-row">
                    <input
                      type="text"
                      placeholder="Type Spanish translation for this command..."
                      value={narfyInput}
                      onChange={(e) => setNarfyInput(e.target.value)}
                      className="form-input"
                      style={{ flex: 1 }}
                      autoFocus
                    />
                    <button type="submit" className="btn btn-primary">
                      Command
                    </button>
                  </form>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                    <span>Tricks learned so far:</span>
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
                    You translated all 5 verbs: correr, andar, comer, dormir, and hablar!
                    {mistakeCount === 0 ? " Perfect Run! (Victoria Impecable checklist ticked)" : ` Complete with ${mistakeCount} mistakes.`}
                  </p>
                  <button className="btn btn-secondary" onClick={restartNarfy}>Play Again</button>
                </div>
              )}
            </div>
          )}

          {/* 4. CITY DIRECTIONS ADVENTURE */}
          {activeGame === "directions" && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
                <span style={{ fontWeight: 'bold' }}>🗺️ Direcciones en la Ciudad</span>
              </div>

              {!dirFinished ? (
                <>
                  <div style={{ flex: 1, background: 'rgba(0,0,0,0.15)', padding: '16px', borderRadius: '12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '220px' }}>
                    {dirLog.length === 0 ? (
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                        A lost tourist approaches you with a city grid map. "Excuse me, where is the library? Is it near the school?"
                      </span>
                    ) : (
                      dirLog.map((log, idx) => (
                        <div key={idx} style={{ fontSize: '0.85rem' }}>
                          <strong style={{ color: log.speaker === 'You' ? 'var(--primary)' : 'var(--gold)' }}>{log.speaker}:</strong> {log.text}
                        </div>
                      ))
                    )}
                  </div>

                  <div className="game-choices-container">
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Choose your response:</span>
                    
                    {dirStep === 1 && (
                      <>
                        <button className="btn btn-secondary" onClick={() => handleDirChoice(0, 1)} style={{ textAlign: 'left', justifyContent: 'flex-start' }}>
                          1. "La biblioteca está al lado de la escuela."
                        </button>
                        <button className="btn btn-secondary" onClick={() => handleDirChoice(1, 1)} style={{ textAlign: 'left', justifyContent: 'flex-start' }}>
                          2. "La biblioteca está en mi mochila."
                        </button>
                      </>
                    )}

                    {dirStep === 2 && (
                      <>
                        <button className="btn btn-secondary" onClick={() => handleDirChoice(0, 2)} style={{ textAlign: 'left', justifyContent: 'flex-start' }}>
                          1. "El café está a la derecha del museo. Cerca de aquí."
                        </button>
                        <button className="btn btn-secondary" onClick={() => handleDirChoice(1, 2)} style={{ textAlign: 'left', justifyContent: 'flex-start' }}>
                          2. "El café come verduras."
                        </button>
                      </>
                    )}

                    {dirStep === 3 && (
                      <>
                        <button className="btn btn-secondary" onClick={() => handleDirChoice(0, 3)} style={{ textAlign: 'left', justifyContent: 'flex-start' }}>
                          1. "El banco está lejos de la plaza, a la izquierda del hospital."
                        </button>
                        <button className="btn btn-secondary" onClick={() => handleDirChoice(1, 3)} style={{ textAlign: 'left', justifyContent: 'flex-start' }}>
                          2. "El banco vive en el bosque."
                        </button>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', margin: 'auto' }}>
                  {dirSuccess ? (
                    <>
                      <Trophy size={48} color="var(--gold)" style={{ margin: '0 auto 12px', animation: 'float 3s ease-in-out infinite' }} />
                      <h3 style={{ fontSize: '1.4rem', color: 'var(--accent)', marginBottom: '8px' }}>¡Turista Guiado!</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px', maxWidth: '350px' }}>
                        You successfully navigated the tourist to the library, cafe, and bank!
                        {mistakeCount === 0 ? " Perfect Navigation!" : ` Completed with ${mistakeCount} mistakes.`}
                      </p>
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: '3rem' }}>🤷‍♂️</span>
                      <h3 style={{ fontSize: '1.4rem', color: 'var(--danger)', marginBottom: '8px', marginTop: '12px' }}>Direcciones Incorrectas</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px', maxWidth: '350px' }}>
                        Your directions were incoherent or nonsensical. The tourist walked away. Try again!
                      </p>
                    </>
                  )}
                  <button className="btn btn-secondary" onClick={restartDirections}>Try Again</button>
                </div>
              )}
            </div>
          )}

          {/* 5. RESTAURANT ADVENTURE */}
          {activeGame === "restaurant" && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
                <span style={{ fontWeight: 'bold' }}>🍷 En el Restaurante</span>
              </div>

              {!restFinished ? (
                <>
                  <div style={{ flex: 1, background: 'rgba(0,0,0,0.15)', padding: '16px', borderRadius: '12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '220px' }}>
                    {restLog.length === 0 ? (
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                        You sit down at a nice local restaurant. The waiter approaches you: "Buenas tardes. ¿Qué desean tomar para empezar?"
                      </span>
                    ) : (
                      restLog.map((log, idx) => (
                        <div key={idx} style={{ fontSize: '0.85rem' }}>
                          <strong style={{ color: log.speaker === 'You' ? 'var(--primary)' : 'var(--gold)' }}>{log.speaker}:</strong> {log.text}
                        </div>
                      ))
                    )}
                  </div>

                  <div className="game-choices-container">
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Choose your response:</span>
                    
                    {restStep === 1 && (
                      <>
                        <button className="btn btn-secondary" onClick={() => handleRestChoice(0, 1)} style={{ textAlign: 'left', justifyContent: 'flex-start' }}>
                          1. "Para beber, me gustaría agua fría por favor."
                        </button>
                        <button className="btn btn-secondary" onClick={() => handleRestChoice(1, 1)} style={{ textAlign: 'left', justifyContent: 'flex-start' }}>
                          2. "Quiero dormir en la mesa."
                        </button>
                      </>
                    )}

                    {restStep === 2 && (
                      <>
                        <button className="btn btn-secondary" onClick={() => handleRestChoice(0, 2)} style={{ textAlign: 'left', justifyContent: 'flex-start' }}>
                          1. "Quisiera el pollo con ensalada de lechuga y tomate."
                        </button>
                        <button className="btn btn-secondary" onClick={() => handleRestChoice(1, 2)} style={{ textAlign: 'left', justifyContent: 'flex-start' }}>
                          2. "Me gustaría una bicicleta roja con queso."
                        </button>
                      </>
                    )}

                    {restStep === 3 && (
                      <>
                        <button className="btn btn-secondary" onClick={() => handleRestChoice(0, 3)} style={{ textAlign: 'left', justifyContent: 'flex-start' }}>
                          1. "No gracias. La cuenta, por favor."
                        </button>
                        <button className="btn btn-secondary" onClick={() => handleRestChoice(1, 3)} style={{ textAlign: 'left', justifyContent: 'flex-start' }}>
                          2. "Dame todo tu dinero."
                        </button>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', margin: 'auto' }}>
                  {restSuccess ? (
                    <>
                      <Trophy size={48} color="var(--gold)" style={{ margin: '0 auto 12px', animation: 'float 3s ease-in-out infinite' }} />
                      <h3 style={{ fontSize: '1.4rem', color: 'var(--accent)', marginBottom: '8px' }}>¡Buen Provecho!</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px', maxWidth: '350px' }}>
                        You successfully ordered food and drinks politely, then asked for the bill!
                        {mistakeCount === 0 ? " Perfect Order!" : ` Completed with ${mistakeCount} mistakes.`}
                      </p>
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: '3rem' }}>🤦‍♂️</span>
                      <h3 style={{ fontSize: '1.4rem', color: 'var(--danger)', marginBottom: '8px', marginTop: '12px' }}>Cena Arruinada</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px', maxWidth: '350px' }}>
                        You made an inappropriate request, and the waiter got offended or confused. Try again!
                      </p>
                    </>
                  )}
                  <button className="btn btn-secondary" onClick={restartRestaurant}>Try Again</button>
                </div>
              )}
            </div>
          )}

          {/* 6. MEDICAL ADVENTURE */}
          {activeGame === "medical" && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
                <span style={{ fontWeight: 'bold' }}>🩺 La Consulta del Médico</span>
              </div>

              {!medFinished ? (
                <>
                  <div style={{ flex: 1, background: 'rgba(0,0,0,0.15)', padding: '16px', borderRadius: '12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '220px' }}>
                    {medLog.length === 0 ? (
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                        You visit the clinic for checkup. Doctor Martínez enters: "Hola, ¿qué síntomas tienes hoy?"
                      </span>
                    ) : (
                      medLog.map((log, idx) => (
                        <div key={idx} style={{ fontSize: '0.85rem' }}>
                          <strong style={{ color: log.speaker === 'You' ? 'var(--primary)' : 'var(--gold)' }}>{log.speaker}:</strong> {log.text}
                        </div>
                      ))
                    )}
                  </div>

                  <div className="game-choices-container">
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Choose your response:</span>
                    
                    {medStep === 1 && (
                      <>
                        <button className="btn btn-secondary" onClick={() => handleMedChoice(0, 1)} style={{ textAlign: 'left', justifyContent: 'flex-start' }}>
                          1. "Me duele la cabeza y tengo fiebre."
                        </button>
                        <button className="btn btn-secondary" onClick={() => handleMedChoice(1, 1)} style={{ textAlign: 'left', justifyContent: 'flex-start' }}>
                          2. "Mi perro corre rápido."
                        </button>
                      </>
                    )}

                    {medStep === 2 && (
                      <>
                        <button className="btn btn-secondary" onClick={() => handleMedChoice(0, 2)} style={{ textAlign: 'left', justifyContent: 'flex-start' }}>
                          1. "Sí, me duele mucho el estómago después de almorzar."
                        </button>
                        <button className="btn btn-secondary" onClick={() => handleMedChoice(1, 2)} style={{ textAlign: 'left', justifyContent: 'flex-start' }}>
                          2. "Tengo un coche verde en la cocina."
                        </button>
                      </>
                    )}

                    {medStep === 3 && (
                      <>
                        <button className="btn btn-secondary" onClick={() => handleMedChoice(0, 3)} style={{ textAlign: 'left', justifyContent: 'flex-start' }}>
                          1. "No, las piernas están bien, pero me duelen los ojos."
                        </button>
                        <button className="btn btn-secondary" onClick={() => handleMedChoice(1, 3)} style={{ textAlign: 'left', justifyContent: 'flex-start' }}>
                          2. "Mis ojos comen manzanas."
                        </button>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', margin: 'auto' }}>
                  {medSuccess ? (
                    <>
                      <Trophy size={48} color="var(--gold)" style={{ margin: '0 auto 12px', animation: 'float 3s ease-in-out infinite' }} />
                      <h3 style={{ fontSize: '1.4rem', color: 'var(--accent)', marginBottom: '8px' }}>¡Paciente Diagnosticado!</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px', maxWidth: '350px' }}>
                        You described your symptoms accurately to Doctor Martínez and received a prescription.
                        {mistakeCount === 0 ? " Perfect Consultation!" : ` Completed with ${mistakeCount} mistakes.`}
                      </p>
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: '3rem' }}>🤦‍♂️</span>
                      <h3 style={{ fontSize: '1.4rem', color: 'var(--danger)', marginBottom: '8px', marginTop: '12px' }}>Diagnóstico Fallido</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px', maxWidth: '350px' }}>
                        You gave nonsense symptoms, and the doctor got confused. Try again!
                      </p>
                    </>
                  )}
                  <button className="btn btn-secondary" onClick={restartMedical}>Try Again</button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
