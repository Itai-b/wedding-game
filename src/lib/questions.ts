import { Question } from "./types";

/**
 * The wedding quiz — Saar (סער, she) & Itai (איתי, he).
 * Narrator is Itai. All content is bilingual; Hebrew is the default UI language.
 * For "order" questions, the `items` array is already in the CORRECT order.
 * For "categorize" questions, each item's `categoryId` is its correct bucket.
 */
export const QUESTIONS: Question[] = [
  // 1 — multiple choice
  {
    id: "q1-years",
    stickers: ["/emojis/saar-love.png"],
    type: "mc",
    timeLimit: 30,
    prompt: {
      he: "כמה זמן סער ואיתי ביחד?",
      en: "How long have Saar & Itai been together?",
    },
    options: [
      { id: "a", text: { he: "4 שנים", en: "4 years" } },
      { id: "b", text: { he: "5.5 שנים", en: "5.5 years" } },
      { id: "c", text: { he: "6.5 שנים", en: "6.5 years" } },
      { id: "d", text: { he: "7 שנים", en: "7 years" } },
    ],
    correctId: "b",
  },

  // 1b — multiple choice: where they met (inserted between Q1 and Q2)
  {
    id: "q-met",
    stickers: ["/emojis/itai-happy.png"],
    type: "mc",
    timeLimit: 30,
    prompt: {
      he: "איפה סער ואיתי נפגשו לראשונה?",
      en: "Where did Saar & Itai first meet?",
    },
    options: [
      { id: "a", text: { he: "בארוחת שישי", en: "At a Shabbat dinner" } },
      { id: "b", text: { he: "בהרצאה אונליין", en: "In an online lecture" } },
      { id: "c", text: { he: "בחתונה", en: "At a wedding" } },
      { id: "d", text: { he: "באפליקציית היכרויות", en: "On a dating app" } },
    ],
    correctId: "a",
  },

  // 2 — multiple choice (converted from short answer)
  {
    id: "q2-apartments",
    stickers: ["/emojis/saar-happy.png"],
    type: "mc",
    timeLimit: 30,
    prompt: {
      he: "בכמה דירות סער ואיתי גרו יחד?",
      en: "In how many apartments have Saar & Itai lived together?",
    },
    options: [
      { id: "a", text: { he: "2", en: "2" } },
      { id: "b", text: { he: "3", en: "3" } },
      { id: "c", text: { he: "1", en: "1" } },
      { id: "d", text: { he: "0", en: "0" } },
    ],
    correctId: "b",
  },

  // 3 — order
  {
    id: "q3-timeline",
    stickers: ["/emojis/itai-think.png"],
    type: "order",
    timeLimit: 60,
    prompt: {
      he: "סדרו את ציר הזמן של סער ואיתי (למעלה = מוקדם, למטה = מאוחר)",
      en: "Put Saar & Itai's timeline in order (top = earliest, bottom = latest)",
    },
    items: [
      {
        id: "t1",
        text: { he: "סער ואיתי עברו לגור יחד", en: "Saar & Itai moved in together" },
      },
      {
        id: "t3",
        text: {
          he: "איתי שבר את היד בהחלקה על הקרח",
          en: "Itai broke his hand ice-skating",
        },
      },
      {
        id: "t2",
        text: {
          he: "הטיול הראשון של סער ואיתי בחו\"ל",
          en: "Saar & Itai's first trip abroad",
        },
      },
      {
        id: "t4",
        text: { he: "סער התחילה תואר שני", en: "Saar started her MSc" },
      },
      {
        id: "t5",
        text: { he: "איתי הציע נישואים לסער", en: "Itai proposed to Saar" },
      },
    ],
  },

  // 4 — multiple choice
  {
    id: "q4-game",
    stickers: ["/emojis/itai-cool.png"],
    type: "mc",
    timeLimit: 30,
    prompt: {
      he: "באיזה ממשחקי המחשב סער ואיתי משחקים יחד?",
      en: "Which of these computer games do Saar & Itai play together?",
    },
    options: [
      { id: "a", text: { he: "פיפ\"א", en: "Fifa" } },
      { id: "b", text: { he: "Pokémon Pokopia", en: "Pokémon Pokopia" } },
      { id: "c", text: { he: "Age of Empires 2", en: "Age of Empires 2" } },
      { id: "d", text: { he: "מיינקראפט", en: "Minecraft" } },
    ],
    correctId: "c",
  },

  // 5 — categorize: who's who (facts about the couple)
  {
    id: "q5-facts",
    stickers: ["/emojis/itai-think.png"],
    type: "categorize",
    timeLimit: 60,
    prompt: {
      he: "מי זה מי? התאימו כל עובדה לסער או לאיתי",
      en: "Who's who? Match each fact to Saar or Itai",
    },
    categories: [
      { id: "saar", label: { he: "סער", en: "Saar" } },
      { id: "itai", label: { he: "איתי", en: "Itai" } },
    ],
    items: [
      { id: "f1", categoryId: "itai", text: { he: "מי קרא את כל סדרת הארי פוטר בשבוע", en: "Who read the entire Harry Potter series in a week" } },
      { id: "f2", categoryId: "saar", text: { he: "מי למד 5 יחידות תנ\"ך בתיכון", en: "Who took 5 units of Bible studies in high school" } },
      { id: "f3", categoryId: "itai", text: { he: "מי היה מפקד בצבא", en: "Who was a commander in the army" } },
      { id: "f4", categoryId: "itai", text: { he: "מי עבר טסט ראשון", en: "Who passed their driving test on the first try" } },
      { id: "f5", categoryId: "saar", text: { he: "מי קיבל 100 באינפי (קורס מתמטיקה בטכניון)", en: "Who scored 100 in Calculus (Technion math course)" } },
      { id: "f6", categoryId: "saar", text: { he: "מי עשה שנת שירות", en: "Who did a volunteer year (shnat sherut)" } },
    ],
  },

  // 6 — multiple choice (converted from short answer)
  {
    id: "q6-pastry",
    stickers: ["/emojis/saar-shake.png"],
    type: "mc",
    timeLimit: 30,
    prompt: {
      he: "איזה מאפה סער הכי אוהבת לאכול לצד הקפה?",
      en: "Which pastry does Saar like most alongside coffee?",
    },
    options: [
      { id: "a", text: { he: "סינבון", en: "Cinnabon" } },
      { id: "b", text: { he: "קרואסון", en: "Croissant" } },
      { id: "c", text: { he: "בורקס", en: "Bourekas" } },
      { id: "d", text: { he: "רוגלך", en: "Rugelach" } },
    ],
    correctId: "a",
  },

  // 6b — multiple choice: favorite movie genre
  {
    id: "q-movie",
    stickers: ["/emojis/saar-wow.png"],
    type: "mc",
    timeLimit: 30,
    prompt: {
      he: "מהו ז'אנר הסרטים האהוב על סער ואיתי?",
      en: "What is Saar & Itai's favorite movie genre?",
    },
    options: [
      { id: "a", text: { he: "אימה", en: "Horror" } },
      { id: "b", text: { he: "קומדיה", en: "Comedy" } },
      { id: "c", text: { he: "אקשן", en: "Action" } },
      { id: "d", text: { he: "דוקומנטרי", en: "Documentary" } },
    ],
    correctId: "a",
  },

  // 6c — multiple choice: the tier list they DON'T keep
  {
    id: "q-tierlist",
    stickers: ["/emojis/saar-burger.png", "/emojis/itai-pizza.png"],
    type: "mc",
    timeLimit: 30,
    prompt: {
      he: "איזה \"דירוג אוכל\" סער ואיתי *לא* מתחזקים?",
      en: "Which food tier list do Saar & Itai *not* keep?",
    },
    options: [
      { id: "a", text: { he: "שווארמה", en: "Shawarma" } },
      { id: "b", text: { he: "המבורגר", en: "Hamburger" } },
      { id: "c", text: { he: "פיצה", en: "Pizza" } },
      { id: "d", text: { he: "גלידה", en: "Ice cream" } },
    ],
    correctId: "a",
  },

  // 8 — multiple choice
  {
    id: "q8-saar-left-itai",
    stickers: ["/emojis/saar-wow.png"],
    type: "mc",
    timeLimit: 30,
    prompt: {
      he: "בתחנת הרכבת של איזו עיר סער השאירה את איתי מאחור?",
      en: "At which city's train station did Saar leave Itai behind?",
    },
    options: [
      { id: "a", text: { he: "אמסטרדם", en: "Amsterdam" } },
      { id: "b", text: { he: "חיפה", en: "Haifa" } },
      { id: "c", text: { he: "רומא", en: "Rome" } },
      { id: "d", text: { he: "פריז", en: "Paris" } },
    ],
    correctId: "d",
  },

  // 8b — multiple choice: Saar's academic paper
  {
    id: "q-paper",
    stickers: ["/emojis/saar-travel.png"],
    type: "mc",
    timeLimit: 30,
    prompt: {
      he: "איפה סער הציגה את המאמר האקדמי שלה?",
      en: "Where did Saar present her academic paper?",
    },
    options: [
      { id: "a", text: { he: "סינגפור", en: "Singapore" } },
      { id: "b", text: { he: "ברלין", en: "Berlin" } },
      { id: "c", text: { he: "לונדון", en: "London" } },
      { id: "d", text: { he: "ניו יורק", en: "New York" } },
    ],
    correctId: "a",
  },

  // 10 — map pin
  {
    id: "q10-honeymoon",
    stickers: ["/emojis/saar-travel.png", "/emojis/itai-travel.png"],
    type: "map",
    timeLimit: 60,
    prompt: {
      he: "לאן ייצאו סער ואיתי לירח הדבש? הקישו על המקום במפה!",
      en: "Where will Saar & Itai's honeymoon be? Tap the spot on the map!",
    },
    target: {
      lat: 39.83,
      lng: -98.58, // geographic center of the continental USA
      label: { he: "ארצות הברית 🇺🇸", en: "USA 🇺🇸" },
    },
    fullCreditKm: 2500, // a tap anywhere on the US lands full credit
    zeroCreditKm: 15000, // closer = more; only the far side of the world scores ~0
  },
];
