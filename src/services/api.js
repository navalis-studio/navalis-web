const BASE_URL = "http://localhost:5000/api";

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
    const body = await response.json().catch(() => ({}));
    const error = new Error(body.message || body.error || `Request failed: ${response.status}`);
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
// GameResponse: { gameId (UUID), status, message }
export async function createGame() {
  return request("/games", { method: "POST" });
}

export async function joinGame(gameId) {
  return request(`/games/${gameId}/join`, { method: "POST" });
}

export async function listAvailableGames() {
  return request("/games/available");
}

export async function getGame(gameId) {
  return request(`/games/${gameId}`);
}

export async function cancelGame(gameId) {
  return request(`/games/${gameId}`, { method: "DELETE" });
}
