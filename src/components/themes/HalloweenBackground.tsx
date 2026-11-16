import React, { useMemo } from "react";

export const HalloweenBackground: React.FC = () => {
  // Rising embers and spectral wisps
  const embers = useMemo(() => {
    return Array.from({ length: 18 }, (_, i) => ({
      id: i,
      left: 5 + ((i * 5.3) % 90),
      size: 2 + ((i * 2) % 6),
      delay: (i * 0.35) % 7,
      duration: 5 + ((i * 1.2) % 7),
      type: i % 3 === 0 ? "spectral" : "fire", // green wisp vs orange ember
    }));
  }, []);

  return (
    <div
      className="theme-decor fixed inset-0 pointer-events-none overflow-hidden z-0"
      aria-hidden="true"
    >
      {/* Ambient background glows (radial gradients instead of blur filters) */}
      <div className="absolute -top-16 -right-16 w-[40rem] h-[40rem] rounded-full" style={{ background: "radial-gradient(circle, hsl(28 100% 50% / 0.12) 0%, transparent 65%)" }} />
      <div className="absolute -bottom-40 -left-40 w-[50rem] h-[50rem] rounded-full" style={{ background: "radial-gradient(circle, hsl(135 90% 45% / 0.1) 0%, transparent 65%)" }} />
      <div className="absolute top-1/3 left-1/4 w-[34rem] h-[34rem] rounded-full" style={{ background: "radial-gradient(circle, hsl(270 70% 48% / 0.12) 0%, transparent 65%)" }} />

      {/* Atmospheric Full Moon with Lunar Halos */}
      <div className="absolute top-6 right-6 md:top-12 md:right-16 w-36 h-36 md:w-56 md:h-56 pointer-events-none">
        {/* Outer Lunar Halo */}
        <div
          className="absolute inset-[-45%] rounded-full animate-pulse"
          style={{
            background: "radial-gradient(circle, hsl(40 100% 60% / 0.3) 0%, hsl(28 100% 52% / 0.15) 35%, hsl(135 80% 45% / 0.06) 55%, transparent 70%)",
            animationDuration: "6s",
            willChange: "opacity",
          }}
        />

        {/* Realistic Detailed Moon SVG */}
        <svg
          viewBox="0 0 100 100"
          className="relative w-full h-full"
        >
          <defs>
            <radialGradient id="moon-body" cx="40%" cy="40%" r="55%">
              <stop offset="0%" stopColor="#fffdf0" />
              <stop offset="60%" stopColor="#fae7b5" />
              <stop offset="85%" stopColor="#dfbe86" />
              <stop offset="100%" stopColor="#ba9961" />
            </radialGradient>
            <radialGradient id="crater-1" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#8d744b" stopOpacity="0.45" />
              <stop offset="70%" stopColor="#ba9961" stopOpacity="0.2" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>

          {/* Moon Disc */}
          <circle cx="50" cy="50" r="46" fill="url(#moon-body)" />

          {/* Lunar Seas / Maria (craters & textured plains) */}
          <ellipse cx="38" cy="36" rx="14" ry="11" fill="url(#crater-1)" />
          <ellipse cx="60" cy="42" rx="12" ry="15" fill="url(#crater-1)" />
          <circle cx="48" cy="62" r="10" fill="url(#crater-1)" />
          <circle cx="32" cy="58" r="7" fill="url(#crater-1)" />
          <circle cx="68" cy="64" r="8" fill="url(#crater-1)" />
          <circle cx="52" cy="28" r="5" fill="url(#crater-1)" />
        </svg>

        {/* Translucent Misty Clouds drifting over Moon */}
        <div
          className="absolute top-1/4 -left-10 w-[140%] h-8 rounded-full bg-gradient-to-r from-transparent via-[hsl(245_35%_12%/0.6)] to-transparent"
          style={{ animation: "cloud-drift 24s linear infinite", willChange: "transform, opacity" }}
        />
        <div
          className="absolute bottom-1/4 -right-10 w-[130%] h-6 rounded-full bg-gradient-to-r from-transparent via-[hsl(245_35%_10%/0.55)] to-transparent"
          style={{ animation: "cloud-drift 18s linear infinite reverse", willChange: "transform, opacity" }}
        />
      </div>

      {/* Gothic Bare Branches framing Top-Left */}
      <div className="absolute top-0 left-0 w-64 h-64 md:w-96 md:h-96 opacity-60 pointer-events-none">
        <svg viewBox="0 0 200 200" className="w-full h-full fill-[hsl(245_40%_5%)]">
          <path d="M 0,0 L 25,0 C 35,30 50,55 75,70 C 95,82 125,90 160,92 C 140,84 125,75 118,62 C 135,66 155,64 175,56 C 150,52 135,46 128,35 C 145,36 160,30 170,20 C 150,18 135,12 130,0 Z" />
          <path d="M 0,40 C 20,60 40,95 55,130 C 50,115 48,102 50,92 C 65,110 85,125 110,135 C 92,126 84,115 82,104 C 98,114 115,116 130,110 C 112,104 100,94 95,82 C 110,88 125,86 135,78 C 115,74 102,64 96,52 Z" />
          <path d="M 0,90 C 15,110 25,145 30,180 C 28,165 24,152 18,142 C 30,155 45,168 65,175 C 50,165 42,154 40,140 C 52,148 65,150 78,145 C 64,138 55,128 50,115 Z" />
        </svg>
      </div>

      {/* Gothic Spiderweb in Top-Right Corner */}
      <div className="absolute top-0 right-0 w-44 h-44 md:w-60 md:h-60 opacity-30 pointer-events-none">
        <svg viewBox="0 0 100 100" className="w-full h-full stroke-[hsl(120_50%_75%)] stroke-[0.6] fill-none">
          {/* Web Struts */}
          <line x1="100" y1="0" x2="0" y2="100" />
          <line x1="100" y1="0" x2="30" y2="100" />
          <line x1="100" y1="0" x2="65" y2="100" />
          <line x1="100" y1="0" x2="0" y2="65" />
          <line x1="100" y1="0" x2="0" y2="30" />
          {/* Connecting Spirals */}
          <path d="M 90,0 Q 85,15 70,30 Q 55,45 40,60 Q 25,75 0,90" />
          <path d="M 80,0 Q 75,22 60,40 Q 45,58 20,70 Q 10,75 0,80" />
          <path d="M 70,0 Q 62,28 48,48 Q 32,62 0,70" />
          <path d="M 55,0 Q 48,25 35,42 Q 22,50 0,55" />
          <path d="M 40,0 Q 32,20 22,32 Q 12,38 0,40" />
          <path d="M 25,0 Q 20,12 12,20 Q 5,22 0,25" />
        </svg>
      </div>

      {/* Flying Bats Silhouettes */}
      <div
        className="absolute top-24 right-44 md:right-72 w-10 h-6 opacity-75 pointer-events-none"
        style={{ animation: "bat-fly-1 15s ease-in-out infinite", willChange: "transform" }}
      >
        <svg viewBox="0 0 40 22" className="w-full h-full fill-[hsl(245_40%_10%)]">
          <path d="M 20,8 C 16,3 10,0 4,2 C 0,3 0,8 3,11 C 7,14 11,11 14,14 C 16,16 18,18 20,20 C 22,18 24,16 26,14 C 29,11 33,14 37,11 C 40,8 40,3 36,2 C 30,0 24,3 20,8 Z" />
        </svg>
      </div>
      <div
        className="absolute top-36 right-20 md:right-40 w-7 h-4 opacity-60 pointer-events-none"
        style={{ animation: "bat-fly-2 19s ease-in-out 3s infinite", willChange: "transform" }}
      >
        <svg viewBox="0 0 40 22" className="w-full h-full fill-[hsl(245_40%_12%)]">
          <path d="M 20,8 C 16,3 10,0 4,2 C 0,3 0,8 3,11 C 7,14 11,11 14,14 C 16,16 18,18 20,20 C 22,18 24,16 26,14 C 29,11 33,14 37,11 C 40,8 40,3 36,2 C 30,0 24,3 20,8 Z" />
        </svg>
      </div>
      <div
        className="absolute top-16 right-16 md:right-32 w-5 h-3 opacity-40 pointer-events-none"
        style={{ animation: "bat-fly-1 23s ease-in-out 7s infinite", willChange: "transform" }}
      >
        <svg viewBox="0 0 40 22" className="w-full h-full fill-[hsl(245_40%_15%)]">
          <path d="M 20,8 C 16,3 10,0 4,2 C 0,3 0,8 3,11 C 7,14 11,11 14,14 C 16,16 18,18 20,20 C 22,18 24,16 26,14 C 29,11 33,14 37,11 C 40,8 40,3 36,2 C 30,0 24,3 20,8 Z" />
        </svg>
      </div>

      {/* Floating Glowing Embers (Orange) and Spectral Wisps (Green) */}
      {embers.map((ember) => {
        const isSpectral = ember.type === "spectral";
        const color = isSpectral ? "hsl(135 90% 45%)" : "hsl(28 100% 52%)";

        return (
          <div
            key={ember.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: `${ember.left}%`,
              bottom: "-15px",
              width: `${ember.size * 4}px`,
              height: `${ember.size * 4}px`,
              background: `radial-gradient(circle, ${color} 0%, ${color} 22%, transparent 70%)`,
              willChange: "transform, opacity",
              opacity: isSpectral ? 0.7 : 0.85,
              animation: `ember-rise ${ember.duration}s ease-out ${ember.delay}s infinite`,
            }}
          />
        );
      })}

      {/* Rolling Cemetery Ground Mist / Fog Layers */}
      <div
        className="absolute bottom-0 left-0 w-[200%] h-36 bg-gradient-to-t from-[hsl(245_35%_6%/0.9)] via-[hsl(135_60%_20%/0.15)] to-transparent pointer-events-none"
        style={{ animation: "fog-drift 22s ease-in-out infinite alternate", willChange: "transform" }}
      />
      <div
        className="absolute bottom-0 right-0 w-[180%] h-28 bg-gradient-to-t from-[hsl(245_35%_7%/0.8)] via-[hsl(28_80%_20%/0.12)] to-transparent pointer-events-none"
        style={{ animation: "fog-drift 17s ease-in-out 4s infinite alternate-reverse", willChange: "transform" }}
      />

      {/* Carved Glowing Jack-o'-Lantern Candlelight Silhouette in bottom-left */}
      <div className="absolute bottom-3 left-4 md:bottom-6 md:left-10 w-20 h-20 md:w-28 md:h-28 opacity-75 md:opacity-85 pointer-events-none">
        {/* Candle glow flicker (opacity-only animation on its own layer) */}
        <div
          className="absolute inset-[-35%] rounded-full animate-pulse"
          style={{
            background: "radial-gradient(circle, hsl(28 100% 50% / 0.55) 0%, hsl(28 100% 50% / 0.2) 40%, transparent 70%)",
            animationDuration: "2s",
            willChange: "opacity",
          }}
        />
        <svg viewBox="0 0 100 100" className="relative w-full h-full">
          {/* Pumpkin Stem */}
          <path d="M 50,15 Q 52,6 59,8 Q 55,14 51,18 Z" fill="#2d3b1e" />

          {/* Dark Pumpkin Body Silhouette */}
          <path
            d="M 50,18 C 30,18 15,30 15,55 C 15,80 32,92 50,92 C 68,92 85,80 85,55 C 85,30 70,18 50,18 Z"
            fill="hsl(245 40% 7%)"
            stroke="hsl(28 90% 30% / 0.5)"
            strokeWidth="1.2"
          />

          {/* Candlelight Glowing Carvings (Eyes, Nose, Grin) with flicker */}
          <g>
            {/* Left Eye */}
            <polygon points="32,44 42,48 35,55" fill="hsl(33 100% 50%)" />
            {/* Right Eye */}
            <polygon points="68,44 58,48 65,55" fill="hsl(33 100% 50%)" />
            {/* Nose */}
            <polygon points="50,54 46,62 54,62" fill="hsl(33 100% 50%)" />
            {/* Creepy Grin with Teeth */}
            <path
              d="M 28,68 Q 50,86 72,68 C 68,74 62,75 58,70 C 56,76 52,77 50,71 C 48,77 44,76 42,70 C 38,75 32,74 28,68 Z"
              fill="hsl(33 100% 50%)"
            />
          </g>
        </svg>
      </div>
    </div>
  );
};
