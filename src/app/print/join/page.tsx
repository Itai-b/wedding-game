"use client";

import { QRCodeSVG } from "qrcode.react";
import Sticker from "@/components/Sticker";

// Stable production alias — the printed QR must always reach the live game,
// regardless of where this page happens to be rendered from.
const GAME_URL = "https://wedding-game-virid.vercel.app";

export default function JoinPrintPage() {
  return (
    <main className="print-root">
      <style>{PRINT_CSS}</style>

      <button className="no-print print-btn" onClick={() => window.print()}>
        🖨️ הדפסה / Print
      </button>

      <div className="sheet portrait">
        <div className="card">
          {/* couple stickers */}
          <div className="stickers-row">
            <Sticker src="/emojis/saar-love.png" size={104} alt="Saar" priority />
            <Sticker src="/emojis/itai-happy.png" size={104} alt="Itai" priority />
          </div>

          <h1 className="he-head">
            חושבים שאתם מכירים את<br />סער ואיתי?
          </h1>
          <p className="he-sub">בחנו את עצמכם בחידון — נושא פרסים! 🏆</p>

          <div className="divider" />

          <h2 className="en-head">Think you know<br />Saar &amp; Itai?</h2>
          <p className="en-sub">Test yourself in this PRIZE-winning game! 🏆</p>

          {/* QR */}
          <div className="qr-wrap">
            <QRCodeSVG value={GAME_URL} size={300} fgColor="#6e80d4" level="M" marginSize={1} />
          </div>

          <p className="scan-cta">סרקו כדי לשחק · Scan to play</p>

          <div className="foot">
            <Sticker src="/emojis/saar-happy.png" size={48} alt="" />
            <span>12.06.26 · אולם סקיי גארדן, יקנעם</span>
            <Sticker src="/emojis/itai-cool.png" size={48} alt="" />
          </div>
        </div>
      </div>
    </main>
  );
}

const PRINT_CSS = `
@page { size: A4 portrait; margin: 0; }

.print-root {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  gap: 16px;
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

.sheet.portrait {
  width: 210mm;
  height: 297mm;
  background:
    radial-gradient(800px 520px at 10% -8%, #f6e6ec 0%, transparent 55%),
    radial-gradient(760px 480px at 100% 0%, #e7edf8 0%, transparent 52%),
    radial-gradient(700px 560px at 50% 114%, #e8f1ea 0%, transparent 56%),
    #fbf7f4;
  box-shadow: 0 10px 40px rgba(58,53,80,0.16);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16mm;
  overflow: hidden;
}

.card {
  width: 100%;
  height: 100%;
  border: 3px solid #c9a24b;
  border-radius: 28px;
  background: rgba(255,255,255,0.72);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 18mm 14mm;
  gap: 8px;
}

.stickers-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.he-head {
  font-size: 40px;
  font-weight: 800;
  color: #6e80d4;
  line-height: 1.2;
  direction: rtl;
}
.he-sub {
  font-size: 24px;
  font-weight: 600;
  color: #e7849c;
  direction: rtl;
  margin-top: 4px;
}

.divider {
  width: 64px;
  height: 4px;
  border-radius: 9999px;
  background: #c9a24b;
  margin: 18px 0;
}

.en-head {
  font-size: 30px;
  font-weight: 800;
  color: #5b8a6f;
  line-height: 1.2;
  direction: ltr;
}
.en-sub {
  font-size: 19px;
  font-weight: 600;
  color: #a98bc0;
  margin-top: 2px;
  direction: ltr;
}

.qr-wrap {
  background: #fff;
  padding: 18px;
  border-radius: 24px;
  box-shadow: inset 0 0 0 2px #e7edf8, 0 6px 20px rgba(58,53,80,0.12);
  margin: 24px 0 12px;
}

.scan-cta {
  font-size: 22px;
  font-weight: 700;
  color: #3a3550;
  letter-spacing: 0.5px;
}

.foot {
  margin-top: auto;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 17px;
  font-weight: 600;
  color: rgba(58,53,80,0.7);
  direction: rtl;
}

@media print {
  .print-root { padding: 0; }
  .no-print { display: none !important; }
  .sheet.portrait { box-shadow: none; }
}
`;
