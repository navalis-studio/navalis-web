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
  const [roomCode, setRoomCode] = useState(null);
  const [gameState, setGameState] = useState(null); // WAITING_FOR_OPPONENT, PLACING_SHIPS, IN_PROGRESS, FINISHED
  const [opponent, setOpponent] = useState(null);
  const [opponentName, setOpponentName] = useState(null);
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
  const [cancelledNotice, setCancelledNotice] = useState(null);
  const [sunkEnemyShips, setSunkEnemyShips] = useState([]);
  const [sunkMyShips, setSunkMyShips] = useState([]);
  const [sunkEnemyCells, setSunkEnemyCells] = useState(new Set());
  const [opponentDisconnected, setOpponentDisconnected] = useState(false);
  const [reconnectCountdown, setReconnectCountdown] = useState(null);

  const enemyMarksRef = useRef(enemyMarks);
  useEffect(() => { enemyMarksRef.current = enemyMarks; }, [enemyMarks]);

  const countdownRef = useRef(null);

  const LETTERS = "ABCDEFGHIJ".split("");

  function pushLog(msg) {
    setLog((l) => [`▸ ${msg}`, ...l].slice(0, 50));
  }

  function startCountdown(seconds) {
    clearCountdown();
    setReconnectCountdown(seconds);
    countdownRef.current = setInterval(() => {
      setReconnectCountdown((prev) => {
        if (prev <= 1) {
          clearCountdown();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function clearCountdown() {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setReconnectCountdown(null);
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
        const { shooterId, row, col, result, sunkShipType, sunkShipCells: shipCells, gameOver: isGameOver, winnerId } = event;
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
          if (sunkShipType) {
            setSunkEnemyShips((prev) => [...prev, sunkShipType]);
            // Use ship cells from backend to mark all cells of the sunk ship
            if (shipCells && shipCells.length > 0) {
              setSunkEnemyCells((prev) => {
                const next = new Set(prev);
                shipCells.forEach((cell) => {
                  next.add(key(cell[0], cell[1]));
                });
                return next;
              });
            }
          }
        } else {
          setMyMarks((prev) => {
            const next = new Map(prev);
            next.set(cellKey, hit ? "hit" : "errou");
            return next;
          });
          pushLog(`INIMIGO ATIRA ${LETTERS[row]}${col + 1} — ${hit ? "FOMOS ATINGIDOS" : "ÁGUA"}${sunkShipType ? ` (${sunkShipType} AFUNDADO!)` : ""}`);
          if (sunkShipType) {
            setSunkMyShips((prev) => [...prev, sunkShipType]);
          }
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
        setOpponentName(event.username || null);
        setGameState("PLACING_SHIPS");
        pushLog("Oponente entrou na sala!");
        break;

      case "OPPONENT_DISCONNECTED":
        setGameState("FINISHED");
        setGameOver({ result: "victory", winnerId: event.winnerId, reason: "wo" });
        setOpponentDisconnected(false);
        clearCountdown();
        pushLog("Oponente desconectou. Vitória por W.O.!");
        break;

      case "OPPONENT_DISCONNECTED_TEMP":
        if (event.playerId !== myUserId) {
          setOpponentDisconnected(true);
          startCountdown(event.timeoutSeconds || 30);
          pushLog("Oponente desconectou. Aguardando reconexão...");
        }
        break;

      case "OPPONENT_RECONNECTED":
        if (event.playerId !== myUserId) {
          setOpponentDisconnected(false);
          clearCountdown();
          pushLog("Oponente reconectou!");
        }
        break;

      case "GAME_CANCELLED":
        // Opponent left during WAITING or PLACING_SHIPS, show modal
        if (event.quitterId !== myUserId) {
          setOpponentDisconnected(false);
          clearCountdown();
          setCancelledNotice("O covarde fugiu antes da batalha.");
        }
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

  // Check for active game on page load (reconnection after reload)
  useEffect(() => {
    if (!user?.token) return;

    async function checkActiveGame() {
      try {
        const data = await api.getActiveGame();
        if (!data) return; // No active game (204 No Content)

        // Restore game state from server
        setGameId(data.gameId);
        setRoomCode(data.roomCode);
        setGameState(data.status);
        setMyTurn(data.myTurn);
        setOpponentReady(data.opponentReady);
        setMyReady(data.myReady);
        setOpponentName(data.opponentUsername || null);

        // Restore my ships
        if (data.myShips && data.myShips.length > 0) {
          const SHIP_TYPE_TO_ID = {
            CARRIER: "carrier",
            BATTLESHIP: "battleship",
            CRUISER: "destroyer",
            SUBMARINE: "submarine",
            DESTROYER: "patrol",
          };
          const SHIP_SIZES = { carrier: 5, battleship: 4, destroyer: 3, submarine: 3, patrol: 2 };
          const SHIP_NAMES = { carrier: "Porta-Aviões", battleship: "Encouraçado", destroyer: "Cruzador", submarine: "Submarino", patrol: "Destroyer" };

          const restoredShips = data.myShips.map((s) => {
            const id = SHIP_TYPE_TO_ID[s.shipType] || s.shipType.toLowerCase();
            return {
              id,
              name: SHIP_NAMES[id] || id,
              size: SHIP_SIZES[id] || 3,
              row: s.row,
              col: s.col,
              orientation: s.orientation === "HORIZONTAL" ? "H" : "V",
            };
          });
          setPlacedShips(restoredShips);
        }

        // Restore enemy marks (shots I fired)
        if (data.myShots && data.myShots.length > 0) {
          const marks = new Map();
          data.myShots.forEach((s) => {
            marks.set(key(s.row, s.col), s.result === "HIT" || s.result === "SUNK" ? "hit" : "errou");
          });
          setEnemyMarks(marks);
        }

        // Restore my marks (shots enemy fired at me)
        if (data.enemyShots && data.enemyShots.length > 0) {
          const marks = new Map();
          data.enemyShots.forEach((s) => {
            marks.set(key(s.row, s.col), s.result === "HIT" || s.result === "SUNK" ? "hit" : "errou");
          });
          setMyMarks(marks);
        }

        // Restore sunk ships
        if (data.sunkEnemyShips) setSunkEnemyShips(data.sunkEnemyShips);
        if (data.sunkMyShips) setSunkMyShips(data.sunkMyShips);

        // Restore sunkEnemyCells from enemy marks (all hits that belong to sunk ships)
        if (data.myShots && data.sunkEnemyShips && data.sunkEnemyShips.length > 0) {
          const hitCells = new Set();
          data.myShots.forEach((s) => {
            if (s.result === "HIT" || s.result === "SUNK") {
              hitCells.add(key(s.row, s.col));
            }
          });
          // For simplicity on reconnect, mark all hit cells as sunk cells
          // (accurate enough — sunk ships' cells are always in hit cells)
          // A more precise approach would need ship positions from enemy, which we don't expose
          setSunkEnemyCells(hitCells);
        }

        // Connect to WebSocket and subscribe
        await connectToGame(data.gameId);
        pushLog("Reconectado à partida!");
      } catch (err) {
        // If 204 or error, just ignore - no active game
        if (err?.status !== 204) {
          console.log("No active game to reconnect to");
        }
      }
    }

    checkActiveGame();
  }, [user?.token]);

  // Create a new game
  const createGame = useCallback(async () => {
    setError(null);
    try {
      const game = await api.createGame();
      // GameResponse: { gameId, roomCode, status, message }
      const id = game.gameId;
      setGameId(id);
      setRoomCode(game.roomCode);
      setGameState("WAITING_FOR_OPPONENT");
      setOpponent(null);
    setOpponentName(null);
      resetGameState();
      await connectToGame(id);
      pushLog("Sala criada. Aguardando oponente...");
      return game;
    } catch (err) {
      setError(err.message || "Falha ao criar partida");
      throw err;
    }
  }, [connectToGame]);

  // Join an existing game (by UUID or room code)
  const joinGame = useCallback(async (gId) => {
    setError(null);
    try {
      // Detect if it's a room code (short, letters only) or a UUID
      const isRoomCode = gId.length <= 6 && /^[A-Za-z]+$/.test(gId);
      const game = isRoomCode
        ? await api.joinByRoomCode(gId.toUpperCase())
        : await api.joinGame(gId);
      // GameResponse: { gameId, roomCode, status, message }
      const id = game.gameId;
      setGameId(id);
      setRoomCode(game.roomCode);
      setGameState("PLACING_SHIPS");
      setOpponent(null);
    setOpponentName(null);
      setOpponentName(game.hostUsername || null);
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
    // Cancel game on backend if not yet in progress
    if (gameId && (gameState === "WAITING_FOR_OPPONENT" || gameState === "PLACING_SHIPS")) {
      try {
        await api.cancelGame(gameId);
      } catch {
        // Game may already be cancelled, ignore
      }
    }
    // Forfeit if game is in progress (immediate WO, no timer)
    if (gameId && gameState === "IN_PROGRESS") {
      try {
        await api.forfeitGame(gameId);
      } catch {
        // Game may already be finished, ignore
      }
    }
    stomp.disconnectStomp();
    resetGameState();
    setGameId(null);
    setRoomCode(null);
    setGameState(null);
    setOpponent(null);
    setOpponentName(null);
    setAvailableGames([]);
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
    setCancelledNotice(null);
    setSunkEnemyShips([]);
    setSunkMyShips([]);
    setSunkEnemyCells(new Set());
    setOpponentDisconnected(false);
    clearCountdown();
  }

  const dismissCancelledNotice = useCallback(() => {
    stomp.disconnectStomp();
    resetGameState();
    setGameId(null);
    setRoomCode(null);
    setGameState(null);
    setOpponent(null);
    setOpponentName(null);
    setLog([]);
  }, []);

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
        roomCode,
        gameState,
        opponent,
        opponentName,
        myTurn,
        enemyMarks,
        myMarks,
        gameOver,
        placedShips,
        availableGames,
        error,
        log,
        sunkEnemyShips,
        sunkEnemyCells,
        sunkMyShips,
        opponentReady,
        myReady,
        cancelledNotice,
        opponentDisconnected,
        reconnectCountdown,
        createGame,
        joinGame,
        fetchAvailableGames,
        confirmFleet,
        fire,
        leaveGame,
        dismissCancelledNotice,
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
