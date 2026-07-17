import { Client } from "@stomp/stompjs";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:5000/ws";

let stompClient = null;
let activeSubscription = null;

export function connectStomp(token, onEvent) {
  return new Promise((resolve, reject) => {
    if (stompClient?.connected) {
      resolve(stompClient);
      return;
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
        resolve(stompClient);
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame.headers["message"]);
        reject(new Error(frame.headers["message"] || "STOMP connection failed"));
      },
      onWebSocketClose: () => {
        console.warn("WebSocket closed");
      },
    });

    stompClient.activate();
  });
}

export function subscribeToGame(gameId, onEvent) {
  if (!stompClient?.connected) {
    console.error("STOMP not connected");
    return null;
  }

  // Unsubscribe from previous game if any
  if (activeSubscription) {
    activeSubscription.unsubscribe();
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

export function sendFire(gameId, row, col) {
  if (!stompClient?.connected) return;
  stompClient.publish({
    destination: `/app/game/${gameId}/fire`,
    body: JSON.stringify({ row, col }),
  });
}

export function disconnectStomp() {
  if (activeSubscription) {
    activeSubscription.unsubscribe();
    activeSubscription = null;
  }
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
  }
}
