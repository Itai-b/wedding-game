import type { ReactNode } from "react";

/**
 * Renders a question prompt with light inline formatting so the main question
 * stays prominent:
 *   *word*   → bold emphasis (e.g. "*not*")
 *   (aside)  → smaller, muted text relative to the heading
 */
export default function QuestionPrompt({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  const re = /\*([^*]+)\*|(\([^()]*\))/g;
  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[1] !== undefined) {
      parts.push(
        <strong key={key++} className="font-extrabold underline decoration-2 underline-offset-2">
          {m[1]}
        </strong>,
      );
    } else {
      parts.push(
        <span key={key++} className="text-[0.85em] font-medium text-ink/70">
          {m[2]}
        </span>,
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}
