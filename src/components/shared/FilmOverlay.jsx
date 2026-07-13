import { useMemo } from "react";

function generateParticles(count, sizeClass) {
  const particles = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      id: `${sizeClass}-${i}`,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      delay: `${(Math.random() * 5).toFixed(1)}s`,
      duration: `${(3 + Math.random() * 2).toFixed(1)}s`,
      pattern: Math.floor(Math.random() * 4),
    });
  }
  return particles;
}

export function FilmOverlay() {
  const smallParticles = useMemo(() => generateParticles(12, "sm"), []);
  const largeParticles = useMemo(() => generateParticles(5, "lg"), []);

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

      {/* Dust particles */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-[9997] overflow-hidden">
        {smallParticles.map((p) => (
          <div
            key={p.id}
            className={`dust-particle dust-pattern-${p.pattern}`}
            style={{ top: p.top, left: p.left, animationDelay: p.delay, animationDuration: p.duration }}
          />
        ))}
        {largeParticles.map((p) => (
          <div
            key={p.id}
            className={`dust-particle-lg dust-pattern-${p.pattern}`}
            style={{ top: p.top, left: p.left, animationDelay: p.delay, animationDuration: p.duration }}
          />
        ))}
      </div>

      {/* Vertical scratches */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-[9996] overflow-hidden">
        <div className="film-scratch" style={{ left: "18%", animationDuration: "6s", animationDelay: "0s" }} />
        <div className="film-scratch" style={{ left: "42%", animationDuration: "7.5s", animationDelay: "2s" }} />
        <div className="film-scratch" style={{ left: "65%", animationDuration: "6.5s", animationDelay: "4.5s" }} />
        <div className="film-scratch" style={{ left: "83%", animationDuration: "8s", animationDelay: "1s" }} />
      </div>

      {/* Vignette estilo funil - bordas escuras */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[9998]"
        style={{
          background: `
            radial-gradient(circle at 50% 50%,
              rgba(0,0,0,0.0) 0%,
              rgba(0,0,0,0.1) 40%,
              rgba(0,0,0,0.5) 68%,
              rgba(0,0,0,0.85) 100%
            )
          `,
        }}
      />

      {/* Central light - glow de projetor com flicker */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[1] projector-glow"
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.18) 0%, transparent 60%)",
        }}
      />

      <style>{`
        .dust-particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: white;
          border-radius: 50%;
          opacity: 0;
        }

        .dust-particle-lg {
          position: absolute;
          width: 6px;
          height: 6px;
          background: white;
          border-radius: 50%;
          filter: blur(0.5px);
          opacity: 0;
        }

        /* 4 padrões diferentes - cada um pisca 1x por ciclo em momentos distintos */
        .dust-pattern-0 {
          animation-name: dust-a;
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
        }
        .dust-pattern-1 {
          animation-name: dust-b;
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
        }
        .dust-pattern-2 {
          animation-name: dust-c;
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
        }
        .dust-pattern-3 {
          animation-name: dust-d;
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
        }

        @keyframes dust-a {
          0%, 100% { opacity: 0; }
          6% { opacity: 1; }
          14% { opacity: 0; }
        }

        @keyframes dust-b {
          0%, 100% { opacity: 0; }
          28% { opacity: 0; }
          34% { opacity: 1; }
          42% { opacity: 0; }
        }

        @keyframes dust-c {
          0%, 100% { opacity: 0; }
          52% { opacity: 0; }
          58% { opacity: 1; }
          66% { opacity: 0; }
        }

        @keyframes dust-d {
          0%, 100% { opacity: 0; }
          75% { opacity: 0; }
          81% { opacity: 1; }
          89% { opacity: 0; }
        }

        .film-scratch {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 1.5px;
          opacity: 0;
          background: linear-gradient(
            to bottom,
            transparent 0%,
            rgba(255,255,255,0.5) 20%,
            rgba(255,255,255,0.75) 50%,
            rgba(255,255,255,0.5) 80%,
            transparent 100%
          );
          animation: scratch-flicker infinite linear;
        }

        @keyframes scratch-flicker {
          0%, 100% { opacity: 0; }
          4% { opacity: 0.85; }
          8% { opacity: 0.6; }
          10% { opacity: 0; }
          55% { opacity: 0; }
          58% { opacity: 0.7; }
          60% { opacity: 0; }
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
