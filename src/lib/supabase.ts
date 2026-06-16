import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** True when Supabase env vars are configured (i.e. after deploy setup). */
export const hasSupabase = Boolean(url && anonKey);

/**
 * Shared Supabase browser client, or null when not configured.
 * When null, the app transparently falls back to localStorage (see leaderboard.ts),
 * so everything is fully playable on a single device during local development.
 */
export const supabase: SupabaseClient | null = hasSupabase
  ? createClient(url as string, anonKey as string, {
      realtime: { params: { eventsPerSecond: 5 } },
    })
  : null;

export const PLAYERS_TABLE = "players";
