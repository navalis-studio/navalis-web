import { useState, useEffect, useRef } from "react";
import { useLanguage } from "../../contexts/LanguageContext";

export function LanguageSelector() {
  const { language, changeLanguage, languages } = useLanguage();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const current = languages.find((l) => l.code === language) || languages[0];

  // Close dropdown on click outside
  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    const timer = setTimeout(() => {
      document.addEventListener("pointerdown", handleClickOutside);
    }, 50);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("pointerdown", handleClickOutside);
    };
  }, [open]);

  function handleSelect(code) {
    changeLanguage(code);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Pill button showing current flag */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-8 h-8 sm:w-10 sm:h-10 bg-ink-black border-[2px] border-paper-white rounded-full shadow-[3px_3px_0px_0px_rgba(255,255,255,0.3)] flex items-center justify-center transition-all hover:scale-110 active:scale-95 select-none"
        aria-label="Change language"
      >
        <span className="font-mono text-[9px] sm:text-[11px] font-bold text-paper-white tracking-[0.05em] uppercase">
          {current.code}
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute bottom-full right-0 mb-2 bg-paper-white border-[3px] border-ink-black rounded-xl shadow-[4px_4px_0px_0px_#000] overflow-hidden z-50 min-w-[140px]">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 font-mono text-[11px] font-bold tracking-[0.05em] transition-colors ${
                lang.code === language
                  ? "bg-ink-black text-paper-white"
                  : "text-ink-black hover:bg-light-grain"
              }`}
            >
              <span className="text-base">{lang.flag}</span>
              <span className="uppercase">{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
