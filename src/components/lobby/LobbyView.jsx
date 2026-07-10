import { useState, useEffect } from "react";
import { BrandMark } from "../shared/BrandMark";
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
    <div className="min-h-screen flex flex-col items-center px-4 py-8 max-w-5xl mx-auto relative z-10">
      {/* Header */}
      <header className="w-full flex items-center justify-between mb-10">
        <BrandMark size="sm" />
        <div className="flex items-center gap-4">
          {/* User badge */}
          <div className="hidden sm:flex items-center gap-3 bg-paper-white ink-border rounded-full px-4 py-2 hard-shadow-sm">
            <span
              className="material-symbols-outlined text-ink-black text-lg"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              person
            </span>
            <span className="font-mono text-[12px] font-bold tracking-[0.1em] text-ink-black uppercase">
              {user?.username}
            </span>
          </div>
          <button
            onClick={logout}
            className="font-mono text-[11px] font-bold tracking-[0.1em] text-ink-black bg-paper-white px-3 py-1.5 rounded-full border-2 border-ink-black hover:bg-light-grain transition-colors uppercase"
          >
            SAIR
          </button>
        </div>
      </header>

      {/* Error */}
      {error && (
        <div className="w-full max-w-3xl mb-6 px-4 py-3 text-sm text-center font-sans bg-error-container ink-border rounded-lg text-error">
          {error}
        </div>
      )}

      {/* Welcome + Actions */}
      <div className="w-full flex flex-col lg:flex-row gap-6 mb-8">
        {/* Welcome card + Create */}
        <div className="flex-1 lg:flex-[2] bg-surface-container-high ink-border rounded-xl p-8 hard-shadow relative overflow-hidden flex flex-col justify-between">
          {/* Corner circles */}
          <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-paper-white" />
          <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-paper-white" />
          <div className="absolute bottom-2 left-2 w-3 h-3 rounded-full bg-paper-white" />
          <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-paper-white" />

          {/* Dashed inner border */}
          <div className="absolute inset-3 border-2 border-paper-white/30 border-dashed rounded-lg pointer-events-none" />

          <div className="relative z-10">
            <h1 className="font-display text-[32px] lg:text-[40px] font-extrabold uppercase tracking-tight text-paper-white leading-tight">
              Bem-vindo a bordo,{" "}
              <span className="inline-block">{user?.username}</span>
            </h1>
            <p className="font-sans text-base text-on-surface-variant mt-2 max-w-md">
              Crie uma nova partida ou entre em uma operação ativa.
            </p>
          </div>

          <button
            onClick={handleCreateGame}
            disabled={loading}
            className={`mt-6 self-start bg-paper-white text-ink-black font-display text-lg font-extrabold py-3 px-8 rounded-full ink-border hard-shadow uppercase flex items-center gap-2 transition-all ${
              loading
                ? "opacity-50 cursor-wait"
                : "hover:scale-x-105 hover:scale-y-95 active:scale-x-95 active:scale-y-105"
            }`}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.animation = "boil 0.3s infinite alternate steps(2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.animation = "none";
            }}
          >
            <span
              className="material-symbols-outlined text-xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              add_circle
            </span>
            <span>{loading ? "CRIANDO..." : "CRIAR PARTIDA"}</span>
          </button>
        </div>

        {/* Enter by ID */}
        <div className="flex-1 bg-surface-container-high ink-border rounded-xl p-6 hard-shadow relative overflow-hidden flex flex-col justify-between">
          {/* Corner circles */}
          <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-paper-white" />
          <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-paper-white" />
          <div className="absolute bottom-2 left-2 w-3 h-3 rounded-full bg-paper-white" />
          <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-paper-white" />

          <div className="flex items-center gap-2 border-b-2 border-paper-white/40 pb-2 mb-4">
            <span
              className="material-symbols-outlined text-paper-white text-lg"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              vpn_key
            </span>
            <h3 className="font-mono text-[12px] font-bold tracking-[0.1em] text-paper-white uppercase">
              Entrar por ID
            </h3>
          </div>

          <div className="flex flex-col gap-4 flex-1 justify-center">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="ID da partida"
              className="w-full bg-surface border-2 border-paper-white rounded-lg p-4 text-paper-white font-mono text-sm tracking-wider text-center placeholder:text-mid-tone-grey outline-none transition-all focus:ring-2 focus:ring-paper-white"
            />
            <button
              onClick={handleJoinByCode}
              disabled={loading || !code.trim()}
              className={`w-full bg-paper-white text-ink-black font-mono text-[12px] font-bold tracking-[0.1em] py-3 rounded-lg ink-border hard-shadow-sm uppercase transition-all ${
                loading || !code.trim()
                  ? "opacity-40 cursor-not-allowed"
                  : "hover:scale-x-105 hover:scale-y-95 active:scale-x-95 active:scale-y-105"
              }`}
            >
              ENTRAR NA SALA
            </button>
          </div>
        </div>
      </div>

      {/* Available Rooms */}
      <div className="w-full bg-surface-container-high ink-border rounded-xl hard-shadow overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-4 border-paper-white">
          <div className="flex items-center gap-3">
            <span
              className="material-symbols-outlined text-paper-white text-2xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              folder_open
            </span>
            <h2 className="font-display text-xl lg:text-2xl font-extrabold uppercase tracking-tight text-paper-white">
              Salas Disponíveis
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] font-bold text-on-surface-variant tracking-[0.1em]">
              {availableGames.length} ATIVAS
            </span>
            <button
              onClick={loadGames}
              disabled={refreshing}
              className="font-mono text-[11px] font-bold tracking-[0.1em] text-paper-white bg-surface-container px-3 py-1.5 rounded-full border-2 border-paper-white transition-all hover:bg-paper-white hover:text-ink-black disabled:opacity-50"
            >
              {refreshing ? "..." : "ATUALIZAR"}
            </button>
          </div>
        </div>

        {/* Room list */}
        {availableGames.length === 0 ? (
          <div className="px-6 py-14 text-center flex flex-col items-center gap-3">
            <span
              className="material-symbols-outlined text-mid-tone-grey text-5xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              sailing
            </span>
            <p className="font-sans text-mid-tone-grey text-base">
              Nenhuma sala disponível. Crie uma partida!
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {availableGames.map((game, idx) => (
              <div
                key={game.gameId}
                className="flex flex-col sm:flex-row items-stretch border-b-2 border-paper-white/20 last:border-b-0 hover:bg-surface-container transition-colors group"
              >
                {/* Index number */}
                <div className="sm:w-16 bg-paper-white border-b-4 sm:border-b-0 sm:border-r-4 border-ink-black flex items-center justify-center p-3 shrink-0">
                  <span className="font-display text-2xl font-extrabold text-ink-black">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                </div>

                {/* Room info */}
                <div className="flex-1 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="material-symbols-outlined text-paper-white text-lg"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        anchor
                      </span>
                      <span className="font-mono text-[11px] font-bold text-on-surface-variant tracking-[0.1em]">
                        {game.gameId?.slice(0, 8).toUpperCase()}
                      </span>
                    </div>
                    <span className="font-sans text-sm text-paper-white">
                      {game.message || "Aguardando oponente"}
                    </span>
                  </div>

                  <button
                    onClick={() => handleJoinGame(game.gameId)}
                    disabled={loading}
                    className={`bg-paper-white text-ink-black font-mono text-[12px] font-bold tracking-[0.1em] px-6 py-2.5 rounded-full ink-border hard-shadow-sm uppercase whitespace-nowrap transition-all ${
                      loading
                        ? "opacity-40 cursor-not-allowed"
                        : "hover:scale-x-105 hover:scale-y-95 active:scale-x-95 active:scale-y-105 group-hover:animate-none"
                    }`}
                    onMouseEnter={(e) => {
                      if (!loading) e.currentTarget.style.animation = "boil 0.3s infinite alternate steps(2)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.animation = "none";
                    }}
                  >
                    ENTRAR
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
