"use client";

// LanguageSelector — a compact dropdown in the navbar for switching language.
// Shows the flag + language name of the currently selected language.
// Clicking opens a small dropdown with all 4 language options.
// Arabic automatically switches the whole app to RTL layout.

import { useState, useRef, useEffect } from "react";
import { LANGUAGES } from "../../lib/translations";
import { useLanguage } from "../../lib/language-context";

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0];

  // Close the dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Current language button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] text-xs transition-colors hover:bg-white/[0.06]"
        style={{
          color: "rgba(255,255,255,0.55)",
          border: "0.5px solid rgba(255,255,255,0.1)",
        }}
        aria-label="Change language"
      >
        <span>{current.flag}</span>
        <span className="hidden sm:inline" style={{ fontWeight: 500 }}>{current.label}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="currentColor"
          style={{ opacity: 0.5, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}
        >
          <path d="M7 10l5 5 5-5z"/>
        </svg>
      </button>

      {/* Dropdown menu */}
      {open && (
        <div
          className="absolute top-full mt-1.5 right-0 rounded-[10px] py-1 z-50 min-w-[140px]"
          style={{
            backgroundColor: "#1A1A2E",
            border: "0.5px solid rgba(255,255,255,0.1)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => { setLanguage(lang.code); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left transition-colors hover:bg-white/[0.05]"
              style={{
                color: lang.code === language ? "white" : "rgba(255,255,255,0.5)",
                fontWeight: lang.code === language ? 500 : 400,
              }}
            >
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
              {lang.code === language && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#8B5CF6" className="ml-auto shrink-0">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
