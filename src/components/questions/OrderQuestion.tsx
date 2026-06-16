"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { AnswerPayload } from "@/lib/scoring";
import { OrderQuestion as OrderQ } from "@/lib/types";

export default function OrderQuestion({
  question,
  value,
  revealed,
  onChange,
}: {
  question: OrderQ;
  value: AnswerPayload;
  revealed: boolean;
  onChange: (a: AnswerPayload) => void;
}) {
  const { t, tl } = useI18n();
  // The list starts pre-shuffled, so it's always "complete" — but a guest who
  // submits without touching it scores ~0. Track whether they've arranged it
  // and nudge them if not.
  const [touched, setTouched] = useState(false);
  const order = value.orderedIds ?? question.items.map((i) => i.id);
  const byId = (id: string) => question.items.find((i) => i.id === id)!;
  const correctIndex = (id: string) =>
    question.items.findIndex((i) => i.id === id);

  function move(idx: number, dir: -1 | 1) {
    const next = [...order];
    const j = idx + dir;
    if (j < 0 || j >= next.length) return;
    [next[idx], next[j]] = [next[j], next[idx]];
    setTouched(true);
    onChange({ orderedIds: next });
  }

  return (
    <div className="flex flex-col gap-2.5">
      {revealed ? null : touched ? (
        <p className="text-ink/70">{t("orderHint")}</p>
      ) : (
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 border-2 border-amber-300 px-3 py-2 text-amber-800 font-bold text-base">
          <span className="text-lg">⚠️</span>
          <span>{t("orderUntouched")}</span>
        </div>
      )}
      {order.map((id, idx) => {
        const item = byId(id);
        const placedRight = revealed && correctIndex(id) === idx;
        const placedWrong = revealed && correctIndex(id) !== idx;
        const isFirst = idx === 0;
        const isLast = idx === order.length - 1;
        return (
          <div
            key={id}
            className={`flex items-stretch gap-3 rounded-2xl p-2.5 shadow-sm border-2 transition-colors ${
              placedRight
                ? "bg-sage/15 border-sage"
                : placedWrong
                  ? "bg-rose-50 border-rose-300"
                  : "bg-white border-periwinkle/20"
            }`}
          >
            <span className="grid place-items-center w-10 h-10 self-center rounded-full bg-periwinkle text-white font-extrabold text-lg shrink-0">
              {idx + 1}
            </span>
            <span className="flex-1 self-center font-semibold leading-snug py-1">
              {tl(item.text)}
            </span>
            {revealed ? (
              <span className="self-center text-base font-bold shrink-0 pe-1">
                {placedRight ? (
                  <span className="text-sage">✓</span>
                ) : (
                  <span className="text-rose-500">→ {correctIndex(id) + 1}</span>
                )}
              </span>
            ) : (
              // Big, clearly-tappable move controls — top moves it earlier,
              // bottom moves it later. Disabled at the ends.
              <span className="flex flex-col gap-1.5 shrink-0">
                <button
                  aria-label={t("moveUp")}
                  onClick={() => move(idx, -1)}
                  disabled={isFirst}
                  className="w-12 flex-1 grid place-items-center rounded-xl bg-periwinkle/10 text-periwinkle text-xl font-bold border-2 border-transparent disabled:opacity-25 active:scale-90 active:bg-periwinkle/20"
                >
                  ↑
                </button>
                <button
                  aria-label={t("moveDown")}
                  onClick={() => move(idx, 1)}
                  disabled={isLast}
                  className="w-12 flex-1 grid place-items-center rounded-xl bg-periwinkle/10 text-periwinkle text-xl font-bold border-2 border-transparent disabled:opacity-25 active:scale-90 active:bg-periwinkle/20"
                >
                  ↓
                </button>
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
