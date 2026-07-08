import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import * as api from "../services/api";
import * as stomp from "../services/stomp";
import { useAuth } from "./AuthContext";
import { key } from "../components/shared/constants";

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const { user } = useAuth();

  // Game state
  const [gameId, setGameId] = useState(null);
  const [gameState, setGameState] = useState(null); // WAITING_FOR_OPPONENT, PLACING_SHIPS, IN_PROGRESS, FINISHED
  const [opponent, setOpponent] = useState(null);
  const [myTurn, setMyTurn] = useState(false);
  const [enemyMarks, setEnemyMarks] = useState(new Map());
  const [myMarks, setMyMarks] = useState(new Map());
  const [gameOver, setGameOver] = useState(null); // { result: "victory"|"defeat", winnerId }
  const [placedShips, setPlacedShips] = useState([]);
  const [availableGames, setAvailableGames] = useState([]);
  const [error, setError] = useState(null);
  const [log, setLog] = useState([]);
  const [opponentReady, setOpponentReady] = useState(false);
  const [myReady, setMyReady] = useState(false);

  const LETTERS = "ABCDEFGHIJ".split("");

  function pushLog(msg) {
    setLog((l) => [`▸ ${msg}`, ...l].slice(0, 50));
  }

  // Handle incoming WebSocket events
  const handleGameEvent = useCallback((event) => {
    const myUserId = user?.userId;

    switch (event.type) {
      case "SHIP_PLACED":
        if (event.playerId !== myUserId) {
          pushLog("Oponente posicionou um navio.");
        }
        break;

      case "PLAYER_READY":
        if (event.playerId === myUserId) {
          setMyReady(true);
          pushLog("Você está pronto!");
        } else {
          setOpponentReady(true);
          pushLog("Oponente está pronto!");
        }
        break;

      case "GAME_STARTED":
        setGameState("IN_PROGRESS");
        // Backend sets currentTurnPlayerId to player1 on start
        // We need to check if we're player1 via the game info
        // For now, the GAME_STARTED event doesn't tell us who goes first
        // So we fetch game info to determine turn
        if (event.firstPlayerId) {
          setMyTurn(event.firstPlayerId === myUserId);
        } else {
          // If backend doesn't send firstPlayerId, we'll determine by fetching
          // For now assume the creator (player1) goes first
          setMyTurn(true); // Will be corrected by SHOT_FIRED events
        }
        pushLog("Partida iniciada! Sonar online.");
        break;

      case "SHOT_FIRED": {
        const { shooterId, row, col, result, sunkShipType, gameOver: isGameOver, winnerId } = event;
        const isMyShot = shooterId === myUserId;
        const hit = result === "HIT" || result === "SUNK";
        const cellKey = key(row, col);

        if (isMyShot) {
          setEnemyMarks((prev) => {
            const next = new Map(prev);
            next.set(cellKey, hit ? "hit" : "errou");
            return next;
          });
          pushLog(`TIRO ${LETTERS[row]}${col + 1} — ${hit ? "ACERTO DIRETO" : "ÁGUA"}${sunkShipType ? ` (${sunkShipType} AFUNDADO!)` : ""}`);
        } else {
          setMyMarks((prev) => {
            const next = new Map(prev);
            next.set(cellKey, hit ? "hit" : "errou");
            return next;
          });
          pushLog(`INIMIGO ATIRA ${LETTERS[row]}${col + 1} — ${hit ? "FOMOS ATINGIDOS" : "ÁGUA"}${sunkShipType ? ` (${sunkShipType} AFUNDADO!)` : ""}`);
        }

        if (isGameOver) {
          setGameState("FINISHED");
          const gameResult = winnerId === myUserId ? "victory" : "defeat";
          setGameOver({ result: gameResult, winnerId });
          pushLog(gameResult === "victory" ? "VITÓRIA! Frota inimiga destruída!" : "DERROTA! Sua frota foi destruída.");
        } else {
          // Turn logic: if hit, same player shoots again; if miss, turn switches
          if (hit) {
            setMyTurn(isMyShot);
          } else {
            setMyTurn(!isMyShot);
          }
          if (!hit && !isMyShot) {
            pushLog("Seu turno — atire!");
          } else if (!hit && isMyShot) {
            pushLog("Turno do inimigo — aguarde...");
          }
        }
        break;
      }

      case "OPPONENT_JOINED":
        setOpponent(event.playerId);
        setGameState("PLACING_SHIPS");
        pushLog("Oponente entrou na sala!");
        break;

      default:
        console.log("Unknown event type:", event.type);
    }
  }, [user?.userId]);

  // Connect to game WebSocket
  const connectToGame = useCallback(async (gId) => {
    if (!user?.token) return;
    try {
      await stomp.connectStomp(user.token);
      stomp.subscribeToGame(gId, handleGameEvent);
    } catch (err) {
      setError("Falha na conexão WebSocket: " + err.message);
    }
  }, [user?.token, handleGameEvent]);

  // Create a new game
  const createGame = useCallback(async () => {
    setError(null);
    try {
      const game = await api.createGame();
      // GameResponse: { gameId, status, message }
      const id = game.gameId;
      setGameId(id);
      setGameState("WAITING_FOR_OPPONENT");
      setOpponent(null);
      resetGameState();
      await connectToGame(id);
      pushLog("Sala criada. Aguardando oponente...");
      return game;
    } catch (err) {
      setError(err.message || "Falha ao criar partida");
      throw err;
    }
  }, [connectToGame]);

  // Join an existing game
  const joinGame = useCallback(async (gId) => {
    setError(null);
    try {
      const game = await api.joinGame(gId);
      // GameResponse: { gameId, status, message }
      const id = game.gameId;
      setGameId(id);
      setGameState("PLACING_SHIPS");
      setOpponent(null);
      resetGameState();
      await connectToGame(id);
      pushLog("Você entrou na partida! Posicione sua frota.");
      return game;
    } catch (err) {
      setError(err.message || "Falha ao entrar na partida");
      throw err;
    }
  }, [connectToGame]);

  // Fetch available games
  const fetchAvailableGames = useCallback(async () => {
    setError(null);
    try {
      const games = await api.listAvailableGames();
      setAvailableGames(games || []);
      return games;
    } catch (err) {
      setError(err.message || "Falha ao listar partidas");
      return [];
    }
  }, []);

  // Place a ship
  const placeShip = useCallback((gameIdVal, ship) => {
    // Map frontend ship id to backend ShipType enum
    const typeMap = {
      carrier: "CARRIER",
      battleship: "BATTLESHIP",
      destroyer: "CRUISER",
      submarine: "SUBMARINE",
      patrol: "DESTROYER",
    };
    stomp.sendPlaceShip(
      gameIdVal,
      typeMap[ship.id] || ship.id.toUpperCase(),
      ship.row,
      ship.col,
      ship.orientation === "H" ? "HORIZONTAL" : "VERTICAL"
    );
  }, []);

  // Send all ships and mark ready
  const confirmFleet = useCallback((ships) => {
    if (!gameId) return;
    setPlacedShips(ships);
    // Send each ship placement with a small delay between them
    ships.forEach((ship, index) => {
      setTimeout(() => {
        placeShip(gameId, ship);
      }, index * 200);
    });
    // Send ready signal after all ships are placed
    setTimeout(() => {
      stomp.sendReady(gameId);
      setMyReady(true);
    }, ships.length * 200 + 300);
  }, [gameId, placeShip]);

  // Fire at a cell
  const fire = useCallback((row, col) => {
    if (!gameId || !myTurn) return;
    const cellKey = key(row, col);
    // Don't fire at already-attacked cells
    if (enemyMarks.has(cellKey)) return;
    stomp.sendFire(gameId, row, col);
    setMyTurn(false); // Optimistically disable until server responds
  }, [gameId, myTurn, enemyMarks]);

  // Leave game / cancel
  const leaveGame = useCallback(async () => {
    // If still waiting for opponent, cancel the game on backend
    if (gameId && gameState === "WAITING_FOR_OPPONENT") {
      try {
        await api.cancelGame(gameId);
      } catch {
        // Game may already be cancelled/joined, ignore
      }
    }
    stomp.disconnectStomp();
    resetGameState();
    setGameId(null);
    setGameState(null);
    setOpponent(null);
    setLog([]);
  }, [gameId, gameState]);

  function resetGameState() {
    setEnemyMarks(new Map());
    setMyMarks(new Map());
    setGameOver(null);
    setPlacedShips([]);
    setOpponentReady(false);
    setMyReady(false);
    setMyTurn(false);
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stomp.disconnectStomp();
    };
  }, []);

  return (
    <GameContext.Provider
      value={{
        gameId,
        gameState,
        opponent,
        myTurn,
        enemyMarks,
        myMarks,
        gameOver,
        placedShips,
        availableGames,
        error,
        log,
        opponentReady,
        myReady,
        createGame,
        joinGame,
        fetchAvailableGames,
        confirmFleet,
        fire,
        leaveGame,
        setError,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
