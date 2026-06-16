"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LangSwitch from "@/components/LangSwitch";
import Leaderboard from "@/components/Leaderboard";
import Sticker from "@/components/Sticker";
import { useI18n } from "@/lib/i18n";
import { fetchLeaderboard, getPlayerId } from "@/lib/leaderboard";

export default function Home() {
  const { t } = useI18n();
  const router = useRouter();
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [wedding, setWedding] = useState<{ score: number; rank: number } | null>(null);

  useEffect(() => {
    const id = getPlayerId();
    setPlayerId(id);
    // Look up this device's wedding result (if any) from the frozen DB. Replays
    // never write, so a returning guest's original entry stays findable.
    fetchLeaderboard(1000).then((all) => {
      const idx = all.findIndex((e) => e.id === id);
      if (idx !== -1) setWedding({ score: all[idx].score, rank: idx + 1 });
    });
  }, []);

  return (
    <main className="min-h-dvh flex flex-col items-center px-5 py-8">
      <div className="w-full max-w-md flex justify-end mb-2">
        <LangSwitch />
      </div>

      <div className="w-full max-w-md flex-1 flex flex-col justify-center">
        <header className="text-center mb-6 animate-pop">
          <div className="flex items-center justify-center gap-1 mb-2">
            <Sticker src="/emojis/saar-love.png" size={88} alt="Saar" priority />
            <span className="text-3xl">💍</span>
            <Sticker src="/emojis/itai-happy.png" size={88} alt="Itai" priority />
          </div>
          <h1 className="text-3xl font-extrabold text-periwinkle leading-tight">
            {t("coupleNames")}
          </h1>
          <p className="text-ink/60 mt-1">{t("weddingDate")}</p>
        </header>

        <div className="bg-white/85 backdrop-blur rounded-3xl shadow-lg p-6 text-center animate-pop">
          <h2 className="text-xl font-extrabold text-coral mb-1">
            {t("postThanksTitle")}
          </h2>
          <p className="text-ink/70 leading-snug">{t("postThanksBody")}</p>

          {wedding && (
            <p className="mt-4 inline-block bg-gold/15 text-ink/80 font-extrabold rounded-full px-4 py-2">
              {t("yourWeddingResult", {
                score: wedding.score.toLocaleString(),
                rank: wedding.rank,
              })}
            </p>
          )}

          <button
            onClick={() => router.push("/play")}
            className="w-full mt-5 bg-coral text-white font-extrabold text-lg rounded-2xl py-4 shadow-md active:scale-[0.98] transition-transform"
          >
            {t("playTheGame")}
          </button>
          <button
            onClick={() => router.push("/answers")}
            className="w-full mt-3 bg-periwinkle text-white font-bold rounded-2xl py-3.5 shadow-md active:scale-[0.98] transition-transform"
          >
            {t("viewAnswers")}
          </button>
        </div>

        {/* The frozen wedding podium — top 3 only, no full list, no player count */}
        <div className="mt-6 bg-white/80 backdrop-blur rounded-3xl shadow-lg p-5 animate-pop">
          <h2 className="text-center text-xl font-extrabold text-periwinkle mb-4">
            {t("weddingPodiumTitle")}
          </h2>
          <Leaderboard podium limit={3} highlightId={playerId} />
        </div>
      </div>
    </main>
  );
}
