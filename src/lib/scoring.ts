import {
  CategorizeQuestion,
  MapQuestion,
  McQuestion,
  OrderQuestion,
  Question,
} from "./types";

export const BASE_POINTS = 1000;

/**
 * Speed factor with LOGARITHMIC decay. An instant correct answer is worth
 * BASE_POINTS; the bonus falls fast in the first seconds and flattens out,
 * so the race is decided by who answers quickest while a slow-but-correct
 * answer at the 5-minute buzzer still earns half. Wrong answers score 0
 * regardless of speed (handled by the correctness fraction).
 *
 * factor(t) = 1 − 0.5 · ln(1 + k·t/T) / ln(1 + k),  k = 59
 *   t = 5s  → ×0.93   t = 30s → ×0.76   t = 60s → ×0.69
 *   t = 150s → ×0.58  t = 300s → ×0.50
 */
export function speedFactor(timeUsedMs: number, timeLimitSec: number): number {
  const K = 59;
  const limit = Math.max(1, timeLimitSec) * 1000;
  const frac = Math.min(1, Math.max(0, timeUsedMs / limit));
  return 1 - (0.5 * Math.log(1 + K * frac)) / Math.log(1 + K);
}

/** Great-circle distance between two lat/lng points, in kilometers. */
export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/* ---------- Correctness fraction per question type (0..1) ---------- */

export function mcFraction(q: McQuestion, answerId: string | null): number {
  return answerId === q.correctId ? 1 : 0;
}

export function orderFraction(q: OrderQuestion, orderedIds: string[]): number {
  const correct = q.items.map((i) => i.id);
  if (orderedIds.length !== correct.length) return 0;
  let hits = 0;
  for (let i = 0; i < correct.length; i++) {
    if (orderedIds[i] === correct[i]) hits++;
  }
  return hits / correct.length;
}

export function categorizeFraction(
  q: CategorizeQuestion,
  assignments: Record<string, string | null>,
): number {
  if (q.items.length === 0) return 0;
  let hits = 0;
  for (const item of q.items) {
    if (assignments[item.id] === item.categoryId) hits++;
  }
  return hits / q.items.length;
}

export function mapFraction(
  q: MapQuestion,
  pin: { lat: number; lng: number } | null,
): number {
  if (!pin) return 0;
  const dist = haversineKm(pin, q.target);
  if (dist <= q.fullCreditKm) return 1; // pointed at the USA → full credit
  if (dist >= q.zeroCreditKm) return 0;
  // Linear falloff: the closer the pin is to the USA, the more points.
  return 1 - (dist - q.fullCreditKm) / (q.zeroCreditKm - q.fullCreditKm);
}

export interface AnswerPayload {
  // exactly one of these is set, depending on question type
  mcAnswerId?: string | null;
  orderedIds?: string[];
  assignments?: Record<string, string | null>;
  pin?: { lat: number; lng: number } | null;
}

export interface ScoreResult {
  fraction: number; // 0..1 correctness
  points: number; // points earned for this question
  correct: boolean; // fully correct?
}

/** The fully-correct answer for a question — used to render the answers review. */
export function solutionAnswer(q: Question): AnswerPayload {
  switch (q.type) {
    case "mc":
      return { mcAnswerId: q.correctId };
    case "order":
      return { orderedIds: q.items.map((i) => i.id) };
    case "categorize":
      return {
        assignments: Object.fromEntries(q.items.map((i) => [i.id, i.categoryId])),
      };
    case "map":
      // No user pin — the reveal renders the target marker (🎯) on its own,
      // so the answers page shows the correct location without implying a guess.
      return { pin: null };
  }
}

export function scoreQuestion(
  q: Question,
  answer: AnswerPayload,
  timeUsedMs: number,
): ScoreResult {
  let fraction = 0;
  switch (q.type) {
    case "mc":
      fraction = mcFraction(q, answer.mcAnswerId ?? null);
      break;
    case "order":
      fraction = orderFraction(q, answer.orderedIds ?? []);
      break;
    case "categorize":
      fraction = categorizeFraction(q, answer.assignments ?? {});
      break;
    case "map":
      fraction = mapFraction(q, answer.pin ?? null);
      break;
  }
  const points =
    fraction > 0
      ? Math.round(BASE_POINTS * fraction * speedFactor(timeUsedMs, q.timeLimit))
      : 0;
  return { fraction, points, correct: fraction >= 0.999 };
}
