import React, { useState, useEffect, useMemo, useCallback } from "react";

interface ConfettiPiece {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
  shape: "circle" | "rect" | "star";
  rotation: number;
}

interface BurstPiece {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
}

let burstId = 0;

export const FaschingBackground: React.FC = () => {
  // Stable falling confetti pieces
  const pieces = useMemo<ConfettiPiece[]>(() => {
    const colors = [
      "hsl(45 100% 52%)", // Gold
      "hsl(340 90% 56%)", // Fuchsia / Pink
      "hsl(280 85% 58%)", // Royal Violet
      "hsl(165 85% 42%)", // Emerald / Turquoise
      "hsl(25 100% 55%)",  // Orange
    ];
    const shapes: ("circle" | "rect" | "star")[] = ["circle", "rect", "rect", "star"];

    return Array.from({ length: 32 }, (_, i) => ({
      id: i,
      left: (i * 3.2 + Math.sin(i) * 3 + 100) % 100,
      size: 6 + ((i * 3) % 8),
      duration: 4.5 + ((i * 1.3) % 5.5),
      delay: (i * 0.22) % 6,
      color: colors[i % colors.length],
      shape: shapes[i % shapes.length],
      rotation: (i * 47) % 360,
    }));
  }, []);

  // Interactive click burst particles
  const [bursts, setBursts] = useState<BurstPiece[]>([]);

  const handleScreenClick = useCallback((e: MouseEvent) => {
    // Only spawn if click was on background or card surface
    const colors = [
      "hsl(45 100% 52%)",
      "hsl(340 90% 56%)",
      "hsl(280 85% 58%)",
      "hsl(165 85% 42%)",
    ];

    const newPieces: BurstPiece[] = Array.from({ length: 14 }, (_, i) => {
      const angle = (i / 14) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const speed = 60 + Math.random() * 90;
      return {
        id: ++burstId,
        x: e.clientX,
        y: e.clientY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[i % colors.length],
        size: 5 + Math.random() * 6,
      };
    });

    setBursts((prev) => [...prev.slice(-36), ...newPieces]);

    // Clean up after the animation finished
    const ids = new Set(newPieces.map((np) => np.id));
    setTimeout(() => {
      setBursts((prev) => prev.filter((p) => !ids.has(p.id)));
    }, 1200);
  }, []);

  useEffect(() => {
    window.addEventListener("click", handleScreenClick);
    return () => window.removeEventListener("click", handleScreenClick);
  }, [handleScreenClick]);

  return (
    <div
      className="theme-decor fixed inset-0 pointer-events-none overflow-hidden z-0"
      aria-hidden="true"
    >
      {/* Warm celebratory ambient lighting orbs (radial gradients instead of blur filters) */}
      <div className="absolute top-[-25%] right-[0%] w-[70vw] h-[70vw] min-w-[420px] min-h-[420px] rounded-full" style={{ background: "radial-gradient(circle, hsl(340 90% 56% / 0.12) 0%, transparent 65%)" }} />
      <div className="absolute top-[15%] left-[-25%] w-[75vw] h-[75vw] min-w-[450px] min-h-[450px] rounded-full" style={{ background: "radial-gradient(circle, hsl(280 85% 58% / 0.12) 0%, transparent 65%)" }} />
      <div className="absolute bottom-[-25%] right-[-15%] w-[65vw] h-[65vw] min-w-[400px] min-h-[400px] rounded-full" style={{ background: "radial-gradient(circle, hsl(45 100% 52% / 0.14) 0%, transparent 65%)" }} />
      <div className="absolute bottom-[5%] left-[10%] w-[60vw] h-[60vw] min-w-[380px] min-h-[380px] rounded-full" style={{ background: "radial-gradient(circle, hsl(165 85% 42% / 0.1) 0%, transparent 65%)" }} />

      {/* Sweeping Carnival Stage Spotlights */}
      <div
        className="absolute -top-32 left-10 w-[300px] h-[120vh] opacity-25 transform -rotate-25 origin-top pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent, hsl(45 100% 55% / 0.3) 50%, transparent)",
          animation: "beam-sweep 12s ease-in-out infinite alternate",
          willChange: "transform, opacity",
        }}
      />
      <div
        className="absolute -top-32 right-10 w-[280px] h-[120vh] opacity-20 transform rotate-25 origin-top pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent, hsl(340 90% 60% / 0.25) 50%, transparent)",
          animation: "beam-sweep 15s ease-in-out infinite alternate-reverse",
          willChange: "transform, opacity",
        }}
      />

      {/* Ornate Venetian Masquerade Mask Watermark in Top Center */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-72 h-44 md:w-96 md:h-56 opacity-15 md:opacity-20 pointer-events-none">
        <svg viewBox="0 0 200 120" className="w-full h-full">
          <defs>
            <linearGradient id="mask-gold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(45 100% 55%)" />
              <stop offset="50%" stopColor="hsl(340 90% 56%)" />
              <stop offset="100%" stopColor="hsl(280 85% 58%)" />
            </linearGradient>
            <linearGradient id="feather-grad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="hsl(280 85% 58%)" />
              <stop offset="60%" stopColor="hsl(340 90% 56%)" />
              <stop offset="100%" stopColor="hsl(45 100% 55%)" />
            </linearGradient>
          </defs>

          {/* Feather Crest */}
          <path
            d="M 100,50 C 95,20 80,5 65,0 C 80,18 88,35 92,50 Z"
            fill="url(#feather-grad)"
            opacity="0.8"
          />
          <path
            d="M 100,50 C 100,15 100,0 100,0 C 100,18 100,35 100,50 Z"
            stroke="url(#feather-grad)"
            strokeWidth="3"
            opacity="0.9"
          />
          <path
            d="M 100,50 C 105,20 120,5 135,0 C 120,18 112,35 108,50 Z"
            fill="url(#feather-grad)"
            opacity="0.8"
          />

          {/* Mask Contour with Filigree curves */}
          <path
            d="M 100,75 C 90,65 72,58 45,60 C 22,62 10,75 14,92 C 18,108 40,115 65,108 C 85,102 96,82 100,75 C 104,82 115,102 135,108 C 160,115 182,108 186,92 C 190,75 178,62 155,60 C 128,58 110,65 100,75 Z"
            fill="none"
            stroke="url(#mask-gold)"
            strokeWidth="2.5"
          />

          {/* Eye Openings */}
          <path
            d="M 45,78 C 35,78 30,85 35,92 C 42,98 58,96 65,90 C 70,85 60,78 45,78 Z"
            fill="none"
            stroke="url(#mask-gold)"
            strokeWidth="2"
          />
          <path
            d="M 155,78 C 165,78 170,85 165,92 C 158,98 142,96 135,90 C 130,85 140,78 155,78 Z"
            fill="none"
            stroke="url(#mask-gold)"
            strokeWidth="2"
          />

          {/* Filigree accents */}
          <circle cx="100" cy="65" r="4" fill="hsl(45 100% 55%)" />
          <circle cx="25" cy="85" r="2" fill="hsl(45 100% 55%)" />
          <circle cx="175" cy="85" r="2" fill="hsl(45 100% 55%)" />
        </svg>
      </div>

      {/* 3D Shaded Serpentine Streamers (Luftschlangen) on Left & Right */}
      {/* Left Streamer */}
      <div className="absolute top-0 -left-6 md:left-2 w-28 md:w-40 h-full opacity-60 md:opacity-75 pointer-events-none">
        <svg viewBox="0 0 100 600" preserveAspectRatio="none" className="w-full h-full">
          <defs>
            <linearGradient id="streamer-gold" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#d4af37" />
              <stop offset="50%" stopColor="#fff2a8" />
              <stop offset="100%" stopColor="#aa820a" />
            </linearGradient>
            <linearGradient id="streamer-pink" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(340 90% 45%)" />
              <stop offset="50%" stopColor="hsl(340 100% 70%)" />
              <stop offset="100%" stopColor="hsl(340 80% 35%)" />
            </linearGradient>
          </defs>

          {/* Spiral Ribbon 1 */}
          <path
            d="M 30,0 Q 80,50 30,100 T 30,200 T 30,300 T 30,400 T 30,500 T 30,600"
            fill="none"
            stroke="url(#streamer-gold)"
            strokeWidth="9"
            strokeLinecap="round"
          />
          {/* Spiral Ribbon 2 */}
          <path
            d="M 60,0 Q 20,60 60,120 T 60,240 T 60,360 T 60,480 T 60,600"
            fill="none"
            stroke="url(#streamer-pink)"
            strokeWidth="7"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Right Streamer */}
      <div className="absolute top-0 -right-6 md:right-2 w-28 md:w-40 h-full opacity-60 md:opacity-75 pointer-events-none">
        <svg viewBox="0 0 100 600" preserveAspectRatio="none" className="w-full h-full">
          <defs>
            <linearGradient id="streamer-turquoise" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(165 85% 35%)" />
              <stop offset="50%" stopColor="hsl(165 100% 70%)" />
              <stop offset="100%" stopColor="hsl(165 80% 25%)" />
            </linearGradient>
            <linearGradient id="streamer-violet" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(280 85% 45%)" />
              <stop offset="50%" stopColor="hsl(280 100% 75%)" />
              <stop offset="100%" stopColor="hsl(280 80% 35%)" />
            </linearGradient>
          </defs>

          <path
            d="M 40,0 Q 80,70 40,140 T 40,280 T 40,420 T 40,560 T 40,650"
            fill="none"
            stroke="url(#streamer-turquoise)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M 70,0 Q 30,55 70,110 T 70,220 T 70,330 T 70,440 T 70,550"
            fill="none"
            stroke="url(#streamer-violet)"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Falling Tumbling Confetti (Multi-shape with 3D rotation) */}
      {pieces.map((piece) => {
        return (
          <div
            key={piece.id}
            className="absolute pointer-events-none"
            style={{
              left: `${piece.left}%`,
              top: "-20px",
              width: `${piece.size}px`,
              height: piece.shape === "rect" ? `${piece.size * 1.5}px` : `${piece.size}px`,
              backgroundColor: piece.shape !== "star" ? piece.color : "transparent",
              borderRadius: piece.shape === "circle" ? "50%" : "2px",
              opacity: 0.85,
              willChange: "transform",
              animation: `confetti-fall ${piece.duration}s linear ${piece.delay}s infinite`,
              transform: `rotate(${piece.rotation}deg)`,
            }}
          >
            {piece.shape === "star" && (
              <svg viewBox="0 0 24 24" className="w-full h-full" fill={piece.color}>
                <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
              </svg>
            )}
          </div>
        );
      })}

      {/* Interactive Click Burst Particles */}
      {bursts.map((b) => (
        <div
          key={b.id}
          className="burst absolute rounded-full pointer-events-none"
          style={{
            left: `${b.x}px`,
            top: `${b.y}px`,
            width: `${b.size}px`,
            height: `${b.size}px`,
            backgroundColor: b.color,
            animation: "confetti-burst 1.1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards",
            "--bx": `${b.vx}px`,
            "--by": `${b.vy}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};
