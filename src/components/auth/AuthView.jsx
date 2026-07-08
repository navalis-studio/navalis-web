import { useState } from "react";
import { NeonInput } from "../shared/NeonInput";
import { useAuth } from "../../contexts/AuthContext";
import logo from "../../img/navalis_logo.png";

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
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md tac-panel rounded-xl p-8 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-neon-cyan to-transparent" />
        <div className="flex flex-col items-center gap-6">
          <img src={logo} alt="Navalis.io" className="h-45" />
          <p className="text-text-dim text-sm tracking-wide text-center">
            Faça login para implantar sua frota.
          </p>

          <div className="grid grid-cols-2 w-full p-1 rounded-md bg-bg-elev border border-tac-blue-deep/60">
            {["login", "register"].map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setLocalError(null); clearError(); }}
                className={`py-2 text-xs uppercase tracking-[0.25em] font-display font-semibold rounded transition-all ${
                  tab === t
                    ? "bg-tac-blue/20 text-neon-cyan neon-glow-cyan"
                    : "text-text-dim hover:text-text"
                }`}
              >
                {t === "login" ? "LOGIN" : "REGISTRO"}
              </button>
            ))}
          </div>

          {displayError && (
            <div className="w-full px-4 py-2 rounded-md bg-neon-red/10 border border-neon-red/40 text-neon-red text-xs text-center font-display tracking-wider">
              {displayError}
            </div>
          )}

          <form className="w-full space-y-4" onSubmit={handleSubmit}>
            <NeonInput label="Nome de Usuário" value={name} onChange={setName} placeholder="commander_07" />
            <NeonInput label="Senha" type="password" value={pwd} onChange={setPwd} placeholder="••••••••" />
            {tab === "register" && (
              <NeonInput label="Confirmar Senha" type="password" value={confirmPwd} onChange={setConfirmPwd} placeholder="••••••••" />
            )}

            <button
              type="submit"
              disabled={submitting}
              className={`w-full my-5 py-3 rounded-md font-display font-bold tracking-[0.25em] text-sm transition-all ${
                submitting
                  ? "bg-neon-cyan/50 text-bg-elev cursor-wait"
                  : "text-bg-elev bg-neon-cyan hover:bg-neon-mint neon-glow-cyan"
              }`}
            >
              {submitting ? "AGUARDE..." : tab === "login" ? "ENTRAR" : "CADASTRAR-SE"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
