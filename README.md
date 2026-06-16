# 💍 Saar & Itai — Wedding Game

A self-paced, **scan-to-play** wedding trivia game (Kahoot-style with speed scoring), built for a
real wedding and battle-tested with ~150 guests. Bilingual **Hebrew (default, RTL) + English (LTR)**,
a **live leaderboard with a winners' podium**, a **host/admin screen**, and printable **QR posters +
winner certificates**.

> The trivia in `src/lib/questions.ts` is the couple's real content, kept here **as an example** —
> swap in your own questions to reuse this for any event.

---

## ✨ Features

- **4 question types** — multiple-choice, drag-to-order (timeline), categorize ("who's who?"),
  and a tap-the-globe **map pin** (distance-based scoring).
- **Speed scoring** — logarithmic decay, so answering correctly *faster* earns more.
- **Live leaderboard** — realtime via Supabase, with a 🥇🥈🥉 **podium** and full standings.
- **Host/admin screen** (`/admin`) — join QR, live board, scheduled open-time, "finish & reveal
  answers", "show leaderboard", reset, and replay — all password-protected (checked server-side).
- **Answer review** — after the host reveals, each player sees **which they got right/wrong** and
  the correct answers.
- **Guest-friendly UX** — a short "get ready" primer before the non-multiple-choice questions,
  "can't submit blank" guards, big tap targets, a numeric countdown, pinch-zoom, 18px base font.
- **Bilingual + RTL** — every player-facing string is in `src/lib/i18n.tsx` (he/en); direction
  flips automatically.
- **Works offline-ish** — with no Supabase configured it runs in **local mode** (scores in the
  browser), so you can develop and demo on one device.
- **Print materials** — generate a scan-to-play **QR poster** and **winner certificates** as
  standalone HTML (`tools/build-print-docs.mjs`).

## 🧱 Tech stack

[Next.js 16](https://nextjs.org) (App Router) · React 19 · TypeScript · Tailwind CSS v4 ·
[Supabase](https://supabase.com) (Postgres + Realtime) · deployed on [Vercel](https://vercel.com).

## 📱 Screens

| Route | What it is |
|------|------------|
| `/` | Landing — start the game / "play anytime" (see **Modes** below) |
| `/play` | The quiz, one question at a time with a draining timer |
| `/result` | Your score |
| `/answers` | Per-question correct answers + your own right/wrong |
| `/leaderboard` | Podium + full standings |
| `/admin` | Host controls (password-protected) |

---

## 🚀 Getting started

```bash
npm install
npm run dev          # http://localhost:3000
```

With no environment variables set, the app runs in **local mode** (scores saved only in the
browser) — perfect for trying the whole flow on one device.

### Environment variables

Copy the template and fill it in:

```bash
cp .env.local.example .env.local
```

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | for shared leaderboard | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | for shared leaderboard | Supabase anon public key |
| `ADMIN_PASSWORD` | for `/admin` | Host-screen password (checked server-side, never shipped to the client) |

**No real secrets are committed** — `.env.local` is git-ignored; only the placeholder
`.env.local.example` is tracked.

### Supabase (live leaderboard)

1. Create a free project at [supabase.com](https://supabase.com).
2. SQL Editor → paste [`supabase/schema.sql`](supabase/schema.sql) → **Run**.
3. Project Settings → API → copy the **Project URL** and **anon public** key into `.env.local`.

### Deploy (Vercel)

Import the repo at [vercel.com](https://vercel.com), add the three env vars above, and deploy.
You'll get a permanent `https://…vercel.app` link; `/admin` shows the QR code that points guests
at the game.

---

## 🎛️ Modes

The app supports two phases of an event, switched in code:

- **Live event** — guests enter a name, play once, and scores stream to the **live leaderboard**;
  the host reveals answers and standings from `/admin`.
- **Post-event "play anytime"** *(current state of `main`)* — a thank-you landing, **unlimited
  replays with no registration**, answers always viewable, and the **leaderboard frozen** (replays
  never write to the DB) while the winners' podium stays on display.

## 🎨 Customizing

- **Questions** → `src/lib/questions.ts` (bilingual; supports the 4 question types).
- **UI text** → `src/lib/i18n.tsx`.
- **Theme colors / fonts** → `src/app/globals.css`.
- **Stickers** → `public/emojis/` (custom illustrations; generated from sheets via
  `tools/extract-emojis.mjs`).
- **Print posters / certificates** → run `node tools/build-print-docs.mjs` → outputs to
  `src/documents/` (git-ignored), then open & print to PDF.

## 📂 Project structure

```
src/
  app/            # routes: /, play, result, answers, leaderboard, admin, api/admin-auth
  components/     # question types, Leaderboard/podium, Prizes, Sticker, …
  lib/            # questions.ts, i18n.tsx, scoring.ts, leaderboard.ts, supabase.ts
public/emojis/    # custom stickers
supabase/         # schema.sql
tools/            # emoji extraction + print-doc generator
```

## 📝 Notes

- **One attempt per guest** (live mode) is best-effort and per-device — fine for a party, not
  bulletproof.
- The map question uses a public-domain equirectangular world map (`public/world.jpg`).
- The questions and couple details are **example content** — replace them to make it yours.

## 💛 Acknowledgements

Built with [Claude Code](https://claude.com/claude-code). Made with love for Saar & Itai. 💍
