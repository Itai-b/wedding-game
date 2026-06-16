import sharp from "sharp";
import fs from "fs";

const SHEETS = ["emojis-1", "emojis-2", "emojis-3", "emojis-4"];
const SRC = process.env.HOME + "/Downloads/";
const OUTDIR = "public/emojis/raw/";
fs.rmSync(OUTDIR, { recursive: true, force: true });
fs.mkdirSync(OUTDIR, { recursive: true });

// "ink" = real sticker content (dark OR saturated). Ignores white halo + gray
// drop shadow (bright, low-saturation), which is also what we flood away.
const bright = (r, g, b) => (r + g + b) / 3;
const sat = (r, g, b) => Math.max(r, g, b) - Math.min(r, g, b);
const isInk = (r, g, b) => bright(r, g, b) < 205 || sat(r, g, b) > 24;

// Binary dilation (Chebyshev radius r), separable max — works on any w×h mask.
function dilateMask(src, w, h, r) {
  const tmp = new Uint8Array(w * h),
    out = new Uint8Array(w * h);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      let on = 0;
      for (let d = -r; d <= r && !on; d++) {
        const xx = x + d;
        if (xx >= 0 && xx < w && src[y * w + xx]) on = 1;
      }
      tmp[y * w + x] = on;
    }
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      let on = 0;
      for (let d = -r; d <= r && !on; d++) {
        const yy = y + d;
        if (yy >= 0 && yy < h && tmp[yy * w + x]) on = 1;
      }
      out[y * w + x] = on;
    }
  return out;
}

const allCrops = [];

for (const sheet of SHEETS) {
  const { data, info } = await sharp(SRC + sheet + ".png")
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const W = info.width,
    H = info.height;
  const at = (x, y) => (y * W + x) * 4;

  const ink = new Uint8Array(W * H);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const p = at(x, y);
      ink[y * W + x] = isInk(data[p], data[p + 1], data[p + 2]) ? 1 : 0;
    }

  // Dilate so a character's parts (split by thin white bands) join up, while
  // the wider gutters between separate characters stay open. Separable max.
  const R = 5;
  const dilate = (src) => {
    const tmp = new Uint8Array(W * H),
      out = new Uint8Array(W * H);
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        let on = 0;
        for (let dx = -R; dx <= R && !on; dx++) {
          const xx = x + dx;
          if (xx >= 0 && xx < W && src[y * W + xx]) on = 1;
        }
        tmp[y * W + x] = on;
      }
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        let on = 0;
        for (let dy = -R; dy <= R && !on; dy++) {
          const yy = y + dy;
          if (yy >= 0 && yy < H && tmp[yy * W + x]) on = 1;
        }
        out[y * W + x] = on;
      }
    return out;
  };
  const mask = dilate(ink);

  // --- connected components on the dilated mask (8-connectivity) ---
  const label = new Int32Array(W * H);
  const comps = [];
  const stack = [];
  for (let s = 0; s < W * H; s++) {
    if (!mask[s] || label[s]) continue;
    const id = comps.length + 1;
    let area = 0,
      minx = W,
      maxx = 0,
      miny = H,
      maxy = 0;
    stack.push(s);
    label[s] = id;
    while (stack.length) {
      const idx = stack.pop();
      const x = idx % W,
        y = (idx / W) | 0;
      area++;
      if (x < minx) minx = x;
      if (x > maxx) maxx = x;
      if (y < miny) miny = y;
      if (y > maxy) maxy = y;
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          if (!dx && !dy) continue;
          const nx = x + dx,
            ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
          const ni = ny * W + nx;
          if (mask[ni] && !label[ni]) {
            label[ni] = id;
            stack.push(ni);
          }
        }
    }
    // keep only sizeable blobs → drops confetti/sparkles that bridge gutters
    if (area >= 1600) comps.push({ area, minx, maxx, miny, maxy });
  }

  // Split a tall merged blob (stacked, touching characters) at low-ink "necks".
  const splitByNecks = (c) => {
    const w = c.maxx - c.minx + 1,
      h = c.maxy - c.miny + 1;
    const prof = new Float64Array(h);
    for (let y = 0; y < h; y++) {
      let s = 0;
      for (let x = c.minx; x <= c.maxx; x++) s += ink[(c.miny + y) * W + x];
      prof[y] = s;
    }
    const k = Math.max(2, Math.round(w * 0.03));
    const sm = new Float64Array(h);
    for (let y = 0; y < h; y++) {
      let s = 0,
        n2 = 0;
      for (let d = -k; d <= k; d++) {
        const yy = y + d;
        if (yy >= 0 && yy < h) {
          s += prof[yy];
          n2++;
        }
      }
      sm[y] = s / n2;
    }
    const peak = Math.max(...sm);
    const minSeg = Math.round(w * 0.7);
    // prominence-based valleys: a neck is a local min flanked by higher peaks
    const cand = [];
    for (let yy = 1; yy < h - 1; yy++) {
      if (sm[yy] <= sm[yy - 1] && sm[yy] <= sm[yy + 1]) {
        let lp = 0,
          rp = 0;
        for (let i = Math.max(0, yy - minSeg); i <= yy; i++) lp = Math.max(lp, sm[i]);
        for (let i = yy; i <= Math.min(h - 1, yy + minSeg); i++) rp = Math.max(rp, sm[i]);
        const prom = Math.min(lp, rp) - sm[yy];
        if (yy > minSeg * 0.5 && yy < h - minSeg * 0.5 && prom > peak * 0.28)
          cand.push({ y: yy, prom });
      }
    }
    cand.sort((a, b) => b.prom - a.prom);
    const chosen = [];
    for (const cc of cand)
      if (chosen.every((z) => Math.abs(z - cc.y) >= minSeg * 0.8)) chosen.push(cc.y);
    chosen.sort((a, b) => a - b);
    const ys = [0, ...chosen, h];
    const out = [];
    for (let i = 0; i < ys.length - 1; i++) {
      const a = ys[i],
        b = ys[i + 1] - 1;
      if (b - a + 1 < minSeg) continue;
      let mnx = c.maxx,
        mxx = c.minx,
        mny = c.maxy,
        mxy = c.miny,
        cnt = 0;
      for (let yy = a; yy <= b; yy++)
        for (let x = c.minx; x <= c.maxx; x++)
          if (ink[(c.miny + yy) * W + x]) {
            cnt++;
            if (x < mnx) mnx = x;
            if (x > mxx) mxx = x;
            const gy = c.miny + yy;
            if (gy < mny) mny = gy;
            if (gy > mxy) mxy = gy;
          }
      if (cnt > 4000) out.push({ minx: mnx, maxx: mxx, miny: mny, maxy: mxy });
    }
    return out.length ? out : [c];
  };

  let stickers = comps
    .filter((c) => c.area > 9000 && c.maxx - c.minx > 80 && c.maxy - c.miny > 80)
    .flatMap(splitByNecks);
  const bigRaw = stickers.length;
  // row-major order (top→bottom, left→right)
  stickers.sort(
    (a, b) => Math.round(a.miny / 120) - Math.round(b.miny / 120) || a.minx - b.minx,
  );

  let n = 0;
  for (const c of stickers) {
    const pad = 14;
    const minx = Math.max(0, c.minx - pad),
      miny = Math.max(0, c.miny - pad),
      maxx = Math.min(W - 1, c.maxx + pad),
      maxy = Math.min(H - 1, c.maxy + pad);
    const cw = maxx - minx + 1,
      chh = maxy - miny + 1;

    const out = Buffer.alloc(cw * chh * 4);
    for (let y = 0; y < chh; y++)
      for (let x = 0; x < cw; x++) {
        const sp = at(minx + x, miny + y),
          op = (y * cw + x) * 4;
        out[op] = data[sp];
        out[op + 1] = data[sp + 1];
        out[op + 2] = data[sp + 2];
        out[op + 3] = 255;
      }

    // Build alpha from THIS sticker's own blob only:
    //  1) ink mask of the crop, 2) keep just the largest connected blob (drops
    //  any sliver of a neighbouring sticker), 3) dilate to re-include the sticker's
    //  white outline, 4) use as alpha → everything else fully transparent.
    const cink = new Uint8Array(cw * chh);
    for (let y = 0; y < chh; y++)
      for (let x = 0; x < cw; x++) {
        const op = (y * cw + x) * 4;
        cink[y * cw + x] = isInk(out[op], out[op + 1], out[op + 2]) ? 1 : 0;
      }
    // largest connected component of cink
    const lab = new Int32Array(cw * chh);
    const st = [];
    let bestId = 0,
      bestArea = 0,
      cur = 0;
    for (let s2 = 0; s2 < cw * chh; s2++) {
      if (!cink[s2] || lab[s2]) continue;
      cur++;
      let area = 0;
      st.push(s2);
      lab[s2] = cur;
      while (st.length) {
        const idx = st.pop();
        area++;
        const x = idx % cw,
          y = (idx / cw) | 0;
        for (let dy = -1; dy <= 1; dy++)
          for (let dx = -1; dx <= 1; dx++) {
            if (!dx && !dy) continue;
            const nx = x + dx,
              ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= cw || ny >= chh) continue;
            const ni = ny * cw + nx;
            if (cink[ni] && !lab[ni]) {
              lab[ni] = cur;
              st.push(ni);
            }
          }
      }
      if (area > bestArea) {
        bestArea = area;
        bestId = cur;
      }
    }
    const keepCore = new Uint8Array(cw * chh);
    for (let i = 0; i < cw * chh; i++) keepCore[i] = lab[i] === bestId ? 1 : 0;
    // dilate to recover the white sticker outline that hugs the blob
    const keep = dilateMask(keepCore, cw, chh, 9);
    // light 1px feather for smooth edges
    for (let y = 0; y < chh; y++)
      for (let x = 0; x < cw; x++) {
        const i = y * cw + x;
        let a;
        if (keep[i]) {
          a = 255;
        } else {
          // edge softening: partial alpha if adjacent to kept pixels
          let near = 0;
          for (let dy = -1; dy <= 1; dy++)
            for (let dx = -1; dx <= 1; dx++) {
              const nx = x + dx,
                ny = y + dy;
              if (nx >= 0 && ny >= 0 && nx < cw && ny < chh && keep[ny * cw + nx])
                near++;
            }
          a = near >= 3 ? 120 : 0;
        }
        out[i * 4 + 3] = a;
      }

    const name = `${sheet}_${String(n).padStart(2, "0")}.png`;
    await sharp(out, { raw: { width: cw, height: chh, channels: 4 } })
      .resize(256, 256, { fit: "inside" })
      .png()
      .toFile(OUTDIR + name);
    allCrops.push(name);
    n++;
  }
  console.log(sheet, "→", n, "crops", "| comps:", comps.length, "| stickers:", bigRaw);
}

// --- labeled montage on periwinkle (white boxes would reveal bad transparency) ---
const COLS = 6,
  TH = 150,
  PADX = 16,
  LBL = 22;
const cellW = TH + PADX,
  cellH = TH + LBL + 10;
const rowsN = Math.ceil(allCrops.length / COLS);
const comps2 = [];
for (let i = 0; i < allCrops.length; i++) {
  const buf = await sharp(OUTDIR + allCrops[i]).resize(TH, TH, { fit: "inside" }).toBuffer();
  const m = await sharp(buf).metadata();
  const col = i % COLS,
    row = (i / COLS) | 0;
  comps2.push({
    input: buf,
    left: col * cellW + ((cellW - m.width) >> 1),
    top: row * cellH + LBL + ((TH - m.height) >> 1),
  });
  const svg = Buffer.from(
    `<svg width="${cellW}" height="${LBL}"><text x="3" y="16" font-size="13" fill="white" font-family="sans-serif">${i}: ${allCrops[i].replace("emojis-", "s").replace(".png", "")}</text></svg>`,
  );
  comps2.push({ input: svg, left: col * cellW, top: row * cellH });
}
await sharp({
  create: { width: COLS * cellW, height: rowsN * cellH, channels: 4, background: "#6e80d4" },
})
  .composite(comps2)
  .png()
  .toFile("/tmp/wg-shots/emoji-montage.png");

console.log("TOTAL", allCrops.length, "→ /tmp/wg-shots/emoji-montage.png");
