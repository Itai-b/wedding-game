"use client";

import { useMemo } from "react";
import { useI18n } from "@/lib/i18n";
import { AnswerPayload } from "@/lib/scoring";
import { McQuestion, McOption } from "@/lib/types";

const OPTION_STYLES = [
  "bg-periwinkle",
  "bg-coral",
  "bg-sage",
  "bg-lavender",
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function MultipleChoice({
  question,
  value,
  revealed,
  onChange,
}: {
  question: McQuestion;
  value: AnswerPayload;
  revealed: boolean;
  onChange: (a: AnswerPayload) => void;
}) {
  const { tl } = useI18n();
  const selected = value.mcAnswerId ?? null;
  const hasSelection = selected !== null;
  // Randomise option order per user (stable for the life of this question).
  const displayOptions = useMemo<McOption[]>(
    () => shuffle(question.options),
    [question.id],
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {displayOptions.map((opt, i) => {
        const isSelected = selected === opt.id;
        const isCorrect = opt.id === question.correctId;

        let cls = `${OPTION_STYLES[i % 4]} text-white`;
        let ring = "";
        let extra = "";
        if (revealed) {
          if (isCorrect) {
            cls = "bg-sage text-white";
            ring = "ring-4 ring-gold";
          } else if (isSelected) {
            cls = "bg-rose-500 text-white";
          } else {
            cls = "bg-gray-200 text-gray-400";
          }
        } else if (isSelected) {
          // Make the picked answer unmistakable: bold ring, lift + shadow…
          ring = "ring-4 ring-ink";
          extra = "scale-[1.03] shadow-xl -translate-y-0.5";
        } else if (hasSelection) {
          // …and slightly mute the ones not chosen so the choice stands out
          // (kept high so they're still clearly readable).
          extra = "opacity-80";
        }

        // Badge shows a check on the picked answer (and reveal marks).
        const pickedNow = !revealed && isSelected;
        const badge =
          revealed && isCorrect ? "✓" : revealed && isSelected ? "✗" : pickedNow ? "✓" : i + 1;
        const badgeCls = pickedNow ? "bg-white text-ink" : "bg-white/25";

        return (
          <button
            key={opt.id}
            disabled={revealed}
            onClick={() => onChange({ mcAnswerId: opt.id })}
            className={`${cls} ${ring} ${extra} rounded-2xl px-5 py-5 text-lg font-bold text-start shadow-md transition-all active:scale-[0.98] flex items-center gap-3 min-h-[68px]`}
          >
            <span
              className={`grid place-items-center w-8 h-8 rounded-full font-extrabold text-base shrink-0 ${badgeCls}`}
            >
              {badge}
            </span>
            <span className="leading-snug">{tl(opt.text)}</span>
          </button>
        );
      })}
    </div>
  );
}
