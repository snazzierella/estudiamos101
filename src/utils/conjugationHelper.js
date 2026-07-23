// Spanish 101 Present Tense Conjugation Helper

const PRONOUNS = [
  { label: "yo (I)", idx: 0 },
  { label: "tú (you, informal)", idx: 1 },
  { label: "él / ella / usted (he/she/you, formal)", idx: 2 },
  { label: "nosotros / nosotras (we)", idx: 3 },
  { label: "vosotros / vosotras (you all, Spain)", idx: 4 },
  { label: "ellos / ellas / ustedes (they/you all)", idx: 5 }
];

const IRREGULAR_VERBS = {
  "ser": ["soy", "eres", "es", "somos", "sois", "son"],
  "estar": ["estoy", "estás", "está", "estamos", "estáis", "están"],
  "ir": ["voy", "vas", "va", "vamos", "vais", "van"],
  "haber": ["he", "has", "ha", "hemos", "habéis", "han"],
  "tener": ["tengo", "tienes", "tiene", "tenemos", "tenéis", "tienen"],
  "venir": ["vengo", "vienes", "viene", "venimos", "venís", "vienen"],
  "decir": ["digo", "dices", "dice", "decimos", "decís", "dicen"],
  "seguir": ["sigo", "sigues", "sigue", "seguimos", "seguís", "siguen"],
  "dar": ["doy", "das", "da", "damos", "dais", "dan"],
  "hacer": ["hago", "haces", "hace", "hacemos", "hacéis", "hacen"],
  "oír": ["oigo", "oyes", "oye", "oímos", "oís", "oyen"],
  "poner": ["pongo", "pones", "pone", "ponemos", "ponéis", "ponen"],
  "salir": ["salgo", "sales", "sale", "salimos", "salís", "salen"],
  "traer": ["traigo", "traes", "trae", "traemos", "traéis", "traen"],
  "valer": ["valgo", "vales", "vale", "valemos", "valéis", "valen"],
  "ver": ["veo", "ves", "ve", "vemos", "veis", "ven"],
  "saber": ["sé", "sabes", "sabe", "sabemos", "sabéis", "saben"],
  "conocer": ["conozco", "conoces", "conoce", "conocemos", "conocéis", "conocen"],
  
  // Stem changers (o -> ue)
  "almorzar": ["almuerzo", "almuerzas", "almuerza", "almorzamos", "almorzáis", "almuerzan"],
  "jugar": ["juego", "juegas", "juega", "jugamos", "jugáis", "juegan"],
  "costar": ["cuesto", "cuestas", "cuesta", "costamos", "costáis", "cuestan"],
  "poder": ["puedo", "puedes", "puede", "podemos", "podéis", "pueden"],
  "devolver": ["devuelvo", "devuelves", "devuelve", "devolvemos", "devolvéis", "devuelven"],
  "recordar": ["recuerdo", "recuerdas", "recuerda", "recordamos", "recordáis", "recuerdan"],
  "dormir": ["duermo", "duermas", "duerma", "dormimos", "dormís", "duermen"],
  "volver": ["vuelvo", "vuelves", "vuelve", "volvemos", "volvéis", "vuelven"],
  "encontrar": ["encuentro", "encuentras", "encuentra", "encontramos", "encontráis", "encuentran"],

  // Stem changers (e -> ie)
  "cerrar": ["cierro", "cierras", "cierra", "cerramos", "cerráis", "cierran"],
  "preferir": ["prefiero", "prefieres", "prefiere", "preferimos", "preferís", "prefieren"],
  "comenzar": ["comienzo", "comienzas", "comienza", "comenzamos", "comenzáis", "comienzan"],
  "querer": ["quiero", "quieres", "quiere", "queremos", "queréis", "quieren"],
  "empezar": ["empiezo", "empiezas", "empieza", "empezamos", "empezáis", "empiezan"],
  "sentir": ["siento", "sientes", "siente", "sentimos", "sentís", "sienten"],
  "entender": ["entiendo", "entiendes", "entiende", "entendemos", "entendéis", "entienden"],
  "pensar": ["pienso", "piensas", "piensa", "pensamos", "pensáis", "piensan"],
  "perder": ["pierdo", "pierdes", "pierde", "perdemos", "perdéis", "pierden"],

  // Stem changers (e -> i)
  "pedir": ["pido", "pides", "pide", "pedimos", "pedís", "piden"],
  "servir": ["sirvo", "sirves", "sirve", "servimos", "servís", "sirven"],
  "reír": ["río", "ríes", "ríe", "reímos", "reís", "ríen"],
  "sonreír": ["sonrío", "sonríes", "sonríe", "sonreímos", "sonreís", "sonríen"],
  "repetir": ["repito", "repites", "repite", "repetimos", "repetís", "repiten"]
};

// Endings arrays for regular verbs
const AR_ENDINGS = ["o", "as", "a", "amos", "áis", "an"];
const ER_ENDINGS = ["o", "es", "e", "emos", "éis", "en"];
const IR_ENDINGS = ["o", "es", "e", "imos", "ís", "en"];

export function conjugate(verb, pronounIdx) {
  const cleanVerb = verb.trim().toLowerCase();
  
  // 1. Check irregulars dictionary
  if (IRREGULAR_VERBS[cleanVerb]) {
    return IRREGULAR_VERBS[cleanVerb][pronounIdx];
  }

  // 2. Perform regular conjugation
  const stem = cleanVerb.slice(0, -2);
  const ending = cleanVerb.slice(-2);

  if (ending === "ar") {
    return stem + AR_ENDINGS[pronounIdx];
  } else if (ending === "er") {
    return stem + ER_ENDINGS[pronounIdx];
  } else if (ending === "ir") {
    return stem + IR_ENDINGS[pronounIdx];
  }

  return cleanVerb; // fallback
}

export function generateConjugationQuestion(verbItem, options = {}) {
  const verb = verbItem.spanish.trim().toLowerCase();
  
  // Skip gustar-type verbs since they conjugate differently
  if (verbItem.subcategory === "Verbs Structured Like Gustar") {
    return null;
  }

  // Filter pronouns based on options
  const allowedPronouns = options.excludeVosotros 
    ? PRONOUNS.filter(p => p.idx !== 4) 
    : PRONOUNS;

  // Pick a random pronoun
  const randPronoun = allowedPronouns[Math.floor(Math.random() * allowedPronouns.length)];
  const correctForm = conjugate(verb, randPronoun.idx);

  // Generate 3 distractors
  const distractors = new Set();
  
  // Distractor source 1: Other endings of the same verb
  for (let i = 0; i < 6; i++) {
    if (i !== randPronoun.idx && !(options.excludeVosotros && i === 4)) {
      distractors.add(conjugate(verb, i));
    }
  }

  // Distractor source 2: If we don't have enough, pull endings from a generic verb type
  const genericEndings = verb.endsWith("ar") ? AR_ENDINGS : (verb.endsWith("er") ? ER_ENDINGS : IR_ENDINGS);
  const stem = verb.slice(0, -2);
  genericEndings.forEach((end, idx) => {
    if (!(options.excludeVosotros && idx === 4)) {
      distractors.add(stem + end);
    }
  });

  // Convert to array, filter out correct answer
  let distractorsArray = Array.from(distractors).filter(form => form !== correctForm);

  // Shuffe and select top 3
  distractorsArray = distractorsArray.sort(() => Math.random() - 0.5).slice(0, 3);

  // Combine and shuffle choices
  const choices = [correctForm, ...distractorsArray].sort(() => Math.random() - 0.5);

  return {
    verb: verbItem.spanish,
    meaning: verbItem.english,
    pronoun: randPronoun.label,
    correct: correctForm,
    choices: choices
  };
}

export function generateFillInTheBlank(sentenceItem) {
  const sentence = sentenceItem.spanish.trim();
  
  const BLANK_SPECS = {
    "la mujer come una manzana roja": {
      blanked: "la mujer [_____] una manzana roja",
      correct: "come",
      choices: ["como", "comes", "come", "comemos"],
      type: "verb"
    },
    "la mujer come una manzana roja (adj)": {
      blanked: "la mujer come una manzana [_____]",
      correct: "roja",
      choices: ["rojo", "roja", "rojos", "rojas"],
      type: "adjective"
    },
    "el muchacho tiene un perro negro": {
      blanked: "el muchacho [_____] un perro negro",
      correct: "tiene",
      choices: ["tengo", "tienes", "tiene", "tenemos"],
      type: "verb"
    },
    "el muchacho tiene un perro negro (adj)": {
      blanked: "el muchacho tiene un perro [_____]",
      correct: "negro",
      choices: ["negro", "negra", "negros", "negras"],
      type: "adjective"
    },
    "nosotros vivimos en una casa grande": {
      blanked: "nosotros [_____] en una casa grande",
      correct: "vivimos",
      choices: ["vivo", "vives", "vive", "vivimos"],
      type: "verb"
    },
    "ellos quieren almorzar en la cafetería": {
      blanked: "ellos [_____] almorzar en la cafetería",
      correct: "quieren",
      choices: ["quiero", "quieres", "quiere", "quieren"],
      type: "verb"
    },
    "el estudiante hace la tarea en la biblioteca": {
      blanked: "el estudiante [_____] la tarea en la biblioteca",
      correct: "hace",
      choices: ["hago", "haces", "hace", "hacemos"],
      type: "verb"
    },
    "yo no sé la respuesta": {
      blanked: "yo no [_____] la respuesta",
      correct: "sé",
      choices: ["sé", "sabes", "sabe", "sabemos"],
      type: "verb"
    },
    "el maestro enseña la clase de español": {
      blanked: "el maestro [_____] la clase de español",
      correct: "enseña",
      choices: ["enseño", "enseñas", "enseña", "enseñan"],
      type: "verb"
    },
    "dónde está la residencia estudiantil": {
      blanked: "dónde [_____] la residencia estudiantil",
      correct: "está",
      choices: ["estoy", "estás", "está", "están"],
      type: "verb"
    },
    "hace mucho frío en el invierno": {
      blanked: "hace mucho [_____] en el invierno",
      correct: "frío",
      choices: ["frío", "fría", "fríos", "frías"],
      type: "adjective"
    },
    "nosotros preferimos jugar al fútbol": {
      blanked: "nosotros [_____] jugar al fútbol",
      correct: "preferimos",
      choices: ["prefiero", "prefieres", "prefiere", "preferimos"],
      type: "verb"
    },
    "mi familia prefiere comer pollo con arroz": {
      blanked: "mi familia [_____] comer pollo con arroz",
      correct: "prefiere",
      choices: ["prefiero", "prefieres", "prefiere", "preferimos"],
      type: "verb"
    },
    "yo tengo que estudiar para el examen": {
      blanked: "yo [_____] que estudiar para el examen",
      correct: "tengo",
      choices: ["tengo", "tienes", "tiene", "tenemos"],
      type: "verb"
    },
    "ella habla español muy bien": {
      blanked: "ella [_____] español muy bien",
      correct: "habla",
      choices: ["hablo", "hablas", "habla", "hablan"],
      type: "verb"
    },
    "qué quieres comer hoy": {
      blanked: "qué [_____] comer hoy",
      correct: "quieres",
      choices: ["quiero", "quieres", "quiere", "queremos"],
      type: "verb"
    },
    "el libro está encima del escritorio": {
      blanked: "el libro [_____] encima del escritorio",
      correct: "está",
      choices: ["estoy", "estás", "está", "están"],
      type: "verb"
    },
    "la escuela está cerca de la casa": {
      blanked: "la escuela [_____] cerca de la casa",
      correct: "está",
      choices: ["estoy", "estás", "está", "están"],
      type: "verb"
    },
    "nosotros compramos pan en el mercado": {
      blanked: "nosotros [_____] pan en el mercado",
      correct: "compramos",
      choices: ["compro", "compras", "compra", "compramos"],
      type: "verb"
    },
    "yo vengo a la universidad en autobús": {
      blanked: "yo [_____] a la universidad en autobús",
      correct: "vengo",
      choices: ["vengo", "vienes", "viene", "venimos"],
      type: "verb"
    },
    "mi amigo duerme en la clase": {
      blanked: "mi amigo [_____] en la clase",
      correct: "duerme",
      choices: ["duermo", "duermes", "duerme", "dormimos"],
      type: "verb"
    }
  };

  let targetKey = sentence;
  if (sentence === "la mujer come una manzana roja" && Math.random() > 0.5) {
    targetKey = "la mujer come una manzana roja (adj)";
  } else if (sentence === "el muchacho tiene un perro negro" && Math.random() > 0.5) {
    targetKey = "el muchacho tiene un perro negro (adj)";
  }

  const spec = BLANK_SPECS[targetKey];
  if (!spec) return null;

  return {
    sentence: spec.blanked,
    meaning: sentenceItem.english,
    correct: spec.correct,
    choices: [...spec.choices].sort(() => Math.random() - 0.5),
    type: spec.type
  };
}
