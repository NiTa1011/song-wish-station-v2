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

/**
 * Sets the theme globally for ALL visitors by writing it to the database.
 * Every open page picks it up via Supabase realtime (plus a periodic re-check).
 * Only applies the theme locally if the database write actually succeeded.
 */
export const setGlobalTheme = async (
  themeName: string
): Promise<{ ok: boolean; error?: string }> => {
  if (!themeConfig[themeName]) return { ok: false, error: "Unbekanntes Theme" };

  try {
    // Activate the new theme first, so there is never a moment without an active theme
    const { data: activated, error: activateError } = await supabase
      .from("app_themes")
      .update({ active: true })
      .eq("theme_name", themeName)
      .select("id");

    if (activateError) return { ok: false, error: activateError.message };
    if (!activated || activated.length === 0) {
      return { ok: false, error: "Theme konnte in der Datenbank nicht gespeichert werden." };
    }

    const { error: deactivateError } = await supabase
      .from("app_themes")
      .update({ active: false })
      .neq("theme_name", themeName);

    if (deactivateError) return { ok: false, error: deactivateError.message };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }

  setAppTheme(themeName);
  return { ok: true };
};

// How often open pages (e.g. a whiteboard left open all evening) re-check the
// active theme, in case the realtime connection dropped silently.
const THEME_RECHECK_MS = 60_000;

export const useActiveTheme = () => {
  const [activeTheme, setActiveTheme] = useState<string>(() => {
    try {
      const cached = localStorage.getItem("active-theme-name");
      if (cached && themeConfig[cached]) return cached;
    } catch {
      // fallback
    }
    return "default";
  });

  const handleThemeUpdate = useCallback((themeName: string) => {
    if (!themeConfig[themeName]) return;
    applyTheme(themeName);
    setActiveTheme(themeName);
  }, []);

  useEffect(() => {
    // Show the cached theme immediately; the database is the source of truth
    try {
      const cached = localStorage.getItem("active-theme-name");
      handleThemeUpdate(cached && themeConfig[cached] ? cached : "default");
    } catch (e) {
      console.error(e);
    }

    const fetchActiveTheme = async () => {
      try {
        const { data } = await supabase
          .from("app_themes")
          .select("theme_name")
          .eq("active", true)
          .limit(1)
          .maybeSingle();

        if (data?.theme_name) {
          handleThemeUpdate(data.theme_name);
        }
      } catch (e) {
        console.error("Error fetching active theme from Supabase:", e);
      }
    };

    // Same-tab changes (e.g. admin changed the theme in this browser)
    const handleCustomChange = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) handleThemeUpdate(customEvent.detail);
    };
    window.addEventListener("app-theme-changed", handleCustomChange);

    fetchActiveTheme();

    // Live updates for all visitors
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

    // Safety net: re-check periodically and whenever the page becomes visible again
    const interval = window.setInterval(fetchActiveTheme, THEME_RECHECK_MS);
    const handleVisibility = () => {
      if (document.visibilityState === "visible") fetchActiveTheme();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("app-theme-changed", handleCustomChange);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [handleThemeUpdate]);

  return activeTheme;
};
