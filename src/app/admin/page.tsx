"use client";

import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import Leaderboard from "@/components/Leaderboard";
import LangSwitch from "@/components/LangSwitch";
import { useI18n } from "@/lib/i18n";
import {
  clearLocalPlayer,
  DEFAULT_OPEN_AT,
  fetchLeaderboard,
  getGameState,
  resetLeaderboard,
  setGameFinished,
  setLeaderboardShown,
  setOpenAt,
  subscribeLeaderboard,
} from "@/lib/leaderboard";

// Israel-time helpers for the datetime-local field. The offset is computed from
// the actual Asia/Jerusalem zone for the given instant, so DST is handled
// correctly (IDT +03 in summer, IST +02 in winter) rather than hardcoded.
const ISRAEL_TZ = "Asia/Jerusalem";

/** Minutes that Asia/Jerusalem is ahead of UTC at the given instant. */
function israelOffsetMinutes(utcMs: number) {
  const p = new Intl.DateTimeFormat("en-US", {
    timeZone: ISRAEL_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(new Date(utcMs));
  const g = (t: string) => Number(p.find((x) => x.type === t)!.value);
  // %24 guards the "24:00" midnight quirk some engines produce.
  const asIfUtc = Date.UTC(g("year"), g("month") - 1, g("day"), g("hour") % 24, g("minute"), g("second"));
  return Math.round((asIfUtc - utcMs) / 60000);
}

function epochToIsraelInput(sec: number) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: ISRAEL_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(sec * 1000));
  const g = (t: string) => parts.find((p) => p.type === t)!.value;
  return `${g("year")}-${g("month")}-${g("day")}T${(g("hour") === "24" ? "00" : g("hour"))}:${g("minute")}`;
}

function israelInputToEpoch(v: string) {
  const [date, time] = v.split("T");
  const [y, mo, d] = date.split("-").map(Number);
  const [h, mi] = time.split(":").map(Number);
  const asIfUtc = Date.UTC(y, mo - 1, d, h, mi);
  // Correct by the zone offset at that instant (approximated at asIfUtc).
  return Math.floor((asIfUtc - israelOffsetMinutes(asIfUtc) * 60000) / 1000);
}
function fmtIsrael(sec: number) {
  return new Date(sec * 1000).toLocaleString("en-GB", {
    timeZone: "Asia/Jerusalem",
    dateStyle: "medium",
    timeStyle: "short",
  });
}
import { hasSupabase } from "@/lib/supabase";

const AUTH_KEY = "wg_admin_ok";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setAuthed(sessionStorage.getItem(AUTH_KEY) === "1");
    setChecked(true);
  }, []);

  if (!checked) {
    return <div className="min-h-dvh grid place-items-center text-ink/40">…</div>;
  }
  return authed ? <Dashboard /> : <Gate onPass={() => setAuthed(true)} />;
}

function Gate({ onPass }: { onPass: () => void }) {
  const { t } = useI18n();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!password) return;
    setBusy(true);
    setError(false);
    try {
      const res = await fetch("/api/admin-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        sessionStorage.setItem(AUTH_KEY, "1");
        onPass();
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-dvh flex flex-col items-center px-5 py-8">
      <div className="w-full max-w-sm flex justify-end mb-2">
        <LangSwitch />
      </div>
      <div className="w-full max-w-sm flex-1 flex flex-col justify-center">
        <div className="bg-white/85 backdrop-blur rounded-3xl shadow-lg p-7 animate-pop">
          <h1 className="text-2xl font-extrabold text-periwinkle text-center mb-1">
            {t("adminLocked")}
          </h1>
          <p className="text-center text-ink/60 text-sm mb-5">
            {t("adminPasswordPrompt")}
          </p>
          <input
            type="password"
            dir="ltr"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(false);
            }}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder={t("passwordPlaceholder")}
            autoFocus
            className={`w-full rounded-2xl border-2 px-4 py-3.5 text-lg outline-none transition-colors ${
              error ? "border-rose-400" : "border-periwinkle/30 focus:border-periwinkle"
            }`}
          />
          {error && (
            <p className="text-rose-500 text-sm mt-1.5">{t("wrongPassword")}</p>
          )}
          <button
            onClick={submit}
            disabled={busy || !password}
            className="w-full mt-5 bg-periwinkle text-white font-extrabold text-lg rounded-2xl py-4 shadow-md active:scale-[0.98] transition-transform disabled:opacity-40"
          >
            {t("enter")}
          </button>
        </div>
      </div>
    </main>
  );
}

function Dashboard() {
  const { t } = useI18n();
  const router = useRouter();
  const [origin, setOrigin] = useState("");
  const [count, setCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [lbShown, setLbShown] = useState(false);
  const [openAt, setOpenAtState] = useState(DEFAULT_OPEN_AT);
  const [timeInput, setTimeInput] = useState("");
  const [savedMsg, setSavedMsg] = useState(false);
  const [nowMs, setNowMs] = useState(Date.now());

  function replay() {
    clearLocalPlayer();
    router.push("/");
  }

  useEffect(() => {
    setOrigin(window.location.origin);
    const load = () => {
      fetchLeaderboard(1000).then((e) => setCount(e.length));
      getGameState().then((s) => {
        setFinished(s.finished);
        setLbShown(s.leaderboardShown);
        setOpenAtState(s.openAt);
        setTimeInput((prev) => prev || epochToIsraelInput(s.openAt));
      });
    };
    load();
    const unsub = subscribeLeaderboard(load);
    return unsub;
  }, []);

  // Tick only while guests are still locked, so the "Locked until → Open" status
  // flips at the open time; stop ticking once it opens.
  useEffect(() => {
    if (Date.now() / 1000 >= openAt) return;
    const id = setInterval(() => {
      const t = Date.now();
      setNowMs(t);
      if (t / 1000 >= openAt) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [openAt]);

  async function onReset() {
    if (window.confirm(t("resetConfirm"))) {
      await resetLeaderboard();
      setFinished(false);
      setLbShown(false);
      setOpenAtState(DEFAULT_OPEN_AT);
      setTimeInput(epochToIsraelInput(DEFAULT_OPEN_AT));
    }
  }

  async function onFinish() {
    if (window.confirm(t("finishConfirm"))) {
      await setGameFinished(true);
      setFinished(true);
    }
  }

  async function onReopen() {
    await setGameFinished(false);
    setFinished(false);
  }

  async function onToggleLeaderboard() {
    const next = !lbShown;
    await setLeaderboardShown(next);
    setLbShown(next);
  }

  async function applyOpenAt(sec: number) {
    await setOpenAt(sec);
    setOpenAtState(sec);
    setTimeInput(epochToIsraelInput(sec));
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 1500);
  }

  const guestsLocked = nowMs / 1000 < openAt;

  return (
    <main className="min-h-dvh px-5 py-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold text-periwinkle">
            💍 {t("coupleNames")} · {t("adminTitle")}
          </h1>
          <LangSwitch />
        </div>

        <div className="grid md:grid-cols-[320px_1fr] gap-6 items-start">
          {/* QR + controls */}
          <div className="bg-white/85 backdrop-blur rounded-3xl shadow-lg p-6 flex flex-col items-center">
            <h2 className="text-lg font-bold mb-3">{t("scanToPlay")}</h2>
            {origin && (
              <div className="bg-white p-3 rounded-2xl shadow-inner">
                <QRCodeSVG
                  value={origin}
                  size={220}
                  fgColor="#6e80d4"
                  level="M"
                  marginSize={1}
                />
              </div>
            )}
            <p className="mt-3 text-sm text-ink/60 break-all text-center">
              {origin}
            </p>

            <div className="mt-5 w-full text-center">
              <p className="text-3xl font-extrabold text-coral">{count}</p>
              <p className="text-sm text-ink/60">{t("playersCount", { n: count })}</p>
            </div>

            <div
              className={`mt-4 w-full text-center text-sm font-bold rounded-xl py-2 ${
                finished ? "bg-ink/10 text-ink/70" : "bg-sage/15 text-sage"
              }`}
            >
              {finished ? t("gameOver") : t("gameLive")}
            </div>
            {finished ? (
              <button
                onClick={onReopen}
                className="mt-3 w-full bg-periwinkle/15 text-periwinkle font-bold rounded-2xl py-3 active:scale-[0.98]"
              >
                {t("reopenGame")}
              </button>
            ) : (
              <button
                onClick={onFinish}
                className="mt-3 w-full bg-gold text-white font-bold rounded-2xl py-3 shadow active:scale-[0.98]"
              >
                {t("finishGame")}
              </button>
            )}

            {/* Leaderboard reveal — a separate step from finishing the game */}
            <div
              className={`mt-3 w-full text-center text-sm font-bold rounded-xl py-2 ${
                lbShown ? "bg-periwinkle/15 text-periwinkle" : "bg-ink/10 text-ink/60"
              }`}
            >
              {lbShown ? t("lbShownStatus") : t("lbHiddenStatus")}
            </div>
            <button
              onClick={onToggleLeaderboard}
              className={`mt-2 w-full font-bold rounded-2xl py-3 active:scale-[0.98] ${
                lbShown
                  ? "bg-ink/10 text-ink/70"
                  : "bg-periwinkle text-white shadow"
              }`}
            >
              {lbShown ? t("hideLeaderboardBtn") : t("showLeaderboardBtn")}
            </button>

            {/* open-time control */}
            <div className="mt-4 w-full border-t border-ink/10 pt-4">
              <p className="text-sm font-semibold mb-1">{t("openTimeLabel")}</p>
              <p
                className={`text-xs mb-2 ${guestsLocked ? "text-amber-700" : "text-sage"}`}
              >
                {guestsLocked
                  ? `${t("lockedUntilShort")} ${fmtIsrael(openAt)}`
                  : t("openNowLabel")}
              </p>
              <input
                type="datetime-local"
                value={timeInput}
                onChange={(e) => setTimeInput(e.target.value)}
                className="w-full rounded-xl border-2 border-periwinkle/30 px-3 py-2 text-sm outline-none focus:border-periwinkle"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => timeInput && applyOpenAt(israelInputToEpoch(timeInput))}
                  className="flex-1 bg-periwinkle text-white font-semibold rounded-xl py-2 text-sm active:scale-[0.98]"
                >
                  {savedMsg ? t("saved") : t("saveTime")}
                </button>
                {guestsLocked ? (
                  <button
                    onClick={() => applyOpenAt(Math.floor(Date.now() / 1000) - 5)}
                    className="flex-1 bg-sage text-white font-semibold rounded-xl py-2 text-sm active:scale-[0.98]"
                  >
                    {t("unlockNow")}
                  </button>
                ) : (
                  <button
                    onClick={() => applyOpenAt(DEFAULT_OPEN_AT)}
                    className="flex-1 bg-ink/10 text-ink/70 font-semibold rounded-xl py-2 text-sm active:scale-[0.98]"
                  >
                    {t("lockGuests")}
                  </button>
                )}
              </div>
            </div>

            <button
              onClick={replay}
              className="mt-5 w-full bg-periwinkle text-white font-bold rounded-2xl py-3 shadow active:scale-[0.98]"
            >
              {t("hostReplay")}
            </button>
            <p className="mt-1.5 text-xs text-ink/50 text-center">
              {t("hostReplayNote")}
            </p>

            <button
              onClick={onReset}
              className="mt-4 w-full bg-rose-500 text-white font-bold rounded-2xl py-3 shadow active:scale-[0.98]"
            >
              {t("resetGame")}
            </button>

            {!hasSupabase && (
              <p className="mt-4 text-xs text-amber-700 bg-amber-50 rounded-xl px-3 py-2 text-center">
                {t("localModeNote")}
              </p>
            )}
          </div>

          {/* Live leaderboard */}
          <div className="bg-white/70 backdrop-blur rounded-3xl shadow-lg p-6">
            <h2 className="text-xl font-extrabold text-center text-periwinkle mb-4">
              🏆 {t("liveLeaderboard")}
            </h2>
            <Leaderboard limit={100} />
          </div>
        </div>
      </div>
    </main>
  );
}
