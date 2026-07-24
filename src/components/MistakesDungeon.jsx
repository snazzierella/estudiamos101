import React, { useState, useEffect, useRef } from 'react';
import vocabularyData from '../data/vocabulary.json';
import { generateConjugationQuestion } from '../utils/conjugationHelper';
import { formatEnglishPrompt } from '../utils/difficultyMapper';
import { ArrowLeft, Trophy, ShieldAlert, Volume2 } from 'lucide-react';

export default function MistakesDungeon({ state, takeDamage, heal, removeMistake, addXp, addGold, setView }) {
  const [activeMistakes, setActiveMistakes] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [question, setQuestion] = useState(null);
  
  // Question states
  const [answered, setAnswered] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [shakeTrigger, setShakeTrigger] = useState(false);
  const [healTrigger, setHealTrigger] = useState(false);
  
  const [dungeonFinished, setDungeonFinished] = useState(false);
  const [goldBonusEarned, setGoldBonusEarned] = useState(0);
  const [xpBonusEarned, setXpBonusEarned] = useState(0);

  const audioCtxRef = useRef(null);
  const inputRef = useRef(null);

  // Load mistake items from vocabulary data on mount
  useEffect(() => {
    const list = state.mistakes || [];
    const mapped = list.map(spanish => {
      return vocabularyData.find(item => item.spanish.trim().toLowerCase() === spanish.trim().toLowerCase());
    }).filter(Boolean);
    setActiveMistakes(mapped);
    setCurrentIdx(0);
    setDungeonFinished(false);
  }, [state.mistakes]);

  // Generate question for the current active mistake item
  useEffect(() => {
    if (activeMistakes.length === 0 || currentIdx >= activeMistakes.length || dungeonFinished) {
      if (activeMistakes.length > 0 && currentIdx >= activeMistakes.length) {
        finishDungeon();
      }
      return;
    }

    buildDungeonQuestion(activeMistakes[currentIdx]);
  }, [activeMistakes, currentIdx, dungeonFinished]);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
  };

  const playSound = (type) => {
    try {
      initAudio();
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'correct') {
        const now = ctx.currentTime;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        gain.gain.setValueAtTime(0.08, now);
        osc.start(now);
        osc.frequency.setValueAtTime(659.25, now + 0.1);
        osc.stop(now + 0.25);
      } else if (type === 'wrong') {
        const now = ctx.currentTime;
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(70, now + 0.3);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.35);
      }
    } catch (e) {
      console.warn("Audio synthesis blocked:", e);
    }
  };

  const speakSpanish = (text) => {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      let clean = text.split("/")[0].split(" o ")[0].replace(/\(.*?\)/g, "").replace(/[¿¡!?]/g, "").trim();
      if (!clean) return;
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = 'es-MX';
      const voices = window.speechSynthesis.getVoices();
      const spanishVoice = voices.find(v => v.lang.toLowerCase() === 'es-mx') ||
                           voices.find(v => v.lang.toLowerCase() === 'es-es') ||
                           voices.find(v => v.lang.toLowerCase().includes('es'));
      if (spanishVoice) {
        utterance.voice = spanishVoice;
      }
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("TTS Error:", e);
    }
  };

  const buildDungeonQuestion = (item) => {
    setAnswered(false);
    setSelectedChoice(null);
    setTypedAnswer("");

    const isVerb = item.category === "Verbs" && item.subcategory !== "Verbs Structured Like Gustar";
    // 40% chance of conjugation for verbs, otherwise translation
    const wantsConjugation = isVerb && !state.excludeVosotros && Math.random() > 0.6;

    if (wantsConjugation) {
      const qSpec = generateConjugationQuestion(item, { excludeVosotros: state.excludeVosotros });
      if (qSpec) {
        setQuestion({
          item,
          isConjugation: true,
          questionWord: qSpec.verb,
          meaning: qSpec.meaning,
          pronoun: qSpec.pronoun,
          correct: qSpec.correct,
          choices: qSpec.choices
        });
        return;
      }
    }

    // Determine type: 0 = MC es->en, 1 = MC en->es, 2 = typing en->es
    let qType = Math.floor(Math.random() * 3);
    if (qType === 2 && (item.spanish.includes("/") || item.spanish.includes("(") || item.spanish.length > 25)) {
      qType = Math.random() > 0.5 ? 0 : 1;
    }

    const isEsToEn = qType === 0;
    const correctText = isEsToEn ? formatEnglishPrompt(item.spanish, item.english) : item.spanish;
    const questionText = isEsToEn ? item.spanish : formatEnglishPrompt(item.spanish, item.english);

    // generate distractors
    const distractors = [];
    while (distractors.length < 3) {
      const rand = vocabularyData[Math.floor(Math.random() * vocabularyData.length)];
      const val = isEsToEn ? formatEnglishPrompt(rand.spanish, rand.english) : rand.spanish;
      if (val.toLowerCase() !== correctText.toLowerCase() && !distractors.includes(val) && val.length < 35) {
        distractors.push(val);
      }
    }

    setQuestion({
      item,
      isConjugation: false,
      type: qType, // 0: MC es->en, 1: MC en->es, 2: typing en->es
      questionWord: questionText,
      correct: correctText,
      choices: [correctText, ...distractors].sort(() => Math.random() - 0.5)
    });
  };

  const cleanAnswer = (str) => {
    if (!str) return "";
    return str
      .toLowerCase()
      .replace(/[¿¡!?.“”"'()\-–—,;:]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  const compareAnswers = (correct, user) => {
    const cleanCorrect = cleanAnswer(correct);
    const cleanUser = cleanAnswer(user);
    if (cleanCorrect === cleanUser) return true;
    if (correct && correct.includes("/")) {
      const parts = correct.split("/");
      for (let part of parts) {
        if (cleanAnswer(part) === cleanUser) return true;
      }
    }
    return false;
  };

  const handleChoiceAnswer = (choice) => {
    if (answered) return;
    setSelectedChoice(choice);
    setAnswered(true);

    const isCorrect = choice.trim().toLowerCase() === question.correct.trim().toLowerCase();
    processAnswerResult(isCorrect);
  };

  const handleTypedSubmit = (e) => {
    e.preventDefault();
    if (answered || !typedAnswer.trim()) return;
    setAnswered(true);

    const isCorrect = compareAnswers(question.correct, typedAnswer);
    if (!isCorrect) {
      setSelectedChoice(typedAnswer);
    }
    processAnswerResult(isCorrect);
  };

  const processAnswerResult = (isCorrect) => {
    if (isCorrect) {
      setHealTrigger(true);
      playSound('correct');
      // heal player +5 HP
      heal(5);
      // Remove word from mistake queue
      removeMistake(question.item.spanish);
      setTimeout(() => setHealTrigger(false), 500);
    } else {
      setShakeTrigger(true);
      playSound('wrong');
      // take standard damage (reduced if shield is equipped)
      takeDamage(15);
      setTimeout(() => setShakeTrigger(false), 500);
    }
  };

  const handleNext = () => {
    if (currentIdx < activeMistakes.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      finishDungeon();
    }
  };

  const finishDungeon = () => {
    // Grant bonus gold and XP based on cleared mistakes
    const goldBonus = activeMistakes.length * 3;
    const xpBonus = activeMistakes.length * 10;
    addGold(goldBonus);
    addXp(xpBonus);
    setGoldBonusEarned(goldBonus);
    setXpBonusEarned(xpBonus);
    setDungeonFinished(true);
  };

  const handleInsertAccent = (char) => {
    if (!inputRef.current) return;
    const start = inputRef.current.selectionStart || 0;
    const end = inputRef.current.selectionEnd || 0;
    const newText = typedAnswer.substring(0, start) + char + typedAnswer.substring(end);
    setTypedAnswer(newText);
    setTimeout(() => {
      inputRef.current.focus();
      inputRef.current.setSelectionRange(start + 1, start + 1);
    }, 0);
  };

  // If fainted or no HP, show fainting panel
  if (state.fainted || state.hp <= 0) {
    return (
      <div className="view-container" style={{ position: 'relative', minHeight: '400px' }}>
        <div className="glass-panel fainted-overlay">
          <div className="fainted-icon">💀</div>
          <h3 className="fainted-title">¡Has caído! (You Fainted)</h3>
          <p className="fainted-desc">
            The ghost words in the dungeon were too strong. Eat red potions or use elixirs from the shop to restore health and fight them again!
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-secondary" onClick={() => setView('dashboard')}>
              Back to Hub
            </button>
            <button className="btn btn-primary" onClick={() => setView('shop')}>
              Visit Shop
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If no mistakes in queue initially
  if (activeMistakes.length === 0 && !dungeonFinished) {
    return (
      <div className="view-container">
        <div className="view-header">
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem' }}>La Mazmorra de Errores</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Battle and purify vocabulary words you recently got wrong.</p>
          </div>
          <button className="btn btn-secondary" onClick={() => setView('dashboard')}>
            <ArrowLeft size={16} /> Back to Hub
          </button>
        </div>

        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', margin: '40px auto', maxWidth: '500px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px', animation: 'float 3s ease-in-out infinite' }}>🐉💤</div>
          <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--accent)', fontSize: '1.4rem', marginBottom: '12px' }}>Dungeon Clear!</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '24px' }}>
            The dragon sleeps. You have no active mistakes to clear right now! Go practice quests or mini-games to challenge yourself.
          </p>
          <button className="btn btn-primary" onClick={() => setView('dashboard')}>
            Continuar Aventura
          </button>
        </div>
      </div>
    );
  }

  // If successfully finished the dungeon clearing session
  if (dungeonFinished) {
    return (
      <div className="view-container">
        <div className="view-header">
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem' }}>La Mazmorra de Errores</h2>
          </div>
          <button className="btn btn-secondary" onClick={() => setView('dashboard')}>
            <ArrowLeft size={16} /> Back to Hub
          </button>
        </div>

        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', margin: '40px auto', maxWidth: '500px' }}>
          <Trophy size={64} color="var(--gold)" style={{ margin: '0 auto 16px', animation: 'float 3s ease-in-out infinite' }} />
          <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--accent)', fontSize: '1.6rem', marginBottom: '12px' }}>¡Mazmorra Purificada!</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '24px' }}>
            You have successfully cleared your recent mistakes and purified the dungeon! The spirits rest.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '28px' }}>
            <span style={{ background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.3)', color: 'var(--gold)', padding: '8px 16px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 'bold' }}>
              +{goldBonusEarned} Gold Coins
            </span>
            <span style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', color: 'var(--primary)', padding: '8px 16px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 'bold' }}>
              +{xpBonusEarned} XP
            </span>
          </div>

          <button className="btn btn-primary" onClick={() => setView('dashboard')} style={{ width: '100%' }}>
            Regresar al Castillo
          </button>
        </div>
      </div>
    );
  }

  const currentQ = question;
  if (!currentQ) return null;

  const currentItem = currentQ.item;
  const isConjugation = currentQ.isConjugation;
  const isTyping = !isConjugation && currentQ.type === 2;

  // Render the battle interface
  return (
    <div className="view-container">
      <div className="view-header">
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem' }}>La Mazmorra de Errores (Mistakes Dungeon)</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Defeating Ghost {currentIdx + 1} of {activeMistakes.length}
          </p>
        </div>
        <button className="btn btn-secondary" onClick={() => setView('dashboard')}>
          Escape Dungeon
        </button>
      </div>

      {/* Battleground Console */}
      <div className={`glass-panel quiz-box ${shakeTrigger ? 'shake-anim' : ''} ${healTrigger ? 'heal-pulse' : ''}`} style={{ border: '1px solid rgba(239, 68, 68, 0.2)' }}>
        
        {/* Dungeon Header stats */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            👻 Ghost Category: <strong>{currentItem.subcategory}</strong>
          </span>
          <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>
            ❤️ Your HP: {state.hp}/100
          </span>
        </div>

        {/* Progress Bar */}
        <div className="quiz-progress-track">
          <div className="quiz-progress-fill" style={{ width: `${((currentIdx) / activeMistakes.length) * 100}%`, background: 'var(--danger)' }}></div>
        </div>

        {/* Ghost visual box */}
        <div style={{ background: 'rgba(0,0,0,0.15)', padding: '24px', borderRadius: '16px', textAlign: 'center', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.02)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '10px', animation: 'float 2.5s ease-in-out infinite' }}>👻</div>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '4px' }}>
            {isConjugation ? "Present Conjugation" : (isTyping ? "Write Translation" : "Translate Word")}
          </div>
          
          {isConjugation ? (
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Conjugate: <strong>{currentQ.questionWord}</strong> ({currentQ.meaning})</div>
              <div style={{ fontSize: '1.8rem', fontFamily: 'var(--font-display)', color: 'var(--primary)', fontWeight: '800', marginTop: '6px' }}>{currentQ.pronoun} [______]</div>
            </div>
          ) : (
            <div>
              <div className="quiz-word" style={{ fontSize: '2rem' }}>{currentQ.questionWord}</div>
              <button 
                onClick={() => speakSpanish(currentItem.spanish)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}
                title="Speak Pronunciation"
              >
                <Volume2 size={14} /> Pronounce
              </button>
            </div>
          )}
        </div>

        {/* Input/Choices Area */}
        {isTyping ? (
          <form onSubmit={handleTypedSubmit} className="quiz-input-wrapper">
            <input
              ref={inputRef}
              type="text"
              className={`quiz-input ${answered ? (compareAnswers(currentQ.correct, typedAnswer) ? 'correct' : 'wrong') : ''}`}
              placeholder="Type translation in Spanish..."
              value={typedAnswer}
              onChange={(e) => setTypedAnswer(e.target.value)}
              disabled={answered}
              autoFocus
            />
            
            {/* Accent characters insert bar */}
            {!answered && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', margin: '4px 0' }}>
                {['á', 'é', 'í', 'ó', 'ú', 'ñ', 'ü', '¿', '¡'].map(char => (
                  <button
                    key={char}
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '6px 10px', fontSize: '0.8rem', minWidth: '32px' }}
                    onClick={() => handleInsertAccent(char)}
                  >
                    {char}
                  </button>
                ))}
              </div>
            )}

            {!answered && (
              <button type="submit" className="btn btn-danger" style={{ width: '100%', marginTop: '8px' }}>
                ⚔️ Strike Ghost
              </button>
            )}
          </form>
        ) : (
          <div className="quiz-choices-grid">
            {currentQ.choices.map((choice, i) => {
              const isChoiceSelected = selectedChoice === choice;
              const isChoiceCorrect = choice.trim().toLowerCase() === currentQ.correct.trim().toLowerCase();
              
              let btnClass = "";
              if (answered) {
                if (isChoiceCorrect) btnClass = "correct";
                else if (isChoiceSelected) btnClass = "wrong";
              } else if (isChoiceSelected) {
                btnClass = "selected";
              }

              return (
                <button
                  key={i}
                  className={`quiz-choice-btn ${btnClass}`}
                  disabled={answered}
                  onClick={() => handleChoiceAnswer(choice)}
                >
                  {choice}
                </button>
              );
            })}
          </div>
        )}

        {/* Feedback box */}
        {answered && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
            <div className={`quiz-feedback-box ${selectedChoice === question.correct || (isTyping && compareAnswers(question.correct, typedAnswer)) ? 'correct' : 'wrong'}`} style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
              {selectedChoice === question.correct || (isTyping && compareAnswers(question.correct, typedAnswer)) ? (
                <span>✨ ¡Excelente! Correct answer: <strong>{question.correct}</strong></span>
              ) : (
                <span>⚠️ Incorrect! Correct form: <strong>{question.correct}</strong></span>
              )}
            </div>

            <button className="btn btn-primary" onClick={handleNext} style={{ width: '100%' }}>
              Continue
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
