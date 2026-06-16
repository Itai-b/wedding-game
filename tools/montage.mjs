import sharp from "sharp";
import fs from "fs";

const DIR = "public/emojis/raw/";
const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".png")).sort();
const TH = 230,
  COLS = 3,
  LBL = 30,
  PAD = 14;
const cellW = TH + PAD,
  cellH = TH + LBL;

// group by sheet
const sheets = {};
for (const f of files) {
  const s = f.split("_")[0];
  (sheets[s] ||= []).push(f);
}

for (const [sheet, list] of Object.entries(sheets)) {
  const rows = Math.ceil(list.length / COLS);
  const comps = [];
  for (let i = 0; i < list.length; i++) {
    const buf = await sharp(DIR + list[i]).resize(TH, TH, { fit: "inside" }).toBuffer();
    const m = await sharp(buf).metadata();
    const col = i % COLS,
      row = (i / COLS) | 0;
    comps.push({
      input: buf,
      left: col * cellW + ((cellW - m.width) >> 1),
      top: row * cellH + LBL + ((TH - m.height) >> 1),
    });
    const svg = Buffer.from(
      `<svg width="${cellW}" height="${LBL}"><text x="4" y="22" font-size="22" fill="white" font-family="sans-serif" font-weight="bold">${list[i].replace(".png", "")}</text></svg>`,
    );
    comps.push({ input: svg, left: col * cellW, top: row * cellH });
  }
  await sharp({
    create: { width: COLS * cellW, height: rows * cellH, channels: 4, background: "#6e80d4" },
  })
    .composite(comps)
    .png()
    .toFile(`/tmp/wg-shots/m-${sheet}.png`);
  console.log(sheet, list.length);
}
