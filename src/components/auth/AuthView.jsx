import { useState } from "react";
import { NeonInput } from "../shared/NeonInput";
import { useAuth } from "../../contexts/AuthContext";
import navalisName from "../../img/black_navalis_name.png";
import navalisShip from "../../img/black_navalis_ship.png";

export function AuthView() {
  const { login, register, error, clearError } = useAuth();
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
      setLocalError("Preencha todos os campos.");
      return;
    }

    if (tab === "register" && pwd !== confirmPwd) {
      setLocalError("As senhas não coincidem.");
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
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Card branco - Ink & Iron style */}
      <div className="w-full max-w-lg bg-paper-white ink-border-heavy rounded-xl hard-shadow relative overflow-hidden flex flex-col z-10 scale-90">
        {/* Cantos decorativos - círculos pretos */}
        <div className="absolute top-2 left-2 w-4 h-4 rounded-full bg-ink-black" />
        <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-ink-black" />
        <div className="absolute bottom-2 left-2 w-4 h-4 rounded-full bg-ink-black" />
        <div className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-ink-black" />

        {/* Borda interna tracejada */}
        <div className="absolute inset-4 border-2 border-ink-black rounded-lg pointer-events-none opacity-50 border-dashed" />

        {/* Conteúdo */}
        <div className="p-8 pt-12 pb-10 flex flex-col items-center relative z-20">
          {/* Logo - Título + Navio animado */}
          <div className="mb-6 flex flex-col items-center">
            {/* Título NAVALIS */}
            <img
              src={navalisName}
              alt="Navalis"
              className="w-72 h-auto"
            />
            {/* Navio com walk-in-place animation */}
            <div className="ship-walk mt-2">
              <img
                src={navalisShip}
                alt=""
                className="w-48 h-auto"
              />
            </div>
          </div>

          {/* Tagline */}
          <p className="font-display text-2xl font-semibold text-ink-black text-center mb-8 px-4 leading-tight">
            "Faça login para implantar sua frota"
          </p>

          {/* Tabs Login/Register - pill com hard shadow */}
          <div className="flex w-full max-w-sm mb-6 rounded-full ink-border hard-shadow-sm overflow-hidden">
            {["login", "register"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => { setTab(t); setLocalError(null); clearError(); }}
                className={`flex-1 py-2.5 font-mono text-[12px] font-bold tracking-[0.1em] uppercase transition-all ${
                  tab === t
                    ? "bg-ink-black text-paper-white"
                    : "bg-paper-white text-ink-black hover:bg-light-grain"
                }`}
              >
                {t === "login" ? "LOGIN" : "REGISTRO"}
              </button>
            ))}
          </div>

          {/* Error message */}
          {displayError && (
            <div className="w-full max-w-sm px-4 py-2 mb-4 text-sm text-center font-sans text-red-800 bg-red-100 ink-border rounded-lg">
              {displayError}
            </div>
          )}

          {/* Form */}
          <form className="w-full max-w-sm space-y-6" onSubmit={handleSubmit}>
            <NeonInput
              label="USUÁRIO"
              value={name}
              onChange={setName}
              placeholder="Seu usuário"
            />
            <NeonInput
              label="SENHA"
              type="password"
              value={pwd}
              onChange={setPwd}
              placeholder="••••••••"
            />
            {tab === "register" && (
              <NeonInput
                label="CONFIRMAR SENHA"
                type="password"
                value={confirmPwd}
                onChange={setConfirmPwd}
                placeholder="••••••••"
              />
            )}

            {/* Botão submit - rubber button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className={`w-full bg-ink-black text-paper-white font-display text-[32px] font-extrabold py-3 px-6 rounded-full ink-border hard-shadow uppercase flex items-center justify-center gap-2 transition-all ${
                  submitting
                    ? "opacity-50 cursor-wait"
                    : "hover:scale-105 hover:scale-y-95 active:scale-95 active:scale-y-105"
                }`}
                onMouseEnter={(e) => {
                  if (!submitting) e.currentTarget.style.animation = "boil 0.3s infinite alternate steps(2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.animation = "none";
                }}
              >
                <span>{submitting ? "AGUARDE..." : tab === "login" ? "ENTRAR" : "REGISTRAR"}</span>
                {!submitting && (
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {tab === "login" ? "login" : "how_to_reg"}
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Walk-in-place animation styles */}
      <style>{`
        .ship-walk {
          animation: ship-bounce 0.9s ease-in-out infinite;
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
