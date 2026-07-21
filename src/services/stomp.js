import { Client } from "@stomp/stompjs";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:5000/ws";

let stompClient = null;
let activeSubscription = null;

// Track current subscription for auto-reconnect
let currentGameId = null;
let currentEventHandler = null;

function resubscribe() {
  if (currentGameId && currentEventHandler && stompClient?.connected) {
    // Unsubscribe old (stale) subscription if any
    if (activeSubscription) {
      try {
        activeSubscription.unsubscribe();
      } catch {
        // Subscription may already be dead from disconnect
      }
      activeSubscription = null;
    }

    activeSubscription = stompClient.subscribe(`/topic/game/${currentGameId}`, (message) => {
      try {
        const event = JSON.parse(message.body);
        currentEventHandler(event);
      } catch (e) {
        console.error("Failed to parse game event:", e);
      }
    });
  }
}

export function connectStomp(token) {
  return new Promise((resolve, reject) => {
    if (stompClient?.connected) {
      resolve(stompClient);
      return;
    }

    // If there's an existing client trying to reconnect, deactivate it first
    if (stompClient) {
      stompClient.deactivate();
      stompClient = null;
    }

    stompClient = new Client({
      brokerURL: WS_URL,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        // Re-subscribe on every connect (initial + auto-reconnects)
        resubscribe();
        resolve(stompClient);
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame.headers["message"]);
        reject(new Error(frame.headers["message"] || "STOMP connection failed"));
      },
      onWebSocketClose: () => {
        console.warn("WebSocket closed, will auto-reconnect...");
      },
    });

    stompClient.activate();
  });
}

export function subscribeToGame(gameId, onEvent) {
  // Always store for reconnect
  currentGameId = gameId;
  currentEventHandler = onEvent;

  if (!stompClient?.connected) {
    console.warn("STOMP not connected yet, will subscribe on connect");
    return null;
  }

  // Unsubscribe from previous game if any
  if (activeSubscription) {
    try {
      activeSubscription.unsubscribe();
    } catch {
      // May already be dead
    }
    activeSubscription = null;
  }

  activeSubscription = stompClient.subscribe(`/topic/game/${gameId}`, (message) => {
    try {
      const event = JSON.parse(message.body);
      onEvent(event);
    } catch (e) {
      console.error("Failed to parse game event:", e);
    }
  });

  return activeSubscription;
}

export function sendPlaceShip(gameId, shipType, row, col, orientation) {
  if (!stompClient?.connected) return;
  stompClient.publish({
    destination: `/app/game/${gameId}/place-ship`,
    body: JSON.stringify({
      shipType,
      row,
      col,
      orientation,
    }),
  });
}

export function sendReady(gameId) {
  if (!stompClient?.connected) return;
  stompClient.publish({
    destination: `/app/game/${gameId}/ready`,
    body: "",
  });
}

export function sendUnready(gameId) {
  if (!stompClient?.connected) return;
  stompClient.publish({
    destination: `/app/game/${gameId}/unready`,
    body: "",
  });
}

export function sendFire(gameId, row, col) {
  if (!stompClient?.connected) return;
  stompClient.publish({
    destination: `/app/game/${gameId}/fire`,
    body: JSON.stringify({ row, col }),
  });
}

export function disconnectStomp() {
  currentGameId = null;
  currentEventHandler = null;

  if (activeSubscription) {
    try {
      activeSubscription.unsubscribe();
    } catch {
      // May already be dead
    }
    activeSubscription = null;
  }
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
  }
}
