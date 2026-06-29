import { useState } from "react";
import { BrandMark } from "../shared/BrandMark";
import { Stat } from "./Stat";

export function LobbyView({ username, onEnterMatch, onLogout }) {
  const [code, setCode] = useState("");
  const rooms = [
    { host: "Admiral_Reyes", code: "NX-7421", ping: 24 },
    { host: "Stormbringer", code: "KR-0098", ping: 41 },
    { host: "Nightshade", code: "ZB-5512", ping: 18 },
    { host: "Captain_Vex", code: "QM-3390", ping: 63 },
    { host: "Iron_Tide", code: "PL-1147", ping: 32 },
  ];

  return (
    <div className="min-h-screen px-6 lg:px-12 py-8 max-w-7xl mx-auto">
      <header className="flex items-center justify-between mb-10">
        <BrandMark />
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-md tac-panel">
            <div className="h-2 w-2 rounded-full bg-neon-mint animate-[pulse-neon_1.6s_ease-in-out_infinite] shadow-[0_0_10px_#00FFCC]" />
            <div className="leading-tight">
              <div className="text-[10px] tracking-[0.3em] text-text-dim font-display">ONLINE</div>
              <div className="text-sm text-text font-display tracking-wider">{username}</div>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="text-[10px] tracking-[0.3em] text-text-dim hover:text-neon-red transition-colors font-display"
          >
            SAIR
          </button>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 tac-panel rounded-xl p-8 relative overflow-hidden">
          <div className="absolute top-4 right-4 flex items-center gap-2 text-[10px] tracking-[0.3em] text-text-dim font-display">
            <span className="h-1.5 w-1.5 rounded-full bg-neon-cyan animate-[pulse-neon_2s_ease-in-out_infinite]" />
            COMANDO DA FROTA
          </div>
          <h1 className="font-display font-black text-4xl lg:text-5xl tracking-tight neon-text">
            Bem-vindo a bordo, <span className="text-neon-cyan">{username}</span>
          </h1>
          <p className="text-text-dim mt-3 max-w-xl">
            Crie uma nova partida ou entre em uma operação ativa. Coordenadas travadas. Sonar online.
          </p>
          <button
            onClick={onEnterMatch}
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-md bg-neon-cyan text-bg-elev font-display font-bold tracking-[0.2em] text-sm hover:bg-neon-mint transition-all neon-glow-cyan"
          >
            <span>+ CRIAR PARTIDA</span>
          </button>
        </div>

        <div className="tac-panel rounded-xl p-6">
          <div className="text-[10px] tracking-[0.3em] text-text-dim font-display mb-3">ENTRAR POR CÓDIGO</div>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="XX-0000"
            className="w-full bg-bg-elev/80 border border-tac-blue-deep/70 rounded-md px-3 py-3 font-mono tracking-[0.3em] text-center text-neon-cyan outline-none transition-all focus:border-neon-cyan focus:shadow-[0_0_0_3px_rgba(0,168,255,0.18)]"
          />
          <button
            onClick={onEnterMatch}
            className="mt-3 w-full py-2.5 rounded-md border border-neon-cyan/60 text-neon-cyan font-display tracking-[0.2em] text-xs hover:bg-neon-cyan/10 transition-all"
          >
            ENTRAR NA SALA
          </button>
          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            <Stat label="VITÓRIAS" value="12" />
            <Stat label="DERROTAS" value="4" />
            <Stat label="RANQUE" value="A-3" />
          </div>
        </div>
      </div>

      <div className="tac-panel rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-tac-blue-deep/50">
          <div className="flex items-center gap-3">
            <h2 className="font-display tracking-[0.2em] text-sm text-text">SALAS DISPONÍVEIS</h2>
            <span className="text-[10px] text-text-dim font-mono">{rooms.length} ATIVAS</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] tracking-[0.3em] text-text-dim font-display">
            <span className="h-1.5 w-1.5 rounded-full bg-neon-mint" /> AO VIVO
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-[10px] tracking-[0.3em] text-text-dim font-display">
              <th className="text-left px-6 py-3">ANFITRIÃO</th>
              <th className="text-left px-6 py-3">CÓDIGO DA SALA</th>
              <th className="text-left px-6 py-3">PING</th>
              <th className="text-right px-6 py-3">AÇÃO</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((r) => (
              <tr
                key={r.code}
                className="border-t border-tac-blue-deep/30 hover:bg-neon-cyan/[0.04] transition-colors group"
              >
                <td className="px-6 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-md bg-tac-blue/20 border border-tac-blue-deep flex items-center justify-center text-neon-cyan font-display font-bold">
                      {r.host[0]}
                    </div>
                    <span className="text-text">{r.host}</span>
                  </div>
                </td>
                <td className="px-6 py-3 font-mono text-neon-cyan tracking-wider">{r.code}</td>
                <td className="px-6 py-3 font-mono text-text-dim">
                  <span className={r.ping < 30 ? "text-neon-mint" : r.ping < 50 ? "text-neon-cyan" : "text-yellow-400"}>
                    {r.ping}ms
                  </span>
                </td>
                <td className="px-6 py-3 text-right">
                  <button
                    onClick={onEnterMatch}
                    className="px-4 py-1.5 rounded border border-neon-cyan/60 text-neon-cyan text-xs font-display tracking-[0.25em] hover:bg-neon-cyan hover:text-bg-elev transition-all hover:neon-glow-cyan"
                  >
                    ENTRAR
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
