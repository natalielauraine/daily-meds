"use client";

// Language context — stores the active language across the whole app.
// Persists the choice to localStorage so it's remembered on return visits.
// For Arabic, sets dir="rtl" on the HTML element so the whole page flips correctly.
// Usage: const { language, setLanguage, t } = useLanguage();
// Example: t("nav", "signIn") returns "Sign in" / "تسجيل الدخول" / etc.

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Language, LANGUAGES, translations, TranslationKey } from "./translations";

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  dir: "ltr" | "rtl";
  // Translate a string: t("nav", "signIn") → "Sign in" in current language
  t: (section: TranslationKey, key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: "en",
  setLanguage: () => {},
  dir: "ltr",
  t: (section, key) => {
    const sec = translations[section] as Record<string, Record<string, string>>;
    return sec?.[key]?.["en"] ?? key;
  },
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  // Load saved language from localStorage on first render
  useEffect(() => {
    const saved = localStorage.getItem("daily_meds_language") as Language | null;
    if (saved && LANGUAGES.find((l) => l.code === saved)) {
      applyLanguage(saved);
    }
  }, []);

  // Apply the language — update state, localStorage, and the HTML element attributes
  function applyLanguage(lang: Language) {
    const langConfig = LANGUAGES.find((l) => l.code === lang);
    if (!langConfig) return;

    setLanguageState(lang);
    localStorage.setItem("daily_meds_language", lang);

    // Set the HTML lang and dir attributes so the browser and screen readers know
    document.documentElement.lang = lang;
    document.documentElement.dir = langConfig.dir;
  }

  function setLanguage(lang: Language) {
    applyLanguage(lang);
  }

  const dir = LANGUAGES.find((l) => l.code === language)?.dir ?? "ltr";

  // Look up a translation string in the current language, falling back to English
  function t(section: TranslationKey, key: string): string {
    const sec = translations[section] as Record<string, Record<Language, string>>;
    return sec?.[key]?.[language] ?? sec?.[key]?.["en"] ?? key;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, dir, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Hook — use this in any component to get the current language and translate strings
export function useLanguage() {
  return useContext(LanguageContext);
}
