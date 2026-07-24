import React, { useState, useEffect, useRef } from 'react';
import vocabularyData from '../data/vocabulary.json';
import { STAGES, getStageForSubcategory, formatEnglishPrompt } from '../utils/difficultyMapper';
import { generateConjugationQuestion, generateFillInTheBlank, conjugate } from '../utils/conjugationHelper';
import { 
  BookOpen, 
  Swords, 
  ArrowLeft, 
  ArrowRight, 
  Volume2, 
  Coins, 
  Heart, 
  Award, 
  Sparkles, 
  Shuffle, 
  Lock, 
  Flame, 
  CheckCircle,
  HelpCircle,
  Play
} from 'lucide-react';

export default function StudyQuest({ 
  state, 
  addXp, 
  addGold, 
  takeDamage, 
  revive, 
  recordWordAnsweredCorrectly, 
  recordQuizPerformance, 
  advanceQuest, 
  passStageReview, 
  markFlashcardsSeen, 
  addMistake, 
  updateWordMastery, 
  toggleAutoSpeak, 
  setView, 
  defaultTab = "quest" 
}) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  // -------------------------------------------------------------
  // STATE FOR QUEST CAMPAIGN
  // -------------------------------------------------------------
  const [questStarted, setQuestStarted] = useState(false);
  const [questQuestions, setQuestQuestions] = useState([]);
  const [questCurrentIdx, setQuestCurrentIdx] = useState(0);
  const [questFinished, setQuestFinished] = useState(false);
  const [questScore, setQuestScore] = useState(0);
  const [questFlipped, setQuestFlipped] = useState(false); // for card intro
  const [questAnswered, setQuestAnswered] = useState(false);
  const [questSelected, setQuestSelected] = useState(null);
  const [questSuccessMsg, setQuestSuccessMsg] = useState("");
  const [questFailMsg, setQuestFailMsg] = useState("");
  const [shakeTrigger, setShakeTrigger] = useState(false);
  const [healTrigger, setHealTrigger] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [questMissedQuestions, setQuestMissedQuestions] = useState([]);
  const [redemptionQuestions, setRedemptionQuestions] = useState([]);
  const [redemptionActive, setRedemptionActive] = useState(false);
  const [redemptionCurrentIdx, setRedemptionCurrentIdx] = useState(0);
  const [redemptionTyped, setRedemptionTyped] = useState("");
  const [redemptionAnswered, setRedemptionAnswered] = useState(false);
  const [redemptionSelected, setRedemptionSelected] = useState(null);
  const [redemptionScore, setRedemptionScore] = useState(0);
  const [redemptionFailed, setRedemptionFailed] = useState(false);
  const [redemptionSuccess, setRedemptionSuccess] = useState(false);

  // RPG & Combo details
  const [comboCount, setComboCount] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [codexVerb, setCodexVerb] = useState(null);
  const [isListening, setIsListening] = useState(false);
  
  const questInputRef = useRef(null);
  const practiceInputRef = useRef(null);

  // -------------------------------------------------------------
  // STATE FOR FREE PRACTICE
  // -------------------------------------------------------------
  const [practiceMode, setPracticeMode] = useState("cards"); // "cards" or "quiz"
  const [practiceCategories, setPracticeCategories] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("Nouns");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [practiceCards, setPracticeCards] = useState([]);
  const [practiceCurrentIdx, setPracticeCurrentIdx] = useState(0);
  const [practiceFlipped, setPracticeFlipped] = useState(false);
  const [practiceQuizStarted, setPracticeQuizStarted] = useState(false);
  const [practiceQuizFinished, setPracticeQuizFinished] = useState(false);
  const [practiceQuizMode, setPracticeQuizMode] = useState("translation"); // "translation" or "conjugation"
  const [practiceQuestions, setPracticeQuestions] = useState([]);
  const [practiceScore, setPracticeScore] = useState(0);
  const [practiceAnswered, setPracticeAnswered] = useState(false);
  const [practiceSelected, setPracticeSelected] = useState(null);
  const [practiceTyped, setPracticeTyped] = useState("");

  // Speech and Audio synthesis refs
  const [speechAvailable, setSpeechAvailable] = useState(false);
  const audioCtxRef = useRef(null);

  // Initialize Speech
  useEffect(() => {
    if ('speechSynthesis' in window) {
      setSpeechAvailable(true);
    }

    // Group categories for free practice
    const grouped = {};
    vocabularyData.forEach(item => {
      if (!grouped[item.category]) {
        grouped[item.category] = new Set();
      }
      grouped[item.category].add(item.subcategory);
    });
    const formatted = {};
    Object.keys(grouped).forEach(cat => {
      formatted[cat] = Array.from(grouped[cat]);
    });
    setPracticeCategories(formatted);
    if (formatted["Nouns"] && formatted["Nouns"].length > 0) {
      setSelectedSubcategory(formatted["Nouns"][0]);
    }
  }, []);

  // Listen for user fainting during an active Quest Campaign level
  useEffect(() => {
    if (state.fainted && questStarted) {
      setQuestStarted(false);
      const finalMissed = [...questMissedQuestions];
      if (currentQuestQ && !finalMissed.some(q => q.questionWord === currentQuestQ.questionWord)) {
        finalMissed.push(currentQuestQ);
      }
      setRedemptionQuestions(finalMissed);
      setRedemptionActive(true);

      setQuestFinished(false);
      setRedemptionCurrentIdx(0);
      setRedemptionTyped("");
      setRedemptionAnswered(false);
      setRedemptionSelected(null);
      setRedemptionScore(0);
      setRedemptionFailed(false);
      setRedemptionSuccess(false);
      setComboCount(0);
    }
  }, [state.fainted, questStarted]);

  // Autoplay TTS for card introductions
  useEffect(() => {
    if (questStarted && currentQuestQ && currentQuestQ.isCardIntro && state.autoSpeak) {
      if (!questFlipped) {
        speakSpanish(currentQuestQ.item.spanish);
      }
    }
  }, [questStarted, questCurrentIdx, questFlipped]);

  // Filter free practice cards when category changes
  useEffect(() => {
    if (!selectedSubcategory) return;
    const filtered = vocabularyData.filter(item => 
      item.category === selectedCategory && item.subcategory === selectedSubcategory
    );
    setPracticeCards(filtered);
    setPracticeCurrentIdx(0);
    setPracticeFlipped(false);
    setPracticeQuizStarted(false);
    setPracticeQuizFinished(false);
  }, [selectedCategory, selectedSubcategory]);

  const handleCategoryChange = (e) => {
    const cat = e.target.value;
    setSelectedCategory(cat);
    if (practiceCategories[cat] && practiceCategories[cat].length > 0) {
      setSelectedSubcategory(practiceCategories[cat][0]);
    }
  };

  const subcategories = practiceCategories[selectedCategory] || [];

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
      console.warn("Audio synthesis block:", e);
    }
  };

  const speakSpanish = (text) => {
    if (!speechAvailable) return;
    try {
      window.speechSynthesis.cancel();
      let clean = text
        .split("/")[0]
        .split(" o ")[0]
        .replace(/\(.*?\)/g, "")
        .replace(/[¿¡!?]/g, "")
        .trim();

      if (!clean) return;

      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = 'es-MX';

      const voices = window.speechSynthesis.getVoices();
      const spanishVoice = voices.find(v => v.lang.toLowerCase() === 'es-mx') ||
                           voices.find(v => v.lang.toLowerCase() === 'es-es') ||
                           voices.find(v => v.lang.toLowerCase().includes('es'));
      if (spanishVoice) {
        utterance.voice = spanishVoice;
        utterance.lang = spanishVoice.lang;
      }

      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("TTS Error:", e);
    }
  };

  const SYNONYM_GROUPS = [
    ["adiós", "adios", "chao", "bye", "goodbye", "bye-bye"],
    ["andar", "caminar", "to walk", "walk"],
    ["bonito", "lindo", "hermoso", "pretty", "beautiful", "lovely"],
    ["maestro", "profesor", "teacher", "professor"],
    ["coche", "carro", "auto", "car", "automobile"],
    ["bolígrafo", "pluma", "pen"],
    ["conversar", "hablar", "to talk", "to speak", "talk", "speak", "converse"],
    ["computadora", "ordenador", "computer"],
    ["estudiante", "alumno", "student"],
    ["apartamento", "departamento", "apartment"],
    ["lápiz", "lapiz", "pencil"],
    ["esposa", "mujer", "wife", "woman"],
  ];

  const cleanAnswer = (str) => {
    if (!str) return "";
    return str
      .toLowerCase()
      .replace(/[¿¡!?.“”"'()\-–—,;:]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  const checkSynonyms = (val1, val2) => {
    const c1 = cleanAnswer(val1);
    const c2 = cleanAnswer(val2);
    if (c1 === c2) return true;
    
    for (let group of SYNONYM_GROUPS) {
      const cleanGroup = group.map(g => cleanAnswer(g));
      if (cleanGroup.includes(c1) && cleanGroup.includes(c2)) {
        return true;
      }
    }
    return false;
  };

  const compareAnswers = (correct, user) => {
    if (checkSynonyms(correct, user)) return true;

    if (correct && correct.includes("/")) {
      const parts = correct.split("/");
      for (let part of parts) {
        if (checkSynonyms(part, user)) {
          return true;
        }
      }
    }
    return false;
  };

  // Web Speech API Voice Dictation
  const handleVoiceInput = (mode) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-MX';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onerror = (e) => {
      console.error("Speech Recognition Error", e);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      if (mode === "quest") {
        setTypedAnswer(text);
      } else if (mode === "practice") {
        setPracticeTyped(text);
      }
    };

    recognition.start();
  };

  // -------------------------------------------------------------
  // QUEST CAMPAIGN CORE LOGIC
  // -------------------------------------------------------------
  const buildProgressiveQuizStep = (item, L) => {
    const isVerb = item.category === "Verbs" && item.subcategory !== "Verbs Structured Like Gustar";
    const isSentence = item.category === "Sentences";
    
    if (isSentence) {
      const fillSpec = generateFillInTheBlank(item);
      if (fillSpec) {
        return {
          item,
          isCardIntro: false,
          isConjugation: false,
          isFillInTheBlank: true,
          questionWord: fillSpec.sentence,
          meaning: fillSpec.meaning,
          correct: fillSpec.correct,
          choices: fillSpec.choices
        };
      }
    }

    let format = "mc"; // "mc", "conjugation", "typing"
    
    if (L <= 5) {
      format = "mc";
    } else if (L <= 10) {
      format = Math.random() > 0.75 ? (isVerb && !state.excludeVosotros ? "conjugation" : "typing") : "mc";
    } else if (L <= 15) {
      format = Math.random() > 0.5 ? (isVerb && !state.excludeVosotros ? "conjugation" : "typing") : "mc";
    } else {
      format = Math.random() > 0.3 ? (isVerb && !state.excludeVosotros ? "conjugation" : "typing") : "mc";
    }

    if (format === "conjugation") {
      const qSpec = generateConjugationQuestion(item, { excludeVosotros: state.excludeVosotros });
      if (qSpec) {
        return {
          item,
          isCardIntro: false,
          isConjugation: true,
          questionWord: qSpec.verb,
          meaning: qSpec.meaning,
          pronoun: qSpec.pronoun,
          correct: qSpec.correct,
          choices: qSpec.choices
        };
      }
    }
    
    if (format === "typing") {
      const correctText = item.spanish;
      const questionText = formatEnglishPrompt(item.spanish, item.english);
      
      if (item.spanish.includes("/") || item.spanish.includes("(") || item.spanish.length > 25) {
        format = "mc";
      } else {
        return {
          item,
          isCardIntro: false,
          isConjugation: false,
          type: 2,
          questionWord: questionText,
          correct: correctText,
          choices: []
        };
      }
    }

    const qType = Math.random() > 0.5 ? 0 : 1;
    const isEsToEn = qType === 0;
    const correctText = isEsToEn ? formatEnglishPrompt(item.spanish, item.english) : item.spanish;
    const questionText = isEsToEn ? item.spanish : formatEnglishPrompt(item.spanish, item.english);

    const distractors = [];
    const answeredCorrectlyBefore = state.wordsAnsweredCorrectly?.includes(item.spanish);

    if (answeredCorrectlyBefore) {
      const sameSub = vocabularyData.filter(rand => rand.subcategory === item.subcategory);
      const shuffledSub = [...sameSub].sort(() => Math.random() - 0.5);
      for (let rand of shuffledSub) {
        const val = isEsToEn ? formatEnglishPrompt(rand.spanish, rand.english) : rand.spanish;
        if (
          val.toLowerCase() !== correctText.toLowerCase() && 
          !checkSynonyms(val, correctText) &&
          !distractors.includes(val) &&
          val.length < 35
        ) {
          distractors.push(val);
        }
        if (distractors.length === 3) break;
      }

      if (distractors.length < 3) {
        const sameCat = vocabularyData.filter(rand => rand.category === item.category);
        const shuffledCat = [...sameCat].sort(() => Math.random() - 0.5);
        for (let rand of shuffledCat) {
          const val = isEsToEn ? formatEnglishPrompt(rand.spanish, rand.english) : rand.spanish;
          if (
            val.toLowerCase() !== correctText.toLowerCase() && 
            !checkSynonyms(val, correctText) &&
            !distractors.includes(val) &&
            val.length < 35
          ) {
            distractors.push(val);
          }
          if (distractors.length === 3) break;
        }
      }
    }

    if (distractors.length < 3) {
      const shuffledAll = [...vocabularyData].sort(() => Math.random() - 0.5);
      for (let rand of shuffledAll) {
        const val = isEsToEn ? formatEnglishPrompt(rand.spanish, rand.english) : rand.spanish;
        if (
          val.toLowerCase() !== correctText.toLowerCase() && 
          !checkSynonyms(val, correctText) &&
          !distractors.includes(val) &&
          val.length < 35
        ) {
          distractors.push(val);
        }
        if (distractors.length === 3) break;
      }
    }
    const choices = [correctText, ...distractors].sort(() => Math.random() - 0.5);

    return {
      item,
      isCardIntro: false,
      isConjugation: false,
      type: qType,
      questionWord: questionText,
      correct: correctText,
      choices: choices
    };
  };

  const startQuestLevel = () => {
    initAudio();
    const activeStage = STAGES[state.questStage];
    if (!activeStage) return;

    setQuestMissedQuestions([]);
    setComboCount(0);
    setMaxCombo(0);

    // Leitner Box / SRS Weighting selection:
    // Gather all words in stage, look up mastery, low mastery (<=2) gets weight 3.
    const stageItemsRaw = vocabularyData.filter(item => 
      activeStage.subcategories.includes(item.subcategory)
    );

    const wordMastery = state.wordMastery || {};
    const weightedItems = [];
    stageItemsRaw.forEach(item => {
      const rating = wordMastery[item.spanish] !== undefined ? wordMastery[item.spanish] : 2;
      const weight = rating <= 2 ? 3 : 1;
      for (let w = 0; w < weight; w++) {
        weightedItems.push(item);
      }
    });

    const getUniqueItems = (weighted, count, excludeSet = []) => {
      const result = [];
      const seen = new Set(excludeSet);
      const shuffled = [...weighted].sort(() => Math.random() - 0.5);
      for (let x of shuffled) {
        if (!seen.has(x.spanish)) {
          result.push(x);
          seen.add(x.spanish);
        }
        if (result.length === count) break;
      }
      return result;
    };

    const stageItems = getUniqueItems(weightedItems, stageItemsRaw.length);

    const levelVal = state.questLevel;
    const seenWords = state.stageFlashcardsSeen || [];
    const unseenStageItems = stageItems.filter(item => !seenWords.includes(item.spanish));

    const targetCardCount = state.isReviewReady ? 0 : Math.max(1, 16 - Math.floor((levelVal - 1) * 0.85));
    const cardCount = Math.min(targetCardCount, unseenStageItems.length);
    const quizCount = 20 - cardCount;

    let finalQuestions = [];
    const selectedFlashcards = [];

    if (cardCount > 0) {
      unseenStageItems.sort(() => Math.random() - 0.5);
      const takeUnseen = unseenStageItems.slice(0, cardCount);
      selectedFlashcards.push(...takeUnseen);

      const newlySeen = takeUnseen.map(item => item.spanish);
      if (newlySeen.length > 0 && markFlashcardsSeen) {
        markFlashcardsSeen(newlySeen);
      }
    }

    const cardSteps = selectedFlashcards.map(item => ({
      item,
      isCardIntro: true
    }));

    const currentlyIntroduced = selectedFlashcards.map(item => item.spanish);
    const eligibleStageItems = stageItems.filter(item => 
      seenWords.includes(item.spanish) || currentlyIntroduced.includes(item.spanish)
    );

    const stageQuizPool = eligibleStageItems.length > 0 ? eligibleStageItems : stageItems;

    let quizItems = [];
    if (state.isReviewReady) {
      const shuffledStage = [...stageItems].sort(() => Math.random() - 0.5);
      quizItems = shuffledStage.slice(0, 20);
      
      if (quizItems.length < 20) {
        const needed = 20 - quizItems.length;
        const extraPool = vocabularyData.filter(item => !activeStage.subcategories.includes(item.subcategory));
        const extraItems = extraPool.sort(() => Math.random() - 0.5).slice(0, needed);
        quizItems = [...quizItems, ...extraItems];
      }
    } else {
      const currentQuizCount = Math.ceil(quizCount * 0.6);
      const reviewQuizCount = quizCount - currentQuizCount;

      const shuffledCurrent = [...stageQuizPool].sort(() => Math.random() - 0.5);
      const currentQuizItems = shuffledCurrent.slice(0, currentQuizCount);

      let reviewQuizItems = [];
      if (state.questStage > 1 && reviewQuizCount > 0) {
        const pastSubcategories = [];
        for (let s = 1; s < state.questStage; s++) {
          pastSubcategories.push(...STAGES[s].subcategories);
        }
        const pastItems = vocabularyData.filter(item => 
          pastSubcategories.includes(item.subcategory)
        );
        const shuffledPast = pastItems.sort(() => Math.random() - 0.5);
        reviewQuizItems = shuffledPast.slice(0, reviewQuizCount);
      }

      if (reviewQuizItems.length < reviewQuizCount) {
        const needed = reviewQuizCount - reviewQuizItems.length;
        const extra = shuffledCurrent.slice(currentQuizCount, currentQuizCount + needed);
        quizItems = [...currentQuizItems, ...reviewQuizItems, ...extra];
      } else {
        quizItems = [...currentQuizItems, ...reviewQuizItems];
      }
    }

    const quizSteps = quizItems.map(item => buildProgressiveQuizStep(item, levelVal));
    finalQuestions = [...cardSteps, ...quizSteps].sort(() => Math.random() - 0.5);

    if (finalQuestions.length < 20) {
      const needed = 20 - finalQuestions.length;
      const backfills = stageItems.sort(() => Math.random() - 0.5).slice(0, needed).map(item => buildProgressiveQuizStep(item, levelVal));
      finalQuestions = [...finalQuestions, ...backfills];
    } else if (finalQuestions.length > 20) {
      finalQuestions = finalQuestions.slice(0, 20);
    }

    setQuestQuestions(finalQuestions);
    setQuestCurrentIdx(0);
    setQuestScore(0);
    setQuestFinished(false);
    setQuestStarted(true);
    setQuestAnswered(false);
    setQuestSelected(null);
    setQuestFlipped(false);
    setQuestSuccessMsg("");
    setQuestFailMsg("");
  };

  const handleQuestInsertAccent = (char) => {
    if (!questInputRef.current) return;
    const input = questInputRef.current;
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const text = typedAnswer;
    const newText = text.substring(0, start) + char + text.substring(end);
    setTypedAnswer(newText);
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + 1, start + 1);
    }, 0);
  };

  const handlePracticeInsertAccent = (char) => {
    if (!practiceInputRef.current) return;
    const input = practiceInputRef.current;
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const text = practiceTyped;
    const newText = text.substring(0, start) + char + text.substring(end);
    setPracticeTyped(newText);
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + 1, start + 1);
    }, 0);
  };

  // -------------------------------------------------------------
  // WRITTEN TRANSLATION SUBMIT HANDLERS
  // -------------------------------------------------------------
  const handleQuestSubmitTyped = (e) => {
    e.preventDefault();
    if (questAnswered || !typedAnswer.trim()) return;
    setQuestAnswered(true);

    const currentQ = questQuestions[questCurrentIdx];
    const correctStr = currentQ.correct;
    const userStr = typedAnswer;
    const isCorrect = compareAnswers(correctStr, userStr);

    if (isCorrect) {
      setQuestScore(prev => prev + 1);
      setQuestSelected(correctStr);
      setHealTrigger(true);
      playSound('correct');
      
      // Update Leitner SRS
      if (updateWordMastery && currentQ.item) {
        updateWordMastery(currentQ.item.spanish, true);
      }

      // Combo count increment
      setComboCount(prev => {
        const next = prev + 1;
        setMaxCombo(m => Math.max(m, next));
        return next;
      });

      if (recordWordAnsweredCorrectly && currentQ.item) {
        recordWordAnsweredCorrectly(currentQ.item.spanish);
      }
      setTimeout(() => setHealTrigger(false), 500);
    } else {
      setQuestSelected(userStr);
      setShakeTrigger(true);
      playSound('wrong');
      
      setComboCount(0); // reset combo

      // Update Leitner SRS
      if (updateWordMastery && currentQ.item) {
        updateWordMastery(currentQ.item.spanish, false);
      }

      setQuestMissedQuestions(prev => {
        if (prev.some(q => q.questionWord === currentQ.questionWord)) return prev;
        return [...prev, currentQ];
      });

      if (addMistake && currentQ.item) {
        addMistake(currentQ.item.spanish);
      }

      takeDamage(15);
      setTimeout(() => setShakeTrigger(false), 500);
    }
  };

  const handlePracticeSubmitTyped = (e) => {
    e.preventDefault();
    if (practiceAnswered || !practiceTyped.trim()) return;
    setPracticeAnswered(true);

    const currentQ = practiceQuestions[practiceCurrentIdx];
    const correctStr = currentQ.correct;
    const userStr = practiceTyped;
    const isCorrect = compareAnswers(correctStr, userStr);

    if (isCorrect) {
      setPracticeScore(prev => prev + 1);
      setPracticeSelected(correctStr);
      setHealTrigger(true);
      playSound('correct');
      if (updateWordMastery && currentQ.item) {
        updateWordMastery(currentQ.item.spanish, true);
      }
      setTimeout(() => setHealTrigger(false), 500);
    } else {
      setPracticeSelected(userStr);
      setShakeTrigger(true);
      playSound('wrong');
      if (updateWordMastery && currentQ.item) {
        updateWordMastery(currentQ.item.spanish, false);
      }
      if (addMistake && currentQ.item) {
        addMistake(currentQ.item.spanish);
      }
      if (!state.fainted) takeDamage(15);
      setTimeout(() => setShakeTrigger(false), 500);
    }
  };

  const handleQuestCardLearned = () => {
    addXp(2);
    setHealTrigger(true);
    setTimeout(() => setHealTrigger(false), 500);

    if (questCurrentIdx < questQuestions.length - 1) {
      setQuestCurrentIdx(prev => prev + 1);
      setQuestFlipped(false);
    } else {
      finishQuestSession();
    }
  };

  const handleQuestAnswer = (choice) => {
    if (questAnswered) return;
    setQuestSelected(choice);
    setQuestAnswered(true);

    const currentQ = questQuestions[questCurrentIdx];
    const isCorrect = choice.trim().toLowerCase() === currentQ.correct.trim().toLowerCase();

    if (isCorrect) {
      setQuestScore(prev => prev + 1);
      setHealTrigger(true);
      playSound('correct');
      
      if (updateWordMastery && currentQ.item) {
        updateWordMastery(currentQ.item.spanish, true);
      }

      setComboCount(prev => {
        const next = prev + 1;
        setMaxCombo(m => Math.max(m, next));
        return next;
      });

      if (recordWordAnsweredCorrectly && currentQ.item) {
        recordWordAnsweredCorrectly(currentQ.item.spanish);
      }
      setTimeout(() => setHealTrigger(false), 500);
    } else {
      setShakeTrigger(true);
      playSound('wrong');
      setComboCount(0);

      if (updateWordMastery && currentQ.item) {
        updateWordMastery(currentQ.item.spanish, false);
      }

      setQuestMissedQuestions(prev => {
        if (prev.some(q => q.questionWord === currentQ.questionWord)) return prev;
        return [...prev, currentQ];
      });

      if (addMistake && currentQ.item) {
        addMistake(currentQ.item.spanish);
      }

      takeDamage(15);
      setTimeout(() => setShakeTrigger(false), 500);
    }
  };

  const handleQuestNext = () => {
    setQuestSelected(null);
    setQuestAnswered(false);
    setTypedAnswer("");
    
    if (questCurrentIdx < questQuestions.length - 1) {
      setQuestCurrentIdx(prev => prev + 1);
    } else {
      finishQuestSession();
    }
  };

  const handleRedemptionAnswer = (choice) => {
    if (redemptionAnswered) return;
    setRedemptionAnswered(true);
    setRedemptionSelected(choice);

    const currentQ = redemptionQuestions[redemptionCurrentIdx];
    if (choice === currentQ.correct) {
      playSound('correct');
      setRedemptionScore(prev => prev + 1);
    } else {
      playSound('wrong');
      setTimeout(() => {
        setRedemptionFailed(true);
      }, 800);
    }
  };

  const handleRedemptionSubmitTyped = (e) => {
    e.preventDefault();
    if (redemptionAnswered || !redemptionTyped.trim()) return;
    setRedemptionAnswered(true);

    const currentQ = redemptionQuestions[redemptionCurrentIdx];
    const correctStr = currentQ.correct;
    const userStr = redemptionTyped;
    const isCorrect = cleanAnswer(correctStr) === cleanAnswer(userStr);
    setRedemptionSelected(userStr);

    if (isCorrect) {
      playSound('correct');
      setRedemptionScore(prev => prev + 1);
    } else {
      playSound('wrong');
      setTimeout(() => {
        setRedemptionFailed(true);
      }, 800);
    }
  };

  const handleRedemptionNext = () => {
    setRedemptionSelected(null);
    setRedemptionAnswered(false);
    setRedemptionTyped("");

    if (redemptionCurrentIdx < redemptionQuestions.length - 1) {
      setRedemptionCurrentIdx(prev => prev + 1);
    } else {
      setRedemptionSuccess(true);
    }
  };

  const handleRestartRedemption = () => {
    setRedemptionCurrentIdx(0);
    setRedemptionTyped("");
    setRedemptionAnswered(false);
    setRedemptionSelected(null);
    setRedemptionScore(0);
    setRedemptionFailed(false);
    setRedemptionSuccess(false);
  };

  const handleCancelRedemption = () => {
    setRedemptionActive(false);
    setQuestMissedQuestions([]);
  };

  const handleClaimRedemption = () => {
    revive(10);
    setRedemptionActive(false);
    setQuestMissedQuestions([]);
  };

  const finishQuestSession = () => {
    setQuestStarted(false);
    setQuestFinished(true);

    const quizQuestionsCount = questQuestions.filter(q => !q.isCardIntro).length;

    // Apply Combo streak multiplier
    let comboMultiplier = 1.0;
    if (maxCombo >= 10) comboMultiplier = 2.0; // 2x rewards for 10 combo streak
    else if (maxCombo >= 5) comboMultiplier = 1.75;
    else if (maxCombo >= 3) comboMultiplier = 1.5;

    let baseGoldReward = state.isReviewReady ? 50 : 12;
    let baseXpReward = state.isReviewReady ? 200 : 60;

    let totalGoldEarned = baseGoldReward;
    let totalXpEarned = baseXpReward;

    if (state.isReviewReady) {
      const passingRequired = Math.ceil(quizQuestionsCount * 0.8); // 80% Boss Review Gate
      const success = passStageReview(questScore, quizQuestionsCount);
      recordQuizPerformance(questScore, quizQuestionsCount);
      if (success) {
        if (comboMultiplier > 1.0) {
          const extraGold = Math.ceil(baseGoldReward * (comboMultiplier - 1));
          const extraXp = Math.ceil(baseXpReward * (comboMultiplier - 1));
          addGold(extraGold);
          addXp(extraXp);
          totalGoldEarned += extraGold;
          totalXpEarned += extraXp;
        }
        setQuestSuccessMsg(`¡Excelente! You passed the Review Gate with ${questScore}/${quizQuestionsCount} (${Math.round((questScore/quizQuestionsCount)*100)}%)! Gained ${totalGoldEarned} G & ${totalXpEarned} XP! Next stage unlocked! (Streak Combo Multiplier: ${comboMultiplier}x)`);
      } else {
        setQuestFailMsg(`Gate Failed! Boss reviews require 80% score or higher (${passingRequired}/${quizQuestionsCount}). Please practice and try again.`);
      }
    } else {
      const passingRequired = Math.ceil(quizQuestionsCount * 0.6);
      const success = advanceQuest(questScore, quizQuestionsCount);
      recordQuizPerformance(questScore, quizQuestionsCount);
      if (success) {
        if (comboMultiplier > 1.0) {
          const extraGold = Math.ceil(baseGoldReward * (comboMultiplier - 1));
          const extraXp = Math.ceil(baseXpReward * (comboMultiplier - 1));
          addGold(extraGold);
          addXp(extraXp);
          totalGoldEarned += extraGold;
          totalXpEarned += extraXp;
        }
        setQuestSuccessMsg(`Quest Level Cleared! You scored ${questScore}/${quizQuestionsCount} correct! Gained ${totalGoldEarned} G & ${totalXpEarned} XP. (Streak Combo Multiplier: ${comboMultiplier}x)`);
      } else {
        setQuestFailMsg(`Quest Failed! You missed 40% or more (Score: ${questScore}/${quizQuestionsCount}, Required: ${passingRequired}/${quizQuestionsCount}).`);
      }
    }
  };

  // -------------------------------------------------------------
  // CUSTOM PRACTICE LOGIC
  // -------------------------------------------------------------
  const startCustomPracticeQuiz = () => {
    initAudio();
    if (practiceCards.length === 0) return;

    const shuffled = [...practiceCards].sort(() => Math.random() - 0.5);
    const chosen = shuffled.slice(0, 10);

    const questions = chosen.map(item => {
      if (item.category === "Sentences") {
        const fillSpec = generateFillInTheBlank(item);
        if (fillSpec) {
          return {
            item,
            isConjugation: false,
            isFillInTheBlank: true,
            questionWord: fillSpec.sentence,
            meaning: fillSpec.meaning,
            correct: fillSpec.correct,
            choices: fillSpec.choices
          };
        }
      }

      const isVerb = item.category === "Verbs" && item.subcategory !== "Verbs Structured Like Gustar";
      const wantsConjugation = isVerb && practiceQuizMode === "conjugation";

      if (wantsConjugation) {
        const qSpec = generateConjugationQuestion(item, { excludeVosotros: state.excludeVosotros });
        if (qSpec) {
          return {
            item,
            isConjugation: true,
            questionWord: qSpec.verb,
            meaning: qSpec.meaning,
            pronoun: qSpec.pronoun,
            correct: qSpec.correct,
            choices: qSpec.choices
          };
        }
      }

      let qType = Math.floor(Math.random() * 3);
      if (qType === 2 && (item.spanish.includes("/") || item.spanish.includes("(") || item.spanish.length > 25)) {
        qType = Math.random() > 0.5 ? 0 : 1;
      }

      const isEsToEn = qType === 0;
      const correctVal = isEsToEn ? formatEnglishPrompt(item.spanish, item.english) : item.spanish;
      const questionText = isEsToEn ? item.spanish : formatEnglishPrompt(item.spanish, item.english);

      const distractors = [];
      while (distractors.length < 3) {
        const rand = vocabularyData[Math.floor(Math.random() * vocabularyData.length)];
        const val = isEsToEn ? formatEnglishPrompt(rand.spanish, rand.english) : rand.spanish;
        if (
          val.toLowerCase() !== correctVal.toLowerCase() && 
          !checkSynonyms(val, correctVal) &&
          !distractors.includes(val) &&
          val.length < 35
        ) {
          distractors.push(val);
        }
      }
      const choices = [correctVal, ...distractors].sort(() => Math.random() - 0.5);

      return {
        item,
        isConjugation: false,
        type: qType,
        questionWord: questionText,
        correct: correctVal,
        choices: choices
      };
    });

    setPracticeQuestions(questions);
    setPracticeCurrentIdx(0);
    setPracticeScore(0);
    setPracticeAnswered(false);
    setPracticeSelected(null);
    setPracticeTyped("");
    setPracticeQuizFinished(false);
    setPracticeQuizStarted(true);
  };

  const handlePracticeNext = () => {
    setPracticeSelected(null);
    setPracticeAnswered(false);
    setPracticeTyped("");

    if (practiceCurrentIdx < practiceQuestions.length - 1) {
      setPracticeCurrentIdx(prev => prev + 1);
    } else {
      const earnedXp = practiceScore * 10;
      const earnedGold = practiceScore;
      addXp(earnedXp);
      addGold(earnedGold);
      recordQuizPerformance(practiceScore, practiceQuestions.length);
      setPracticeQuizFinished(true);
    }
  };

  const activeStageSpec = STAGES[state.questStage];
  const maxStageProgress = 19;
  const stageProgressPct = Math.round((Math.min(19, state.questLevel - 1) / maxStageProgress) * 100);

  const currentQuestQ = questQuestions[questCurrentIdx];
  const shakeClass = shakeTrigger ? "shake damage-flash" : healTrigger ? "heal-flash" : "";

  const isQuestUserCorrect = questAnswered && currentQuestQ && (
    compareAnswers(currentQuestQ.correct, questSelected)
  );
  const isPracticeUserCorrect = practiceAnswered && practiceQuestions[practiceCurrentIdx] && (
    compareAnswers(practiceQuestions[practiceCurrentIdx].correct, practiceSelected)
  );

  // RPG Sprite calculations
  const getHeroSprite = (level) => {
    if (level >= 15) return "🧙‍♂️✨";
    if (level >= 10) return "🛡️⚔️";
    if (level >= 5) return "⚔️";
    return "🎒";
  };

  const getMonsterSprite = (category) => {
    if (category === "Verbs") return "😈";
    if (category === "Sentences") return "🐉";
    return "👻";
  };

  const monsterHpPct = currentQuestQ 
    ? Math.max(0, Math.round(((questQuestions.length - questCurrentIdx) / questQuestions.length) * 100))
    : 100;

  return (
    <div className={`view-container ${shakeClass}`} style={{ transition: 'background-color 0.25s ease' }}>
      
      {/* Header controls */}
      <div className="view-header">
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem' }}>Baraja de Aprendizaje (Study & Quest Deck)</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Campaign quests and custom practice modules.</p>
        </div>
        <button className="btn btn-secondary" onClick={() => { handleCancelRedemption(); setView('dashboard'); }}>
          <ArrowLeft size={16} /> Back to Hub
        </button>
      </div>

      {/* Tab Switcher */}
      {!questStarted && !practiceQuizStarted && !redemptionActive && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '14px', width: 'fit-content' }}>
            <button 
              className={`btn ${activeTab === 'quest' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              onClick={() => setActiveTab("quest")}
            >
              Quest Campaign (Búsqueda)
            </button>
            <button 
              className={`btn ${activeTab === 'practice' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              onClick={() => setActiveTab("practice")}
            >
              Practice Deck (Práctica)
            </button>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '6px 12px', borderRadius: '10px', border: '1px solid var(--card-border)' }}>
            <input 
              type="checkbox" 
              id="autoSpeakCheckbox" 
              checked={state.autoSpeak ?? true} 
              onChange={toggleAutoSpeak} 
              style={{ cursor: 'pointer', accentColor: 'var(--primary)' }}
            />
            <label htmlFor="autoSpeakCheckbox" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600 }}>
              🔊 Auto-pronunciar
            </label>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          TAB 1: QUEST CAMPAIGN VIEW
          ------------------------------------------------------------- */}
      {activeTab === "quest" && !questStarted && !redemptionActive && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {questFinished && (
            <div 
              className="glass-panel" 
              style={{ 
                padding: '24px', 
                border: questSuccessMsg ? '2px solid var(--accent)' : '2px solid var(--danger)',
                background: questSuccessMsg ? 'rgba(16,185,129,0.03)' : 'rgba(239,68,68,0.03)',
                animation: 'pop-in 0.4s ease-out',
                textAlign: 'center'
              }}
            >
              <Award size={48} color={questSuccessMsg ? "var(--accent)" : "var(--danger)"} style={{ margin: '0 auto 12px', animation: 'float 3s ease-in-out infinite' }} />
              <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
                {questSuccessMsg ? "¡Misión Cumplida!" : "Misión Fallida"}
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#e2e8f0', maxWidth: '500px', margin: '0 auto 16px', lineHeight: '1.4' }}>
                {questSuccessMsg || questFailMsg}
              </p>
              
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', width: 'fit-content', margin: '0 auto 20px', border: '1px solid var(--card-border)', display: 'flex', gap: '20px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Correct Challenges</span>
                  <strong style={{ fontSize: '1.4rem', color: 'var(--accent)' }}>{questScore} / {questQuestions.filter(q => !q.isCardIntro).length}</strong>
                </div>
                {questSuccessMsg && (
                  <>
                    <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)' }}></div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Loot Gained</span>
                      <strong style={{ fontSize: '1.2rem', color: 'var(--gold)' }}>+{state.isReviewReady ? 50 : 12} Gold</strong>
                    </div>
                  </>
                )}
              </div>

              <button className="btn btn-primary" onClick={() => { setQuestFinished(false); startQuestLevel(); }}>
                {questSuccessMsg ? "Continue Next Quest" : "Retake Quest Level"}
              </button>
            </div>
          )}

          {!questFinished && activeStageSpec && (
            <div className="glass-panel" style={{ padding: '30px', maxWidth: '650px', margin: '0 auto', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '8px', animation: 'float 3s ease-in-out infinite' }}>🗺️</div>
              
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--gold)', letterSpacing: '0.1em', fontWeight: 'bold' }}>
                Campamento de Aprendizaje
              </span>
              <h3 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-display)', margin: '4px 0 16px' }}>
                Stage {state.questStage}: {activeStageSpec.name}
              </h3>

              <div style={{ background: 'rgba(0,0,0,0.15)', padding: '16px 20px', borderRadius: '16px', textAlign: 'left', border: '1px solid var(--card-border)', marginBottom: '24px' }}>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 'bold' }}>
                  Unlocks Vocabulary:
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                  {activeStageSpec.subcategories.map(sub => (
                    <span key={sub} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600 }}>
                      {sub}
                    </span>
                  ))}
                </div>

                <div className="stat-row" style={{ margin: 0 }}>
                  <div className="stat-label">
                    <span>Stage Completion Progress</span>
                    <strong>{state.isReviewReady ? "100%" : `${stageProgressPct}%`}</strong>
                  </div>
                  <div className="progress-bar-outer" style={{ height: '8px' }}>
                    <div className="progress-bar-inner xp" style={{ width: state.isReviewReady ? '100%' : `${stageProgressPct}%` }}></div>
                  </div>
                </div>
              </div>

              {state.isReviewReady ? (
                <div style={{ background: 'rgba(239, 68, 68, 0.03)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '20px', borderRadius: '16px', marginBottom: '24px' }}>
                  <h4 style={{ color: 'var(--danger)', fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    🛡️ Stage Review Gate Active
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    You have unlocked all content in Stage {state.questStage}! To level up to Stage {state.questStage + 1}, you must pass the Review Gate. <strong>Requires a strict 80% passing grade (16/20 or higher) to pass.</strong>
                  </p>
                </div>
              ) : (
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.4' }}>
                  Quest Level {state.questLevel} of 19. Level quizzes mix safe flashcard previews with translation challenges. Score 12/20 to pass.
                </p>
              )}

              {state.fainted ? (
                <button className="btn btn-secondary" disabled style={{ opacity: 0.5 }}>
                  You are fainted. Visit the shop to heal!
                </button>
              ) : (
                <button 
                  className={`btn ${state.isReviewReady ? 'btn-danger' : 'btn-primary'}`} 
                  onClick={startQuestLevel}
                  style={{ width: '100%', maxWidth: '280px', margin: '0 auto', fontSize: '1rem', padding: '14px 20px' }}
                >
                  {state.isReviewReady ? "Start Review Gate" : `Start Quest Level ${state.questLevel}`} <Play size={16} />
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* -------------------------------------------------------------
          ACTIVE QUEST GAMEPLAY SCREEN
          ------------------------------------------------------------- */}
      {questStarted && currentQuestQ && (
        <div 
          className="glass-panel quiz-box"
          style={{
            boxShadow: comboCount >= 10 
              ? '0 0 35px rgba(239, 68, 68, 0.4)' 
              : comboCount >= 5 
                ? '0 0 25px rgba(249, 115, 22, 0.3)' 
                : comboCount >= 3 
                  ? '0 0 15px rgba(250, 204, 21, 0.2)' 
                  : 'none',
            border: comboCount >= 3 ? '1.5px solid var(--gold)' : '1px solid var(--card-border)'
          }}
        >
          
          {/* Header HP details */}
          <div className="quiz-header">
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Quest Stage {state.questStage} | Level {state.isReviewReady ? 'Review Gate' : state.questLevel}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem', color: 'var(--danger)', fontWeight: 'bold' }}>
                <Heart size={14} fill="var(--danger)" /> {state.hp} HP
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem', color: 'var(--gold)', fontWeight: 'bold' }}>
                <Coins size={14} /> {state.gold} G
              </span>
            </div>
          </div>

          <div className="quiz-progress-track">
            <div className="quiz-progress-fill" style={{ width: `${((questCurrentIdx + 1) / questQuestions.length) * 100}%` }}></div>
          </div>

          {/* RPG Battle Scene Panel */}
          {!currentQuestQ.isCardIntro && (
            <div 
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                background: 'rgba(0,0,0,0.2)', 
                padding: '12px 18px', 
                borderRadius: '12px', 
                marginBottom: '16px',
                border: '1px solid rgba(255,255,255,0.05)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.2rem', marginBottom: '4px' }}>{getHeroSprite(state.level)}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>You (Lv. {state.level})</div>
              </div>

              {/* Combo Streaks Banner */}
              {comboCount >= 3 ? (
                <div style={{ textAlign: 'center', animation: 'pulse 1s infinite' }}>
                  <div style={{ fontSize: '1rem', color: '#f97316', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>🔥 STREAK COMBO 🔥</div>
                  <div style={{ fontSize: '1.4rem', color: 'var(--gold)', fontWeight: 'bold' }}>x{comboCount}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    {comboCount >= 10 ? '2.0x Gold/XP' : comboCount >= 5 ? '1.75x Gold/XP' : '1.5x Gold/XP'}
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>VS Vocab Monster</div>
              )}

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.2rem', marginBottom: '4px' }}>{getMonsterSprite(currentQuestQ.item?.category)}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>HP: {monsterHpPct}%</div>
                <div style={{ width: '60px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden', margin: '4px auto 0' }}>
                  <div style={{ width: `${monsterHpPct}%`, height: '100%', background: 'var(--danger)' }}></div>
                </div>
              </div>
            </div>
          )}

          {currentQuestQ.isCardIntro ? (
            <div style={{ textAlign: 'center', animation: 'pop-in 0.3s ease-out' }}>
              <div 
                className="flashcard-wrapper"
                onClick={() => setQuestFlipped(!questFlipped)}
                style={{ height: '240px' }}
              >
                <div className={`flashcard ${questFlipped ? 'flipped' : ''}`}>
                  <div className="flashcard-face flashcard-front">
                    <span className="flashcard-category">Preview New Word (+2 XP)</span>
                    <h3 className="flashcard-term" style={{ fontSize: '2rem' }}>{currentQuestQ.item.spanish}</h3>
                    
                    {currentQuestQ.item?.category === "Verbs" && (
                      <button 
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={(e) => { e.stopPropagation(); setCodexVerb(currentQuestQ.item.spanish); }}
                        style={{ position: 'absolute', top: '16px', right: '16px', padding: '6px 12px', fontSize: '0.75rem', gap: '4px' }}
                      >
                        📖 Codex
                      </button>
                    )}

                    {speechAvailable && (
                      <button 
                        className="btn btn-secondary"
                        onClick={(e) => { e.stopPropagation(); speakSpanish(currentQuestQ.item.spanish); }}
                        style={{ position: 'absolute', bottom: '60px', borderRadius: '50%', width: '40px', height: '40px', padding: 0 }}
                      >
                        <Volume2 size={16} color="var(--primary)" />
                      </button>
                    )}
                    <span className="flashcard-hint">Click card to reveal translation</span>
                  </div>

                  <div className="flashcard-face flashcard-back">
                    <span className="flashcard-category">Preview New Word (+2 XP)</span>
                    <h4 className="flashcard-translation" style={{ fontSize: '1.6rem' }}>{currentQuestQ.item.english}</h4>
                    <span className="flashcard-hint">Click card to reveal Spanish</span>
                  </div>
                </div>
              </div>

              <button className="btn btn-accent" onClick={handleQuestCardLearned} style={{ width: '100%', maxWidth: '240px', marginTop: '10px' }}>
                I learned this word!
              </button>
            </div>
          ) : (
            <div>
              <div className="quiz-question-card">
                {currentQuestQ.isConjugation ? (
                  <>
                    <div className="quiz-question-lbl">Conjugate the verb for this pronoun:</div>
                    <h3 className="quiz-word" style={{ color: 'var(--primary)' }}>{currentQuestQ.questionWord}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontStyle: 'italic', marginBottom: '12px' }}>({currentQuestQ.meaning})</p>
                    <div style={{ display: 'inline-block', background: 'rgba(250, 204, 21, 0.1)', padding: '6px 14px', borderRadius: '16px', color: 'var(--gold)', fontWeight: 'bold', fontSize: '0.9rem' }}>
                      Pronoun: {currentQuestQ.pronoun}
                    </div>
                  </>
                ) : currentQuestQ.isFillInTheBlank ? (
                  <>
                    <div className="quiz-question-lbl">Completar la frase (Fill in the blank):</div>
                    <h3 className="quiz-word" style={{ color: 'var(--accent)' }}>{currentQuestQ.questionWord}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontStyle: 'italic', marginBottom: '12px' }}>({currentQuestQ.meaning})</p>
                  </>
                ) : (
                  <>
                    <div className="quiz-question-lbl">
                      {currentQuestQ.type === 2 ? "Type the Spanish translation:" : "Choose the correct translation:"}
                    </div>
                    <h3 className="quiz-word">{currentQuestQ.questionWord}</h3>
                  </>
                )}
                
                {currentQuestQ.item?.category === "Verbs" && (
                  <button 
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setCodexVerb(currentQuestQ.item.spanish)}
                    style={{ padding: '4px 10px', fontSize: '0.75rem', margin: '10px auto 0', display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content' }}
                  >
                    📖 Ver Conjugaciones
                  </button>
                )}
              </div>

              {currentQuestQ.isConjugation || currentQuestQ.isFillInTheBlank || currentQuestQ.type !== 2 ? (
                <div className="quiz-choices-grid">
                  {currentQuestQ.choices.map((choice, idx) => {
                    let btnClass = "";
                    if (questAnswered) {
                      if (choice === currentQuestQ.correct) {
                        btnClass = "correct";
                      } else if (choice === questSelected) {
                        btnClass = "wrong";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        className={`quiz-choice-btn ${btnClass}`}
                        onClick={() => handleQuestAnswer(choice)}
                        disabled={questAnswered}
                      >
                        {choice}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <form onSubmit={handleQuestSubmitTyped}>
                  <div className="quiz-input-wrapper" style={{ marginTop: '16px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        ref={questInputRef}
                        placeholder="Type the Spanish translation..."
                        value={typedAnswer}
                        onChange={(e) => setTypedAnswer(e.target.value)}
                        disabled={questAnswered}
                        className={`quiz-input ${questAnswered ? (isQuestUserCorrect ? 'correct' : 'wrong') : ''}`}
                        style={{ flex: 1, padding: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--card-border)', borderRadius: '12px', color: 'var(--text-primary)', fontSize: '1.1rem', outline: 'none' }}
                        autoFocus
                      />
                      
                      {/* Speech Rec Button */}
                      <button 
                        type="button" 
                        className={`btn ${isListening ? 'btn-danger pulse' : 'btn-secondary'}`}
                        disabled={questAnswered}
                        onClick={() => handleVoiceInput("quest")}
                        style={{ padding: '12px', borderRadius: '12px' }}
                      >
                        🎤
                      </button>
                    </div>
                    
                    {/* Accent Buttons row */}
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px', justifyContent: 'center' }}>
                      {['á', 'é', 'í', 'ó', 'ú', 'ñ', 'ü', '¿', '¡'].map(char => (
                        <button
                          key={char}
                          type="button"
                          className="btn btn-secondary"
                          disabled={questAnswered}
                          onClick={() => handleQuestInsertAccent(char)}
                          style={{ padding: '6px 12px', fontSize: '1rem', minWidth: '38px', height: '38px', borderRadius: '8px' }}
                        >
                          {char}
                        </button>
                      ))}
                    </div>

                    {!questAnswered && (
                      <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }} disabled={!typedAnswer.trim()}>
                        Submit Translation
                      </button>
                    )}
                  </div>
                </form>
              )}

              {questAnswered && (
                <div 
                  className={`quiz-feedback-box ${isQuestUserCorrect ? 'correct' : 'wrong'}`}
                  style={{ animation: 'pop-in 0.3s ease-out' }}
                >
                  {isQuestUserCorrect 
                    ? `¡Correcto! ${comboCount >= 3 ? `Combo Streak ${comboCount}! ` : ''}` 
                    : `Incorrecto! Correct translation: "${currentQuestQ.correct}"`
                  }
                  <button className="btn btn-primary" onClick={handleQuestNext} style={{ width: '100%', marginTop: '16px' }}>
                    {questCurrentIdx === questQuestions.length - 1 ? "Finish Quest" : "Next Challenge"} <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* -------------------------------------------------------------
          TAB 2: FREE PRACTICE VIEW
          ------------------------------------------------------------- */}
      {activeTab === "practice" && !practiceQuizStarted && !redemptionActive && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div className="study-selector-row">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Category</span>
                <select value={selectedCategory} onChange={handleCategoryChange} className="study-select">
                  {Object.keys(practiceCategories).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Vocabulary Unit</span>
                <select 
                  value={selectedSubcategory} 
                  onChange={(e) => setSelectedSubcategory(e.target.value)} 
                  className="study-select"
                  disabled={subcategories.length === 0}
                >
                  {subcategories.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', marginLeft: 'auto' }}>
                {practiceMode === "cards" && (
                  <button className="btn btn-secondary" onClick={() => setPracticeCards(prev => [...prev].sort(() => Math.random() - 0.5))}>
                    <Shuffle size={14} /> Shuffle
                  </button>
                )}
                
                <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '10px' }}>
                  <button 
                    className={`btn ${practiceMode === 'cards' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                    onClick={() => setPracticeMode("cards")}
                  >
                    Flashcards
                  </button>
                  <button 
                    className={`btn ${practiceMode === 'quiz' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                    onClick={() => setPracticeMode("quiz")}
                  >
                    Custom Quiz
                  </button>
                </div>
              </div>
            </div>
          </div>

          {practiceMode === "cards" && (
            practiceCards.length > 0 && practiceCards[practiceCurrentIdx] ? (
              <div style={{ textAlign: 'center' }}>
                <div className="flashcard-wrapper" onClick={() => setPracticeFlipped(!practiceFlipped)}>
                  <div className={`flashcard ${practiceFlipped ? 'flipped' : ''}`}>
                    
                    <div className="flashcard-face flashcard-front">
                      <span className="flashcard-category">{selectedSubcategory}</span>
                      <h3 className="flashcard-term">{practiceCards[practiceCurrentIdx].spanish}</h3>
                      
                      {practiceCards[practiceCurrentIdx]?.category === "Verbs" && (
                        <button 
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={(e) => { e.stopPropagation(); setCodexVerb(practiceCards[practiceCurrentIdx].spanish); }}
                          style={{ position: 'absolute', top: '16px', right: '16px', padding: '6px 12px', fontSize: '0.75rem', gap: '4px' }}
                        >
                          📖 Codex
                        </button>
                      )}

                      {speechAvailable && (
                        <button 
                          className="btn btn-secondary"
                          onClick={(e) => { e.stopPropagation(); speakSpanish(practiceCards[practiceCurrentIdx].spanish); }}
                          style={{ position: 'absolute', bottom: '70px', borderRadius: '50%', width: '45px', height: '45px', padding: 0 }}
                        >
                          <Volume2 size={20} color="var(--primary)" />
                        </button>
                      )}
                      <span className="flashcard-hint">Click card to reveal translation</span>
                    </div>

                    <div className="flashcard-face flashcard-back">
                      <span className="flashcard-category">{selectedSubcategory}</span>
                      <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--accent)', letterSpacing: '0.1em', fontWeight: 'bold', marginBottom: '8px' }}>
                        English Translation
                      </span>
                      <h4 className="flashcard-translation">{practiceCards[practiceCurrentIdx].english}</h4>
                      <span className="flashcard-hint">Click card to flip Spanish</span>
                    </div>

                  </div>
                </div>

                <div className="study-nav-controls">
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => { setPracticeFlipped(false); setPracticeCurrentIdx(prev => prev > 0 ? prev - 1 : practiceCards.length - 1); }}
                    style={{ borderRadius: '50%', width: '48px', height: '48px', padding: 0 }}
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <span className="study-progress-txt">{practiceCurrentIdx + 1} / {practiceCards.length}</span>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => { setPracticeFlipped(false); setPracticeCurrentIdx(prev => prev < practiceCards.length - 1 ? prev + 1 : 0); }}
                    style={{ borderRadius: '50%', width: '48px', height: '48px', padding: 0 }}
                  >
                    <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
                No vocabulary items found in this section.
              </div>
            )
          )}

          {practiceMode === "quiz" && (
            <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', maxWidth: '550px', margin: '0 auto' }}>
              <Swords size={36} color="var(--primary)" style={{ margin: '0 auto 12px' }} />
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '8px' }}>Start Custom Practice Quiz</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.4' }}>
                Test yourself in: <strong>{selectedSubcategory}</strong>. You will receive 10 questions. Errors deal damage to your HP!
              </p>

              {selectedCategory === "Verbs" && selectedSubcategory !== "Verbs Structured Like Gustar" && (
                <div className="form-group" style={{ maxWidth: '280px', margin: '0 auto 20px', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
                  <label className="form-label" style={{ marginBottom: '6px', fontSize: '0.8rem' }}>Quiz Type</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className={`btn ${practiceQuizMode === 'translation' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1, padding: '6px', fontSize: '0.8rem' }} onClick={() => setPracticeQuizMode("translation")}>
                      Translation
                    </button>
                    <button className={`btn ${practiceQuizMode === 'conjugation' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1, padding: '6px', fontSize: '0.8rem' }} onClick={() => setPracticeQuizMode("conjugation")}>
                      Conjugation
                    </button>
                  </div>
                </div>
              )}

              <button className="btn btn-primary" onClick={startCustomPracticeQuiz}>
                Start Practice Quiz
              </button>
            </div>
          )}
        </div>
      )}

      {/* -------------------------------------------------------------
          ACTIVE CUSTOM PRACTICE QUIZ SCREEN
          ------------------------------------------------------------- */}
      {activeTab === "practice" && practiceQuizStarted && !redemptionActive && (
        <div className="glass-panel quiz-box">
          
          {practiceQuizFinished ? (
            <div style={{ textAlign: 'center', padding: '10px' }}>
              <Award size={64} color="var(--gold)" style={{ margin: '0 auto 16px', animation: 'float 3s ease-in-out' }} />
              <h3 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>Practice Complete!</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>Unit: {selectedSubcategory}</p>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '16px', border: '1px solid var(--card-border)', marginBottom: '24px' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Score Gained</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent)', margin: '4px 0' }}>{practiceScore} / 10</div>
                
                <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
                  <div>
                    <span style={{ display: 'block', color: 'var(--primary)', fontWeight: 800, fontSize: '1.1rem' }}>+{practiceScore * 10} XP</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>XP Bonus</span>
                  </div>
                  <div>
                    <span style={{ display: 'block', color: 'var(--gold)', fontWeight: 800, fontSize: '1.1rem' }}>+{practiceScore} Gold</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Gold Bonus</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button className="btn btn-secondary" onClick={() => setPracticeQuizStarted(false)}>Another Unit</button>
                <button className="btn btn-primary" onClick={startCustomPracticeQuiz}>Replay</button>
              </div>
            </div>
          ) : (
            <div>
              <div className="quiz-header">
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Practice Question {practiceCurrentIdx + 1} of 10
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem', color: 'var(--danger)', fontWeight: 'bold' }}>
                    <Heart size={14} fill="var(--danger)" /> {state.hp} HP
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem', color: 'var(--gold)', fontWeight: 'bold' }}>
                    <Coins size={14} /> {state.gold} G
                  </span>
                </div>
              </div>

              <div className="quiz-progress-track">
                <div className="quiz-progress-fill" style={{ width: `${((practiceCurrentIdx + 1) / 10) * 100}%` }}></div>
              </div>

              {practiceQuestions[practiceCurrentIdx]?.isConjugation ? (
                <div className="quiz-question-card">
                  <div className="quiz-question-lbl">Conjugate the verb for this pronoun:</div>
                  <h3 className="quiz-word" style={{ color: 'var(--primary)', fontSize: '2.4rem' }}>{practiceQuestions[practiceCurrentIdx].questionWord}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontStyle: 'italic', marginBottom: '12px' }}>({practiceQuestions[practiceCurrentIdx].meaning})</p>
                  <div style={{ display: 'inline-block', background: 'rgba(250, 204, 21, 0.1)', padding: '6px 14px', borderRadius: '16px', color: 'var(--gold)', fontWeight: 'bold', fontSize: '0.9rem' }}>
                    Pronoun: {practiceQuestions[practiceCurrentIdx].pronoun}
                  </div>
                  
                  <button 
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setCodexVerb(practiceQuestions[practiceCurrentIdx].item.spanish)}
                    style={{ padding: '4px 10px', fontSize: '0.75rem', margin: '10px auto 0', display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content' }}
                  >
                    📖 Ver Conjugaciones
                  </button>
                </div>
              ) : practiceQuestions[practiceCurrentIdx]?.isFillInTheBlank ? (
                <div className="quiz-question-card">
                  <div className="quiz-question-lbl">Completar la frase (Fill in the blank):</div>
                  <h3 className="quiz-word" style={{ color: 'var(--accent)', fontSize: '2rem' }}>{practiceQuestions[practiceCurrentIdx].questionWord}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontStyle: 'italic', marginBottom: '12px' }}>({practiceQuestions[practiceCurrentIdx].meaning})</p>
                </div>
              ) : (
                <div className="quiz-question-card">
                  <div className="quiz-question-lbl">
                    {practiceQuestions[practiceCurrentIdx]?.type === 2 ? "Type the Spanish translation:" : "Choose correct translation:"}
                  </div>
                  <h3 className="quiz-word">{practiceQuestions[practiceCurrentIdx]?.questionWord}</h3>
                  
                  {practiceQuestions[practiceCurrentIdx]?.item?.category === "Verbs" && (
                    <button 
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setCodexVerb(practiceQuestions[practiceCurrentIdx].item.spanish)}
                      style={{ padding: '4px 10px', fontSize: '0.75rem', margin: '10px auto 0', display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content' }}
                    >
                      📖 Ver Conjugaciones
                    </button>
                  )}
                </div>
              )}

              {practiceQuestions[practiceCurrentIdx]?.isConjugation || practiceQuestions[practiceCurrentIdx]?.isFillInTheBlank || practiceQuestions[practiceCurrentIdx]?.type !== 2 ? (
                <div className="quiz-choices-grid">
                  {practiceQuestions[practiceCurrentIdx]?.choices.map((choice, idx) => {
                    let btnClass = "";
                    if (practiceAnswered) {
                      if (choice === practiceQuestions[practiceCurrentIdx].correct) {
                        btnClass = "correct";
                      } else if (choice === practiceSelected) {
                        btnClass = "wrong";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        className={`quiz-choice-btn ${btnClass}`}
                        onClick={() => handlePracticeAnswer(choice)}
                        disabled={practiceAnswered}
                      >
                        {choice}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <form onSubmit={handlePracticeSubmitTyped}>
                  <div className="quiz-input-wrapper" style={{ marginTop: '16px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        ref={practiceInputRef}
                        placeholder="Type the Spanish translation..."
                        value={practiceTyped}
                        onChange={(e) => setPracticeTyped(e.target.value)}
                        disabled={practiceAnswered}
                        className={`quiz-input ${practiceAnswered ? (isPracticeUserCorrect ? 'correct' : 'wrong') : ''}`}
                        style={{ flex: 1, padding: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--card-border)', borderRadius: '12px', color: 'var(--text-primary)', fontSize: '1.1rem', outline: 'none' }}
                        autoFocus
                      />
                      <button 
                        type="button" 
                        className={`btn ${isListening ? 'btn-danger pulse' : 'btn-secondary'}`}
                        disabled={practiceAnswered}
                        onClick={() => handleVoiceInput("practice")}
                        style={{ padding: '12px', borderRadius: '12px' }}
                      >
                        🎤
                      </button>
                    </div>
                    
                    {/* Accent Buttons row */}
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px', justifyContent: 'center' }}>
                      {['á', 'é', 'í', 'ó', 'ú', 'ñ', 'ü', '¿', '¡'].map(char => (
                        <button
                          key={char}
                          type="button"
                          className="btn btn-secondary"
                          disabled={practiceAnswered}
                          onClick={() => handlePracticeInsertAccent(char)}
                          style={{ padding: '6px 12px', fontSize: '1rem', minWidth: '38px', height: '38px', borderRadius: '8px' }}
                        >
                          {char}
                        </button>
                      ))}
                    </div>

                    {!practiceAnswered && (
                      <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }} disabled={!practiceTyped.trim()}>
                        Submit Translation
                      </button>
                    )}
                  </div>
                </form>
              )}

              {practiceAnswered && (
                <div 
                  className={`quiz-feedback-box ${isPracticeUserCorrect ? 'correct' : 'wrong'}`}
                  style={{ animation: 'pop-in 0.3s ease-out' }}
                >
                  {isPracticeUserCorrect 
                    ? "¡Correcto! +10 XP | +1 Gold" 
                    : `Incorrecto! Correct Answer: "${practiceQuestions[practiceCurrentIdx].correct}"`
                  }
                  <button className="btn btn-primary" onClick={handlePracticeNext} style={{ width: '100%', marginTop: '16px' }}>
                    Next Question <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* -------------------------------------------------------------
          REDEMPTION QUIZ GAMEPLAY SCREEN
          ------------------------------------------------------------- */}
      {redemptionActive && redemptionQuestions.length > 0 && (
        <div className="glass-panel quiz-box" style={{ borderColor: 'var(--warning)', boxShadow: '0 0 25px rgba(245, 158, 11, 0.15)' }}>
          
          <div className="quiz-header">
            <span style={{ fontSize: '0.9rem', color: 'var(--warning)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Swords size={16} /> REDEMPTION QUIZ
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Question {redemptionCurrentIdx + 1} of {redemptionQuestions.length}
            </span>
          </div>

          <div style={{ padding: '8px 12px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '10px', fontSize: '0.85rem', color: 'var(--warning)', textAlign: 'center', marginBottom: '16px', fontWeight: '500' }}>
            Answer all missed questions correctly to revive with 10 HP!
          </div>

          {/* Question card */}
          {(() => {
            const currentQ = redemptionQuestions[redemptionCurrentIdx];
            if (!currentQ) return null;

            const isRedemptionCorrect = redemptionAnswered && (
              redemptionSelected === currentQ.correct || cleanAnswer(redemptionSelected) === cleanAnswer(currentQ.correct)
            );

            return (
              <div>
                <div className="quiz-question-card">
                  {currentQ.isConjugation ? (
                    <>
                      <div className="quiz-question-lbl">Conjugate the verb for this pronoun:</div>
                      <h3 className="quiz-word" style={{ color: 'var(--primary)' }}>{currentQ.questionWord}</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontStyle: 'italic', marginBottom: '12px' }}>({currentQ.meaning})</p>
                      <div style={{ display: 'inline-block', background: 'rgba(250, 204, 21, 0.1)', padding: '6px 14px', borderRadius: '16px', color: 'var(--gold)', fontWeight: 'bold', fontSize: '0.9rem' }}>
                        Pronoun: {currentQ.pronoun}
                      </div>
                    </>
                  ) : currentQ.isFillInTheBlank ? (
                    <>
                      <div className="quiz-question-lbl">Completar la frase (Fill in the blank):</div>
                      <h3 className="quiz-word" style={{ color: 'var(--accent)' }}>{currentQ.questionWord}</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontStyle: 'italic', marginBottom: '12px' }}>({currentQ.meaning})</p>
                    </>
                  ) : (
                    <>
                      <div className="quiz-question-lbl">
                        {currentQ.type === 2 ? "Type the Spanish translation:" : "Choose the correct translation:"}
                      </div>
                      <h3 className="quiz-word">{currentQ.questionWord}</h3>
                    </>
                  )}
                </div>

                {redemptionFailed ? (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '10px' }}>💀</div>
                    <h3 style={{ color: 'var(--danger)', marginBottom: '10px' }}>Redemption Failed!</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
                      You made a mistake. You can try the redemption quiz again, or visit the shop/practice section.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '280px', margin: '0 auto' }}>
                      <button className="btn btn-primary" onClick={handleRestartRedemption}>
                        Try Redemption Again
                      </button>
                      <button className="btn btn-secondary" onClick={handleCancelRedemption}>
                        Exit to Hub
                      </button>
                    </div>
                  </div>
                ) : redemptionSuccess ? (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '10px' }}>💖</div>
                    <h3 style={{ color: 'var(--accent)', marginBottom: '10px' }}>Redemption Successful!</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
                      Excellent! You answered all missed questions correctly.
                    </p>
                    <button className="btn btn-accent" onClick={handleClaimRedemption} style={{ width: '100%', maxWidth: '240px', margin: '0 auto' }}>
                      Claim & Revive (10 HP)
                    </button>
                  </div>
                ) : (
                  <div>
                    {currentQ.isConjugation || currentQ.isFillInTheBlank || currentQ.type !== 2 ? (
                      <div className="quiz-choices-grid">
                        {currentQ.choices.map((choice, idx) => {
                          let btnClass = "";
                          if (redemptionAnswered) {
                            if (choice === currentQ.correct) {
                              btnClass = "correct";
                            } else if (choice === redemptionSelected) {
                              btnClass = "wrong";
                            }
                          }

                          return (
                            <button
                              key={idx}
                              className={`quiz-choice-btn ${btnClass}`}
                              onClick={() => handleRedemptionAnswer(choice)}
                              disabled={redemptionAnswered}
                            >
                              {choice}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <form onSubmit={handleRedemptionSubmitTyped}>
                        <div className="quiz-input-wrapper" style={{ marginTop: '16px' }}>
                          <input
                            type="text"
                            placeholder="Type the Spanish translation..."
                            value={redemptionTyped}
                            onChange={(e) => setRedemptionTyped(e.target.value)}
                            disabled={redemptionAnswered}
                            className={`quiz-input ${redemptionAnswered ? (isRedemptionCorrect ? 'correct' : 'wrong') : ''}`}
                            style={{ width: '100%', padding: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--card-border)', borderRadius: '12px', color: 'var(--text-primary)', fontSize: '1.1rem', outline: 'none' }}
                            autoFocus
                          />
                          
                          {/* Accent Buttons row */}
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px', justifyContent: 'center' }}>
                            {['á', 'é', 'í', 'ó', 'ú', 'ñ', 'ü', '¿', '¡'].map(char => (
                              <button
                                key={char}
                                type="button"
                                className="btn btn-secondary"
                                disabled={redemptionAnswered}
                                onClick={() => setRedemptionTyped(prev => prev + char)}
                                style={{ padding: '6px 12px', fontSize: '1rem', minWidth: '38px', height: '38px', borderRadius: '8px' }}
                              >
                                {char}
                              </button>
                            ))}
                          </div>

                          {!redemptionAnswered && (
                            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }} disabled={!redemptionTyped.trim()}>
                              Submit Translation
                            </button>
                          )}
                        </div>
                      </form>
                    )}

                    {redemptionAnswered && (
                      <div 
                        className={`quiz-feedback-box ${isRedemptionCorrect ? 'correct' : 'wrong'}`}
                        style={{ animation: 'pop-in 0.3s ease-out' }}
                      >
                        {isRedemptionCorrect
                          ? "¡Correcto!" 
                          : `Incorrecto. Correct answer: "${currentQ.correct}"`
                        }
                        <button className="btn btn-primary" onClick={handleRedemptionNext} style={{ width: '100%', marginTop: '16px' }}>
                          Next Question <ArrowRight size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* -------------------------------------------------------------
          CONJUGATION CODEX VERB CHART POPUP MODAL
          ------------------------------------------------------------- */}
      {codexVerb && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="glass-panel modal-content" style={{ animation: 'pop-in 0.3s ease-out', maxWidth: '400px', width: '90%' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--primary)', marginBottom: '4px' }}>
              📖 Codex de Conjugación
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Present tense forms for verb: <strong>"{codexVerb}"</strong>
            </p>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '8px', color: 'var(--text-secondary)' }}>Pronombre</th>
                  <th style={{ padding: '8px', color: 'var(--primary)', fontWeight: 'bold' }}>Forma</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { pronoun: "yo", translation: "I" },
                  { pronoun: "tú", translation: "you (inf)" },
                  { pronoun: "él / ella / usted", translation: "he/she/you (formal)" },
                  { pronoun: "nosotros / nosotras", translation: "we" },
                  { pronoun: "vosotros / vosotras", translation: "you all (Spain)" },
                  { pronoun: "ellos / ellas / ustedes", translation: "they/you all" }
                ].map((p, idx) => {
                  const conjugated = conjugate(codexVerb, idx);
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {p.pronoun} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({p.translation})</span>
                      </td>
                      <td style={{ padding: '8px', color: 'var(--text-primary)', fontWeight: 600 }}>
                        {conjugated}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            <button className="btn btn-secondary" onClick={() => setCodexVerb(null)} style={{ marginTop: '20px', width: '100%' }}>
              Cerrar Codex
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
