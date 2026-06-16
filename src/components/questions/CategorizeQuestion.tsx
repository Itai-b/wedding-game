"use client";

import { useMemo } from "react";
import Sticker from "@/components/Sticker";
import { useI18n } from "@/lib/i18n";
import { AnswerPayload } from "@/lib/scoring";
import { CategorizeQuestion as CatQ, CategorizeItem } from "@/lib/types";

// Map the chore-question categories to the couple's stickers.
const CAT_STICKER: Record<string, string> = {
  saar: "/emojis/saar-love.png",
  itai: "/emojis/itai-cool.png",
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function CategorizeQuestion({
  question,
  value,
  revealed,
  onChange,
}: {
  question: CatQ;
  value: AnswerPayload;
  revealed: boolean;
  onChange: (a: AnswerPayload) => void;
}) {
  const { t, tl } = useI18n();
  const assignments = value.assignments ?? {};

  // Randomise item order per user so the correct buckets aren't grouped
  // (stable for the life of this question).
  const displayItems = useMemo<CategorizeItem[]>(
    () => shuffle(question.items),
    [question.id],
  );

  function assign(itemId: string, catId: string) {
    onChange({ assignments: { ...assignments, [itemId]: catId } });
  }

  const remaining = question.items.filter((it) => assignments[it.id] == null).length;

  return (
    <div className="flex flex-col gap-3">
      {revealed ? (
        <p className="text-ink/60">{t("categorizeHint")}</p>
      ) : remaining > 0 ? (
        // Make it obvious there are still unassigned facts — submit stays
        // disabled until they're all sorted, so nothing is sent blank.
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 border-2 border-amber-300 px-3 py-2.5 text-amber-800 font-bold text-base">
          <span className="text-lg">⚠️</span>
          <span>{t("categorizeRemaining", { n: remaining })}</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-xl bg-sage/15 border-2 border-sage/40 px-3 py-2.5 text-sage font-bold text-base">
          <span className="text-lg">✓</span>
          <span>{t("categorizeAllDone")}</span>
        </div>
      )}
      {displayItems.map((item) => {
        const chosen = assignments[item.id] ?? null;
        const correctCat = item.categoryId;
        const isCorrect = revealed && chosen === correctCat;
        const isWrong = revealed && chosen !== correctCat;
        return (
          <div
            key={item.id}
            className={`rounded-2xl p-3.5 shadow-sm border-2 ${
              isCorrect
                ? "bg-sage/15 border-sage"
                : isWrong
                  ? "bg-rose-50 border-rose-300"
                  : "bg-white border-periwinkle/20"
            }`}
          >
            {/* The fact gets its own line so long ones never squeeze the
               choices; the two options sit below as equal-width buttons. */}
            <p className="font-semibold leading-snug mb-3">{tl(item.text)}</p>
            <div className="flex gap-2.5">
              {question.categories.map((cat) => {
                const selected = chosen === cat.id;
                const isRightAnswer = revealed && cat.id === correctCat;
                return (
                  <button
                    key={cat.id}
                    disabled={revealed}
                    onClick={() => assign(item.id, cat.id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-base font-bold border-2 transition-all active:scale-[0.97] ${
                      isRightAnswer
                        ? "bg-sage text-white border-sage"
                        : selected
                          ? "bg-periwinkle text-white border-periwinkle"
                          : "bg-cream-deep text-ink/70 border-transparent"
                    }`}
                  >
                    {CAT_STICKER[cat.id] && (
                      <Sticker src={CAT_STICKER[cat.id]} size={36} alt="" priority />
                    )}
                    {tl(cat.label)}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
