import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { themeConfig } from "@/config/themes";

export const applyTheme = (themeName: string) => {
  const theme = themeConfig[themeName] || themeConfig.default;
  if (!theme) return;

  const root = document.documentElement;
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value);
  });

  if (theme.gradientPrimary) {
    root.style.setProperty("--gradient-primary", theme.gradientPrimary);
  }
  if (theme.gradientButton) {
    root.style.setProperty("--gradient-button", theme.gradientButton);
  }

  // Apply background pattern
  if (theme.backgroundPattern && theme.backgroundPattern !== "none") {
    if (document.body) {
      document.body.style.backgroundImage = theme.backgroundPattern;
    }
    root.style.setProperty("--background-pattern", theme.backgroundPattern);
  } else {
    if (document.body) {
      document.body.style.backgroundImage = "none";
    }
    root.style.setProperty("--background-pattern", "none");
  }

  try {
    localStorage.setItem("active-theme-name", themeName);
    localStorage.setItem("active-theme-data", JSON.stringify(theme));
  } catch (e) {
    console.error("Error saving theme to localStorage:", e);
  }
};

export const setAppTheme = (themeName: string) => {
  if (themeConfig[themeName]) {
    applyTheme(themeName);
    window.dispatchEvent(
      new CustomEvent("app-theme-changed", { detail: themeName })
    );
  }
};

export const useActiveTheme = () => {
  const [activeTheme, setActiveTheme] = useState<string>(() => {
    try {
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        const urlTheme = urlParams.get("theme");
        if (urlTheme && themeConfig[urlTheme]) {
          return urlTheme;
        }
        return localStorage.getItem("active-theme-name") || "default";
      }
    } catch {
      // fallback
    }
    return "default";
  });

  const handleThemeUpdate = useCallback((themeName: string) => {
    applyTheme(themeName);
    setActiveTheme(themeName);
  }, []);

  useEffect(() => {
    // Apply cached or URL theme immediately
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlTheme = urlParams.get("theme");
      const chosenTheme =
        (urlTheme && themeConfig[urlTheme] && urlTheme) ||
        localStorage.getItem("active-theme-name") ||
        "default";
      applyTheme(chosenTheme);
      setActiveTheme(chosenTheme);
    } catch (e) {
      console.error(e);
    }

    // Listen to local theme change events (e.g. from preview switcher or admin)
    const handleCustomChange = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail && themeConfig[customEvent.detail]) {
        handleThemeUpdate(customEvent.detail);
      }
    };
    window.addEventListener("app-theme-changed", handleCustomChange);

    fetchActiveTheme();

    // Subscribe to theme changes via Supabase realtime
    const channel = supabase
      .channel("theme-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "app_themes",
        },
        (payload) => {
          if (payload.new && payload.new.active) {
            handleThemeUpdate(payload.new.theme_name);
          }
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener("app-theme-changed", handleCustomChange);
      supabase.removeChannel(channel);
    };
  }, [handleThemeUpdate]);

  const fetchActiveTheme = async () => {
    try {
      // If URL override is present, prioritize URL
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("theme")) return;

      const { data } = await supabase
        .from("app_themes")
        .select("theme_name")
        .eq("active", true)
        .maybeSingle();

      if (data && data.theme_name && themeConfig[data.theme_name]) {
        handleThemeUpdate(data.theme_name);
      }
    } catch (e) {
      console.error("Error fetching active theme from Supabase:", e);
    }
  };

  return activeTheme;
};
