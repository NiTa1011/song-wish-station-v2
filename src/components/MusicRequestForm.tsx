import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Music2, LogIn, Palette, CheckCircle2, Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { ThemeDecorations } from "@/components/ThemeDecorations";
import { QrCodePanel, QrCodeToggle } from "@/components/QrCodePanel";
import { Skeleton } from "@/components/ui/skeleton";
import { useActiveTheme, setGlobalTheme } from "@/hooks/useActiveTheme";
import { themeConfig } from "@/config/themes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SubmittedWish {
  title: string;
  artist: string;
  kind: "new" | "counted" | "similar";
  count?: number;
}

// After this time the thank-you view switches back to the form automatically
const THANK_YOU_MS = 12_000;

interface Venue {
  id: string;
  name: string;
  active: boolean;
}

const MusicRequestForm = () => {
  const [songTitle, setSongTitle] = useState("");
  const [artistName, setArtistName] = useState("");
  const [selectedVenue, setSelectedVenue] = useState<string>("");
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoadingVenues, setIsLoadingVenues] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<SubmittedWish | null>(null);
  const activeTheme = useActiveTheme();
  const [canChangeTheme, setCanChangeTheme] = useState(false);
  const [isSavingTheme, setIsSavingTheme] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchVenues();
    checkThemePermission();
  }, []);

  useEffect(() => {
    if (!submitted) return;
    const id = window.setTimeout(() => setSubmitted(null), THANK_YOU_MS);
    return () => window.clearTimeout(id);
  }, [submitted]);

  // The theme switcher is only shown to logged-in users with the "Design ändern" permission
  const checkThemePermission = async () => {
    try {
      const userId = localStorage.getItem("adminUserId");
      if (localStorage.getItem("adminLoggedIn") !== "true" || !userId) return;

      const { data } = await supabase
        .from("admin_users")
        .select("can_change_theme")
        .eq("id", userId)
        .maybeSingle();

      setCanChangeTheme(data?.can_change_theme === true);
    } catch (e) {
      console.error("Error checking theme permission:", e);
    }
  };

  const handleThemeSwitch = async (themeName: string) => {
    if (isSavingTheme || themeName === activeTheme) return;
    setIsSavingTheme(true);
    const result = await setGlobalTheme(themeName);
    setIsSavingTheme(false);

    if (result.ok) {
      toast({
        title: "Theme geändert",
        description: `${themeConfig[themeName].name} ist jetzt für alle Besucher aktiv.`,
      });
    } else {
      toast({
        title: "Theme konnte nicht geändert werden",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const fetchVenues = async () => {
    setIsLoadingVenues(true);
    try {
      const { data, error } = await supabase
        .from("venues")
        .select("*")
        .eq("active", true)
        .order("name", { ascending: true });

      if (error) {
        console.error("Error fetching venues:", error);
      } else {
        setVenues(data || []);
        // Auto-select first venue if only one exists
        if (data && data.length === 1) {
          setSelectedVenue(data[0].id);
        }
      }
    } catch (error) {
      console.error("Error in fetchVenues:", error);
    } finally {
      setIsLoadingVenues(false);
    }
  };

  // Helper function to normalize strings for comparison
  const normalizeString = (str: string): string => {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, '') // Remove special characters
      .replace(/\s+/g, ' '); // Normalize whitespace
  };

  // Calculate similarity between two strings (Levenshtein distance)
  const getSimilarity = (str1: string, str2: string): number => {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();
    
    const costs = new Array(s2.length + 1);
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[s2.length] = lastValue;
    }
    
    const maxLength = Math.max(s1.length, s2.length);
    return maxLength === 0 ? 1 : 1 - costs[s2.length] / maxLength;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!songTitle.trim() || !artistName.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte fülle alle Felder aus!",
        variant: "destructive",
      });
      return;
    }

    if (!selectedVenue) {
      toast({
        title: "Fehler",
        description: "Bitte wähle eine Disco aus!",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Normalize input for better matching
      const normalizedTitle = normalizeString(songTitle);
      const normalizedArtist = normalizeString(artistName);

      // Check for exact matches first (normalized comparison)
      let exactMatchQuery = supabase
        .from("music_requests")
        .select("*");
      
      if (selectedVenue) {
        exactMatchQuery = exactMatchQuery.eq("venue_id", selectedVenue);
      } else {
        exactMatchQuery = exactMatchQuery.is("venue_id", null);
      }

      const { data: allRequests, error: fetchError } = await exactMatchQuery;
      
      if (fetchError) throw fetchError;

      // Find exact match using normalized comparison
      const exactMatch = allRequests?.find(req => 
        normalizeString(req.song_title) === normalizedTitle &&
        normalizeString(req.artist_name) === normalizedArtist
      );

      if (exactMatch) {
        // Update request count for exact match
        const { error: updateError } = await supabase
          .from("music_requests")
          .update({ request_count: (exactMatch.request_count || 1) + 1 })
          .eq("id", exactMatch.id);

        if (updateError) throw updateError;

        setSubmitted({
          title: exactMatch.song_title,
          artist: exactMatch.artist_name,
          kind: "counted",
          count: (exactMatch.request_count || 1) + 1,
        });
        setSongTitle("");
        setArtistName("");
      } else {
        // Check for similar songs (fuzzy matching) using already fetched data
        let bestMatch = null;
        let highestSimilarity = 0;

        if (allRequests) {
          for (const song of allRequests) {
            const titleSimilarity = getSimilarity(normalizedTitle, normalizeString(song.song_title));
            const artistSimilarity = getSimilarity(normalizedArtist, normalizeString(song.artist_name));
            
            // Average similarity, weighted more towards title
            const combinedSimilarity = (titleSimilarity * 0.6 + artistSimilarity * 0.4);
            
            // If both title and artist are similar (>75%), consider it a match to handle typos
            if (combinedSimilarity > 0.75 && combinedSimilarity > highestSimilarity) {
              highestSimilarity = combinedSimilarity;
              bestMatch = song;
            }
          }
        }

        if (bestMatch) {
          // Found similar song, update that instead
          const { error: updateError } = await supabase
            .from("music_requests")
            .update({ request_count: (bestMatch.request_count || 1) + 1 })
            .eq("id", bestMatch.id);

          if (updateError) throw updateError;

          setSubmitted({
            title: bestMatch.song_title,
            artist: bestMatch.artist_name,
            kind: "similar",
            count: (bestMatch.request_count || 1) + 1,
          });
          setSongTitle("");
          setArtistName("");
        } else {
          // No similar song found, insert as new
          const { error: insertError } = await supabase
            .from("music_requests")
            .insert({
              song_title: songTitle.trim(),
              artist_name: artistName.trim(),
              request_count: 1,
              venue_id: selectedVenue || null,
            });

          if (insertError) throw insertError;

          setSubmitted({ title: songTitle.trim(), artist: artistName.trim(), kind: "new" });
          setSongTitle("");
          setArtistName("");
        }
      }
    } catch (error) {
      console.error("Error submitting request:", error);
      toast({
        title: "Fehler",
        description: "Es gab ein Problem beim Senden deines Wunsches.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      <ThemeDecorations activeTheme={activeTheme} />
      <QrCodePanel />
      <div className="w-full max-w-md animate-fade-in relative z-10">
        <div className="text-center mb-10 md:mb-12">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-primary bg-clip-text text-transparent leading-tight tracking-tight drop-shadow-sm">
            Musik-Wünsche
          </h1>
          <p className="text-lg text-foreground/80 font-medium">
            Gib deinen Musikwunsch für die U-Disco ab!
          </p>
        </div>

        <div className="glass-card rounded-3xl p-8 md:p-10 transition-all duration-300 hover:shadow-2xl">
          {isLoadingVenues ? (
            <div className="space-y-5">
              <div className="space-y-2">
                <Skeleton className="h-5 w-1/3 bg-primary/10 rounded-lg" />
                <Skeleton className="h-14 w-full bg-primary/5 rounded-2xl" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-1/4 bg-primary/10 rounded-lg" />
                <Skeleton className="h-14 w-full bg-primary/5 rounded-2xl animate-pulse" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-1/4 bg-primary/10 rounded-lg" />
                <Skeleton className="h-14 w-full bg-primary/5 rounded-2xl" />
              </div>
              <Skeleton className="h-14 w-full bg-primary/15 rounded-2xl mt-8" />
            </div>
          ) : submitted ? (
            <div className="text-center py-2 animate-fade-in" role="status" aria-live="polite">
              <CheckCircle2 className="w-20 h-20 mx-auto mb-4 text-green-500" strokeWidth={1.75} />
              <h2 className="text-2xl font-extrabold mb-2">Danke! 🎵</h2>
              <p className="text-foreground/80 font-medium mb-5">Dein Wunsch ist angekommen.</p>
              <div className="rounded-2xl bg-primary/10 border border-primary/20 px-4 py-3 mb-4">
                <p className="font-bold text-lg leading-tight break-words">{submitted.title}</p>
                <p className="text-muted-foreground font-medium break-words">{submitted.artist}</p>
              </div>
              {submitted.kind !== "new" && (
                <p className="text-sm text-muted-foreground mb-5">
                  {submitted.kind === "similar"
                    ? "Diesen Song hat schon jemand gewünscht – deine Stimme wurde dazugezählt"
                    : "Diesen Song wollen mehrere hören"}
                  {submitted.count ? ` (jetzt ${submitted.count}×).` : "."}
                </p>
              )}
              <Button
                type="button"
                onClick={() => setSubmitted(null)}
                variant="outline"
                className="h-12 w-full rounded-2xl gap-2 font-semibold"
              >
                <Plus className="w-4 h-4" />
                Noch einen Song wünschen
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {venues.length > 1 && (
                <div className="space-y-1.5 text-left">
                  <Label htmlFor="venue" className="text-sm font-semibold text-foreground/80 pl-1">
                    Disco
                  </Label>
                  <Select value={selectedVenue} onValueChange={setSelectedVenue}>
                    <SelectTrigger id="venue" className="h-14 px-4 text-base rounded-2xl border-border/50 glass-input font-medium">
                      <SelectValue placeholder="Wähle eine Disco" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {venues.map((venue) => (
                        <SelectItem key={venue.id} value={venue.id} className="rounded-lg">
                          {venue.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-1.5 text-left">
                <Label htmlFor="song-title" className="text-sm font-semibold text-foreground/80 pl-1">
                  Song
                </Label>
                <div className="relative">
                  <Input
                    id="song-title"
                    type="text"
                    placeholder="z. B. Mr. Brightside"
                    value={songTitle}
                    onChange={(e) => setSongTitle(e.target.value)}
                    autoComplete="off"
                    className="h-14 pl-4 pr-12 text-base rounded-2xl border-border/50 glass-input font-medium"
                  />
                  <Music2 className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <Label htmlFor="artist-name" className="text-sm font-semibold text-foreground/80 pl-1">
                  Künstler
                </Label>
                <Input
                  id="artist-name"
                  type="text"
                  placeholder="z. B. The Killers"
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                  autoComplete="off"
                  className="h-14 px-4 text-base rounded-2xl border-border/50 glass-input font-medium"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 text-base font-semibold rounded-2xl bg-gradient-button hover:opacity-95 transition-all duration-300 !mt-6 shadow-lg shadow-primary/20 hover:shadow-primary/30 disabled:opacity-50 mt-2"
              >
                {isSubmitting ? "Wird gesendet..." : "Wunsch absenden"}
              </Button>

              <div className="flex items-center justify-center gap-6 pt-2">
                <QrCodeToggle />
                <button
                  type="button"
                  onClick={() => navigate("/admin")}
                  className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-all duration-300 font-semibold"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="text-sm">Login</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Theme Quick Switcher – only for logged-in theme managers, changes it for everyone */}
        {canChangeTheme && (
        <div className="mt-6 flex items-center justify-center gap-1 p-1 bg-card/70 backdrop-blur-md rounded-full border border-border/60 shadow-sm max-w-fit mx-auto text-xs">
          <Palette className="w-3.5 h-3.5 text-muted-foreground ml-2.5 mr-1" />
          {Object.entries(themeConfig).map(([key, config]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleThemeSwitch(key)}
              disabled={isSavingTheme}
              title="Für alle Besucher ändern"
              className={`px-3 py-1 rounded-full font-medium transition-all duration-200 ${
                activeTheme === key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <span className="mr-1">{config.icon}</span>
              <span className="hidden sm:inline">{config.name.split(" ")[0]}</span>
            </button>
          ))}
        </div>
        )}
      </div>
    </div>
  );
};

export default MusicRequestForm;
