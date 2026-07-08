import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import * as api from "../services/api";
import * as stomp from "../services/stomp";
import { useAuth } from "./AuthContext";
import { FLEET, key } from "../components/shared/constants";

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
  const gameIdRef = useRef(gameId);
  gameIdRef.current = gameId;

  function pushLog(msg) {
    setLog((l) => [`▸ ${msg}`, ...l].slice(0, 50));
  }

  // Handle incoming WebSocket events
  const handleGameEvent = useCallback((event) => {
    switch (event.type) {
      case "SHIP_PLACED":
        if (event.playerId !== user?.username) {
          pushLog("Oponente posicionou um navio.");
        }
        break;

      case "PLAYER_READY":
        if (event.playerId === user?.username) {
          setMyReady(true);
          pushLog("Você está pronto!");
        } else {
          setOpponentReady(true);
          pushLog("Oponente está pronto!");
        }
        break;

      case "GAME_STARTED":
        setGameState("IN_PROGRESS");
        setMyTurn(event.firstPlayerId === user?.username);
        pushLog("Partida iniciada! Sonar online.");
        if (event.firstPlayerId === user?.username) {
          pushLog("Seu turno — atire!");
        } else {
          pushLog("Turno do inimigo — aguarde...");
        }
        break;

      case "SHOT_FIRED": {
        const { shooterId, row, col, result, sunkShipType, gameOver: isGameOver, winnerId } = event;
        const isMyShot = shooterId === user?.username;
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
          const result = winnerId === user?.username ? "victory" : "defeat";
          setGameOver({ result, winnerId });
          pushLog(result === "victory" ? "VITÓRIA! Frota inimiga destruída!" : "DERROTA! Sua frota foi destruída.");
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
        pushLog(`${event.playerId} entrou na sala!`);
        break;

      default:
        console.log("Unknown event type:", event.type);
    }
  }, [user?.username]);

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
      setGameId(game.id);
      setGameState("WAITING_FOR_OPPONENT");
      setOpponent(null);
      resetGameState();
      await connectToGame(game.id);
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
      setGameId(game.id);
      setGameState("PLACING_SHIPS");
      setOpponent(game.hostUsername || game.player1);
      resetGameState();
      await connectToGame(game.id);
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
  const placeShip = useCallback((ship) => {
    if (!gameId) return;
    // Map frontend ship id to backend shipType enum
    const typeMap = {
      carrier: "CARRIER",
      battleship: "BATTLESHIP",
      destroyer: "CRUISER", // destroyer in frontend = CRUISER (size 3) in backend
      submarine: "SUBMARINE",
      patrol: "DESTROYER", // patrol in frontend = DESTROYER (size 2) in backend
    };
    stomp.sendPlaceShip(gameId, typeMap[ship.id] || ship.id.toUpperCase(), ship.row, ship.col, ship.orientation === "H" ? "HORIZONTAL" : "VERTICAL");
  }, [gameId]);

  // Send all ships and mark ready
  const confirmFleet = useCallback((ships) => {
    if (!gameId) return;
    setPlacedShips(ships);
    // Send each ship placement
    ships.forEach((ship) => placeShip(ship));
    // Send ready signal
    setTimeout(() => {
      stomp.sendReady(gameId);
    }, 500);
  }, [gameId, placeShip]);

  // Fire at a cell
  const fire = useCallback((row, col) => {
    if (!gameId || !myTurn) return;
    stomp.sendFire(gameId, row, col);
    setMyTurn(false); // Optimistically disable until server responds
  }, [gameId, myTurn]);

  // Leave game
  const leaveGame = useCallback(() => {
    stomp.disconnectStomp();
    resetGameState();
    setGameId(null);
    setGameState(null);
  }, []);

  function resetGameState() {
    setEnemyMarks(new Map());
    setMyMarks(new Map());
    setGameOver(null);
    setPlacedShips([]);
    setLog([]);
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
