import { useState, useEffect } from 'react';

const INITIAL_STATE = {
  level: 1,
  xp: 0,
  hp: 100,
  gold: 20,
  streak: 0,
  lastActiveDate: "",
  hasCompletedPlacement: false,
  badges: [],
  inventory: {
    redPotion: 0,
    goldenElixir: 0,
    streakShield: 0,
  },
  fainted: false,
  completedAdventures: [],
  apiKeys: {
    gemini: "",
  },
  answersCorrect: 0,
  answersTotal: 0,
  excludeVosotros: false,
  questStage: 1,
  questLevel: 1,
  isReviewReady: false,
  stageFlashcardsSeen: [],
  wordsAnsweredCorrectly: [],
  equipped: {
    shield: null,
    weapon: null,
    amulet: null,
  },
  ownedEquipment: [],
  mistakes: [],
  autoSpeak: true,
};

export function useGameState() {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem('estudiamos_101_state') || localStorage.getItem('vocab_aventura_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...INITIAL_STATE, ...parsed };
      }
    } catch (e) {
      console.error("Error loading state from localStorage", e);
    }
    return INITIAL_STATE;
  });

  useEffect(() => {
    localStorage.setItem('estudiamos_101_state', JSON.stringify(state));
  }, [state]);

  const addXp = (amount) => {
    setState(prev => {
      let finalAmount = amount;
      if (prev.equipped && prev.equipped.weapon === "wisdomSword") {
        finalAmount = Math.ceil(amount * 1.2);
      }
      let newXp = prev.xp + finalAmount;
      let newLevel = prev.level;
      let newHp = prev.hp;
      let newGold = prev.gold;
      let isLevelUp = false;
      const leveledBadges = [...prev.badges];

      while (newXp >= newLevel * 100) {
        newXp -= newLevel * 100;
        newLevel += 1;
        newGold += 25;
        newHp = 100;
        isLevelUp = true;
      }

      if (newLevel >= 5 && !leveledBadges.includes("level_5")) {
        leveledBadges.push("level_5");
      }
      if (newLevel >= 10 && !leveledBadges.includes("level_10")) {
        leveledBadges.push("level_10");
      }

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        hp: newHp,
        gold: newGold,
        badges: leveledBadges,
        _levelUpFlag: isLevelUp ? Date.now() : prev._levelUpFlag
      };
    });
  };

  const addGold = (amount) => {
    setState(prev => {
      let finalAmount = amount;
      if (prev.equipped && prev.equipped.amulet === "goldenAmulet") {
        finalAmount = Math.ceil(amount * 1.2);
      }
      return {
        ...prev,
        gold: prev.gold + finalAmount
      };
    });
  };

  const takeDamage = (amount) => {
    setState(prev => {
      let finalAmount = amount;
      if (prev.equipped && prev.equipped.shield === "woodenShield") {
        finalAmount = Math.max(1, amount - 5);
      }
      let newHp = Math.max(0, prev.hp - finalAmount);
      let newFainted = prev.fainted;
      const newBadges = [...prev.badges];

      if (newHp <= 0) {
        newHp = 0;
        newFainted = true;
        if (!newBadges.includes("survivor")) {
          newBadges.push("survivor");
        }
      }

      return {
        ...prev,
        hp: newHp,
        fainted: newFainted
      };
    });
  };

  const heal = (amount) => {
    setState(prev => ({
      ...prev,
      hp: Math.min(100, prev.hp + amount)
    }));
  };

  const revive = (hpAmount = 100) => {
    setState(prev => ({
      ...prev,
      hp: hpAmount,
      fainted: false
    }));
  };

  const recordQuizPerformance = (correct, total) => {
    setState(prev => {
      const newCorrect = prev.answersCorrect + correct;
      const newTotal = prev.answersTotal + total;
      const newBadges = [...prev.badges];

      if (newCorrect >= 10 && !newBadges.includes("warrior_10")) {
        newBadges.push("warrior_10");
      }
      if (newCorrect >= 50 && !newBadges.includes("warrior_50")) {
        newBadges.push("warrior_50");
      }
      if (newCorrect >= 150 && !newBadges.includes("warrior_150")) {
        newBadges.push("warrior_150");
      }

      return {
        ...prev,
        answersCorrect: newCorrect,
        answersTotal: newTotal,
        badges: newBadges
      };
    });
  };

  const buyItem = (itemKey, cost) => {
    if (state.gold < cost) return false;
    setState(prev => {
      const newInventory = { ...prev.inventory };
      newInventory[itemKey] = (newInventory[itemKey] || 0) + 1;
      const newBadges = [...prev.badges];
      
      if (prev.gold - cost >= 100 && !newBadges.includes("rich_learner")) {
        newBadges.push("rich_learner");
      }

      return {
        ...prev,
        gold: prev.gold - cost,
        inventory: newInventory
      };
    });
    return true;
  };

  const useItem = (itemKey) => {
    if ((state.inventory[itemKey] || 0) <= 0) return false;

    let success = false;
    setState(prev => {
      const newInventory = { ...prev.inventory };
      let newHp = prev.hp;
      let newFainted = prev.fainted;

      if (itemKey === "redPotion") {
        if (prev.fainted || prev.hp < 100) {
          newHp = Math.min(100, prev.hp + 50);
          newFainted = false;
          newInventory.redPotion -= 1;
          success = true;
        }
      } else if (itemKey === "goldenElixir") {
        if (prev.fainted || prev.hp < 100) {
          newHp = 100;
          newFainted = false;
          newInventory.goldenElixir -= 1;
          success = true;
        }
      }

      if (success) {
        return {
          ...prev,
          hp: newHp,
          fainted: newFainted,
          inventory: newInventory
        };
      }
      return prev;
    });

    return success;
  };

  const addBadge = (badgeId) => {
    setState(prev => {
      if (prev.badges.includes(badgeId)) return prev;
      return {
        ...prev,
        badges: [...prev.badges, badgeId]
      };
    });
  };

  const completeAdventure = (adventureId) => {
    setState(prev => {
      const updatedAdventures = prev.completedAdventures.includes(adventureId)
        ? prev.completedAdventures
        : [...prev.completedAdventures, adventureId];
      
      const newBadges = [...prev.badges];
      if (adventureId === "market" && !newBadges.includes("market_master")) {
        newBadges.push("market_master");
      }
      if (adventureId === "nat" && !newBadges.includes("social_butterfly")) {
        newBadges.push("social_butterfly");
      }
      if (adventureId === "narfy" && !newBadges.includes("dog_trainer")) {
        newBadges.push("dog_trainer");
      }

      return {
        ...prev,
        completedAdventures: updatedAdventures,
        badges: newBadges
      };
    });
  };

  const recordWordAnsweredCorrectly = (spanishWord) => {
    setState(prev => {
      const list = prev.wordsAnsweredCorrectly || [];
      if (list.includes(spanishWord)) return prev;
      return {
        ...prev,
        wordsAnsweredCorrectly: [...list, spanishWord]
      };
    });
  };

  const setApiKey = (key) => {
    setState(prev => ({
      ...prev,
      apiKeys: {
        ...prev.apiKeys,
        gemini: key
      }
    }));
  };

  const completePlacement = (score, startingStage = 1) => {
    setState(prev => {
      const startingGoldBonus = score * 10;
      const startingXpBonus = score * 40;
      
      let finalXp = prev.xp + startingXpBonus;
      let finalLevel = prev.level;
      let finalGold = prev.gold + startingGoldBonus;
      
      while (finalXp >= finalLevel * 100) {
        finalXp -= finalLevel * 100;
        finalLevel += 1;
      }

      const newBadges = [...prev.badges];
      if (!newBadges.includes("placement_done")) {
        newBadges.push("placement_done");
      }

      return {
        ...prev,
        hasCompletedPlacement: true,
        level: finalLevel,
        xp: finalXp,
        gold: finalGold,
        badges: newBadges,
        questStage: startingStage,
        questLevel: 1,
        isReviewReady: false
      };
    });
  };

  const checkAndUpdateStreak = () => {
    setState(prev => {
      const today = new Date().toISOString().split('T')[0];
      const isNewDay = prev.lastActiveDate && prev.lastActiveDate !== today;
      let newHp = isNewDay ? 100 : prev.hp;
      let newFainted = isNewDay ? false : prev.fainted;
      
      if (!prev.lastActiveDate) {
        return {
          ...prev,
          lastActiveDate: today,
          streak: 1,
          hp: 100,
          fainted: false
        };
      }

      if (prev.lastActiveDate === today) {
        return prev;
      }

      const lastDateObj = new Date(prev.lastActiveDate);
      const todayObj = new Date(today);
      const diffTime = Math.abs(todayObj - lastDateObj);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let newStreak = prev.streak;
      let newInventory = { ...prev.inventory };
      const newBadges = [...prev.badges];

      if (diffDays === 1) {
        newStreak += 1;
      } else {
        if (prev.inventory.streakShield > 0) {
          newInventory.streakShield -= 1;
        } else {
          newStreak = 1;
        }
      }

      if (newStreak >= 3 && !newBadges.includes("streak_3")) {
        newBadges.push("streak_3");
      }
      if (newStreak >= 7 && !newBadges.includes("streak_7")) {
        newBadges.push("streak_7");
      }

      return {
        ...prev,
        lastActiveDate: today,
        streak: newStreak,
        inventory: newInventory,
        badges: newBadges,
        hp: newHp,
        fainted: newFainted
      };
    });
  };

  const advanceQuest = (score, totalQuizzes = 20) => {
    const requiredScore = Math.ceil(totalQuizzes * 0.6); // 60% pass threshold (missing 40% or more fails)
    if (score < requiredScore) return false;
    
    setState(prev => {
      let nextLevel = prev.questLevel;
      let nextReview = prev.isReviewReady;
      
      if (prev.questLevel < 19) {
        nextLevel += 1;
      } else {
        nextReview = true;
      }

      let goldReward = 12;
      let xpReward = 60;
      if (prev.equipped && prev.equipped.amulet === "goldenAmulet") {
        goldReward = Math.ceil(goldReward * 1.2);
      }
      if (prev.equipped && prev.equipped.weapon === "wisdomSword") {
        xpReward = Math.ceil(xpReward * 1.2);
      }

      let newXp = prev.xp + xpReward;
      let newLevel = prev.level;
      let newHp = prev.hp;
      let newGold = prev.gold + goldReward;
      let isLevelUp = false;
      const leveledBadges = [...prev.badges];

      while (newXp >= newLevel * 100) {
        newXp -= newLevel * 100;
        newLevel += 1;
        newGold += 25;
        newHp = 100;
        isLevelUp = true;
      }

      if (newLevel >= 5 && !leveledBadges.includes("level_5")) {
        leveledBadges.push("level_5");
      }
      if (newLevel >= 10 && !leveledBadges.includes("level_10")) {
        leveledBadges.push("level_10");
      }

      return {
        ...prev,
        questLevel: nextLevel,
        isReviewReady: nextReview,
        gold: newGold,
        xp: newXp,
        level: newLevel,
        hp: newHp,
        badges: leveledBadges,
        _levelUpFlag: isLevelUp ? Date.now() : prev._levelUpFlag
      };
    });
    return true;
  };

  const passStageReview = (score, totalQuizzes = 20) => {
    const requiredScore = Math.ceil(totalQuizzes * 0.7); // 70% pass threshold
    if (score < requiredScore) return false;

    setState(prev => {
      const nextStage = Math.min(10, prev.questStage + 1);
      const isGameBeaten = prev.questStage === 10;
      const newBadges = [...prev.badges];
      
      if (isGameBeaten && !newBadges.includes("game_beaten")) {
        newBadges.push("game_beaten");
      }

      let goldReward = 50;
      let xpReward = 200;
      if (prev.equipped && prev.equipped.amulet === "goldenAmulet") {
        goldReward = Math.ceil(goldReward * 1.2);
      }
      if (prev.equipped && prev.equipped.weapon === "wisdomSword") {
        xpReward = Math.ceil(xpReward * 1.2);
      }

      let newXp = prev.xp + xpReward;
      let newLevel = prev.level;
      let newHp = prev.hp;
      let newGold = prev.gold + goldReward;
      let isLevelUp = false;

      while (newXp >= newLevel * 100) {
        newXp -= newLevel * 100;
        newLevel += 1;
        newGold += 25;
        newHp = 100;
        isLevelUp = true;
      }

      if (newLevel >= 5 && !newBadges.includes("level_5")) {
        newBadges.push("level_5");
      }
      if (newLevel >= 10 && !newBadges.includes("level_10")) {
        newBadges.push("level_10");
      }

      return {
        ...prev,
        questStage: nextStage,
        questLevel: 1,
        isReviewReady: false,
        gold: newGold,
        xp: newXp,
        level: newLevel,
        hp: newHp,
        badges: newBadges,
        stageFlashcardsSeen: [],
        _levelUpFlag: isLevelUp ? Date.now() : prev._levelUpFlag
      };
    });
    return true;
  };

  const buyEquipment = (itemKey, cost, slot) => {
    if (state.gold < cost) return false;
    setState(prev => {
      const owned = prev.ownedEquipment || [];
      if (owned.includes(itemKey)) return prev;
      const newOwned = [...owned, itemKey];
      const newEquipped = { ...prev.equipped };
      newEquipped[slot] = itemKey;

      return {
        ...prev,
        gold: prev.gold - cost,
        ownedEquipment: newOwned,
        equipped: newEquipped
      };
    });
    return true;
  };

  const equipItem = (itemKey, slot) => {
    setState(prev => {
      const owned = prev.ownedEquipment || [];
      if (itemKey !== null && !owned.includes(itemKey)) return prev;

      const newEquipped = { ...prev.equipped };
      newEquipped[slot] = itemKey;

      return {
        ...prev,
        equipped: newEquipped
      };
    });
  };

  const addMistake = (spanishWord) => {
    setState(prev => {
      const list = prev.mistakes || [];
      if (list.includes(spanishWord)) return prev;
      return {
        ...prev,
        mistakes: [...list, spanishWord]
      };
    });
  };

  const removeMistake = (spanishWord) => {
    setState(prev => {
      const list = prev.mistakes || [];
      return {
        ...prev,
        mistakes: list.filter(w => w !== spanishWord)
      };
    });
  };

  const toggleAutoSpeak = () => {
    setState(prev => ({
      ...prev,
      autoSpeak: !prev.autoSpeak
    }));
  };

  const resetAllProgress = () => {
    setState(INITIAL_STATE);
  };

  const setExcludeVosotros = (val) => {
    setState(prev => ({
      ...prev,
      excludeVosotros: val
    }));
  };

  const markFlashcardsSeen = (words) => {
    setState(prev => {
      const nextSeen = [...new Set([...(prev.stageFlashcardsSeen || []), ...words])];
      return {
        ...prev,
        stageFlashcardsSeen: nextSeen
      };
    });
  };

  return {
    state,
    addXp,
    addGold,
    takeDamage,
    heal,
    revive,
    recordQuizPerformance,
    buyItem,
    useItem,
    addBadge,
    completeAdventure,
    setApiKey,
    completePlacement,
    checkAndUpdateStreak,
    advanceQuest,
    passStageReview,
    resetAllProgress,
    setExcludeVosotros,
    markFlashcardsSeen,
    recordWordAnsweredCorrectly,
    buyEquipment,
    equipItem,
    addMistake,
    removeMistake,
    toggleAutoSpeak,
  };
}
