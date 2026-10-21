import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Palette, CheckCircle2 } from "lucide-react";
import { themeConfig } from "@/config/themes";
import { applyTheme, setAppTheme } from "@/hooks/useActiveTheme";

interface Theme {
  id: string;
  theme_name: string;
  active: boolean;
}

export const ThemeManagement = () => {
  const [, setThemes] = useState<Theme[]>([]);
  const [activeTheme, setActiveTheme] = useState<string>(() => {
    try {
      return localStorage.getItem("active-theme-name") || "default";
    } catch {
      return "default";
    }
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchThemes();
  }, []);

  const fetchThemes = async () => {
    try {
      const { data, error } = await supabase
        .from("app_themes")
        .select("*");

      if (error) {
        console.warn("Could not fetch themes from supabase, using local state:", error);
        return;
      }

      setThemes(data || []);
      const active = data?.find((t) => t.active);
      if (active && themeConfig[active.theme_name]) {
        setActiveTheme(active.theme_name);
        applyTheme(active.theme_name);
      }
    } catch (e) {
      console.warn("Fetch themes error:", e);
    }
  };

  const handleThemeChange = async (themeName: string) => {
    if (!themeConfig[themeName]) return;

    // Apply immediately to local state and UI
    setActiveTheme(themeName);
    setAppTheme(themeName);

    try {
      // Sync to database if reachable
      await supabase
        .from("app_themes")
        .update({ active: false })
        .neq("id", "00000000-0000-0000-0000-000000000000");

      const { error } = await supabase
        .from("app_themes")
        .update({ active: true })
        .eq("theme_name", themeName);

      if (error) {
        console.warn("Supabase theme update notice:", error);
      }
    } catch (e) {
      console.warn("Supabase update error:", e);
    }

    toast({
      title: "Theme geändert",
      description: `${themeConfig[themeName].name} aktiviert`,
    });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-semibold">Design-Verwaltung</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Wähle ein atmosphärisches Thema für die Musikwunsch-Station aus. Änderungen werden in Echtzeit übernommen.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {Object.entries(themeConfig).map(([key, theme]) => {
            const isActive = activeTheme === key;

            return (
              <Card
                key={key}
                className={`p-6 cursor-pointer transition-all duration-300 relative overflow-hidden group ${
                  isActive
                    ? "ring-2 ring-primary shadow-xl scale-[1.02] bg-primary/5"
                    : "hover:shadow-lg hover:scale-[1.01]"
                }`}
                onClick={() => handleThemeChange(key)}
              >
                <div className="text-center space-y-3">
                  <div className="text-5xl mb-2 transition-transform duration-300 group-hover:scale-110">
                    {theme.icon}
                  </div>
                  <h4 className="font-bold text-lg">{theme.name}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {theme.description}
                  </p>

                  <div className="pt-2 flex justify-center">
                    {isActive ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary text-primary-foreground rounded-full text-xs font-semibold shadow-sm animate-fade-in">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Aktiv</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground font-medium group-hover:text-primary transition-colors">
                        Klicken zum Aktivieren
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
