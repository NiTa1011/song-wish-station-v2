import React, { useMemo } from "react";

export const DefaultBackground: React.FC = () => {
  // Generate stable particle positions
  const particles = useMemo(() => {
    return Array.from({ length: 22 }, (_, i) => ({
      id: i,
      left: (i * 4.7) % 100,
      size: 3 + ((i * 3) % 5),
      delay: (i * 0.4) % 6,
      duration: 6 + ((i * 1.5) % 8),
      opacity: 0.25 + ((i % 5) * 0.12),
      isAccent: i % 3 === 0,
    }));
  }, []);

  // Equalizer bar heights & delays
  const eqBars = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => ({
      id: i,
      minHeight: 12 + ((i * 7) % 25),
      maxHeight: 45 + ((i * 11) % 50),
      duration: 0.8 + ((i * 0.13) % 1.2),
      delay: (i * 0.08) % 1.5,
      color:
        i % 4 === 0
          ? "hsl(var(--primary))"
          : i % 4 === 1
          ? "hsl(var(--accent))"
          : i % 4 === 2
          ? "hsl(190 90% 48%)"
          : "hsl(var(--primary) / 0.7)",
    }));
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      aria-hidden="true"
    >
      {/* Dynamic ambient club lighting orbs */}
      <div className="absolute top-[-10%] left-[-5%] w-[45vw] h-[45vw] min-w-[320px] min-h-[320px] rounded-full bg-primary/20 blur-[100px] animate-pulse" style={{ animationDuration: "8s" }} />
      <div className="absolute top-[20%] right-[-10%] w-[50vw] h-[50vw] min-w-[350px] min-h-[350px] rounded-full bg-accent/20 blur-[120px] animate-pulse" style={{ animationDuration: "11s", animationDelay: "2s" }} />
      <div className="absolute bottom-[-15%] left-[20%] w-[55vw] h-[55vw] min-w-[380px] min-h-[380px] rounded-full bg-[hsl(190_90%_48%/0.15)] blur-[110px] animate-pulse" style={{ animationDuration: "9s", animationDelay: "4s" }} />

      {/* Sweeping diagonal disco light beam */}
      <div
        className="absolute -top-32 left-1/4 w-[280px] h-[120vh] opacity-25 transform -rotate-45 origin-top pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.25) 50%, transparent)",
          filter: "blur(25px)",
          animation: "beam-sweep 14s ease-in-out infinite alternate",
        }}
      />
      <div
        className="absolute -top-32 right-1/4 w-[240px] h-[120vh] opacity-20 transform rotate-45 origin-top pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent, hsl(var(--accent) / 0.2) 50%, transparent)",
          filter: "blur(30px)",
          animation: "beam-sweep 16s ease-in-out infinite alternate-reverse",
        }}
      />

      {/* Stylized Vinyl Disc in top-right corner */}
      <div className="absolute -top-20 -right-20 md:-top-16 md:-right-16 w-72 h-72 md:w-96 md:h-96 opacity-30 md:opacity-40 transition-opacity">
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full animate-[spin_32s_linear_infinite]"
          style={{ willChange: "transform" }}
        >
          <defs>
            <radialGradient id="vinyl-body" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1a1829" />
              <stop offset="40%" stopColor="#12101e" />
              <stop offset="70%" stopColor="#0b0914" />
              <stop offset="95%" stopColor="#151224" />
              <stop offset="100%" stopColor="#08070d" />
            </radialGradient>
            <linearGradient id="vinyl-sheen-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="white" stopOpacity="0.25" />
              <stop offset="48%" stopColor="white" stopOpacity="0.02" />
              <stop offset="52%" stopColor="transparent" />
              <stop offset="100%" stopColor="white" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="vinyl-label" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--accent))" />
            </linearGradient>
          </defs>

          {/* Vinyl base disc */}
          <circle cx="100" cy="100" r="98" fill="url(#vinyl-body)" stroke="hsl(var(--primary)/0.3)" strokeWidth="1" />

          {/* Microgrooves */}
          <circle cx="100" cy="100" r="88" fill="none" stroke="#35314d" strokeWidth="0.6" strokeDasharray="4 2 8 3" opacity="0.6" />
          <circle cx="100" cy="100" r="80" fill="none" stroke="#2a273f" strokeWidth="0.8" opacity="0.8" />
          <circle cx="100" cy="100" r="72" fill="none" stroke="#35314d" strokeWidth="0.5" strokeDasharray="12 4" opacity="0.6" />
          <circle cx="100" cy="100" r="64" fill="none" stroke="#252238" strokeWidth="0.8" opacity="0.8" />
          <circle cx="100" cy="100" r="54" fill="none" stroke="#35314d" strokeWidth="0.5" strokeDasharray="6 3" opacity="0.5" />
          <circle cx="100" cy="100" r="44" fill="none" stroke="#252238" strokeWidth="0.7" opacity="0.7" />

          {/* Light sheen cones (anisotropic reflection) */}
          <path d="M 100 100 L 30 20 A 98 98 0 0 1 170 20 Z" fill="url(#vinyl-sheen-1)" opacity="0.4" />
          <path d="M 100 100 L 170 180 A 98 98 0 0 1 30 180 Z" fill="url(#vinyl-sheen-1)" opacity="0.4" />

          {/* Center Label */}
          <circle cx="100" cy="100" r="32" fill="url(#vinyl-label)" />
          <circle cx="100" cy="100" r="28" fill="none" stroke="white" strokeWidth="0.7" opacity="0.6" />
          {/* Soundwave on label */}
          <path
            d="M 85 100 Q 90 93 95 100 T 105 100 T 115 100"
            fill="none"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.8"
          />
          {/* Center Spindle Hole */}
          <circle cx="100" cy="100" r="5" fill="#0b0914" stroke="white" strokeWidth="0.8" opacity="0.9" />
        </svg>
      </div>

      {/* Floating Stage Dust & Light Flecks */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${p.left}%`,
            bottom: "-20px",
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.isAccent ? "hsl(var(--accent))" : "hsl(var(--primary))",
            opacity: p.opacity,
            boxShadow: `0 0 ${p.size * 2}px ${
              p.isAccent ? "hsl(var(--accent))" : "hsl(var(--primary))"
            }`,
            animation: `float-dust ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}

      {/* Modern Audio Equalizer Bars at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-28 flex items-end justify-center gap-1.5 md:gap-2 px-6 pb-2 opacity-35 md:opacity-45 pointer-events-none">
        {eqBars.map((bar) => (
          <div
            key={bar.id}
            className="w-1.5 md:w-2 rounded-t-full transition-all duration-300"
            style={{
              height: `${bar.minHeight}%`,
              backgroundColor: bar.color,
              boxShadow: `0 0 10px ${bar.color}`,
              animation: `eq-bounce ${bar.duration}s ease-in-out ${bar.delay}s infinite alternate`,
            }}
          />
        ))}
      </div>
    </div>
  );
};
