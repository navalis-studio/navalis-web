import { useState, useEffect, useCallback, createContext, useContext } from "react";

const IrisContext = createContext(null);

export function useIris() {
  return useContext(IrisContext);
}

export function IrisTransitionProvider({ children }) {
  const [phase, setPhase] = useState("idle"); // idle | closing | closed | opening
  const [onMidpoint, setOnMidpoint] = useState(null);

  const trigger = useCallback((callback) => {
    setOnMidpoint(() => callback);
    setPhase("closing");
  }, []);

  const triggerOpen = useCallback(() => {
    setPhase("opening");
  }, []);

  useEffect(() => {
    if (phase === "closing") {
      const timer = setTimeout(() => {
        setPhase("closed");
      }, 700);
      return () => clearTimeout(timer);
    }

    if (phase === "closed") {
      // Execute the midpoint callback (view change happens here)
      if (onMidpoint) {
        onMidpoint();
        setOnMidpoint(null);
      }
      const timer = setTimeout(() => {
        setPhase("opening");
      }, 200);
      return () => clearTimeout(timer);
    }

    if (phase === "opening") {
      const timer = setTimeout(() => {
        setPhase("idle");
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [phase, onMidpoint]);

  return (
    <IrisContext.Provider value={{ trigger, triggerOpen, isTransitioning: phase !== "idle" }}>
      {children}
      {phase !== "idle" && <IrisOverlay phase={phase} />}
    </IrisContext.Provider>
  );
}

function IrisOverlay({ phase }) {
  const animationClass =
    phase === "closing"
      ? "iris-close"
      : phase === "closed"
        ? "iris-closed"
        : "iris-open";

  return (
    <div
      className={`fixed inset-0 z-[99999] pointer-events-none ${animationClass}`}
    />
  );
}
