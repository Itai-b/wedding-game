"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Leaderboard from "@/components/Leaderboard";
import LangSwitch from "@/components/LangSwitch";
import Sticker from "@/components/Sticker";
import { useI18n } from "@/lib/i18n";
import { getGameState, getPlayerId } from "@/lib/leaderboard";

export default function LeaderboardPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [state, setState] = useState<"loading" | "locked" | "open">("loading");

  useEffect(() => {
    setPlayerId(getPlayerId());
    const isAdmin = sessionStorage.getItem("wg_admin_ok") === "1";
    // Standings stay hidden until the host explicitly shows the leaderboard
    // (a separate action from finishing the game). Admins can always preview.
    getGameState().then((s) =>
      setState(s.leaderboardShown || isAdmin ? "open" : "locked"),
    );
  }, []);

  return (
    <main className="min-h-dvh flex flex-col items-center px-5 py-8">
      <div className="w-full max-w-md flex items-center justify-between mb-4">
        <button
          onClick={() => router.push("/")}
          className="text-periwinkle font-semibold"
        >
          ‹ {t("coupleNames")}
        </button>
        <LangSwitch />
      </div>

      {state === "loading" ? (
        <div className="flex-1 grid place-items-center text-ink/40">…</div>
      ) : state === "locked" ? (
        <div className="w-full max-w-md flex-1 flex flex-col justify-center">
          <div className="bg-white/85 backdrop-blur rounded-3xl shadow-lg p-7 text-center animate-pop">
            <h1 className="text-xl font-bold mb-2">{t("lbLockedTitle")}</h1>
            <p className="text-ink/60">{t("lbLockedBody")}</p>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Sticker src="/emojis/saar-happy.png" size={60} alt="" />
            <h1 className="text-2xl font-extrabold text-center text-periwinkle">
              🏆 {t("leaderboard")}
            </h1>
            <Sticker src="/emojis/itai-laugh.png" size={60} alt="" />
          </div>
          <p className="text-center text-ink/60 mb-6">{t("standingsSubtitle")}</p>
          <Leaderboard highlightId={playerId} limit={100} podium />
        </div>
      )}
    </main>
  );
}
