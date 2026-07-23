import React, { useState, useEffect } from 'react';
import vocabularyData from '../data/vocabulary.json';
import { getWordDifficulty, formatEnglishPrompt } from '../utils/difficultyMapper';
import { generateFillInTheBlank } from '../utils/conjugationHelper';
import { Swords, ArrowRight, Trophy } from 'lucide-react';

export default function PlacementTest({ completePlacement }) {
  const [started, setStarted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0); // 0 to 9
  const [currentDifficulty, setCurrentDifficulty] = useState(2); // Starts at 2 (Easy)
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Generate a question based on current difficulty
  const generateQuestion = (diffLevel) => {
    // Filter words matching target difficulty rating
    const matchingWords = vocabularyData.filter(item => getWordDifficulty(item) === diffLevel);
    
    if (matchingWords.length === 0) {
      // Fallback if none found
      return {
        spanish: "hola",
        correct: "hello",
        choices: ["hello", "bye", "dog", "cat"],
        difficulty: 1
      };
    }

    // Pick a random word
    const randWord = matchingWords[Math.floor(Math.random() * matchingWords.length)];

    if (randWord.category === "Sentences") {
      const fillSpec = generateFillInTheBlank(randWord);
      if (fillSpec) {
        return {
          spanish: fillSpec.sentence,
          correct: fillSpec.correct,
          choices: fillSpec.choices,
          difficulty: diffLevel,
          originalItem: randWord,
          isFillInTheBlank: true,
          meaning: fillSpec.meaning
        };
      }
    }
    
    // Choose question translation direction: 0 = Spanish to English, 1 = English to Spanish
    const qType = Math.random() > 0.5 ? 1 : 0;
    const correctVal = qType === 1 ? randWord.spanish : formatEnglishPrompt(randWord.spanish, randWord.english);
    const questionWord = qType === 1 ? formatEnglishPrompt(randWord.spanish, randWord.english) : randWord.spanish;

    // Generate distractors
    const distractors = [];
    while (distractors.length < 3) {
      const randItem = vocabularyData[Math.floor(Math.random() * vocabularyData.length)];
      const val = qType === 1 ? randItem.spanish : formatEnglishPrompt(randItem.spanish, randItem.english);
      if (
        val.toLowerCase() !== correctVal.toLowerCase() && 
        !distractors.includes(val) &&
        val.length < 35
      ) {
        distractors.push(val);
      }
    }

    const choices = [correctVal, ...distractors].sort(() => Math.random() - 0.5);

    return {
      spanish: questionWord,
      correct: correctVal,
      choices: choices,
      difficulty: diffLevel,
      originalItem: randWord
    };
  };

  // Generate first question on mount
  useEffect(() => {
    setActiveQuestion(generateQuestion(2));
  }, []);

  const handleSelect = (choice) => {
    if (selectedAnswer !== null) return; // locked
    setSelectedAnswer(choice);
    
    const isCorrect = choice.trim().toLowerCase() === activeQuestion.correct.trim().toLowerCase();

    if (isCorrect) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    const isCorrect = selectedAnswer.trim().toLowerCase() === activeQuestion.correct.trim().toLowerCase();
    
    // Determine next difficulty level adaptively
    let nextDifficulty = currentDifficulty;
    if (isCorrect) {
      nextDifficulty = Math.min(5, currentDifficulty + 1);
    } else {
      nextDifficulty = Math.max(1, currentDifficulty - 1);
    }

    setSelectedAnswer(null);

    if (currentIdx < 9) {
      setCurrentIdx(prev => prev + 1);
      setCurrentDifficulty(nextDifficulty);
      setActiveQuestion(generateQuestion(nextDifficulty));
    } else {
      setIsFinished(true);
    }
  };

  const getPlacementRank = () => {
    if (currentDifficulty >= 5 && score >= 7) {
      return { 
        level: "Experto (Stage 7 - Verbs)", 
        stage: 7,
        gold: score * 8, 
        xp: score * 30, 
        desc: "Increíble! You completed the quiz at high difficulty. You will start at Level 3 and skip straight to Stage 7 (Verb conjugations)!" 
      };
    }
    if (currentDifficulty >= 4 && score >= 5) {
      return { 
        level: "Intermedio Alto (Stage 5 - Time & Courses)", 
        stage: 5,
        gold: score * 8, 
        xp: score * 30, 
        desc: "Bien hecho! You placed at intermediate difficulty. You will start at Level 2 and skip directly to Stage 5 (Time, Calendars & Courses)!" 
      };
    }
    if (currentDifficulty >= 3 && score >= 4) {
      return { 
        level: "Intermedio (Stage 3 - City & Classroom)", 
        stage: 3,
        gold: score * 8, 
        xp: score * 30, 
        desc: "Muy bien! You placed at lower-intermediate difficulty. You will start at Stage 3 (Classroom, Cities, Colors)!" 
      };
    }
    return { 
      level: "Principiante (Stage 1 - Basics)", 
      stage: 1,
      gold: score * 8, 
      xp: score * 30, 
      desc: "Perfect! A clean slate. You will start at Level 1, Stage 1 (Greetings, Articles, Numbers) to learn the foundations." 
    };
  };

  const handleFinish = () => {
    completePlacement(score, currentDifficulty);
  };

  if (!started) {
    return (
      <div className="glass-panel quiz-box" style={{ textAlign: 'center', padding: '40px', maxWidth: '500px', margin: '40px auto', animation: 'pop-in 0.4s ease-out' }}>
        <Swords size={60} color="var(--accent)" style={{ margin: '0 auto 20px', animation: 'float 3s ease-in-out infinite' }} />
        <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', marginBottom: '12px' }}>Prueba de Nivel</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '30px' }}>
          Welcome to Vocab Aventura! This quick 10-question adaptive test determines your starting stage. Correct answers increase difficulty, while mistakes lower it.
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button className="btn btn-primary" onClick={() => setStarted(true)} style={{ padding: '14px', fontSize: '1rem', fontWeight: 'bold' }}>
            Take Placement Test <ArrowRight size={16} />
          </button>
          <button className="btn btn-secondary" onClick={() => completePlacement(0, 1)} style={{ padding: '12px', fontSize: '0.9rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)' }}>
            Skip & Start from Beginning (Stage 1)
          </button>
        </div>
      </div>
    );
  }

  if (!activeQuestion) {
    return <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>Loading Placement Assessment...</div>;
  }

  if (isFinished) {
    const rank = getPlacementRank();
    return (
      <div className="glass-panel quiz-box" style={{ animation: 'pop-in 0.4s ease-out' }}>
        <div style={{ textAlign: 'center', padding: '10px' }}>
          <Trophy size={60} color="var(--gold)" style={{ margin: '0 auto 16px', animation: 'float 3s ease-in-out infinite' }} />
          <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>Evaluación Completada</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Adaptive assessment finished!</p>
          
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '16px', border: '1px solid var(--card-border)', marginBottom: '30px' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Score / Final Difficulty</div>
            <div style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--accent)', margin: '8px 0' }}>
              {score} / 10 (Tier {currentDifficulty})
            </div>
            
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--gold)', marginTop: '16px' }}>
              Unlocking: {rank.level}
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '8px', maxWidth: '380px', margin: '8px auto 0', lineHeight: '1.4' }}>
              {rank.desc}
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ display: 'block', color: 'var(--gold)', fontWeight: 800, fontSize: '1.2rem' }}>+{rank.gold}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Gold Coins</span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ display: 'block', color: 'var(--primary)', fontWeight: 800, fontSize: '1.2rem' }}>+{rank.xp}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>XP Bonus</span>
              </div>
            </div>
          </div>

          <button className="btn btn-accent" onClick={handleFinish} style={{ width: '100%', maxWidth: '280px', margin: '0 auto' }}>
            Comenzar Búsqueda <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel quiz-box">
      <div className="quiz-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Swords size={20} color="var(--primary)" />
          <span style={{ fontWeight: 700, fontFamily: 'var(--font-display)' }}>Placement (Adaptive Level: Tier {currentDifficulty})</span>
        </div>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Question {currentIdx + 1} of 10</span>
      </div>

      <div className="quiz-progress-track">
        <div className="quiz-progress-fill" style={{ width: `${((currentIdx + 1) / 10) * 100}%` }}></div>
      </div>

      <div className="quiz-question-card">
        <div className="quiz-question-lbl">
          {activeQuestion.isFillInTheBlank 
            ? "Completar la frase (Fill in the blank):"
            : "Translate this term:"}
        </div>
        <h3 className="quiz-word">{activeQuestion.spanish}</h3>
        {activeQuestion.isFillInTheBlank && (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontStyle: 'italic', marginTop: '8px' }}>
            ({activeQuestion.meaning})
          </p>
        )}
      </div>

      <div className="quiz-choices-grid">
        {activeQuestion.choices.map((choice, idx) => {
          let btnClass = "";
          if (selectedAnswer !== null) {
            if (choice === activeQuestion.correct) {
              btnClass = "correct";
            } else if (choice === selectedAnswer) {
              btnClass = "wrong";
            }
          }

          return (
            <button
              key={idx}
              className={`quiz-choice-btn ${btnClass}`}
              onClick={() => handleSelect(choice)}
              disabled={selectedAnswer !== null}
            >
              {choice}
            </button>
          );
        })}
      </div>

      {selectedAnswer !== null && (
        <div 
          className={`quiz-feedback-box ${selectedAnswer === activeQuestion.correct ? 'correct' : 'wrong'}`}
          style={{ animation: 'pop-in 0.3s ease-out' }}
        >
          {selectedAnswer === activeQuestion.correct 
            ? "¡Correcto! Well done. Moving to harder tier." 
            : `Incorrecto. Correct translation: "${activeQuestion.correct}". Dropping difficulty tier.`
          }
          <button 
            className="btn btn-primary" 
            onClick={handleNext}
            style={{ width: '100%', marginTop: '16px' }}
          >
            {currentIdx === 9 ? "Finish Test" : "Next Question"} <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
