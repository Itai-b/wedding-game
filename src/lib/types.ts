export type Lang = "he" | "en";

export type LocalizedText = { he: string; en: string };

export type QuestionType = "mc" | "order" | "categorize" | "map";

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  prompt: LocalizedText;
  /** Seconds allowed before the timer runs out. */
  timeLimit: number;
  /** Optional decorative Saar/Itai sticker(s) shown beside the prompt. */
  stickers?: string[];
}

export interface McOption {
  id: string;
  text: LocalizedText;
}

export interface McQuestion extends BaseQuestion {
  type: "mc";
  options: McOption[];
  correctId: string;
}

export interface OrderItem {
  id: string;
  text: LocalizedText;
}

export interface OrderQuestion extends BaseQuestion {
  type: "order";
  /** Items listed in the CORRECT order (top = first). */
  items: OrderItem[];
}

export interface CategorizeCategory {
  id: string;
  label: LocalizedText;
}

export interface CategorizeItem {
  id: string;
  text: LocalizedText;
  categoryId: string; // the correct bucket
}

export interface CategorizeQuestion extends BaseQuestion {
  type: "categorize";
  categories: CategorizeCategory[];
  items: CategorizeItem[];
}

export interface MapQuestion extends BaseQuestion {
  type: "map";
  /** Correct location to point at. */
  target: { lat: number; lng: number; label: LocalizedText };
  /** Tap within this distance (km) of the target = full credit. */
  fullCreditKm: number;
  /** Beyond this distance (km) = zero; in between scales linearly (closer = more). */
  zeroCreditKm: number;
}

export type Question =
  | McQuestion
  | OrderQuestion
  | CategorizeQuestion
  | MapQuestion;

export interface LeaderboardEntry {
  id: string; // player id
  name: string;
  score: number;
  updated_at?: string;
}
