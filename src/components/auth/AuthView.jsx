import { useState } from "react";
import { NeonInput } from "../shared/NeonInput";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import navalisName from "../../img/black_navalis_name.png";
import navalisShip from "../../img/black_navalis_ship.png";

export function AuthView() {
  const { login, register, error, clearError } = useAuth();
  const { t, translateError } = useLanguage();
  const [tab, setTab] = useState("login");
  const [name, setName] = useState("");
  const [pwd, setPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLocalError(null);
    clearError();

    const username = name.trim();
    if (!username || !pwd) {
      setLocalError(t('auth.errorEmpty'));
      return;
    }

    if (tab === "register" && pwd !== confirmPwd) {
      setLocalError(t('auth.errorMismatch'));
      return;
    }

    setSubmitting(true);
    try {
      if (tab === "login") {
        await login(username, pwd);
      } else {
        await register(username, pwd);
      }
    } catch {
      // Error is handled by context
    } finally {
      setSubmitting(false);
    }
  }

  const displayError = localError || error;

  return (
    <div className="min-h-screen flex items-center justify-center px-8 py-2 relative">
      {/* Card branco - Ink & Iron style */}
      <div className="w-full max-w-[380px] 2xl:max-w-[460px] bg-paper-white ink-border-heavy rounded-xl hard-shadow relative overflow-hidden flex flex-col z-10">
        {/* Cantos decorativos - círculos pretos */}
        <div className="absolute top-2 left-2 w-4 h-4 rounded-full bg-ink-black" />
        <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-ink-black" />
        <div className="absolute bottom-2 left-2 w-4 h-4 rounded-full bg-ink-black" />
        <div className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-ink-black" />

        {/* Borda interna tracejada */}
        <div className="absolute inset-4 border-2 border-ink-black rounded-lg pointer-events-none opacity-50 border-dashed" />

        {/* Conteúdo */}
        <div className="p-6 pt-7 pb-7 2xl:p-8 2xl:pt-10 2xl:pb-10 flex flex-col items-center relative z-20">
          {/* Logo - Título + Navio animado */}
          <div className="mb-1 2xl:mb-4 flex flex-col items-center">
            {/* Título NAVALIS */}
            <img
              src={navalisName}
              alt="Navalis"
              className="w-40 2xl:w-60 h-auto"
              draggable="false"
            />
            {/* Navio com walk-in-place animation */}
            <div className="ship-walk mt-0">
              <img src={navalisShip} alt="" className="w-20 2xl:w-40 h-auto" draggable="false" />
            </div>
          </div>

          {/* Tagline */}
          <p className="font-display text-sm 2xl:text-xl font-semibold text-ink-black text-center mb-3 2xl:mb-6 px-4 leading-tight">
            {t('auth.tagline')}
          </p>

          {/* Tabs Login/Register - pill com hard shadow */}
          <div className="flex w-full max-w-[240px] 2xl:max-w-xs mb-4 2xl:mb-5 rounded-full ink-border hard-shadow-sm overflow-hidden">
            {["login", "register"].map((tabKey) => (
              <button
                key={tabKey}
                type="button"
                tabIndex={-1}
                onClick={() => {
                  setTab(tabKey);
                  setLocalError(null);
                  clearError();
                }}
                className={`flex-1 py-1.5 2xl:py-2.5 font-mono text-[11px] 2xl:text-[12px] font-bold tracking-[0.1em] uppercase transition-all ${
                  tab === tabKey
                    ? "bg-ink-black text-paper-white"
                    : "bg-paper-white text-ink-black hover:bg-light-grain"
                }`}
              >
                {tabKey === "login" ? t('auth.login') : t('auth.register')}
              </button>
            ))}
          </div>

          {/* Error message */}
          {displayError && (
            <div className="w-full max-w-sm px-4 py-2 mb-4 text-sm text-center font-sans text-ink-black bg-light-grain ink-border rounded-lg">
              {translateError(displayError)}
            </div>
          )}

          {/* Form */}
          <form
            className="w-full max-w-xs 2xl:max-w-sm space-y-3.5 2xl:space-y-4"
            onSubmit={handleSubmit}
          >
            <NeonInput label={t('auth.username')} value={name} onChange={setName} placeholder={t('auth.usernamePlaceholder')} />
            <NeonInput
              label={t('auth.password')}
              type="password"
              value={pwd}
              onChange={setPwd}
              placeholder="••••••••"
            />
            {tab === "register" && (
              <NeonInput
                label={t('auth.confirmPassword')}
                type="password"
                value={confirmPwd}
                onChange={setConfirmPwd}
                placeholder="••••••••"
              />
            )}

            {/* Botão submit - rubber button */}
            <div className="pt-1 2xl:pt-2">
              <button
                type="submit"
                disabled={submitting}
                className={`w-[85%] mx-auto bg-ink-black text-paper-white font-display text-[15px] 2xl:text-[20px] font-extrabold py-2 2xl:py-2.5 px-4 rounded-full ink-border hard-shadow uppercase flex items-center justify-center gap-2 transition-all ${
                  submitting
                    ? "opacity-50 cursor-wait"
                    : "hover:scale-105 hover:scale-y-95 active:scale-95 active:scale-y-105"
                }`}
                onMouseEnter={(e) => {
                  if (!submitting)
                    e.currentTarget.style.animation = "boil 0.3s infinite alternate steps(2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.animation = "none";
                }}
              >
                <span>{submitting ? t('auth.wait') : tab === "login" ? t('auth.enterButton') : t('auth.registerButton')}</span>
                {!submitting && (
                  <span
                    className="material-symbols-outlined"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {tab === "login" ? "login" : "how_to_reg"}
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Credits */}
      <a
        href="https://github.com/jhowzluk"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-4 right-4 font-mono text-[12px] font-bold text-paper-white hover:text-paper-white/60 transition-colors tracking-[0.1em]"
      >
        {t('credits')} @jhowzluk
      </a>

      {/* Walk-in-place animation styles */}
      <style>{`
        .ship-walk {
          animation: ship-bounce 2.2s ease-in-out infinite;
        }

        .ship-walk img {
          animation: ship-sway 1.8s ease-in-out infinite;
          transform-origin: center bottom;
        }

        @keyframes ship-bounce {
          0%, 100% {
            transform: translateY(0);
          }
          15% {
            transform: translateY(-6px) scaleY(1.03) scaleX(0.97);
          }
          40% {
            transform: translateY(0) scaleY(0.97) scaleX(1.02);
          }
          65% {
            transform: translateY(-6px) scaleY(1.03) scaleX(0.97);
          }
          90% {
            transform: translateY(0) scaleY(0.97) scaleX(1.02);
          }
        }

        @keyframes ship-sway {
          0%, 100% {
            transform: rotate(-2deg);
          }
          50% {
            transform: rotate(2deg);
          }
        }
      `}</style>
    </div>
  );
}
