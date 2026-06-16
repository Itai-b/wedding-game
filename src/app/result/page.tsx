"use client";

import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import LangSwitch from "@/components/LangSwitch";
import Prizes from "@/components/Prizes";
import Sticker from "@/components/Sticker";
import { useI18n } from "@/lib/i18n";
import { getLastResult } from "@/lib/leaderboard";

export default function ResultPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [score, setScore] = useState<number | null>(null);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
    const r = getLastResult();
    if (!r) {
      router.replace("/");
      return;
    }
    setScore(r.score);
  }, [router]);

  if (score == null) {
    return <div className="min-h-dvh grid place-items-center text-ink/40">…</div>;
  }

  return (
    <main className="min-h-dvh flex flex-col items-center px-5 py-8">
      <div className="w-full max-w-md flex justify-end mb-2">
        <LangSwitch />
      </div>

      <div className="w-full max-w-md">
        <div className="bg-white/85 backdrop-blur rounded-3xl shadow-lg p-7 text-center animate-pop">
          <div className="flex items-center justify-center gap-1 mb-2">
            <Sticker src="/emojis/itai-drink.png" size={80} alt="" />
            <Sticker src="/emojis/saar-happy.png" size={80} alt="" />
          </div>
          <p className="text-ink/60">{t("yourScore")}</p>
          <p className="text-6xl font-extrabold text-coral my-1 tabular-nums">
            {score.toLocaleString()}
          </p>
          <p className="mt-3 text-ink/60">{t("thanksForPlaying")}</p>

          <button
            onClick={() => router.push("/play")}
            className="w-full mt-5 bg-coral text-white font-extrabold text-lg rounded-2xl py-4 shadow-md active:scale-[0.98]"
          >
            {t("playAgain")}
          </button>
          <button
            onClick={() => router.push("/answers")}
            className="w-full mt-3 bg-periwinkle text-white font-bold rounded-2xl py-3.5 shadow-md active:scale-[0.98]"
          >
            {t("viewAnswers")}
          </button>
          <button
            onClick={() => router.push("/")}
            className="w-full mt-3 text-periwinkle font-semibold underline-offset-4 hover:underline"
          >
            {t("back")}
          </button>
        </div>

        <Prizes className="mt-5 animate-pop" />

        {/* Share QR so others can play too */}
        {origin && (
          <div className="bg-white/85 backdrop-blur rounded-3xl shadow-lg p-6 mt-5 flex flex-col items-center animate-pop">
            <p className="text-ink/70 text-center mb-3">{t("shareInvite")}</p>
            <div className="bg-white p-3 rounded-2xl shadow-inner">
              <QRCodeSVG value={origin} size={150} fgColor="#6e80d4" level="M" marginSize={1} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
