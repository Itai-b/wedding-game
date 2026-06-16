"use client";

import Sticker from "@/components/Sticker";

type Prize = { emoji: string; he: string; en: string };

const DINNER: Prize = {
  emoji: "🍝",
  he: "ארוחת ערב בהכנת סער ואיתי",
  en: "A dinner made by Saar & Itai",
};
const SONG: Prize = {
  emoji: "🎶",
  he: "בחירת שיר לרחבה (תלוי אם זמין ל-DJ)",
  en: "Pick a song for the dancefloor (if available for the DJ)",
};
const SCRATCH: Prize = {
  emoji: "🎟️",
  he: "כרטיס גירוד",
  en: "Scratch card",
};

type Place = {
  medal: string;
  he: string;
  en: string;
  accent: string; // border + medal ring color
  soft: string; // soft background tint
  stickers: [string, string];
  prizes: Prize[]; // accumulating: higher places include the lower ones
};

const PLACES: Place[] = [
  {
    medal: "🥇",
    he: "מקום ראשון",
    en: "First Place",
    accent: "#c9a24b",
    soft: "rgba(201,162,75,0.10)",
    stickers: ["/emojis/saar-love.png", "/emojis/itai-cool.png"],
    prizes: [DINNER, SONG, SCRATCH],
  },
  {
    medal: "🥈",
    he: "מקום שני",
    en: "Second Place",
    accent: "#8d9ce0",
    soft: "rgba(141,156,224,0.12)",
    stickers: ["/emojis/saar-happy.png", "/emojis/itai-laugh.png"],
    prizes: [SONG, SCRATCH],
  },
  {
    medal: "🥉",
    he: "מקום שלישי",
    en: "Third Place",
    accent: "#84b39a",
    soft: "rgba(132,179,154,0.14)",
    stickers: ["/emojis/saar-shake.png", "/emojis/itai-drink.png"],
    prizes: [SCRATCH],
  },
];

export default function CertificatesPrintPage() {
  return (
    <main className="print-root">
      <style>{PRINT_CSS}</style>

      <button className="no-print print-btn" onClick={() => window.print()}>
        🖨️ הדפסה / Print
      </button>
      <p className="no-print hint">
        טיפ: אפשר להקליד את שם הזוכה בשורה, או להשאיר ריק ולכתוב ביד.<br />
        Tip: type the winner&apos;s name on the line, or leave it blank to handwrite.
      </p>

      {PLACES.map((p, i) => (
        <div className="sheet landscape" key={i}>
          <div
            className="cert"
            style={{ borderColor: p.accent, background: `linear-gradient(${p.soft}, ${p.soft}), #fbf7f4` }}
          >
            <div className="corner tl">
              <Sticker src={p.stickers[0]} size={70} alt="" priority />
            </div>
            <div className="corner br">
              <Sticker src={p.stickers[1]} size={70} alt="" priority />
            </div>

            <p className="eyebrow">תעודת הצטיינות · Certificate of Achievement</p>

            <div className="medal" style={{ boxShadow: `0 0 0 6px ${p.soft}, 0 0 0 8px ${p.accent}` }}>
              <span>{p.medal}</span>
            </div>

            <h1 className="place" style={{ color: p.accent }}>
              {p.he} · {p.en}
            </h1>

            <p className="awarded">הוענקה ל · Awarded to</p>
            <input className="name-line" style={{ borderColor: p.accent }} placeholder="" />

            <p className="reason">
              על ניצחון בחידון החתונה של סער ואיתי 🏆
              <br />
              <span className="reason-en">for winning Saar &amp; Itai&apos;s Wedding Quiz</span>
            </p>

            <div className="prizes" style={{ borderColor: p.accent }}>
              <p className="prizes-title">🎁 הפרסים · The prizes</p>
              {p.prizes.map((pr) => (
                <p className="prize-item" key={pr.en}>
                  {pr.emoji} {pr.he}
                  <span className="prize-en" dir="ltr"> · {pr.en}</span>
                </p>
              ))}
            </div>

            <p className="grant">
              🎁 כולל פטור מהבאת מתנה לברית/ה
              <br />
              <span className="grant-en">also exempt from bringing a gift to the brit/brita</span>
            </p>

            <div className="cert-foot">
              <span>סער ואיתי · Saar &amp; Itai</span>
              <span className="dot" style={{ background: p.accent }} />
              <span>12.06.26 · אולם סקיי גארדן, יקנעם</span>
            </div>
          </div>
        </div>
      ))}
    </main>
  );
}

const PRINT_CSS = `
@page { size: A4 landscape; margin: 0; }

.print-root {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  gap: 18px;
}

.print-btn {
  position: sticky;
  top: 12px;
  background: #6e80d4;
  color: #fff;
  font-weight: 800;
  font-size: 1rem;
  border-radius: 9999px;
  padding: 12px 28px;
  box-shadow: 0 6px 18px rgba(110,128,212,0.35);
  cursor: pointer;
  z-index: 10;
}
.hint {
  text-align: center;
  font-size: 14px;
  color: rgba(58,53,80,0.7);
  line-height: 1.5;
}

.sheet.landscape {
  width: 297mm;
  height: 210mm;
  background: #fbf7f4;
  box-shadow: 0 10px 40px rgba(58,53,80,0.16);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12mm;
  overflow: hidden;
}

.cert {
  position: relative;
  width: 100%;
  height: 100%;
  border: 4px double;
  border-radius: 26px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 14mm 22mm;
  gap: 6px;
}

.corner {
  position: absolute;
  opacity: 0.9;
}
.corner.tl { top: 16px; inset-inline-start: 22px; }
.corner.br { bottom: 16px; inset-inline-end: 22px; }

.eyebrow {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 1px;
  color: rgba(58,53,80,0.55);
  text-transform: uppercase;
}

.medal {
  width: 96px;
  height: 96px;
  border-radius: 9999px;
  background: #fff;
  display: grid;
  place-items: center;
  margin: 10px 0 6px;
}
.medal span { font-size: 56px; line-height: 1; }

.place {
  font-size: 46px;
  font-weight: 800;
  line-height: 1.1;
  direction: rtl;
}

.awarded {
  margin-top: 14px;
  font-size: 20px;
  font-weight: 600;
  color: rgba(58,53,80,0.7);
  direction: rtl;
}

.name-line {
  width: 70%;
  max-width: 460px;
  margin: 6px 0 10px;
  border: none;
  border-bottom: 3px solid;
  background: transparent;
  text-align: center;
  font-size: 34px;
  font-weight: 700;
  color: #3a3550;
  padding: 6px 8px;
  outline: none;
  font-family: inherit;
}

.reason {
  font-size: 22px;
  font-weight: 600;
  color: #e7849c;
  line-height: 1.45;
  direction: rtl;
}
.reason-en {
  font-size: 17px;
  font-weight: 500;
  color: #a98bc0;
}

.prizes {
  margin-top: 14px;
  background: rgba(201,162,75,0.10);
  border: 2px solid #c9a24b;
  border-radius: 18px;
  padding: 10px 26px;
  direction: rtl;
}
.prizes-title {
  font-size: 15px;
  font-weight: 800;
  color: #3a3550;
  margin: 0 0 6px;
}
.prize-item {
  font-size: 18px;
  font-weight: 700;
  color: #3a3550;
  margin: 4px 0;
  line-height: 1.3;
}
.prize-en {
  font-size: 13px;
  font-weight: 500;
  color: rgba(58,53,80,0.55);
}

.grant {
  margin-top: 10px;
  font-size: 15px;
  font-weight: 600;
  color: rgba(58,53,80,0.6);
  direction: rtl;
  line-height: 1.35;
}
.grant-en {
  font-size: 12px;
  font-weight: 500;
  color: rgba(58,53,80,0.5);
  direction: ltr;
}

.cert-foot {
  margin-top: 18px;
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 17px;
  font-weight: 600;
  color: rgba(58,53,80,0.7);
  direction: rtl;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 9999px;
  display: inline-block;
}

@media print {
  .print-root { padding: 0; gap: 0; }
  .no-print { display: none !important; }
  .sheet.landscape { box-shadow: none; page-break-after: always; break-after: page; }
  .sheet.landscape:last-of-type { page-break-after: auto; break-after: auto; }
  .name-line::placeholder { color: transparent; }
}
`;
