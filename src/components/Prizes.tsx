"use client";

import { useI18n } from "@/lib/i18n";

const DINNER = { emoji: "🍝", key: "prizeDinner" };
const SONG = { emoji: "🎶", key: "prizeSong" };
const SCRATCH = { emoji: "🎟️", key: "prizeScratch" };

// Prizes accumulate: each higher place also wins everything below it.
const PLACES = [
  { medal: "🥇", labelKey: "placeFirst", items: [DINNER, SONG, SCRATCH] },
  { medal: "🥈", labelKey: "placeSecond", items: [SONG, SCRATCH] },
  { medal: "🥉", labelKey: "placeThird", items: [SCRATCH] },
];

/** Bilingual, accumulating list of the winners' prizes — shown on the lock
 * screen, the instructions screen, and the result page. */
export default function Prizes({ className = "" }: { className?: string }) {
  const { t } = useI18n();
  return (
    <div
      className={`rounded-2xl bg-gradient-to-br from-gold/20 to-coral/10 border-2 border-gold/40 px-4 py-4 ${className}`}
    >
      <p className="flex items-center justify-center gap-2 font-extrabold text-ink/80 mb-3">
        <span className="text-xl">🏆</span> {t("prizesTitle")}
      </p>
      <div className="flex flex-col gap-3">
        {PLACES.map((p) => (
          <div key={p.labelKey} className="flex items-start gap-2.5">
            <span className="text-2xl leading-none shrink-0">{p.medal}</span>
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-ink/80 leading-tight">{t(p.labelKey)}</p>
              <ul className="mt-1 flex flex-col gap-0.5">
                {p.items.map((it) => (
                  <li
                    key={it.key}
                    className="flex items-start gap-1.5 text-ink/70 leading-snug"
                  >
                    <span className="shrink-0">{it.emoji}</span>
                    <span className="font-medium">{t(it.key)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
