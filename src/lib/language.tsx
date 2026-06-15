import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "es" | "en" | "sv";

type LanguageContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
};

const STORAGE_KEY = "nl_lang";

const LanguageContext = createContext<LanguageContextValue>({
  lang: "es",
  setLang: () => {},
});

function detectLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "es" || saved === "en" || saved === "sv") return saved;
    const b = navigator.language?.toLowerCase() ?? "";
    if (b.startsWith("sv")) return "sv";
    if (b.startsWith("es")) return "es";
    if (b.startsWith("en")) return "en";
  } catch {
    /* no-op */
  }
  return "es";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("es");

  useEffect(() => {
    setLangState(detectLang());
  }, []);

  const setLang = (next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
      document.documentElement.lang = next;
    } catch {
      /* no-op */
    }
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>{children}</LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
