import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import { GameProvider } from "./contexts/GameContext";
import { AudioProvider } from "./contexts/AudioContext";
import { NavalisApp } from "./NavalisApp";
import "./styles.css";

// Cursor click animation - alterna para frame de "select" ao clicar
document.addEventListener("mousedown", () => document.documentElement.classList.add("clicking"));
document.addEventListener("mouseup", () => document.documentElement.classList.remove("clicking"));

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <LanguageProvider>
      <AuthProvider>
        <GameProvider>
          <AudioProvider>
            <NavalisApp />
          </AudioProvider>
        </GameProvider>
      </AuthProvider>
    </LanguageProvider>
  </StrictMode>,
);
