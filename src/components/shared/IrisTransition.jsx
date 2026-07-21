import { useState, useEffect, useCallback, createContext, useContext } from "react";

const IrisContext = createContext(null);

export function useIris() {
  return useContext(IrisContext);
}

export function IrisTransitionProvider({ children }) {
  const [phase, setPhase] = useState("idle"); // idle | closing | closed | opening
  const [onMidpoint, setOnMidpoint] = useState(null);
  const [autoOpen, setAutoOpen] = useState(true);

  const trigger = useCallback((callback) => {
    setAutoOpen(true);
    setOnMidpoint(() => callback);
    setPhase("closing");
  }, []);

  const triggerCloseOnly = useCallback((callback) => {
    setAutoOpen(false);
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
      }, 1500);
      return () => clearTimeout(timer);
    }

    if (phase === "closed") {
      // Execute the midpoint callback (view change happens here)
      if (onMidpoint) {
        onMidpoint();
        setOnMidpoint(null);
      }
      if (autoOpen) {
        const timer = setTimeout(() => {
          setPhase("opening");
        }, 200);
        return () => clearTimeout(timer);
      } else {
        // Don't auto-open, just go idle
        setPhase("idle");
      }
    }

    if (phase === "opening") {
      const timer = setTimeout(() => {
        setPhase("idle");
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [phase, onMidpoint, autoOpen]);

  return (
    <IrisContext.Provider value={{ trigger, triggerCloseOnly, triggerOpen, isTransitioning: phase !== "idle" }}>
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
