"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import CategorizeQuestion from "@/components/questions/CategorizeQuestion";
import MapPin from "@/components/questions/MapPin";
import MultipleChoice from "@/components/questions/MultipleChoice";
import OrderQuestion from "@/components/questions/OrderQuestion";
import LangSwitch from "@/components/LangSwitch";
import Prizes from "@/components/Prizes";
import QuestionPrompt from "@/components/QuestionPrompt";
import Sticker from "@/components/Sticker";
import { useI18n } from "@/lib/i18n";
import { markPlayed, saveMyAnswers } from "@/lib/leaderboard";
import { QUESTIONS } from "@/lib/questions";
import { AnswerPayload, scoreQuestion } from "@/lib/scoring";
import { Question } from "@/lib/types";

function Instructions({ onStart }: { onStart: () => void }) {
  const { t } = useI18n();
  const rules: { icon: string; text: string }[] = [
    { icon: "⚡", text: t("ruleSpeed") },
    { icon: "⏱️", text: t("ruleTiming") },
    { icon: "🔒", text: t("ruleNoBack") },
    { icon: "🤫", text: t("ruleHidden") },
    { icon: "🏆", text: t("ruleReveal") },
  ];
  return (
    <main className="min-h-dvh flex flex-col items-center px-5 py-8">
      <div className="w-full max-w-md flex justify-end mb-2">
        <LangSwitch />
      </div>
      <div className="w-full max-w-md flex-1 flex flex-col justify-center">
        <div className="bg-white/85 backdrop-blur rounded-3xl shadow-lg p-7 animate-pop">
          <div className="flex items-center justify-center gap-1 mb-3">
            <Sticker src="/emojis/saar-burger.png" size={76} alt="" priority />
            <Sticker src="/emojis/itai-pizza.png" size={76} alt="" priority />
          </div>
          <h1 className="text-2xl font-extrabold text-center text-periwinkle mb-5">
            {t("howToTitle")}
          </h1>

          <ul className="flex flex-col gap-3">
            {rules.map((r, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-2xl shrink-0">{r.icon}</span>
                <span className="font-medium leading-snug pt-0.5">{r.text}</span>
              </li>
            ))}
          </ul>

          <Prizes className="mt-5" />

          <p className="text-center text-ink/60 mt-4">
            {t("ruleOnce", { n: QUESTIONS.length })}
          </p>

          <button
            onClick={onStart}
            className="w-full mt-6 bg-coral text-white font-extrabold text-lg rounded-2xl py-4 shadow-md active:scale-[0.98] transition-transform"
          >
            {t("startPlaying")}
          </button>
        </div>
      </div>
    </main>
  );
}

function SavingScreen() {
  const { t } = useI18n();
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-6 text-center">
      <div className="flex items-center gap-1 mb-6">
        <Sticker src="/emojis/saar-love.png" size={88} alt="" priority />
        <Sticker src="/emojis/itai-happy.png" size={88} alt="" priority />
      </div>
      <div className="w-12 h-12 rounded-full border-4 border-periwinkle/25 border-t-periwinkle animate-spin mb-6" />
      <h1 className="text-2xl font-extrabold text-periwinkle mb-1">
        {t("savingTitle")}
      </h1>
      <p className="text-ink/60">{t("savingBody")}</p>
    </main>
  );
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function initialAnswer(q: Question): AnswerPayload {
  switch (q.type) {
    case "mc":
      return { mcAnswerId: null };
    case "order":
      return { orderedIds: shuffle(q.items.map((i) => i.id)) };
    case "categorize":
      return { assignments: {} };
    case "map":
      return { pin: null };
  }
}

function hasAnswer(q: Question, a: AnswerPayload): boolean {
  switch (q.type) {
    case "mc":
      return a.mcAnswerId != null;
    case "map":
      return a.pin != null;
    case "categorize": {
      // Every fact must be assigned to Saar or Itai before submitting.
      const assigned = a.assignments ?? {};
      return q.items.every((it) => assigned[it.id] != null);
    }
    case "order":
      // The list is always in some complete order (pre-shuffled), so it's
      // never "missing" — submitting is always allowed.
      return true;
  }
}

// Seconds the "get ready" buffer shows before a non-multiple-choice question.
const INTRO_SECONDS = 10;

// MC questions are self-explanatory; the other types get a quick primer.
const INTRO: Record<string, { icon: string; title: string; body: string } | null> = {
  mc: null,
  order: { icon: "🔢", title: "introTitleOrder", body: "introBodyOrder" },
  categorize: { icon: "👥", title: "introTitleCategorize", body: "introBodyCategorize" },
  map: { icon: "🗺️", title: "introTitleMap", body: "introBodyMap" },
};

/** Kahoot-style buffer shown before order/categorize/map questions so guests
 * know what to do; auto-starts after a short countdown or on "skip". */
function QuestionIntro({
  q,
  secondsLeft,
  onSkip,
}: {
  q: Question;
  secondsLeft: number;
  onSkip: () => void;
}) {
  const { t, tl } = useI18n();
  const info = INTRO[q.type]!;
  return (
    <main className="min-h-dvh flex flex-col items-center px-5 py-8">
      <div className="w-full max-w-md flex justify-end mb-2">
        <LangSwitch />
      </div>
      <div className="w-full max-w-md flex-1 flex flex-col justify-center">
        <div className="bg-white/85 backdrop-blur rounded-3xl shadow-lg p-7 text-center animate-pop">
          <p className="text-sm font-bold uppercase tracking-wide text-ink/50">
            {t("introHeading")}
          </p>
          <div className="text-6xl my-3">{info.icon}</div>
          <h1 className="text-2xl font-extrabold text-periwinkle mb-2">
            {t(info.title)}
          </h1>
          <p className="text-lg text-ink/75 leading-snug">{t(info.body)}</p>

          <p className="mt-6 text-base text-ink/70 font-medium leading-snug">
            <QuestionPrompt text={tl(q.prompt)} />
          </p>

          <div className="mt-6 flex items-center justify-center gap-2">
            <span className="grid place-items-center w-12 h-12 rounded-full bg-periwinkle text-white text-2xl font-extrabold tabular-nums">
              {secondsLeft}
            </span>
            <span className="text-ink/55 font-semibold">{t("introStartsIn")}</span>
          </div>

          <button
            onClick={onSkip}
            className="w-full mt-6 bg-coral text-white font-extrabold text-lg rounded-2xl py-4 shadow-md active:scale-[0.98] transition-transform"
          >
            {t("introSkip")}
          </button>
        </div>
      </div>
    </main>
  );
}

export default function PlayPage() {
  const { t, tl } = useI18n();
  const router = useRouter();

  const [ready, setReady] = useState(false);
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<AnswerPayload>({});
  const [now, setNow] = useState(0);
  const [finishing, setFinishing] = useState(false);
  const [phase, setPhase] = useState<"intro" | "question">("question");
  const [introLeft, setIntroLeft] = useState(0);

  const startRef = useRef(0);
  const answerRef = useRef<AnswerPayload>({});
  const committedRef = useRef(false);
  const totalRef = useRef(0);
  const answersRef = useRef<Record<string, AnswerPayload>>({});
  answerRef.current = answer;

  const q = QUESTIONS[index];

  // Post-wedding "play anytime": no registration, no one-attempt lock, no
  // open/finished gate — anyone can play (and replay) freely.
  useEffect(() => {
    setReady(true);
  }, []);

  // Start a question for real: reset its answer and begin its timer now.
  const startQuestion = useCallback((i: number) => {
    setPhase("question");
    setAnswer(initialAnswer(QUESTIONS[i]));
    committedRef.current = false;
    startRef.current = Date.now();
    setNow(Date.now());
  }, []);

  // Advance to question i — show the "get ready" buffer first for the
  // non-multiple-choice types, otherwise jump straight in.
  const goTo = useCallback(
    (i: number) => {
      setIndex(i);
      if (INTRO[QUESTIONS[i].type]) {
        setPhase("intro");
        setIntroLeft(INTRO_SECONDS);
      } else {
        startQuestion(i);
      }
    },
    [startQuestion],
  );

  useEffect(() => {
    if (ready && started) goTo(0);
  }, [ready, started, goTo]);

  // Preload the world map the moment play begins — it's one of the last
  // questions, so by the time guests reach it the image is already cached
  // (avoids a slow load on venue Wi-Fi).
  useEffect(() => {
    if (!started) return;
    const img = new window.Image();
    img.src = "/world.jpg";
  }, [started]);

  // The buffer counts down, then auto-starts the question.
  useEffect(() => {
    if (phase !== "intro") return;
    if (introLeft <= 0) {
      startQuestion(index);
      return;
    }
    const id = setTimeout(() => setIntroLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, introLeft, index, startQuestion]);

  useEffect(() => {
    if (!ready || !started || finishing || phase !== "question") return;
    const id = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(id);
  }, [ready, started, finishing, phase]);

  // Score silently and move on — players never see if they were right.
  const commit = useCallback(() => {
    if (committedRef.current) return;
    committedRef.current = true;
    const used = Math.min(
      Date.now() - startRef.current,
      QUESTIONS[index].timeLimit * 1000,
    );
    totalRef.current += scoreQuestion(
      QUESTIONS[index],
      answerRef.current,
      used,
    ).points;
    // Remember this answer so the answers page can show right/wrong later.
    answersRef.current[QUESTIONS[index].id] = answerRef.current;
    saveMyAnswers(answersRef.current);

    if (index + 1 >= QUESTIONS.length) {
      setFinishing(true);
      // Post-wedding practice: no leaderboard write (keeps the wedding scores
      // frozen). Just save the score locally for the result page and go.
      markPlayed("", totalRef.current);
      router.replace("/result");
      return;
    }
    goTo(index + 1);
  }, [index, router, goTo]);

  const remainingSec = q
    ? Math.max(0, q.timeLimit - (now - startRef.current) / 1000)
    : 0;

  // Auto-advance when the timer runs out (only while a question is live).
  useEffect(() => {
    if (
      ready &&
      started &&
      !finishing &&
      phase === "question" &&
      remainingSec <= 0 &&
      startRef.current
    )
      commit();
  }, [now, ready, started, finishing, phase, remainingSec, commit]);

  if (finishing) {
    return <SavingScreen />;
  }

  if (!ready) {
    return <div className="min-h-dvh grid place-items-center text-ink/40">…</div>;
  }

  if (!started) {
    return <Instructions onStart={() => setStarted(true)} />;
  }

  if (phase === "intro") {
    return (
      <QuestionIntro
        q={q}
        secondsLeft={introLeft}
        onSkip={() => startQuestion(index)}
      />
    );
  }

  const fraction = q ? remainingSec / q.timeLimit : 0;
  const timerColor =
    fraction > 0.5 ? "bg-sage" : fraction > 0.25 ? "bg-gold" : "bg-rose-500";
  const last = index + 1 >= QUESTIONS.length;

  return (
    <main className="min-h-dvh flex flex-col items-center px-4 py-5">
      <div className="w-full max-w-md flex items-center justify-between mb-2">
        <span className="font-semibold text-ink/70">
          {t("questionOf", { n: index + 1, total: QUESTIONS.length })}
        </span>
        <LangSwitch />
      </div>

      <div className="w-full max-w-md flex items-center gap-3 mb-5">
        <div className="flex-1 h-3 rounded-full bg-cream-deep overflow-hidden">
          <div
            className={`h-full ${timerColor} timer-fill`}
            style={{ width: `${Math.max(0, fraction) * 100}%`, transitionDuration: "150ms" }}
          />
        </div>
        <span
          className={`text-base font-extrabold tabular-nums shrink-0 w-12 text-end ${
            fraction > 0.5 ? "text-sage" : fraction > 0.25 ? "text-gold" : "text-rose-500"
          }`}
        >
          {Math.ceil(remainingSec)}s
        </span>
      </div>

      <div className="w-full max-w-md flex-1 flex flex-col">
        <div className="flex items-start gap-3 mb-5">
          {q.stickers?.map((s) => (
            <Sticker key={s} src={s} size={64} alt="" priority />
          ))}
          <h2 className="text-xl font-bold leading-snug">
            <QuestionPrompt text={tl(q.prompt)} />
          </h2>
        </div>

        <div key={q.id} className="animate-float">
          {q.type === "mc" && (
            <MultipleChoice question={q} value={answer} revealed={false} onChange={setAnswer} />
          )}
          {q.type === "order" && (
            <OrderQuestion question={q} value={answer} revealed={false} onChange={setAnswer} />
          )}
          {q.type === "categorize" && (
            <CategorizeQuestion question={q} value={answer} revealed={false} onChange={setAnswer} />
          )}
          {q.type === "map" && (
            <MapPin question={q} value={answer} revealed={false} onChange={setAnswer} />
          )}
        </div>

        <div className="mt-auto pt-6 sticky bottom-4">
          {hasAnswer(q, answer) && (
            <p className="text-center text-sm font-semibold text-ink/60 mb-2 animate-pop">
              {t("tapNext")}
            </p>
          )}
          <button
            onClick={commit}
            disabled={!hasAnswer(q, answer)}
            className={`w-full bg-periwinkle text-white font-extrabold text-lg rounded-2xl py-4 shadow-lg active:scale-[0.98] transition-transform disabled:opacity-40 ${
              hasAnswer(q, answer) ? "ring-2 ring-gold/60" : ""
            }`}
          >
            {last ? t("finish") : t("next")}
          </button>
        </div>
      </div>
    </main>
  );
}
