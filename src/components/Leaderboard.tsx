"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import {
  fetchLeaderboard,
  subscribeLeaderboard,
} from "@/lib/leaderboard";
import { LeaderboardEntry } from "@/lib/types";

const MEDALS = ["🥇", "🥈", "🥉"];
const PODIUM_BG = [
  "bg-gradient-to-r from-gold/30 to-gold/10 border-gold",
  "bg-gradient-to-r from-gray-300/40 to-gray-200/10 border-gray-300",
  "bg-gradient-to-r from-amber-700/20 to-amber-600/5 border-amber-700/50",
];

// Visual podium blocks, indexed by rank (0 = 1st). 1st is tallest.
const PODIUM_BLOCK = [
  { h: "h-24", grad: "from-gold/50 to-gold/10", border: "border-gold" },
  { h: "h-16", grad: "from-gray-300/60 to-gray-200/10", border: "border-gray-300" },
  { h: "h-12", grad: "from-amber-700/35 to-amber-600/10", border: "border-amber-700/50" },
];

export default function Leaderboard({
  highlightId,
  limit = 50,
  compact = false,
  podium = false,
}: {
  highlightId?: string | null;
  limit?: number;
  compact?: boolean;
  podium?: boolean;
}) {
  const { t } = useI18n();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const data = await fetchLeaderboard(limit);
      if (alive) {
        setEntries(data);
        setLoading(false);
      }
    };
    load();
    const unsub = subscribeLeaderboard(load);
    return () => {
      alive = false;
      unsub();
    };
  }, [limit]);

  if (loading) {
    return <p className="text-center text-ink/50 py-8">…</p>;
  }
  if (entries.length === 0) {
    return <p className="text-center text-ink/60 py-8">{t("noPlayersYet")}</p>;
  }

  const showPodium = podium && entries.length > 0;
  const top = showPodium ? entries.slice(0, 3) : [];
  const listEntries = showPodium ? entries.slice(3) : entries;
  const listOffset = showPodium ? 3 : 0;

  return (
    <div className="flex flex-col gap-4">
      {showPodium && (
        // Render 2nd · 1st · 3rd so the winner stands tallest in the middle.
        <div className="flex items-end justify-center gap-2 px-1">
          {[1, 0, 2].filter((i) => top[i]).map((i) => {
            const e = top[i];
            const isMe = highlightId && e.id === highlightId;
            const blk = PODIUM_BLOCK[i];
            return (
              <div
                key={e.id}
                className="flex-1 max-w-[33%] flex flex-col items-center"
              >
                <span className="text-4xl leading-none">{MEDALS[i]}</span>
                <span
                  className={`mt-1 font-bold text-sm leading-tight text-center truncate max-w-full px-1 ${
                    isMe ? "text-coral" : ""
                  }`}
                >
                  {e.name}
                </span>
                <span className="font-extrabold text-periwinkle tabular-nums text-sm">
                  {e.score.toLocaleString()}
                </span>
                <div
                  className={`w-full mt-1 rounded-t-xl border-2 ${blk.border} bg-gradient-to-b ${blk.grad} ${blk.h} grid place-items-center ${
                    isMe ? "ring-2 ring-coral" : ""
                  }`}
                >
                  <span className="text-2xl font-extrabold text-ink/70">{i + 1}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {listEntries.length > 0 && (
        <ol className="flex flex-col gap-2">
          {listEntries.map((e, j) => {
            const i = j + listOffset; // absolute rank index (0-based)
            const isTop3 = i < 3;
            const isMe = highlightId && e.id === highlightId;
            return (
              <li
                key={e.id}
                className={`flex items-center gap-3 rounded-2xl border-2 px-4 ${
                  compact ? "py-2" : "py-3"
                } shadow-sm animate-float ${
                  isTop3 ? PODIUM_BG[i] : "bg-white border-periwinkle/15"
                } ${isMe ? "ring-2 ring-coral" : ""}`}
                style={{ animationDelay: `${Math.min(j, 12) * 30}ms` }}
              >
                <span className="w-9 text-center text-xl font-bold shrink-0">
                  {isTop3 ? MEDALS[i] : i + 1}
                </span>
                <span className="flex-1 font-semibold truncate">
                  {e.name}
                  {isMe && (
                    <span className="ms-2 text-xs text-coral">({t("you")})</span>
                  )}
                </span>
                <span className="font-extrabold text-periwinkle tabular-nums shrink-0">
                  {e.score.toLocaleString()}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
