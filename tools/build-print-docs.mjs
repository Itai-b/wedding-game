// Generates standalone, self-contained printable HTML documents:
//   src/documents/wedding-join.html         (portrait QR poster)
//   src/documents/wedding-certificates.html (landscape 1st/2nd/3rd certificates)
// Everything is inlined — the QR as an SVG, every sticker as a base64 data URI —
// so the files open and print correctly straight from disk with no server.
//
// Run: source ~/.nvm/nvm.sh && node tools/build-print-docs.mjs

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QRCodeSVG } from "qrcode.react";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT_DIR = join(ROOT, "src", "documents");
mkdirSync(OUT_DIR, { recursive: true });

const GAME_URL = "https://wedding-game-virid.vercel.app";

/** Read a sticker PNG and return it as a base64 data URI. */
function sticker(name) {
  const buf = readFileSync(join(ROOT, "public", "emojis", `${name}.png`));
  return `data:image/png;base64,${buf.toString("base64")}`;
}

const S = {
  saarLove: sticker("saar-love"),
  itaiHappy: sticker("itai-happy"),
  saarWow: sticker("saar-wow"),
  itaiCool: sticker("itai-cool"),
  saarHappy: sticker("saar-happy"),
  itaiLaugh: sticker("itai-laugh"),
  saarShake: sticker("saar-shake"),
  itaiDrink: sticker("itai-drink"),
};

// QR as an inline SVG string.
const qrSvg = renderToStaticMarkup(
  React.createElement(QRCodeSVG, {
    value: GAME_URL,
    size: 300,
    fgColor: "#6e80d4",
    level: "M",
    marginSize: 1,
  }),
);

const FONT_LINK = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;600;700;800&display=swap" rel="stylesheet">`;

const BASE_FONT = `font-family: 'Rubik', system-ui, -apple-system, sans-serif;`;

/* ----------------------------- JOIN POSTER ----------------------------- */

const joinHtml = `<!doctype html>
<html lang="he" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>סער ואיתי · הצטרפו למשחק</title>
${FONT_LINK}
<style>
  @page { size: A4 portrait; margin: 0; }
  * { box-sizing: border-box; }
  body { margin: 0; ${BASE_FONT} color: #3a3550; display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 24px;
    background: radial-gradient(800px 520px at 10% -8%, #f6e6ec 0%, transparent 55%), radial-gradient(760px 480px at 100% 0%, #e7edf8 0%, transparent 52%), #fbf7f4; }
  .print-btn { position: sticky; top: 12px; background: #6e80d4; color: #fff; font-weight: 800; font-size: 16px; border: none; border-radius: 9999px; padding: 12px 28px; box-shadow: 0 6px 18px rgba(110,128,212,.35); cursor: pointer; z-index: 10; }
  .sheet { width: 210mm; height: 297mm; padding: 16mm; overflow: hidden; display: flex; align-items: center; justify-content: center;
    background: radial-gradient(800px 520px at 10% -8%, #f6e6ec 0%, transparent 55%), radial-gradient(760px 480px at 100% 0%, #e7edf8 0%, transparent 52%), radial-gradient(700px 560px at 50% 114%, #e8f1ea 0%, transparent 56%), #fbf7f4;
    box-shadow: 0 10px 40px rgba(58,53,80,.16); }
  .card { width: 100%; height: 100%; border: 3px solid #c9a24b; border-radius: 28px; background: rgba(255,255,255,.72); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 18mm 14mm; gap: 8px; }
  .stickers-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
  .stickers-row img { width: 104px; height: 104px; object-fit: contain; }
  .he-head { font-size: 40px; font-weight: 800; color: #6e80d4; line-height: 1.2; margin: 0; }
  .he-sub { font-size: 24px; font-weight: 600; color: #e7849c; margin: 4px 0 0; }
  .divider { width: 64px; height: 4px; border-radius: 9999px; background: #c9a24b; margin: 18px 0; }
  .en-head { font-size: 30px; font-weight: 800; color: #5b8a6f; line-height: 1.2; margin: 0; direction: ltr; }
  .en-sub { font-size: 19px; font-weight: 600; color: #a98bc0; margin: 2px 0 0; direction: ltr; }
  .qr-wrap { background: #fff; padding: 18px; border-radius: 24px; box-shadow: inset 0 0 0 2px #e7edf8, 0 6px 20px rgba(58,53,80,.12); margin: 24px 0 12px; line-height: 0; }
  .qr-wrap svg { width: 300px; height: 300px; display: block; }
  .scan-cta { font-size: 22px; font-weight: 700; letter-spacing: .5px; margin: 0; }
  .foot { margin-top: auto; display: flex; align-items: center; gap: 12px; font-size: 17px; font-weight: 600; color: rgba(58,53,80,.7); }
  .foot img { width: 48px; height: 48px; object-fit: contain; }
  @media print { body { padding: 0; background: none; } .no-print { display: none !important; } .sheet { box-shadow: none; } }
</style>
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">🖨️ הדפסה / Print</button>
  <div class="sheet">
    <div class="card">
      <div class="stickers-row">
        <img src="${S.saarLove}" alt="Saar">
        <img src="${S.itaiHappy}" alt="Itai">
      </div>
      <h1 class="he-head">חושבים שאתם מכירים את<br>סער ואיתי?</h1>
      <p class="he-sub">בחנו את עצמכם בחידון — נושא פרסים! 🏆</p>
      <div class="divider"></div>
      <h2 class="en-head">Think you know<br>Saar &amp; Itai?</h2>
      <p class="en-sub">Test yourself in this PRIZE-winning game! 🏆</p>
      <div class="qr-wrap">${qrSvg}</div>
      <p class="scan-cta">סרקו כדי לשחק · Scan to play</p>
      <div class="foot">
        <img src="${S.saarHappy}" alt="">
        <span>12.06.26 · אולם סקיי גארדן, יקנעם</span>
        <img src="${S.itaiCool}" alt="">
      </div>
    </div>
  </div>
</body>
</html>`;

/* ----------------------------- CERTIFICATES ----------------------------- */

// Prizes accumulate: each higher place also wins everything below it.
const DINNER = { emoji: "🍝", he: "ארוחת ערב בהכנת סער ואיתי", en: "A dinner made by Saar & Itai" };
const SONG = { emoji: "🎶", he: "בחירת שיר לרחבה (תלוי אם זמין ל-DJ)", en: "Pick a song for the dancefloor (if available for the DJ)" };
const SCRATCH = { emoji: "🎟️", he: "כרטיס גירוד", en: "Scratch card" };

const PLACES = [
  { medal: "🥇", he: "מקום ראשון", en: "First Place", accent: "#c9a24b", soft: "rgba(201,162,75,.10)", a: S.saarLove, b: S.itaiCool,
    prizes: [DINNER, SONG, SCRATCH] },
  { medal: "🥈", he: "מקום שני", en: "Second Place", accent: "#8d9ce0", soft: "rgba(141,156,224,.12)", a: S.saarHappy, b: S.itaiLaugh,
    prizes: [SONG, SCRATCH] },
  { medal: "🥉", he: "מקום שלישי", en: "Third Place", accent: "#84b39a", soft: "rgba(132,179,154,.14)", a: S.saarShake, b: S.itaiDrink,
    prizes: [SCRATCH] },
];

const certCard = (p) => `
  <div class="sheet">
    <div class="cert" style="border-color:${p.accent}; background: linear-gradient(${p.soft}, ${p.soft}), #fbf7f4;">
      <img class="corner tl" src="${p.a}" alt="">
      <img class="corner br" src="${p.b}" alt="">
      <p class="eyebrow">תעודת הצטיינות · Certificate of Achievement</p>
      <div class="medal" style="box-shadow: 0 0 0 6px ${p.soft}, 0 0 0 8px ${p.accent};"><span>${p.medal}</span></div>
      <h1 class="place" style="color:${p.accent};">${p.he} · ${p.en}</h1>
      <p class="awarded">הוענקה ל · Awarded to</p>
      <input class="name-line" style="border-color:${p.accent};">
      <p class="reason">על ניצחון בחידון החתונה של סער ואיתי 🏆<br><span class="reason-en">for winning Saar &amp; Itai's Wedding Quiz</span></p>
      <div class="prizes" style="border-color:${p.accent};"><p class="prizes-title">🎁 הפרסים · The prizes</p>${p.prizes.map((pr) => `<p class="prize-item">${pr.emoji} ${pr.he}<span class="prize-en" dir="ltr"> · ${pr.en}</span></p>`).join("")}</div>
      <p class="grant">🎁 כולל פטור מהבאת מתנה לברית/ה<br><span class="grant-en">also exempt from bringing a gift to the brit/brita</span></p>
      <div class="cert-foot"><span>סער ואיתי · Saar &amp; Itai</span><span class="dot" style="background:${p.accent};"></span><span>12.06.26 · אולם סקיי גארדן, יקנעם</span></div>
    </div>
  </div>`;

const certHtml = `<!doctype html>
<html lang="he" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>סער ואיתי · תעודות זוכים</title>
${FONT_LINK}
<style>
  @page { size: A4 landscape; margin: 0; }
  * { box-sizing: border-box; }
  body { margin: 0; ${BASE_FONT} color: #3a3550; display: flex; flex-direction: column; align-items: center; gap: 18px; padding: 24px; background: #f3ebe4; }
  .print-btn { position: sticky; top: 12px; background: #6e80d4; color: #fff; font-weight: 800; font-size: 16px; border: none; border-radius: 9999px; padding: 12px 28px; box-shadow: 0 6px 18px rgba(110,128,212,.35); cursor: pointer; z-index: 10; }
  .hint { text-align: center; font-size: 14px; color: rgba(58,53,80,.7); line-height: 1.5; }
  .sheet { width: 297mm; height: 210mm; padding: 12mm; overflow: hidden; display: flex; align-items: center; justify-content: center; background: #fbf7f4; box-shadow: 0 10px 40px rgba(58,53,80,.16); }
  .cert { position: relative; width: 100%; height: 100%; border: 4px double; border-radius: 26px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 14mm 22mm; gap: 6px; }
  .corner { position: absolute; width: 70px; height: 70px; object-fit: contain; opacity: .9; }
  .corner.tl { top: 16px; inset-inline-start: 22px; }
  .corner.br { bottom: 16px; inset-inline-end: 22px; }
  .eyebrow { font-size: 18px; font-weight: 700; letter-spacing: 1px; color: rgba(58,53,80,.55); text-transform: uppercase; margin: 0; }
  .medal { width: 96px; height: 96px; border-radius: 9999px; background: #fff; display: grid; place-items: center; margin: 10px 0 6px; }
  .medal span { font-size: 56px; line-height: 1; }
  .place { font-size: 46px; font-weight: 800; line-height: 1.1; margin: 0; }
  .awarded { margin: 14px 0 0; font-size: 20px; font-weight: 600; color: rgba(58,53,80,.7); }
  .name-line { width: 70%; max-width: 460px; margin: 6px 0 10px; border: none; border-bottom: 3px solid; background: transparent; text-align: center; font-size: 34px; font-weight: 700; color: #3a3550; padding: 6px 8px; outline: none; font-family: inherit; }
  .reason { font-size: 22px; font-weight: 600; color: #e7849c; line-height: 1.45; margin: 0; }
  .reason-en { font-size: 17px; font-weight: 500; color: #a98bc0; }
  .prizes { margin-top: 14px; background: rgba(201,162,75,.10); border: 2px solid #c9a24b; border-radius: 18px; padding: 10px 26px; direction: rtl; }
  .prizes-title { font-size: 15px; font-weight: 800; color: #3a3550; margin: 0 0 6px; }
  .prize-item { font-size: 18px; font-weight: 700; color: #3a3550; margin: 4px 0; line-height: 1.3; }
  .prize-en { font-size: 13px; font-weight: 500; color: rgba(58,53,80,.55); }
  .grant { margin-top: 10px; font-size: 15px; font-weight: 600; color: rgba(58,53,80,.6); direction: rtl; line-height: 1.35; }
  .grant-en { font-size: 12px; font-weight: 500; color: rgba(58,53,80,.5); direction: ltr; }
  .cert-foot { margin-top: 18px; display: flex; align-items: center; gap: 14px; font-size: 17px; font-weight: 600; color: rgba(58,53,80,.7); }
  .dot { width: 8px; height: 8px; border-radius: 9999px; display: inline-block; }
  @media print { body { padding: 0; gap: 0; background: none; } .no-print { display: none !important; } .sheet { box-shadow: none; page-break-after: always; break-after: page; } .sheet:last-of-type { page-break-after: auto; break-after: auto; } .name-line::placeholder { color: transparent; } }
</style>
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">🖨️ הדפסה / Print</button>
  <p class="hint no-print">טיפ: הקלידו את שם הזוכה בשורה, או השאירו ריק וכתבו ביד.<br>Tip: type the winner's name on the line, or leave it blank to handwrite.</p>
  ${PLACES.map(certCard).join("\n")}
</body>
</html>`;

writeFileSync(join(OUT_DIR, "wedding-join.html"), joinHtml);
writeFileSync(join(OUT_DIR, "wedding-certificates.html"), certHtml);
console.log("Wrote:");
console.log("  src/documents/wedding-join.html");
console.log("  src/documents/wedding-certificates.html");
