"use client";

import { AnswerPayload } from "./scoring";
import { hasSupabase, PLAYERS_TABLE, supabase } from "./supabase";
import { LeaderboardEntry } from "./types";

const PLAYER_ID_KEY = "wg_player_id";
const PLAYED_KEY = "wg_played";
const LOCAL_LB_KEY = "wg_leaderboard_local";
const LOCAL_EVENT = "wg_leaderboard_changed";

/* ---------------- player identity (best-effort one-attempt) ---------------- */

export function getPlayerId(): string {
  if (typeof window === "undefined") return "server";
  let id = localStorage.getItem(PLAYER_ID_KEY);
  if (!id) {
    id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `p_${Date.now()}_${Math.floor(Math.random() * 1e9)}`;
    localStorage.setItem(PLAYER_ID_KEY, id);
  }
  return id;
}

export function hasPlayed(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(PLAYED_KEY) === "1";
}

export function markPlayed(name: string, score: number) {
  try {
    localStorage.setItem(PLAYED_KEY, "1");
    localStorage.setItem("wg_last_name", name);
    localStorage.setItem("wg_last_score", String(score));
  } catch {}
}

export function getLastResult(): { name: string; score: number } | null {
  if (typeof window === "undefined") return null;
  const name = localStorage.getItem("wg_last_name");
  const score = localStorage.getItem("wg_last_score");
  if (name == null || score == null) return null;
  return { name, score: Number(score) };
}

/**
 * Host-only: wipe this device's play state so the game can be replayed.
 * Also drops the player id + name so each replay is a fresh entrant
 * (handy for testing or seeding the leaderboard).
 */
export function clearLocalPlayer() {
  [
    "wg_played",
    "wg_last_name",
    "wg_last_score",
    "wg_player_id",
    "wg_name",
    "wg_answers",
  ].forEach((k) => {
    try {
      localStorage.removeItem(k);
    } catch {}
  });
}

/* ---------------- this device's own answers (for the answer review) ---------------- */

const ANSWERS_KEY = "wg_answers";

/** Persist this player's per-question answers so the answers page can show
 * them whether they got each one right (keyed by question id). */
export function saveMyAnswers(answers: Record<string, AnswerPayload>) {
  try {
    localStorage.setItem(ANSWERS_KEY, JSON.stringify(answers));
  } catch {}
}

export function getMyAnswers(): Record<string, AnswerPayload> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(ANSWERS_KEY) || "{}");
  } catch {
    return {};
  }
}

/* ---------------- local (no-server) storage backend ---------------- */

function readLocal(): LeaderboardEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LOCAL_LB_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeLocal(entries: LeaderboardEntry[]) {
  localStorage.setItem(LOCAL_LB_KEY, JSON.stringify(entries));
  // notify same-tab listeners (storage event only fires cross-tab)
  window.dispatchEvent(new Event(LOCAL_EVENT));
}

/* ---------------- public API ---------------- */

export async function submitScore(name: string, score: number): Promise<void> {
  const id = getPlayerId();
  if (hasSupabase && supabase) {
    // Retry with backoff — on flaky venue Wi-Fi a guest's single finish-time
    // upsert must not be lost. The upsert is idempotent (keyed on player id).
    for (let attempt = 0; attempt < 4; attempt++) {
      const { error } = await supabase
        .from(PLAYERS_TABLE)
        .upsert({ id, name, score, updated_at: new Date().toISOString() }, {
          onConflict: "id",
        });
      if (!error) break;
      await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
    }
  } else {
    const entries = readLocal().filter((e) => e.id !== id);
    entries.push({ id, name, score });
    writeLocal(entries);
  }
  markPlayed(name, score);
}

/** Reserved player-ids used to store global game state in the same table. */
const STATE_ID = "__state__";
const OPEN_ID = "__open__";
const LB_ID = "__lb__";
const isRealPlayer = (e: LeaderboardEntry) => !e.id.startsWith("__");

/** Default: locked for guests until the wedding morning (Israel time, UTC+3). */
export const DEFAULT_OPEN_AT = Math.floor(
  new Date("2026-06-12T08:30:00+03:00").getTime() / 1000,
);

export async function fetchLeaderboard(
  limit = 100,
): Promise<LeaderboardEntry[]> {
  if (hasSupabase && supabase) {
    const { data } = await supabase
      .from(PLAYERS_TABLE)
      .select("id,name,score,updated_at")
      .order("score", { ascending: false })
      .limit(limit + 1);
    return (data ?? []).filter(isRealPlayer).slice(0, limit);
  }
  return readLocal()
    .filter(isRealPlayer)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/* ---------------- global game state (running vs finished) ---------------- */

export async function setGameFinished(finished: boolean): Promise<void> {
  if (hasSupabase && supabase) {
    await supabase.from(PLAYERS_TABLE).upsert(
      { id: STATE_ID, name: "state", score: finished ? 1 : 0, updated_at: new Date().toISOString() },
      { onConflict: "id" },
    );
  } else {
    localStorage.setItem("wg_finished", finished ? "1" : "0");
    window.dispatchEvent(new Event(LOCAL_EVENT));
  }
}

export interface GameState {
  /** Game over: locks out new players and reveals the answers. */
  finished: boolean;
  /** Leaderboard revealed to guests — a separate host action from finishing. */
  leaderboardShown: boolean;
  /** Unix seconds; guests can't join before this (admins always can). */
  openAt: number;
}

export async function getGameState(): Promise<GameState> {
  if (hasSupabase && supabase) {
    const { data } = await supabase
      .from(PLAYERS_TABLE)
      .select("id,score")
      .in("id", [STATE_ID, OPEN_ID, LB_ID]);
    const finished = (data?.find((r) => r.id === STATE_ID)?.score ?? 0) === 1;
    const leaderboardShown = (data?.find((r) => r.id === LB_ID)?.score ?? 0) === 1;
    const openRow = data?.find((r) => r.id === OPEN_ID);
    return {
      finished,
      leaderboardShown,
      openAt: openRow ? Number(openRow.score) : DEFAULT_OPEN_AT,
    };
  }
  if (typeof window === "undefined")
    return { finished: false, leaderboardShown: false, openAt: DEFAULT_OPEN_AT };
  const o = localStorage.getItem("wg_openat");
  return {
    finished: localStorage.getItem("wg_finished") === "1",
    leaderboardShown: localStorage.getItem("wg_lb_shown") === "1",
    openAt: o != null ? Number(o) : DEFAULT_OPEN_AT,
  };
}

/** Host-only: reveal or hide the leaderboard to all guests. */
export async function setLeaderboardShown(shown: boolean): Promise<void> {
  if (hasSupabase && supabase) {
    await supabase.from(PLAYERS_TABLE).upsert(
      { id: LB_ID, name: "lb", score: shown ? 1 : 0, updated_at: new Date().toISOString() },
      { onConflict: "id" },
    );
  } else {
    localStorage.setItem("wg_lb_shown", shown ? "1" : "0");
    window.dispatchEvent(new Event(LOCAL_EVENT));
  }
}

/** Set the moment guests can start (Unix seconds). Pass a past time to open now. */
export async function setOpenAt(seconds: number): Promise<void> {
  if (hasSupabase && supabase) {
    await supabase.from(PLAYERS_TABLE).upsert(
      { id: OPEN_ID, name: "open", score: Math.floor(seconds), updated_at: new Date().toISOString() },
      { onConflict: "id" },
    );
  } else {
    localStorage.setItem("wg_openat", String(Math.floor(seconds)));
    window.dispatchEvent(new Event(LOCAL_EVENT));
  }
}

/** Returns 1-based rank of a player id, or null if not present. */
export async function fetchRank(playerId: string): Promise<number | null> {
  const all = await fetchLeaderboard(1000);
  const idx = all.findIndex((e) => e.id === playerId);
  return idx === -1 ? null : idx + 1;
}

/** Poll interval (ms) used as a network-robust fallback alongside realtime.
 * Standings are only visible post-reveal, when ~200 guests may open the board
 * at once — 8s polling keeps that burst at ~25 req/s, well within Supabase
 * free-tier headroom, while realtime still delivers instant updates when
 * WebSockets work. */
const POLL_MS = 8000;

/** Ensures every subscriber gets a uniquely-named channel (multiple components
 * subscribe at once — e.g. the result page shows rank + the leaderboard list).
 * Reusing one topic makes supabase-js throw on the second subscribe. */
let channelSeq = 0;

export function subscribeLeaderboard(onChange: () => void): () => void {
  if (hasSupabase && supabase) {
    const client = supabase;
    // Primary: realtime push (instant) — works when WebSockets are allowed.
    const channel = client
      .channel(`leaderboard-${++channelSeq}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: PLAYERS_TABLE },
        () => onChange(),
      )
      .subscribe();
    // Safety net: poll every few seconds so the board stays live even on
    // networks that block/drop WebSockets (common at venues).
    const poll = setInterval(onChange, POLL_MS);
    return () => {
      clearInterval(poll);
      client.removeChannel(channel);
    };
  }
  // local fallback: same-tab custom event + cross-tab storage event
  const handler = () => onChange();
  window.addEventListener(LOCAL_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(LOCAL_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export async function resetLeaderboard(): Promise<void> {
  if (hasSupabase && supabase) {
    await supabase
      .from(PLAYERS_TABLE)
      .delete()
      .neq("id", "__none__"); // delete all rows
  } else {
    writeLocal([]);
  }
}
