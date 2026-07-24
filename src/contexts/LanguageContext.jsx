import { createContext, useContext, useState, useCallback, useMemo } from "react";
import pt from "../locales/pt.json";
import en from "../locales/en.json";
import es from "../locales/es.json";
import ja from "../locales/ja.json";

const locales = { pt, en, es, ja };

export const LANGUAGES = [
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
];

const LanguageContext = createContext(null);

function getNestedValue(obj, path) {
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem("navalis_language");
    if (saved && locales[saved]) return saved;
    // Detect browser language
    const browserLang = (navigator.language || "").split("-")[0].toLowerCase();
    return locales[browserLang] ? browserLang : "pt";
  });

  const changeLanguage = useCallback((code) => {
    if (locales[code]) {
      setLanguage(code);
      localStorage.setItem("navalis_language", code);
    }
  }, []);

  const t = useCallback(
    (key) => {
      const value = getNestedValue(locales[language], key);
      if (value === undefined) {
        // Fallback to Portuguese, then return the key itself
        const fallback = getNestedValue(locales.pt, key);
        return fallback !== undefined ? fallback : key;
      }
      return value;
    },
    [language],
  );

  // Translate error codes from backend (e.g. "error.username_taken" → translated message)
  // If the code is not found in the errors section, return the original string as-is
  const translateError = useCallback(
    (message) => {
      if (!message) return message;
      // Check if it's an error code (starts with "error.")
      const translated = locales[language]?.errors?.[message];
      if (translated) return translated;
      // Fallback to PT
      const fallback = locales.pt?.errors?.[message];
      if (fallback) return fallback;
      // Not a known code — return original string
      return message;
    },
    [language],
  );

  const value = useMemo(
    () => ({ language, changeLanguage, t, translateError, languages: LANGUAGES }),
    [language, changeLanguage, t, translateError],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
