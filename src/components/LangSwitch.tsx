"use client";

import { useI18n } from "@/lib/i18n";
import { Lang } from "@/lib/types";

export default function LangSwitch() {
  const { lang, setLang } = useI18n();
  const opts: { code: Lang; label: string }[] = [
    { code: "he", label: "עברית" },
    { code: "en", label: "English" },
  ];
  return (
    <div className="inline-flex rounded-full bg-white/70 backdrop-blur border border-periwinkle/20 p-1 shadow-sm">
      {opts.map((o) => (
        <button
          key={o.code}
          onClick={() => setLang(o.code)}
          className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-colors ${
            lang === o.code
              ? "bg-periwinkle text-white"
              : "text-ink/60 hover:text-ink"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
