import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { NavalisApp } from "./NavalisApp";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <NavalisApp />
  </StrictMode>,
);
