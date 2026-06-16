"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { AnswerPayload, haversineKm } from "@/lib/scoring";
import { MapQuestion } from "@/lib/types";

// Equirectangular projection (full globe: lng -180..180, lat 90..-90).
const lngToX = (lng: number) => ((lng + 180) / 360) * 100;
const latToY = (lat: number) => ((90 - lat) / 180) * 100;

// Draw the world wider than the column so it's big enough to tap precisely;
// the overflow scrolls horizontally (native scroll keeps tap-to-pin reliable).
const ZOOM = 1.8;

export default function MapPin({
  question,
  value,
  revealed,
  onChange,
}: {
  question: MapQuestion;
  value: AnswerPayload;
  revealed: boolean;
  onChange: (a: AnswerPayload) => void;
}) {
  const { t, tl } = useI18n();
  const scroller = useRef<HTMLDivElement>(null);
  const map = useRef<HTMLDivElement>(null);
  const [imgReady, setImgReady] = useState(false);

  // Start scrolled to the middle (Greenwich-centred) like a normal world map.
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
  }, []);

  const pin = value.pin ?? null;

  function handleTap(e: React.MouseEvent<HTMLDivElement>) {
    if (revealed || !map.current) return;
    // Measure against the map element itself — its rect already accounts for
    // the current horizontal scroll, and it's the exact box the pin markers are
    // positioned within, so a tap and its pin line up precisely.
    const rect = map.current.getBoundingClientRect();
    const fx = (e.clientX - rect.left) / rect.width; // 0..1 across the world
    const fy = (e.clientY - rect.top) / rect.height; // 0..1 down the world
    const lng = fx * 360 - 180;
    const lat = 90 - fy * 180;
    onChange({ pin: { lat, lng } });
  }

  const dist = revealed && pin ? Math.round(haversineKm(pin, question.target)) : null;
  const px = pin ? lngToX(pin.lng) : 0;
  const py = pin ? latToY(pin.lat) : 0;
  const tx = lngToX(question.target.lng);
  const ty = latToY(question.target.lat);

  return (
    <div className="flex flex-col gap-3">
      {!revealed && (
        <p className="text-ink/60">{pin ? t("mapPlaced") : t("mapHint")}</p>
      )}

      <div
        ref={scroller}
        className="w-full overflow-x-auto overflow-y-hidden rounded-2xl border-2 border-periwinkle/30 shadow-sm"
      >
        {/* Inner map — wider than the viewport so it scrolls horizontally.
           The aspect box reserves height so the loader fills it before the
           image arrives. */}
        <div
          ref={map}
          onClick={handleTap}
          className={`relative aspect-[1600/805] ${revealed ? "" : "cursor-crosshair"}`}
          style={{ width: `${ZOOM * 100}%` }}
        >
          {/* plain <img>: predictable sizing + scrolling inside the scroller */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/world.jpg"
            alt="world map"
            draggable={false}
            onLoad={() => setImgReady(true)}
            className="block w-full h-auto select-none pointer-events-none brightness-105"
          />

          {!imgReady && (
            <div className="absolute inset-0 grid place-items-center bg-cream-deep text-ink/40">
              <span className="flex items-center gap-2 text-sm font-medium">
                <span className="w-4 h-4 rounded-full border-2 border-periwinkle/30 border-t-periwinkle animate-spin" />
                🗺️
              </span>
            </div>
          )}

          {/* line between guess and target on reveal */}
          {revealed && pin && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <line
                x1={px}
                y1={py}
                x2={tx}
                y2={ty}
                stroke="#3a3550"
                strokeWidth="0.4"
                strokeDasharray="1.2 1.2"
                opacity="0.7"
              />
            </svg>
          )}

          {pin && <Marker xPct={px} yPct={py} emoji="📍" />}
          {revealed && <Marker xPct={tx} yPct={ty} emoji="🎯" ring="ring-sage" />}
        </div>
      </div>

      {!revealed && (
        <p className="text-center text-base font-medium text-ink/65">↔ {t("mapScrollHint")}</p>
      )}

      {revealed && (
        <div className="flex items-center justify-between flex-wrap gap-1 text-sm">
          <span className="font-semibold text-sage">🎯 {tl(question.target.label)}</span>
          {dist != null && (
            <span className="text-ink/70">
              {dist <= question.fullCreditKm
                ? t("mapBullseye")
                : t("yourGuessAway", { km: dist.toLocaleString() })}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function Marker({
  xPct,
  yPct,
  emoji,
  ring = "ring-white/80",
}: {
  xPct: number;
  yPct: number;
  emoji: string;
  ring?: string;
}) {
  return (
    <span
      className={`absolute -translate-x-1/2 -translate-y-1/2 grid place-items-center w-10 h-10 rounded-full bg-white shadow-lg text-2xl ring-2 ${ring} z-10`}
      style={{ left: `${xPct}%`, top: `${yPct}%` }}
    >
      {emoji}
    </span>
  );
}
