export function FilmOverlay() {
  return (
    <>
      {/* Film Grain - estático, sem movimento */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[9999]"
        style={{
          opacity: 0.1,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Dust particles - mais visíveis */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-[9997] overflow-hidden">
        <div className="dust-particle" style={{ top: "12%", left: "18%", animationDelay: "0s" }} />
        <div className="dust-particle" style={{ top: "38%", left: "62%", animationDelay: "0.5s" }} />
        <div className="dust-particle" style={{ top: "68%", left: "33%", animationDelay: "1.1s" }} />
        <div className="dust-particle" style={{ top: "22%", left: "78%", animationDelay: "1.6s" }} />
        <div className="dust-particle" style={{ top: "58%", left: "12%", animationDelay: "0.2s" }} />
        <div className="dust-particle" style={{ top: "82%", left: "55%", animationDelay: "2.0s" }} />
        <div className="dust-particle" style={{ top: "45%", left: "42%", animationDelay: "0.8s" }} />
        <div className="dust-particle" style={{ top: "8%", left: "52%", animationDelay: "1.3s" }} />
        <div className="dust-particle" style={{ top: "90%", left: "75%", animationDelay: "2.4s" }} />
        <div className="dust-particle" style={{ top: "33%", left: "88%", animationDelay: "0.4s" }} />
        <div className="dust-particle-lg" style={{ top: "28%", left: "70%", animationDelay: "1.0s" }} />
        <div className="dust-particle-lg" style={{ top: "72%", left: "25%", animationDelay: "2.2s" }} />
        <div className="dust-particle-lg" style={{ top: "50%", left: "85%", animationDelay: "0.6s" }} />
        <div className="dust-particle-lg" style={{ top: "18%", left: "40%", animationDelay: "1.8s" }} />
      </div>

      {/* Vertical scratches */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-[9996] overflow-hidden">
        <div className="film-scratch" style={{ left: "22%", animationDuration: "8s", animationDelay: "0s" }} />
        <div className="film-scratch" style={{ left: "47%", animationDuration: "10s", animationDelay: "3s" }} />
        <div className="film-scratch" style={{ left: "68%", animationDuration: "9s", animationDelay: "6s" }} />
      </div>

      {/* Vignette estilo funil - bordas escuras profundas */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[9998]"
        style={{
          background: `
            radial-gradient(circle at 50% 50%,
              rgba(0,0,0,0.0) 0%,
              rgba(0,0,0,0.3) 40%,
              rgba(0,0,0,0.78) 65%,
              rgba(0,0,0,0.97) 100%
            )
          `,
        }}
      />

      {/* Central light - glow de projetor com flicker */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[1] projector-glow"
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 55%)",
        }}
      />

      <style>{`
        .dust-particle {
          position: absolute;
          width: 3px;
          height: 3px;
          background: white;
          border-radius: 50%;
          opacity: 0;
          animation: dust-flicker 2s infinite;
        }

        .dust-particle-lg {
          position: absolute;
          width: 5px;
          height: 5px;
          background: white;
          border-radius: 50%;
          filter: blur(0.5px);
          opacity: 0;
          animation: dust-flicker 2.5s infinite;
        }

        @keyframes dust-flicker {
          0%, 100% { opacity: 0; }
          3% { opacity: 1; }
          6% { opacity: 0.9; }
          9% { opacity: 0; }
          35% { opacity: 0; }
          37% { opacity: 0.85; }
          40% { opacity: 0; }
          65% { opacity: 0; }
          67% { opacity: 0.95; }
          70% { opacity: 0; }
        }

        .film-scratch {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 2px;
          opacity: 0;
          background: linear-gradient(
            to bottom,
            transparent 0%,
            rgba(255,255,255,0.6) 15%,
            rgba(255,255,255,0.85) 50%,
            rgba(255,255,255,0.6) 85%,
            transparent 100%
          );
          animation: scratch-flicker infinite linear;
        }

        @keyframes scratch-flicker {
          0%, 100% { opacity: 0; }
          2% { opacity: 0.9; }
          4% { opacity: 0.7; }
          6% { opacity: 0; }
          50% { opacity: 0; }
          52% { opacity: 0.6; }
          53% { opacity: 0; }
        }

        .projector-glow {
          animation: glow-flicker 9s infinite;
        }

        @keyframes glow-flicker {
          0% { opacity: 1; }
          8% { opacity: 0.88; }
          16% { opacity: 1; }
          45% { opacity: 0.92; }
          50% { opacity: 1; }
          72% { opacity: 0.85; }
          80% { opacity: 1; }
          92% { opacity: 0.93; }
          100% { opacity: 1; }
        }
      `}</style>
    </>
  );
}
