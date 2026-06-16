"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CategorizeQuestion from "@/components/questions/CategorizeQuestion";
import MapPin from "@/components/questions/MapPin";
import MultipleChoice from "@/components/questions/MultipleChoice";
import OrderQuestion from "@/components/questions/OrderQuestion";
import LangSwitch from "@/components/LangSwitch";
import QuestionPrompt from "@/components/QuestionPrompt";
import Sticker from "@/components/Sticker";
import { useI18n } from "@/lib/i18n";
import { getMyAnswers } from "@/lib/leaderboard";
import { QUESTIONS } from "@/lib/questions";
import { AnswerPayload, scoreQuestion, solutionAnswer } from "@/lib/scoring";

export default function AnswersPage() {
  const { t, tl } = useI18n();
  const router = useRouter();
  const [mine, setMine] = useState<Record<string, AnswerPayload>>({});

  useEffect(() => {
    setMine(getMyAnswers());
  }, []);

  return (
    <main className="min-h-dvh flex flex-col items-center px-4 py-6">
      <div className="w-full max-w-md flex items-center justify-between mb-4">
        <button onClick={() => router.push("/")} className="text-periwinkle font-semibold">
          ‹ {t("back")}
        </button>
        <LangSwitch />
      </div>

      <div className="w-full max-w-md">
          <h1 className="text-2xl font-extrabold text-center text-periwinkle mb-3">
            ✅ {t("answersTitle")}
          </h1>
          {(() => {
            const answered = QUESTIONS.filter((q) => mine[q.id]);
            if (answered.length === 0) return null;
            const right = answered.filter(
              (q) => scoreQuestion(q, mine[q.id], 0).correct,
            ).length;
            return (
              <p className="text-center font-bold text-ink/80 bg-white/70 rounded-full py-2 px-4 mb-6">
                {t("answersScore", { n: right, total: QUESTIONS.length })}
              </p>
            );
          })()}
          <div className="flex flex-col gap-6">
            {QUESTIONS.map((q, i) => {
              const sol = solutionAnswer(q);
              // Show the player's own answer (so the question highlights what
              // they picked vs. the correct one). If they didn't play on this
              // device, fall back to just the solution.
              const myAnswer = mine[q.id];
              const value = myAnswer ?? sol;
              const res = myAnswer ? scoreQuestion(q, myAnswer, 0) : null;
              return (
                <div
                  key={q.id}
                  className="bg-white/80 backdrop-blur rounded-3xl shadow-md p-5"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-sm font-bold text-ink/55">
                      {t("questionOf", { n: i + 1, total: QUESTIONS.length })}
                    </p>
                    {res && (
                      <span
                        className={`text-sm font-bold rounded-full px-3 py-1 ${
                          res.correct
                            ? "bg-sage/15 text-sage"
                            : res.fraction > 0
                              ? "bg-amber-100 text-amber-700"
                              : "bg-rose-100 text-rose-600"
                        }`}
                      >
                        {res.correct ? t("correct") : res.fraction > 0 ? t("partial") : t("wrong")}
                      </span>
                    )}
                  </div>
                  <div className="flex items-start gap-2 mb-4">
                    {q.stickers?.map((s) => (
                      <Sticker key={s} src={s} size={52} alt="" />
                    ))}
                    <h2 className="font-bold leading-snug">
                      <QuestionPrompt text={tl(q.prompt)} />
                    </h2>
                  </div>
                  {q.type === "mc" && (
                    <MultipleChoice question={q} value={value} revealed onChange={() => {}} />
                  )}
                  {q.type === "order" && (
                    <OrderQuestion question={q} value={value} revealed onChange={() => {}} />
                  )}
                  {q.type === "categorize" && (
                    <CategorizeQuestion question={q} value={value} revealed onChange={() => {}} />
                  )}
                  {q.type === "map" && (
                    <MapPin question={q} value={value} revealed onChange={() => {}} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
    </main>
  );
}
