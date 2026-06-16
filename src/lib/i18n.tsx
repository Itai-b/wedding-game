"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Lang, LocalizedText } from "./types";

type Dict = Record<string, { he: string; en: string }>;

/** All UI strings (question content lives in questions.ts). */
const DICT: Dict = {
  coupleNames: { he: "סער ואיתי", en: "Saar & Itai" },
  weddingDate: { he: "12.06.26 · אולם סקיי גארדן, יקנעם", en: "12.06.26 · Sky Garden, Yokneam" },

  chooseLanguage: { he: "בחרו שפה", en: "Choose a language" },
  hebrew: { he: "עברית", en: "עברית" },
  english: { he: "English", en: "English" },

  gameTitle: { he: "משחק החתונה", en: "The Wedding Game" },
  gameSubtitle: {
    he: "כמה טוב אתם מכירים את הזוג?",
    en: "How well do you know the couple?",
  },
  namePrompt: { he: "איך קוראים לכם?", en: "What's your name?" },
  namePlaceholder: { he: "השם שלכם", en: "Your name" },
  start: { he: "מתחילים!", en: "Let's go!" },
  nameRequired: { he: "אנא הזינו שם", en: "Please enter a name" },

  howToTitle: { he: "איך משחקים?", en: "How to play" },
  ruleSpeed: {
    he: "ככל שתענו נכון מהר יותר — תזכו ביותר נקודות",
    en: "The faster you answer correctly, the more points you earn",
  },
  ruleNoBack: {
    he: "אי אפשר לחזור אחורה — ברגע שאישרתם (או שנגמר הזמן), עוברים לשאלה הבאה",
    en: "No going back — once you submit (or the time runs out) you move on",
  },
  ruleHidden: {
    he: "לא תדעו אם עניתם נכון — הניקוד מתגלה רק בסוף",
    en: "You won't see if you were right — your score is revealed at the end",
  },
  ruleTiming: {
    he: "30 שניות לשאלות אמריקאיות, ודקה לשאלות המיוחדות (שיוסברו לפני כל אחת)",
    en: "30 seconds for multiple-choice, 1 minute for the special questions (explained before each one)",
  },
  ruleReveal: {
    he: "המנצחים כבר הוכתרו בחתונה — עכשיו פשוט משחקים בשביל הכיף! 🎉",
    en: "The winners were already crowned at the wedding — now it's just for fun! 🎉",
  },
  ruleOnce: {
    he: "{n} שאלות, משחק אחד. בהצלחה! 💍",
    en: "{n} questions, one game. Good luck! 💍",
  },
  rulePrizes: {
    he: "שלושת המקומות הראשונים זוכים בפרסים!",
    en: "The top 3 places win prizes!",
  },
  prizesTitle: { he: "במה זכו המנצחים", en: "What the winners won" },
  placeFirst: { he: "מקום ראשון", en: "First place" },
  placeSecond: { he: "מקום שני", en: "Second place" },
  placeThird: { he: "מקום שלישי", en: "Third place" },
  prizeDinner: {
    he: "ארוחת ערב בהכנת סער ואיתי",
    en: "A dinner made by Saar & Itai",
  },
  prizeSong: {
    he: "בחירת שיר לרחבה (תלוי אם זמין ל-DJ)",
    en: "Pick a song for the dancefloor (if available for the DJ)",
  },
  prizeScratch: {
    he: "כרטיס גירוד",
    en: "Scratch card",
  },
  startPlaying: { he: "יאללה, מתחילים!", en: "I'm ready — start!" },

  // Kahoot-style "get ready" buffer before the non-multiple-choice questions
  introHeading: { he: "השאלה הבאה", en: "Next question" },
  introStartsIn: { he: "מתחילים בעוד", en: "Starts in" },
  introSkip: { he: "מוכנים, קדימה! ›", en: "I'm ready — go! ›" },
  introTitleOrder: { he: "סידור לפי הסדר", en: "Put them in order" },
  introBodyOrder: {
    he: "סדרו את הפריטים מהמוקדם (למעלה) למאוחר (למטה) בעזרת החצים",
    en: "Sort the items from earliest (top) to latest (bottom) using the arrows",
  },
  introTitleCategorize: { he: "סער או איתי?", en: "Saar or Itai?" },
  introBodyCategorize: {
    he: "לכל עובדה בחרו אם היא שייכת לסער או לאיתי",
    en: "For each fact, choose whether it belongs to Saar or Itai",
  },
  introTitleMap: { he: "על המפה", en: "On the map" },
  introBodyMap: {
    he: "גללו את מפת העולם והקישו על המקום — ככל שתהיו קרובים, תקבלו יותר נקודות",
    en: "Scroll the world map and tap the spot — the closer you are, the more points",
  },

  questionOf: { he: "שאלה {n} מתוך {total}", en: "Question {n} of {total}" },
  submit: { he: "אישור", en: "Submit" },
  next: { he: "הבא", en: "Next" },
  tapNext: { he: "כדי להמשיך, לחצו על הכפתור למטה ↓", en: "Tap the button below to continue ↓" },
  finish: { he: "סיום", en: "Finish" },
  seeResults: { he: "לתוצאות", en: "See results" },
  timesUp: { he: "נגמר הזמן!", en: "Time's up!" },

  correct: { he: "נכון! 🎉", en: "Correct! 🎉" },
  partial: { he: "כמעט! 👏", en: "Almost! 👏" },
  wrong: { he: "אופס, לא נכון", en: "Oops, not quite" },
  pointsEarned: { he: "+{pts} נק'", en: "+{pts} pts" },
  correctAnswerWas: { he: "התשובה הנכונה:", en: "Correct answer:" },

  // order
  orderHint: {
    he: "השתמשו בחצים כדי לסדר (למעלה = מוקדם)",
    en: "Use the arrows to sort (top = earliest)",
  },
  moveUp: { he: "למעלה", en: "Up" },
  moveDown: { he: "למטה", en: "Down" },
  orderUntouched: {
    he: "עדיין לא סידרתם — השתמשו בחצים כדי לסדר",
    en: "Not sorted yet — use the arrows to order them",
  },

  // categorize
  categorizeHint: {
    he: "לכל עובדה — בחרו סער או איתי",
    en: "For each fact, choose Saar or Itai",
  },
  categorizeRemaining: {
    he: "נותרו {n} להתאמה",
    en: "{n} still to assign",
  },
  categorizeAllDone: {
    he: "הכול הותאם! אפשר לאשר ✓",
    en: "All assigned — ready to submit ✓",
  },
  unassigned: { he: "להתאמה", en: "To sort" },

  // map
  mapHint: { he: "הקישו על המפה כדי לסמן מיקום", en: "Tap the map to drop your pin" },
  mapScrollHint: {
    he: "גללו ימינה ושמאלה כדי לראות את כל העולם",
    en: "Scroll left & right to see the whole world",
  },
  mapPlaced: { he: "סומן! הקישו שוב כדי להזיז", en: "Pinned! Tap again to move it" },
  mapBullseye: { he: "בול! פגעתם בארה\"ב 🎯", en: "Bullseye — you hit the USA! 🎯" },
  yourGuessAway: { he: "פספסתם ב-{km} ק\"מ", en: "You were {km} km off" },

  // results
  yourScore: { he: "הניקוד שלכם", en: "Your score" },
  yourRank: { he: "המקום שלכם: {rank}", en: "Your rank: {rank}" },
  viewLeaderboard: { he: "טבלת המובילים", en: "View leaderboard" },
  viewFullLeaderboard: { he: "לדירוג המלא ›", en: "Full standings ›" },
  thanksForPlaying: { he: "תודה ששיחקתם! 💍", en: "Thanks for playing! 💍" },

  // Post-wedding "play anytime" landing
  postThanksTitle: { he: "תודה שחגגתם איתנו! 💍", en: "Thanks for celebrating with us! 💍" },
  postThanksBody: {
    he: "החתונה הסתיימה — אבל המשחק כאן בשבילכם. שחקו כמה פעמים שתרצו!",
    en: "The wedding's over — but the game lives on. Play as many times as you like!",
  },
  playTheGame: { he: "לשחק את המשחק 🎮", en: "Play the game 🎮" },
  playAgain: { he: "לשחק שוב 🔁", en: "Play again 🔁" },
  weddingPodiumTitle: { he: "הפודיום מהחתונה 🏆", en: "Wedding podium 🏆" },
  yourWeddingResult: {
    he: "התוצאה שלכם בחתונה: {score} · מקום {rank}",
    en: "Your wedding result: {score} · #{rank}",
  },
  savingTitle: { he: "מסכמים את הניקוד…", en: "Tallying your score…" },
  savingBody: {
    he: "עוד רגע והתוצאות שלכם מוכנות 🎉",
    en: "Just a moment — your results are on the way 🎉",
  },
  shareInvite: {
    he: "מכירים עוד מישהו ששווה שישחק? הראו לו את הקוד!",
    en: "Know someone who should play? Show them this code!",
  },

  rankRevealLater: {
    he: "המיקום שלכם בטבלה יוכרז בהמשך החתונה 🤫",
    en: "Your place on the board will be revealed later at the wedding 🤫",
  },

  // leaderboard
  leaderboard: { he: "טבלת המובילים", en: "Leaderboard" },
  lbLockedTitle: { he: "הטבלה עדיין נעולה 🔒", en: "The leaderboard is locked 🔒" },
  lbLockedBody: {
    he: "התוצאות ייחשפו ברגע שהמנחה יסיים את המשחק",
    en: "Standings are revealed once the host ends the game",
  },
  topThree: { he: "שלושת המקומות הראשונים", en: "Top 3" },
  standingsSubtitle: { he: "הפודיום והדירוג המלא", en: "The podium & full standings" },
  resultRank: {
    he: "המקום שלכם בטבלה: {rank} מתוך {total} 🏆",
    en: "Your place on the board: {rank} of {total} 🏆",
  },
  noPlayersYet: { he: "עדיין אין שחקנים — היו הראשונים!", en: "No players yet — be the first!" },
  you: { he: "אתם", en: "You" },
  rankCol: { he: "מקום", en: "Rank" },
  nameCol: { he: "שם", en: "Name" },
  scoreCol: { he: "ניקוד", en: "Score" },
  playersCount: { he: "{n} שחקנים", en: "{n} players" },
  refresh: { he: "רענון", en: "Refresh" },

  // one-attempt / already played
  alreadyPlayedTitle: { he: "כבר שיחקתם 🎈", en: "You already played 🎈" },
  alreadyPlayedBody: {
    he: "כל אורח יכול לשחק פעם אחת. הנה הניקוד שלכם:",
    en: "Each guest can play once. Here's your score:",
  },

  // game finished / answers
  gameEndedTitle: { he: "המשחק הסתיים! 🎉", en: "The game has ended! 🎉" },
  gameEndedBody: { he: "תודה לכולם ששיחקתם 💍", en: "Thanks everyone for playing 💍" },
  scoreHiddenNote: {
    he: "התשובות הנכונות ייחשפו בסוף המשחק",
    en: "The correct answers are revealed at the end of the game",
  },
  viewAnswers: { he: "צפו בתשובות", en: "View answers" },
  answersTitle: { he: "התשובות הנכונות", en: "The answers" },
  answersScore: {
    he: "עניתם נכון על {n} מתוך {total} שאלות",
    en: "You got {n} of {total} questions right",
  },
  answersLockedTitle: { he: "התשובות עדיין נעולות 🔒", en: "Answers are locked 🔒" },
  answersLockedBody: {
    he: "הן ייחשפו ברגע שהמנחה יסיים את המשחק",
    en: "They'll be revealed once the host ends the game",
  },
  back: { he: "חזרה", en: "Back" },

  // admin
  adminTitle: { he: "עמוד מנהל", en: "Admin page" },
  finishGame: { he: "סיום משחק + חשיפת תשובות", en: "Finish game + reveal answers" },
  reopenGame: { he: "פתיחת המשחק מחדש", en: "Reopen game" },
  showLeaderboardBtn: { he: "הצגת טבלת המובילים 🏆", en: "Show leaderboard 🏆" },
  hideLeaderboardBtn: { he: "הסתרת טבלת המובילים", en: "Hide leaderboard" },
  lbShownStatus: { he: "הטבלה מוצגת לאורחים 🏆", en: "Leaderboard is shown 🏆" },
  lbHiddenStatus: { he: "הטבלה מוסתרת", en: "Leaderboard hidden" },
  finishConfirm: {
    he: "לסיים את המשחק? שחקנים חדשים לא יוכלו להצטרף והתשובות ייחשפו לכולם.",
    en: "Finish the game? New players can't join and the answers are revealed to everyone.",
  },
  gameLive: { he: "המשחק פעיל 🟢", en: "Game is live 🟢" },
  gameOver: { he: "המשחק הסתיים 🏁", en: "Game finished 🏁" },

  // time lock
  lockedTitle: { he: "המשחק עוד לא התחיל 🔒", en: "The game hasn't started yet 🔒" },
  opensOn: { he: "ייפתח ב־{when}", en: "Opens {when}" },
  startsIn: { he: "מתחיל בעוד", en: "Starts in" },
  adminPreviewNote: {
    he: "תצוגת מנחה — המשחק נעול לאורחים",
    en: "Host preview — locked for guests",
  },
  openTimeLabel: { he: "זמן פתיחת המשחק (שעון ישראל)", en: "Game opens at (Israel time)" },
  saveTime: { he: "שמירת זמן", en: "Save time" },
  unlockNow: { he: "פתח עכשיו", en: "Open now" },
  lockGuests: { he: "נעל לאורחים", en: "Lock for guests" },
  lockedUntilShort: { he: "נעול עד", en: "Locked until" },
  openNowLabel: { he: "פתוח לאורחים 🔓", en: "Open to guests 🔓" },
  saved: { he: "נשמר ✓", en: "Saved ✓" },
  adminLocked: { he: "אזור מנהל 🔒", en: "Admin area 🔒" },
  adminPasswordPrompt: { he: "הזינו את סיסמת המנהל", en: "Enter the admin password" },
  passwordPlaceholder: { he: "סיסמה", en: "Password" },
  enter: { he: "כניסה", en: "Enter" },
  wrongPassword: { he: "סיסמה שגויה", en: "Wrong password" },
  scanToPlay: { he: "סרקו כדי לשחק", en: "Scan to play" },
  resetGame: { he: "איפוס המשחק", en: "Reset game" },
  resetConfirm: {
    he: "לאפס את כל הניקוד? לא ניתן לבטל.",
    en: "Reset all scores? This cannot be undone.",
  },
  liveLeaderboard: { he: "טבלה חיה", en: "Live leaderboard" },
  hostReplay: { he: "לשחק שוב 🔁", en: "Play again 🔁" },
  hostReplayNote: {
    he: "ללא הגבלה — לבדיקות ולמילוי הטבלה",
    en: "Unlimited — for testing / seeding the board",
  },
  localModeNote: {
    he: "מצב מקומי (ללא שרת) — הניקוד נשמר רק במכשיר הזה.",
    en: "Local mode (no server) — scores are saved only on this device.",
  },
};

interface I18nCtx {
  lang: Lang;
  dir: "rtl" | "ltr";
  setLang: (l: Lang) => void;
  /** Translate a UI string key, with optional {var} interpolation. */
  t: (key: keyof typeof DICT | string, vars?: Record<string, string | number>) => string;
  /** Pick the right side of a bilingual content field. */
  tl: (text: LocalizedText) => string;
}

const Ctx = createContext<I18nCtx | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("he");

  // Restore saved language on mount.
  useEffect(() => {
    const saved = (typeof window !== "undefined" &&
      localStorage.getItem("wg_lang")) as Lang | null;
    if (saved === "he" || saved === "en") setLangState(saved);
  }, []);

  // Reflect language on <html> for correct direction + font shaping.
  useEffect(() => {
    const dir = lang === "he" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("wg_lang", l);
    } catch {}
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const entry = DICT[key];
      let s = entry ? entry[lang] : key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          s = s.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
        }
      }
      return s;
    },
    [lang],
  );

  const tl = useCallback((text: LocalizedText) => text[lang], [lang]);

  const dir = lang === "he" ? "rtl" : "ltr";

  return (
    <Ctx.Provider value={{ lang, dir, setLang, t, tl }}>{children}</Ctx.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
