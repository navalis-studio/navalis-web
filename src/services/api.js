const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function getToken() {
  return localStorage.getItem("navalis_token");
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // Auto-logout on invalid/expired token
    if ((response.status === 401 || response.status === 403) && token) {
      localStorage.removeItem("navalis_token");
      localStorage.removeItem("navalis_username");
      localStorage.removeItem("navalis_user_id");
      window.location.reload();
      return;
    }

    const body = await response.json().catch(() => ({}));
    let message = body.message || body.detail || body.error || `Request failed: ${response.status}`;
    // Clean validation field prefixes (e.g. "password: Senha deve..." → "Senha deve...")
    message = message
      .split("; ")
      .map((msg) => msg.replace(/^\w+:\s*/, ""))
      .join(" ");
    const error = new Error(message);
    error.status = response.status;
    error.body = body;
    throw error;
  }

  if (response.status === 204) return null;
  return response.json();
}

// Auth
export async function register(username, password) {
  const data = await request("/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  // AuthResponse: { id (UUID), username, token }
  localStorage.setItem("navalis_token", data.token);
  localStorage.setItem("navalis_username", data.username);
  localStorage.setItem("navalis_user_id", data.id);
  return data;
}

export async function login(username, password) {
  const data = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  // AuthResponse: { id (UUID), username, token }
  localStorage.setItem("navalis_token", data.token);
  localStorage.setItem("navalis_username", data.username);
  localStorage.setItem("navalis_user_id", data.id);
  return data;
}

export function logout() {
  localStorage.removeItem("navalis_token");
  localStorage.removeItem("navalis_username");
  localStorage.removeItem("navalis_user_id");
}

export function getStoredAuth() {
  const token = getToken();
  const username = localStorage.getItem("navalis_username");
  const userId = localStorage.getItem("navalis_user_id");
  if (token && username && userId) return { token, username, userId };
  return null;
}

// Games
// GameResponse: { gameId (UUID), roomCode, status, message }
export async function createGame() {
  return request("/games", { method: "POST" });
}

export async function joinGame(gameId) {
  return request(`/games/${gameId}/join`, { method: "POST" });
}

export async function joinByRoomCode(roomCode) {
  return request(`/games/join/${roomCode}`, { method: "POST" });
}

export async function listAvailableGames() {
  return request("/games/available");
}

export async function cancelGame(gameId) {
  return request(`/games/${gameId}`, { method: "DELETE" });
}

export async function forfeitGame(gameId) {
  return request(`/games/${gameId}/forfeit`, { method: "POST" });
}

export async function getActiveGame() {
  return request("/games/active");
}


// Ranking
export async function getRanking() {
  return request("/players/ranking");
}
