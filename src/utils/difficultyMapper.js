// progressive Stage Mapper and Difficulty Ratings for Spanish 101 Vocabulary

export const STAGES = {
  1: {
    name: "Primeros Pasos (First Steps)",
    subcategories: [
      "Greetings, Goodbyes, & Conversation",
      "Articles",
      "Numbers",
      "Subject & Indirect Object Pronouns"
    ]
  },
  2: {
    name: "La Gente y Mascotas (People & Pets)",
    subcategories: [
      "People and Professions",
      "Family",
      "Animals and Pets"
    ]
  },
  3: {
    name: "Entorno y Colores (Environment & Colors)",
    subcategories: [
      "Classroom and Office",
      "Places in the City",
      "Colors"
    ]
  },
  4: {
    name: "La Casa y Comida (Home & Dining)",
    subcategories: [
      "The House and Furniture",
      "Tableware and Utensils",
      "Food and Drinks"
    ]
  },
  5: {
    name: "Universidad y Tiempo (University & Time)",
    subcategories: [
      "The University and Courses",
      "Time, Days, Months, and Seasons"
    ]
  },
  6: {
    name: "Naturaleza y Pasatiempos (Nature & Hobbies)",
    subcategories: [
      "Weather and Nature",
      "Sports and Hobbies",
      "Other Common Nouns",
      "Conjunctions"
    ]
  },
  7: {
    name: "Descripción y Emociones (Descriptions & Feelings)",
    subcategories: [
      "Physical Appearance",
      "Personality & Qualities",
      "Emotions & Conditions"
    ]
  },
  8: {
    name: "Nacionalidades y Modificadores (Nationalities & Grammar)",
    subcategories: [
      "Nationalities",
      "Possessive & Quantitative Adjectives",
      "Weather Adjectives",
      "Miscellaneous Adjectives"
    ]
  },
  9: {
    name: "Acciones Regulares y Ubicación (Verbs & Directions)",
    subcategories: [
      "Regular -ar Verbs",
      "Regular -er Verbs",
      "Regular -ir Verbs",
      "Question Words",
      "Prepositions and Location Words",
      "Adverbs of Time and Frequency",
      "Other Useful Words"
    ]
  },
  10: {
    name: "Acciones Avanzadas (Irregularities & Stem Changers)",
    subcategories: [
      "Core Irregular Verbs",
      "Stem-Changing Verbs (o -> ue)",
      "Stem-Changing Verbs (e -> ie)",
      "Stem-Changing Verbs (e -> i)",
      "Irregular Yo Form Verbs",
      "Verbs for Knowing",
      "Verbs Structured Like Gustar",
      "Syllabus Sentences"
    ]
  }
};

// Maps subcategory string to Stage Number
export function getStageForSubcategory(subcategory) {
  for (const [stageNum, stageInfo] of Object.entries(STAGES)) {
    if (stageInfo.subcategories.includes(subcategory)) {
      return parseInt(stageNum, 10);
    }
  }
  return 10; // default fallback
}

// Assigns word difficulty rating (1 to 5) for the adaptive placement test
export function getWordDifficulty(item) {
  const stage = getStageForSubcategory(item.subcategory);
  
  if (stage <= 2) return 1; // Very Easy
  if (stage <= 4) return 2; // Easy
  if (stage <= 6) return 3; // Medium
  if (stage <= 8) return 4; // Hard
  return 5; // Very Hard
}

// Prefixes articles like 'the', 'a', 'an' to English translations based on Spanish article presence
export function formatEnglishPrompt(spanish, english) {
  const sp = spanish.trim().toLowerCase();
  const en = english.trim().toLowerCase();
  
  // Definite Articles
  if (sp.startsWith("el ") || sp.startsWith("la ") || sp.startsWith("los ") || sp.startsWith("las ")) {
    if (!en.startsWith("the ")) {
      return "the " + english;
    }
  }
  
  // Indefinite Singular Articles
  if (sp.startsWith("un ") || sp.startsWith("una ")) {
    if (!en.startsWith("a ") && !en.startsWith("an ")) {
      const firstChar = english.trim().toLowerCase().charAt(0);
      const isVowel = ['a', 'e', 'i', 'o', 'u'].includes(firstChar);
      return (isVowel ? "an " : "a ") + english;
    }
  }
  
  // Indefinite Plural Articles
  if (sp.startsWith("unos ") || sp.startsWith("unas ")) {
    if (!en.startsWith("some ")) {
      return "some " + english;
    }
  }
  
  return english;
}
