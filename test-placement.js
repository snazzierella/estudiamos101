import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const vocabPath = path.join(__dirname, 'src', 'data', 'vocabulary.json');
const vocab = JSON.parse(fs.readFileSync(vocabPath, 'utf8'));

const getWordDifficulty = (item) => {
  // Simple check similar to difficultyMapper
  if (item.category === "Sentences") return 5;
  if (item.category === "Verbs") return 4;
  if (item.category === "Adjectives" && item.subcategory === "Nationalities") return 3;
  if (item.category === "Nouns" && item.subcategory === "People and Professions") return 3;
  if (item.category === "Nouns" && item.subcategory === "Food and Drinks") return 3;
  if (item.subcategory === "Greetings, Goodbyes, & Conversation") return 1;
  if (item.subcategory === "Articles") return 1;
  if (item.subcategory === "Numbers") return 1;
  return 2;
};

const subcategories = [
  "Greetings, Goodbyes, & Conversation",
  "Family",
  "Food and Drinks",
  "People and Professions",
  "Numbers",
  "Time, Days, Months, and Seasons",
  "Sports and Hobbies",
  "Colors"
];

subcategories.forEach(sub => {
  const catWords = vocab.filter(item => item.subcategory === sub);
  const easyPool = catWords.filter(item => getWordDifficulty(item) <= 3);
  const hardPool = catWords.filter(item => getWordDifficulty(item) >= 4);

  console.log(`Subcategory: "${sub}"`);
  console.log(`- Total words: ${catWords.length}`);
  console.log(`- Easy pool (<=3): ${easyPool.length}`);
  console.log(`- Hard pool (>=4): ${hardPool.length}`);
  
  if (catWords.length === 0) {
    console.error(`ERROR: Subcategory "${sub}" not found!`);
  }
});
