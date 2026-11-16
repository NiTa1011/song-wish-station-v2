import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useActiveTheme } from "@/hooks/useActiveTheme";
import { ThemeDecorations } from "@/components/ThemeDecorations";
import { Trophy, Music2 } from "lucide-react";

/*
 * Big, read-only "Top wishes" board for the whiteboard / beamer.
 * Shows only songs the DJ has accepted (never unmoderated input).
 * URL options:  /top?venue=<disco id>   – only one disco
 *               /top?limit=5            – number of songs (default 10)
 */

interface Wish {
  id: string;
  song_title: string;
  artist_name: string;
  request_count: number;
  status: string;
  venue_id: string | null;
  created_at: string;
}

const RECHECK_MS = 30_000;

const TopWishes = () => {
  const activeTheme = useActiveTheme();
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const venueId = params.get("venue");
  const limit = Math.min(Math.max(Number(params.get("limit")) || 10, 1), 20);

  const fetchWishes = useCallback(async () => {
    let query = supabase
      .from("music_requests")
      .select("*")
      .eq("status", "accepted")
      .order("request_count", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(limit);
    if (venueId) query = query.eq("venue_id", venueId);

    const { data, error } = await query;
    setIsLoading(false);
    if (error) {
      console.error("Error fetching top wishes:", error);
      return;
    }
    setWishes(data || []);
  }, [limit, venueId]);

  useEffect(() => {
    fetchWishes();

    // Live updates; refetch keeps ordering + limit simple and correct
    const channel = supabase
      .channel("top-wishes")
      .on("postgres_changes", { event: "*", schema: "public", table: "music_requests" }, () => {
        fetchWishes();
      })
      .subscribe();

    // Safety net in case the realtime connection drops (board runs all evening)
    const interval = window.setInterval(fetchWishes, RECHECK_MS);

    return () => {
      supabase.removeChannel(channel);
      window.clearInterval(interval);
    };
  }, [fetchWishes]);

  const wishUrl = `${window.location.host}`;
  const maxCount = wishes[0]?.request_count || 1;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      <ThemeDecorations activeTheme={activeTheme} />

      <div className="relative z-10 flex-1 w-full max-w-6xl mx-auto px-6 md:px-10 py-8 md:py-12 flex flex-col">
        <header className="flex flex-wrap items-end justify-between gap-4 mb-8 md:mb-10">
          <div>
            <h1 className="text-5xl md:text-7xl font-extrabold bg-gradient-primary bg-clip-text text-transparent leading-tight tracking-tight flex items-center gap-4">
              <Trophy className="w-12 h-12 md:w-16 md:h-16 text-primary shrink-0" />
              Top-Wünsche
            </h1>
          </div>
          <div className="glass-card rounded-2xl px-5 py-3 text-right">
            <p className="text-sm md:text-base text-muted-foreground font-medium">Wünsch dir was auf</p>
            <p className="text-xl md:text-3xl font-extrabold text-foreground">{wishUrl}</p>
          </div>
        </header>

        {isLoading ? null : wishes.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center glass-card rounded-3xl p-10">
            <Music2 className="w-20 h-20 text-primary mb-6" />
            <p className="text-3xl md:text-4xl font-bold mb-3">Noch keine Wünsche angenommen</p>
            <p className="text-xl md:text-2xl text-muted-foreground">
              Schick jetzt deinen Wunsch auf <span className="font-bold text-foreground">{wishUrl}</span>
            </p>
          </div>
        ) : (
          <ol className="space-y-3 md:space-y-4">
            {wishes.map((wish, index) => (
              <li
                key={wish.id}
                className="glass-card rounded-2xl md:rounded-3xl px-5 md:px-8 py-4 md:py-5 flex items-center gap-5 md:gap-8 relative overflow-hidden"
              >
                {/* popularity bar */}
                <div
                  className="absolute inset-y-0 left-0 bg-primary/10"
                  style={{ width: `${Math.max(8, (wish.request_count / maxCount) * 100)}%` }}
                  aria-hidden="true"
                />
                <span
                  className={`relative w-12 md:w-16 shrink-0 text-center text-4xl md:text-6xl font-extrabold tabular-nums ${
                    index === 0 ? "text-primary" : "text-foreground/40"
                  }`}
                >
                  {index + 1}
                </span>
                <div className="relative flex-1 min-w-0">
                  <p className="text-2xl md:text-4xl font-bold leading-tight truncate">{wish.song_title}</p>
                  <p className="text-lg md:text-2xl text-muted-foreground font-medium truncate">
                    {wish.artist_name}
                  </p>
                </div>
                <span className="relative shrink-0 text-2xl md:text-4xl font-extrabold tabular-nums text-primary">
                  {wish.request_count}×
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
};

export default TopWishes;
