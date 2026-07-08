import { useState, useEffect } from "react";
import { BrandMark } from "../shared/BrandMark";
import { Stat } from "./Stat";
import { useAuth } from "../../contexts/AuthContext";
import { useGame } from "../../contexts/GameContext";

export function LobbyView() {
  const { user, logout } = useAuth();
  const { createGame, joinGame, fetchAvailableGames, availableGames, error } = useGame();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadGames();
    const interval = setInterval(loadGames, 5000);
    return () => clearInterval(interval);
  }, []);

  async function loadGames() {
    setRefreshing(true);
    await fetchAvailableGames();
    setRefreshing(false);
  }

  async function handleCreateGame() {
    setLoading(true);
    try {
      await createGame();
    } catch {
      // error handled by context
    } finally {
      setLoading(false);
    }
  }

  async function handleJoinByCode() {
    if (!code.trim()) return;
    setLoading(true);
    try {
      await joinGame(code.trim());
    } catch {
      // error handled by context
    } finally {
      setLoading(false);
    }
  }

  async function handleJoinGame(gameId) {
    setLoading(true);
    try {
      await joinGame(gameId);
    } catch {
      // error handled by context
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen px-4 lg:px-8 py-6 max-w-5xl mx-auto">
      <header className="flex items-center justify-between mb-10">
        <BrandMark />
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-md tac-panel">
            <div className="h-2 w-2 rounded-full bg-neon-mint animate-[pulse-neon_1.6s_ease-in-out_infinite] shadow-[0_0_10px_#00FFCC]" />
            <div className="leading-tight">
              <div className="text-[10px] tracking-[0.3em] text-text-dim font-display">ONLINE</div>
              <div className="text-sm text-text font-display tracking-wider">{user?.username}</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="text-[10px] tracking-[0.3em] text-text-dim hover:text-neon-red transition-colors font-display"
          >
            SAIR
          </button>
        </div>
      </header>

      {error && (
        <div className="mb-6 px-4 py-2 rounded-md bg-neon-red/10 border border-neon-red/40 text-neon-red text-xs text-center font-display tracking-wider">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 tac-panel rounded-xl p-8 relative overflow-hidden">
          <div className="absolute top-4 right-4 flex items-center gap-2 text-[10px] tracking-[0.3em] text-text-dim font-display">
            <span className="h-1.5 w-1.5 rounded-full bg-neon-cyan animate-[pulse-neon_2s_ease-in-out_infinite]" />
            COMANDO DA FROTA
          </div>
          <h1 className="font-display font-black text-4xl lg:text-5xl tracking-tight neon-text">
            Bem-vindo a bordo, <span className="text-neon-cyan">{user?.username}</span>
          </h1>
          <p className="text-text-dim mt-3 max-w-xl">
            Crie uma nova partida ou entre em uma operação ativa. Coordenadas travadas. Sonar online.
          </p>
          <button
            onClick={handleCreateGame}
            disabled={loading}
            className={`mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-md font-display font-bold tracking-[0.2em] text-sm transition-all ${
              loading
                ? "bg-neon-cyan/50 text-bg-elev cursor-wait"
                : "bg-neon-cyan text-bg-elev hover:bg-neon-mint neon-glow-cyan"
            }`}
          >
            <span>{loading ? "CRIANDO..." : "+ CRIAR PARTIDA"}</span>
          </button>
        </div>

        <div className="tac-panel rounded-xl p-6">
          <div className="text-[10px] tracking-[0.3em] text-text-dim font-display mb-3">ENTRAR POR ID</div>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="ID da partida"
            className="w-full bg-bg-elev/80 border border-tac-blue-deep/70 rounded-md px-3 py-3 font-mono tracking-[0.1em] text-center text-neon-cyan outline-none transition-all focus:border-neon-cyan focus:shadow-[0_0_0_3px_rgba(0,168,255,0.18)]"
          />
          <button
            onClick={handleJoinByCode}
            disabled={loading || !code.trim()}
            className="mt-3 w-full py-2.5 rounded-md border border-neon-cyan/60 text-neon-cyan font-display tracking-[0.2em] text-xs hover:bg-neon-cyan/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ENTRAR NA SALA
          </button>
        </div>
      </div>

      <div className="tac-panel rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-tac-blue-deep/50">
          <div className="flex items-center gap-3">
            <h2 className="font-display tracking-[0.2em] text-sm text-text">SALAS DISPONÍVEIS</h2>
            <span className="text-[10px] text-text-dim font-mono">{availableGames.length} ATIVAS</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadGames}
              disabled={refreshing}
              className="text-[10px] tracking-[0.3em] text-text-dim hover:text-neon-cyan font-display transition-colors disabled:opacity-50"
            >
              {refreshing ? "ATUALIZANDO..." : "ATUALIZAR"}
            </button>
            <span className="h-1.5 w-1.5 rounded-full bg-neon-mint" />
            <span className="text-[10px] tracking-[0.3em] text-text-dim font-display">AO VIVO</span>
          </div>
        </div>

        {availableGames.length === 0 ? (
          <div className="px-6 py-10 text-center text-text-dim text-sm font-display tracking-wider">
            Nenhuma sala disponível. Crie uma partida!
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-[10px] tracking-[0.3em] text-text-dim font-display">
                <th className="text-left px-6 py-3">ANFITRIÃO</th>
                <th className="text-left px-6 py-3">ID DA SALA</th>
                <th className="text-right px-6 py-3">AÇÃO</th>
              </tr>
            </thead>
            <tbody>
              {availableGames.map((game) => (
                <tr
                  key={game.id}
                  className="border-t border-tac-blue-deep/30 hover:bg-neon-cyan/[0.04] transition-colors group"
                >
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-md bg-tac-blue/20 border border-tac-blue-deep flex items-center justify-center text-neon-cyan font-display font-bold">
                        {(game.hostUsername || game.player1 || "?")[0].toUpperCase()}
                      </div>
                      <span className="text-text">{game.hostUsername || game.player1 || "Desconhecido"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 font-mono text-neon-cyan tracking-wider text-xs">
                    {game.id?.slice(0, 8)}...
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={() => handleJoinGame(game.id)}
                      disabled={loading}
                      className="px-4 py-1.5 rounded border border-neon-cyan/60 text-neon-cyan text-xs font-display tracking-[0.25em] hover:bg-neon-cyan hover:text-bg-elev transition-all hover:neon-glow-cyan disabled:opacity-40"
                    >
                      ENTRAR
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
