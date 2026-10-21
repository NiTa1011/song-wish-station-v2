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

    return Array.from({ length: 42 }, (_, i) => ({
      id: i,
      left: (i * 2.4 + Math.sin(i) * 3) % 100,
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

    const newPieces: BurstPiece[] = Array.from({ length: 18 }, (_, i) => {
      const angle = (i / 18) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const speed = 60 + Math.random() * 90;
      return {
        id: Date.now() + i,
        x: e.clientX,
        y: e.clientY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[i % colors.length],
        size: 5 + Math.random() * 6,
      };
    });

    setBursts((prev) => [...prev.slice(-36), ...newPieces]);

    // Clean up after 1.2s
    setTimeout(() => {
      setBursts((prev) => prev.filter((p) => !newPieces.some((np) => np.id === p.id)));
    }, 1200);
  }, []);

  useEffect(() => {
    window.addEventListener("click", handleScreenClick);
    return () => window.removeEventListener("click", handleScreenClick);
  }, [handleScreenClick]);

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      aria-hidden="true"
    >
      {/* Warm celebratory ambient lighting orbs */}
      <div className="absolute top-[-10%] right-[10%] w-[50vw] h-[50vw] min-w-[320px] rounded-full bg-[hsl(340_90%_56%/0.12)] blur-[120px] pointer-events-none" />
      <div className="absolute top-[30%] left-[-10%] w-[55vw] h-[55vw] min-w-[350px] rounded-full bg-[hsl(280_85%_58%/0.12)] blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[45vw] h-[45vw] min-w-[300px] rounded-full bg-[hsl(45_100%_52%/0.14)] blur-[110px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[20%] w-[40vw] h-[40vw] min-w-[280px] rounded-full bg-[hsl(165_85%_42%/0.1)] blur-[100px] pointer-events-none" />

      {/* Sweeping Carnival Stage Spotlights */}
      <div
        className="absolute -top-32 left-10 w-[300px] h-[120vh] opacity-25 transform -rotate-25 origin-top pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent, hsl(45 100% 55% / 0.3) 50%, transparent)",
          filter: "blur(28px)",
          animation: "beam-sweep 12s ease-in-out infinite alternate",
        }}
      />
      <div
        className="absolute -top-32 right-10 w-[280px] h-[120vh] opacity-20 transform rotate-25 origin-top pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent, hsl(340 90% 60% / 0.25) 50%, transparent)",
          filter: "blur(28px)",
          animation: "beam-sweep 15s ease-in-out infinite alternate-reverse",
        }}
      />

      {/* Ornate Venetian Masquerade Mask Watermark in Top Center */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-72 h-44 md:w-96 md:h-56 opacity-15 md:opacity-20 pointer-events-none">
        <svg viewBox="0 0 200 120" className="w-full h-full drop-shadow-md">
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
            className="animate-pulse"
            style={{ animationDuration: "5s" }}
          />
          {/* Spiral Ribbon 2 */}
          <path
            d="M 60,0 Q 20,60 60,120 T 60,240 T 60,360 T 60,480 T 60,600"
            fill="none"
            stroke="url(#streamer-pink)"
            strokeWidth="7"
            strokeLinecap="round"
            className="animate-pulse"
            style={{ animationDuration: "7s", animationDelay: "1s" }}
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
            className="animate-pulse"
            style={{ animationDuration: "6s", animationDelay: "0.5s" }}
          />
          <path
            d="M 70,0 Q 30,55 70,110 T 70,220 T 70,330 T 70,440 T 70,550"
            fill="none"
            stroke="url(#streamer-violet)"
            strokeWidth="6"
            strokeLinecap="round"
            className="animate-pulse"
            style={{ animationDuration: "8s", animationDelay: "1.5s" }}
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
              boxShadow: `0 0 6px ${piece.color}`,
              opacity: 0.85,
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
          className="absolute rounded-full pointer-events-none transition-transform"
          style={{
            left: `${b.x}px`,
            top: `${b.y}px`,
            width: `${b.size}px`,
            height: `${b.size}px`,
            backgroundColor: b.color,
            boxShadow: `0 0 10px ${b.color}`,
            transform: `translate(${b.vx}px, ${b.vy}px) scale(0)`,
            transition: "transform 1.1s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 1.1s ease-out",
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
};
