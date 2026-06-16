// Generates an on-brand animated demo banner for the README.
// Renders SVG frames (palette + a phone mockup of the quiz, with the couple's
// stickers, a draining timer, an answer being selected, and the podium) to PNGs
// via sharp; ffmpeg (run separately) assembles them into docs/demo.gif.
//
// Run: source ~/.nvm/nvm.sh && node tools/build-banner.mjs
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = "/tmp/wgframes";
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const b64 = (p) =>
  `data:image/png;base64,${readFileSync(join(ROOT, "public/emojis", p)).toString("base64")}`;
const SAAR = b64("saar-love.png");
const ITAI = b64("itai-happy.png");

const C = {
  cream: "#fbf7f4", creamDeep: "#f3ebe4", ink: "#3a3550",
  peri: "#6e80d4", coral: "#e7849c", sage: "#5b8a6f", lav: "#a98bc0", gold: "#c9a24b",
};
const FONT = "'Noto Sans','DejaVu Sans',sans-serif";
const W = 960, H = 400;
const clamp01 = (t) => Math.max(0, Math.min(1, t));

const OPTS = [
  { c: C.peri, label: "4 years" },
  { c: C.coral, label: "5.5 years" }, // the selected one
  { c: C.sage, label: "6.5 years" },
  { c: C.lav, label: "7 years" },
];
const SEL = 1;

function svg(p) {
  const timer = 1 - 0.72 * p;
  const tColor = timer > 0.5 ? C.sage : timer > 0.25 ? C.gold : C.coral;
  const selected = p >= 0.42;
  const fp = clamp01((p - 0.5) / 0.45);
  const floatY = -42 * fp;
  const floatOp = selected ? (1 - fp).toFixed(2) : 0;
  const bob = (Math.sin(p * 2 * Math.PI) * 3).toFixed(2);

  const sx = 614, sw = 272; // phone screen x / width
  const ix = sx + 16, iw = sw - 32; // inner content
  const optY = [176, 216, 256, 296];

  const options = OPTS.map((o, i) => {
    const y = optY[i];
    const isSel = selected && i === SEL;
    return `
      <rect x="${ix}" y="${y}" width="${iw}" height="34" rx="12" fill="${o.c}"/>
      ${isSel ? `<rect x="${ix - 2}" y="${y - 2}" width="${iw + 4}" height="38" rx="14" fill="none" stroke="${C.gold}" stroke-width="3"/>` : ""}
      <circle cx="${ix + 19}" cy="${y + 17}" r="11" fill="#ffffff" fill-opacity="${isSel ? 1 : 0.25}"/>
      <text x="${ix + 19}" y="${y + 22}" font-family="${FONT}" font-size="14" font-weight="700" fill="${isSel ? C.ink : "#ffffff"}" text-anchor="middle">${isSel ? "✓" : i + 1}</text>
      <text x="${ix + 40}" y="${y + 22}" font-family="${FONT}" font-size="15" font-weight="700" fill="#ffffff">${o.label}</text>`;
  }).join("");

  const medal = (cx, col, n) =>
    `<circle cx="${cx}" cy="318" r="21" fill="${col}"/><text x="${cx}" y="324" font-family="${FONT}" font-size="20" font-weight="800" fill="#fff" text-anchor="middle">${n}</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W * 1.6}" height="${H * 1.6}" viewBox="0 0 ${W} ${H}">
  <defs>
    <filter id="blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="34"/></filter>
    <filter id="sh" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="8" stdDeviation="14" flood-color="#3a3550" flood-opacity="0.18"/></filter>
  </defs>

  <rect width="${W}" height="${H}" fill="${C.cream}"/>
  <g filter="url(#blur)">
    <circle cx="860" cy="10" r="150" fill="${C.peri}" opacity="0.13"/>
    <circle cx="70" cy="430" r="190" fill="${C.coral}" opacity="0.13"/>
    <circle cx="470" cy="440" r="150" fill="${C.sage}" opacity="0.10"/>
  </g>

  <!-- gold ring motif -->
  <g transform="translate(60,74)">
    <circle cx="15" cy="22" r="12" fill="none" stroke="${C.gold}" stroke-width="4.5"/>
    <path d="M15 1 L22 10 L15 18 L8 10 Z" fill="#eaf0fb" stroke="${C.gold}" stroke-width="1.5" stroke-linejoin="round"/>
  </g>

  <!-- left text -->
  <text x="60" y="168" font-family="${FONT}" font-size="56" font-weight="800" fill="${C.peri}">Saar &amp; Itai</text>
  <text x="62" y="206" font-family="${FONT}" font-size="22" font-weight="800" letter-spacing="4" fill="${C.ink}" opacity="0.82">THE WEDDING GAME</text>
  <text x="62" y="240" font-family="${FONT}" font-size="17" font-weight="600" fill="${C.ink}" opacity="0.62">Bilingual · scan-to-play trivia</text>
  <text x="62" y="263" font-family="${FONT}" font-size="13.5" font-weight="600" fill="${C.ink}" opacity="0.5">speed scoring · live leaderboard · answer reveal</text>
  ${medal(80, C.gold, 1)}${medal(134, "#c2c7ce", 2)}${medal(188, "#c0813f", 3)}
  <text x="220" y="324" font-family="${FONT}" font-size="13" font-weight="700" letter-spacing="2" fill="${C.ink}" opacity="0.55">WINNERS' PODIUM</text>

  <!-- phone -->
  <g filter="url(#sh)">
    <rect x="600" y="40" width="300" height="324" rx="38" fill="${C.ink}"/>
    <rect x="${sx}" y="54" width="${sw}" height="296" rx="26" fill="${C.cream}"/>
  </g>
  <!-- stickers -->
  <image href="${SAAR}" x="${694}" y="${66 + Number(bob)}" width="52" height="52"/>
  <image href="${ITAI}" x="${754}" y="${66 + Number(bob)}" width="52" height="52"/>
  <!-- timer -->
  <rect x="${ix}" y="130" width="${iw}" height="8" rx="4" fill="${C.creamDeep}"/>
  <rect x="${ix}" y="130" width="${(iw * timer).toFixed(1)}" height="8" rx="4" fill="${tColor}"/>
  <!-- question -->
  <text x="${sx + sw / 2}" y="160" font-family="${FONT}" font-size="14" font-weight="700" fill="${C.ink}" text-anchor="middle">How long together?</text>
  ${options}
  <!-- score pop -->
  <text x="${ix + iw - 6}" y="${214 + floatY}" font-family="${FONT}" font-size="17" font-weight="800" fill="${C.gold}" text-anchor="end" opacity="${floatOp}">+900</text>
</svg>`;
}

const FRAMES = 30; // animation
const HOLD = 10; // hold on the completed state before looping
let n = 0;
const tasks = [];
for (let i = 0; i < FRAMES; i++) {
  const p = i / (FRAMES - 1);
  tasks.push(sharp(Buffer.from(svg(p))).png().toFile(join(OUT, `f${String(n++).padStart(3, "0")}.png`)));
}
for (let i = 0; i < HOLD; i++) {
  tasks.push(sharp(Buffer.from(svg(1))).png().toFile(join(OUT, `f${String(n++).padStart(3, "0")}.png`)));
}
await Promise.all(tasks);
mkdirSync(join(ROOT, "docs"), { recursive: true });
// also drop a static hero (the completed frame) for social/fallback
await sharp(Buffer.from(svg(1))).png().toFile(join(ROOT, "docs/banner.png"));
console.log(`wrote ${n} frames to ${OUT} and docs/banner.png`);
