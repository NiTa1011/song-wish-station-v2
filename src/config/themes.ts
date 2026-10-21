export interface ThemeDefinition {
  name: string;
  icon: string;
  description: string;
  colors: {
    primary: string;
    background: string;
    foreground: string;
    accent: string;
    card: string;
    "card-foreground": string;
    border: string;
    muted: string;
    "muted-foreground": string;
    secondary?: string;
    "secondary-foreground"?: string;
  };
  gradientPrimary?: string;
  gradientButton?: string;
  backgroundPattern: string;
}

export const themeConfig: Record<string, ThemeDefinition> = {
  default: {
    name: "U-Disco (Standard) 🎵",
    icon: "🎵",
    description: "Club-Atmosphäre mit Neon-Beats & Audio-Vibes",
    colors: {
      primary: "271 85% 60%",
      background: "260 25% 97%",
      foreground: "240 15% 15%",
      accent: "330 85% 60%",
      card: "0 0% 100%",
      "card-foreground": "240 15% 15%",
      border: "271 35% 88%",
      muted: "270 25% 93%",
      "muted-foreground": "260 10% 45%",
      secondary: "190 90% 48%",
      "secondary-foreground": "0 0% 100%",
    },
    gradientPrimary: "linear-gradient(135deg, hsl(271 85% 60%), hsl(330 85% 60%))",
    gradientButton: "linear-gradient(90deg, hsl(271 85% 60%), hsl(330 85% 60%))",
    backgroundPattern:
      "radial-gradient(ellipse at 15% 15%, hsl(271 85% 60% / 0.12) 0%, transparent 55%), radial-gradient(ellipse at 85% 20%, hsl(330 85% 60% / 0.12) 0%, transparent 50%), radial-gradient(circle at 50% 85%, hsl(190 90% 50% / 0.08) 0%, transparent 60%)",
  },
  halloween: {
    name: "Halloween 🎃",
    icon: "🎃",
    description: "Düstere Nacht, Vollmond, Nebel & Geisterlichter",
    colors: {
      primary: "135 90% 45%",
      background: "245 35% 7%",
      foreground: "120 70% 92%",
      accent: "28 100% 52%",
      card: "245 30% 11%",
      "card-foreground": "120 70% 92%",
      border: "135 60% 25%",
      muted: "245 25% 15%",
      "muted-foreground": "135 25% 65%",
      secondary: "270 70% 48%",
      "secondary-foreground": "0 0% 100%",
    },
    gradientPrimary: "linear-gradient(135deg, hsl(135 90% 45%), hsl(28 100% 52%))",
    gradientButton: "linear-gradient(90deg, hsl(135 90% 45%), hsl(28 100% 52%))",
    backgroundPattern:
      "radial-gradient(circle at 80% 18%, hsl(28 100% 50% / 0.22) 0%, transparent 45%), radial-gradient(circle at 15% 65%, hsl(135 90% 45% / 0.18) 0%, transparent 50%), radial-gradient(circle at 50% 90%, hsl(270 70% 45% / 0.2) 0%, transparent 55%)",
  },
  fasching: {
    name: "Fasching 🎭",
    icon: "🎭",
    description: "Bunte Konfetti-Gala, Luftschlangen & Maskenzauber",
    colors: {
      primary: "280 85% 58%",
      background: "45 60% 98%",
      foreground: "280 70% 18%",
      accent: "340 90% 56%",
      card: "0 0% 100%",
      "card-foreground": "280 70% 18%",
      border: "280 40% 88%",
      muted: "45 50% 94%",
      "muted-foreground": "280 30% 45%",
      secondary: "165 85% 42%",
      "secondary-foreground": "0 0% 100%",
    },
    gradientPrimary: "linear-gradient(135deg, hsl(280 85% 58%), hsl(340 90% 56%))",
    gradientButton: "linear-gradient(90deg, hsl(280 85% 58%), hsl(340 90% 56%))",
    backgroundPattern:
      "radial-gradient(ellipse at 15% 20%, hsl(340 90% 60% / 0.14) 0%, transparent 50%), radial-gradient(ellipse at 85% 15%, hsl(280 85% 60% / 0.14) 0%, transparent 50%), radial-gradient(circle at 50% 80%, hsl(165 85% 45% / 0.12) 0%, transparent 55%), radial-gradient(circle at 75% 75%, hsl(45 100% 55% / 0.12) 0%, transparent 45%)",
  },
};
