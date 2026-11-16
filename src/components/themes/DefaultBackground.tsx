import React from "react";

/*
 * Performance notes:
 * - No `filter: blur()` on large elements: soft glows are radial gradients instead,
 *   which the GPU draws once instead of re-blurring huge layers every frame.
 * - Only `transform` and `opacity` are animated (compositor-only, no layout/paint).
 * - No box-shadows on animated elements.
 */

// Stable, precomputed decoration data (module level: computed once, never re-created)
const PARTICLES = Array.from({ length: 16 }, (_, i) => ({
  id: i,
  left: (i * 6.3) % 100,
  size: 4 + ((i * 3) % 5),
  delay: (i * 0.45) % 6,
  duration: 7 + ((i * 1.5) % 8),
  opacity: 0.3 + ((i % 5) * 0.12),
  isAccent: i % 3 === 0,
}));

const EQ_BARS = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  minHeight: 12 + ((i * 7) % 25),
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

export const DefaultBackground: React.FC = () => {
  return (
    <div
      className="theme-decor fixed inset-0 pointer-events-none overflow-hidden z-0"
      aria-hidden="true"
    >
      {/* Ambient club lighting orbs (static radial gradients, no blur filter) */}
      <div
        className="absolute top-[-20%] left-[-15%] w-[65vw] h-[65vw] min-w-[420px] min-h-[420px] rounded-full"
        style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.2) 0%, transparent 65%)" }}
      />
      <div
        className="absolute top-[10%] right-[-20%] w-[70vw] h-[70vw] min-w-[450px] min-h-[450px] rounded-full"
        style={{ background: "radial-gradient(circle, hsl(var(--accent) / 0.2) 0%, transparent 65%)" }}
      />
      <div
        className="absolute bottom-[-25%] left-[10%] w-[75vw] h-[75vw] min-w-[480px] min-h-[480px] rounded-full"
        style={{ background: "radial-gradient(circle, hsl(190 90% 48% / 0.15) 0%, transparent 65%)" }}
      />

      {/* Sweeping diagonal disco light beams (gradient is already soft – no blur needed) */}
      <div
        className="absolute -top-32 left-1/4 w-[280px] h-[120vh] opacity-25 origin-top"
        style={{
          background:
            "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.22) 50%, transparent)",
          animation: "beam-sweep 14s ease-in-out infinite alternate",
          willChange: "transform, opacity",
        }}
      />
      <div
        className="absolute -top-32 right-1/4 w-[240px] h-[120vh] opacity-20 origin-top"
        style={{
          background:
            "linear-gradient(90deg, transparent, hsl(var(--accent) / 0.18) 50%, transparent)",
          animation: "beam-sweep 16s ease-in-out infinite alternate-reverse",
          willChange: "transform, opacity",
        }}
      />

      {/* Stylized Vinyl Disc in top-right corner */}
      <div className="absolute -top-20 -right-20 md:-top-16 md:-right-16 w-72 h-72 md:w-96 md:h-96 opacity-30 md:opacity-40">
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

          <circle cx="100" cy="100" r="98" fill="url(#vinyl-body)" stroke="hsl(var(--primary)/0.3)" strokeWidth="1" />

          <circle cx="100" cy="100" r="88" fill="none" stroke="#35314d" strokeWidth="0.6" strokeDasharray="4 2 8 3" opacity="0.6" />
          <circle cx="100" cy="100" r="80" fill="none" stroke="#2a273f" strokeWidth="0.8" opacity="0.8" />
          <circle cx="100" cy="100" r="72" fill="none" stroke="#35314d" strokeWidth="0.5" strokeDasharray="12 4" opacity="0.6" />
          <circle cx="100" cy="100" r="64" fill="none" stroke="#252238" strokeWidth="0.8" opacity="0.8" />
          <circle cx="100" cy="100" r="54" fill="none" stroke="#35314d" strokeWidth="0.5" strokeDasharray="6 3" opacity="0.5" />
          <circle cx="100" cy="100" r="44" fill="none" stroke="#252238" strokeWidth="0.7" opacity="0.7" />

          <path d="M 100 100 L 30 20 A 98 98 0 0 1 170 20 Z" fill="url(#vinyl-sheen-1)" opacity="0.4" />
          <path d="M 100 100 L 170 180 A 98 98 0 0 1 30 180 Z" fill="url(#vinyl-sheen-1)" opacity="0.4" />

          <circle cx="100" cy="100" r="32" fill="url(#vinyl-label)" />
          <circle cx="100" cy="100" r="28" fill="none" stroke="white" strokeWidth="0.7" opacity="0.6" />
          <path
            d="M 85 100 Q 90 93 95 100 T 105 100 T 115 100"
            fill="none"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.8"
          />
          <circle cx="100" cy="100" r="5" fill="#0b0914" stroke="white" strokeWidth="0.8" opacity="0.9" />
        </svg>
      </div>

      {/* Floating stage dust (glow via radial gradient instead of box-shadow) */}
      {PARTICLES.map((p) => {
        const color = p.isAccent ? "var(--accent)" : "var(--primary)";
        return (
          <div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.left}%`,
              bottom: "-30px",
              width: `${p.size * 3}px`,
              height: `${p.size * 3}px`,
              background: `radial-gradient(circle, hsl(${color}) 0%, hsl(${color}) 30%, hsl(${color} / 0.25) 45%, transparent 70%)`,
              opacity: p.opacity,
              animation: `float-dust ${p.duration}s ease-in-out ${p.delay}s infinite`,
              willChange: "transform, opacity",
            }}
          />
        );
      })}

      {/* Audio equalizer bars – animated with transform: scaleY (no layout per frame) */}
      <div className="absolute bottom-0 left-0 right-0 h-28 flex items-end justify-center gap-1.5 md:gap-2 px-6 pb-2 opacity-35 md:opacity-45">
        {EQ_BARS.map((bar) => (
          <div
            key={bar.id}
            className="w-1.5 md:w-2 h-full rounded-t-sm origin-bottom"
            style={{
              backgroundColor: bar.color,
              transform: `scaleY(${bar.minHeight / 100})`,
              animation: `eq-bounce ${bar.duration}s ease-in-out ${bar.delay}s infinite alternate`,
              willChange: "transform",
            }}
          />
        ))}
      </div>
    </div>
  );
};
