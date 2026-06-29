import { useState } from "react";
import { NeonInput } from "../shared/NeonInput";
import logo from "../../img/navalis_logo.png";

export function AuthView({ onAuthed }) {
  const [tab, setTab] = useState("login");
  const [name, setName] = useState("");
  const [pwd, setPwd] = useState("");

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
                onClick={() => setTab(t)}
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

          <form
            className="w-full space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              onAuthed(name.trim());
            }}
          >
            <NeonInput label="Nome de Usuário" value={name} onChange={setName} placeholder="commander_07" />
            <NeonInput label="Senha" type="password" value={pwd} onChange={setPwd} placeholder="••••••••" />
            {tab === "register" && (
              <NeonInput label="Confirmar Senha" type="password" value={pwd} onChange={() => {}} placeholder="••••••••" />
            )}

            <button
              type="submit"
              className="w-full my-5 py-3 rounded-md font-display font-bold tracking-[0.25em] text-sm text-bg-elev bg-neon-cyan hover:bg-neon-mint transition-all neon-glow-cyan"
            >
              {tab === "login" ? "ENTRAR" : "CADASTRAR-SE"}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
