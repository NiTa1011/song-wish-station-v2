import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { formatDistanceToNowStrict } from "date-fns";
import { de } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Music2,
  Check,
  X,
  Undo2,
  CheckCheck,
  Search,
  Volume2,
  VolumeX,
  Trophy,
  Inbox,
  ListMusic,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Venue {
  id: string;
  name: string;
  active: boolean;
}

type RequestStatus = "pending" | "accepted" | "played" | "rejected";

interface MusicRequest {
  id: string;
  song_title: string;
  artist_name: string;
  request_count: number;
  status: string;
  created_at: string;
  venue_id: string | null;
}

const STATUS_TABS: { value: RequestStatus; label: string }[] = [
  { value: "pending", label: "Offen" },
  { value: "accepted", label: "Angenommen" },
  { value: "played", label: "Gespielt" },
  { value: "rejected", label: "Abgelehnt" },
];

const STATUS_TEXT: Record<RequestStatus, string> = {
  pending: "Wunsch wieder offen",
  accepted: "Wunsch angenommen",
  played: "Als gespielt markiert",
  rejected: "Wunsch abgelehnt",
};

type SortMode = "count" | "newest";

const NEW_HIGHLIGHT_MS = 15_000;
const SOUND_KEY = "admin-sound-on";

const normalizeStatus = (status: string | null): RequestStatus =>
  status === "accepted" || status === "played" || status === "rejected" ? status : "pending";

const isToday = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
};

/** Short two-tone "ding" via WebAudio – no audio file needed. */
const playDing = (ctx: AudioContext) => {
  const now = ctx.currentTime;
  [880, 1320].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, now + i * 0.12);
    gain.gain.exponentialRampToValueAtTime(0.25, now + i * 0.12 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.12 + 0.35);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now + i * 0.12);
    osc.stop(now + i * 0.12 + 0.4);
  });
};

export const MusicRequestsList = ({ canManageRequests }: { canManageRequests: boolean }) => {
  const [requests, setRequests] = useState<MusicRequest[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVenue, setSelectedVenue] = useState<string>("all");
  const [tab, setTab] = useState<RequestStatus>(canManageRequests ? "pending" : "accepted");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortMode>("count");
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const [unseen, setUnseen] = useState(0);
  const [soundOn, setSoundOn] = useState(() => {
    try {
      return localStorage.getItem(SOUND_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [, setTick] = useState(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const soundOnRef = useRef(soundOn);
  const { toast } = useToast();

  soundOnRef.current = soundOn;

  // Without the permission, the user only sees accepted requests
  useEffect(() => {
    setTab(canManageRequests ? "pending" : "accepted");
  }, [canManageRequests]);

  const fetchRequests = useCallback(async () => {
    let query = supabase.from("music_requests").select("*");
    if (!canManageRequests) query = query.eq("status", "accepted");

    const { data, error } = await query;
    setIsLoading(false);

    if (error) {
      toast({
        title: "Fehler",
        description: "Konnte Musikwünsche nicht laden.",
        variant: "destructive",
      });
      return;
    }
    setRequests(data || []);
  }, [canManageRequests, toast]);

  useEffect(() => {
    supabase
      .from("venues")
      .select("*")
      .order("name", { ascending: true })
      .then(({ data, error }) => {
        if (error) console.error("Error fetching venues:", error);
        else setVenues(data || []);
      });
  }, []);

  // Initial load + live updates (new requests, count changes, status changes)
  useEffect(() => {
    fetchRequests();

    const markNew = (id: string) => {
      setNewIds((prev) => new Set(prev).add(id));
      setTimeout(() => {
        setNewIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }, NEW_HIGHLIGHT_MS);
    };

    const channel = supabase
      .channel("music-requests-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "music_requests" },
        (payload) => {
          if (payload.eventType === "DELETE") {
            const oldId = (payload.old as { id?: string }).id;
            setRequests((prev) => prev.filter((r) => r.id !== oldId));
            return;
          }

          const row = payload.new as MusicRequest;
          if (!canManageRequests && row.status !== "accepted") {
            setRequests((prev) => prev.filter((r) => r.id !== row.id));
            return;
          }

          setRequests((prev) => {
            const exists = prev.some((r) => r.id === row.id);
            return exists ? prev.map((r) => (r.id === row.id ? row : r)) : [...prev, row];
          });

          const isNewWish =
            payload.eventType === "INSERT" ||
            (payload.eventType === "UPDATE" &&
              (payload.old as { request_count?: number }).request_count !== undefined &&
              row.request_count > ((payload.old as { request_count?: number }).request_count ?? 0));

          if (payload.eventType === "INSERT" && canManageRequests) {
            markNew(row.id);
            toast({
              title: "🎵 Neuer Musikwunsch!",
              description: `${row.song_title} – ${row.artist_name}`,
            });
          }

          if (isNewWish && canManageRequests) {
            if (document.visibilityState !== "visible") setUnseen((n) => n + 1);
            if (soundOnRef.current && audioCtxRef.current) playDing(audioCtxRef.current);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchRequests, canManageRequests, toast]);

  // Badge in the browser tab title while the tab is in the background
  useEffect(() => {
    const baseTitle = document.title.replace(/^\(\d+\)\s*/, "");
    document.title = unseen > 0 ? `(${unseen}) ${baseTitle}` : baseTitle;

    const onVisible = () => {
      if (document.visibilityState === "visible") setUnseen(0);
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [unseen]);

  useEffect(() => {
    return () => {
      document.title = document.title.replace(/^\(\d+\)\s*/, "");
    };
  }, []);

  // Keep "vor X Minuten" fresh
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    try {
      localStorage.setItem(SOUND_KEY, next ? "1" : "0");
    } catch {
      // ignore
    }
    if (next) {
      // AudioContext must be created from a user gesture
      if (!audioCtxRef.current) {
        const Ctx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new Ctx();
      }
      audioCtxRef.current.resume();
      playDing(audioCtxRef.current);
    }
  };

  // The browser only allows sound after a click: re-arm a remembered "sound on" on first click
  useEffect(() => {
    if (!soundOn || audioCtxRef.current) return;
    const arm = () => {
      if (!audioCtxRef.current) {
        const Ctx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new Ctx();
      }
      audioCtxRef.current.resume();
    };
    window.addEventListener("pointerdown", arm, { once: true });
    return () => window.removeEventListener("pointerdown", arm);
  }, [soundOn]);

  const handleStatusChange = async (id: string, status: RequestStatus) => {
    const previous = requests;
    // Optimistic update: the row moves to its new tab immediately
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));

    const { error } = await supabase.from("music_requests").update({ status }).eq("id", id);

    if (error) {
      setRequests(previous);
      toast({
        title: "Fehler",
        description: "Status konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
      return;
    }
    toast({ description: STATUS_TEXT[status] });
  };

  const venueName = (venueId: string | null) => {
    if (!venueId) return "Ohne Disco";
    return venues.find((v) => v.id === venueId)?.name ?? "Unbekannte Disco";
  };

  // Requests of the selected disco (all tabs)
  const venueRequests = useMemo(
    () =>
      selectedVenue === "all"
        ? requests
        : requests.filter((r) => (r.venue_id ?? "none") === selectedVenue),
    [requests, selectedVenue]
  );

  const counts = useMemo(() => {
    const c: Record<RequestStatus, number> = { pending: 0, accepted: 0, played: 0, rejected: 0 };
    venueRequests.forEach((r) => c[normalizeStatus(r.status)]++);
    return c;
  }, [venueRequests]);

  const stats = useMemo(() => {
    const today = venueRequests.filter((r) => isToday(r.created_at));
    const wishesToday = today.reduce((sum, r) => sum + (r.request_count || 1), 0);
    const top = venueRequests
      .filter((r) => normalizeStatus(r.status) !== "rejected")
      .sort((a, b) => b.request_count - a.request_count)[0];
    return { wishesToday, top };
  }, [venueRequests]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return venueRequests
      .filter((r) => normalizeStatus(r.status) === tab)
      .filter(
        (r) =>
          !q ||
          r.song_title.toLowerCase().includes(q) ||
          r.artist_name.toLowerCase().includes(q)
      )
      .sort((a, b) =>
        sort === "count"
          ? b.request_count - a.request_count ||
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  }, [venueRequests, tab, search, sort]);

  const iconButton = "h-10 w-10 rounded-xl shrink-0";

  const renderActions = (request: MusicRequest) => {
    if (!canManageRequests) return null;
    const status = normalizeStatus(request.status);

    if (status === "pending") {
      return (
        <>
          <Button
            size="icon"
            onClick={() => handleStatusChange(request.id, "accepted")}
            className={`${iconButton} bg-green-600 hover:bg-green-700 text-white`}
            title="Annehmen"
            aria-label={`${request.song_title} annehmen`}
          >
            <Check className="w-5 h-5" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={() => handleStatusChange(request.id, "rejected")}
            className={`${iconButton} text-destructive hover:bg-destructive hover:text-destructive-foreground`}
            title="Ablehnen"
            aria-label={`${request.song_title} ablehnen`}
          >
            <X className="w-5 h-5" />
          </Button>
        </>
      );
    }

    if (status === "accepted") {
      return (
        <>
          <Button
            size="icon"
            onClick={() => handleStatusChange(request.id, "played")}
            className={`${iconButton} bg-primary hover:bg-primary/90 text-primary-foreground`}
            title="Als gespielt markieren"
            aria-label={`${request.song_title} als gespielt markieren`}
          >
            <CheckCheck className="w-5 h-5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => handleStatusChange(request.id, "pending")}
            className={`${iconButton} text-muted-foreground`}
            title="Zurück zu Offen"
            aria-label={`${request.song_title} zurück zu offen`}
          >
            <Undo2 className="w-5 h-5" />
          </Button>
        </>
      );
    }

    return (
      <Button
        size="icon"
        variant="ghost"
        onClick={() => handleStatusChange(request.id, status === "played" ? "accepted" : "pending")}
        className={`${iconButton} text-muted-foreground`}
        title={status === "played" ? "Zurück zu Angenommen" : "Zurück zu Offen"}
        aria-label={`${request.song_title} zurücksetzen`}
      >
        <Undo2 className="w-5 h-5" />
      </Button>
    );
  };

  const emptyText: Record<RequestStatus, string> = {
    pending: "Keine offenen Wünsche – alles erledigt! 🎉",
    accepted: "Noch keine angenommenen Wünsche.",
    played: "Noch nichts gespielt.",
    rejected: "Keine abgelehnten Wünsche.",
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4 rounded-2xl">
          <p className="text-xs font-medium text-muted-foreground">Wünsche heute</p>
          <p className="text-2xl font-extrabold tabular-nums">{stats.wishesToday}</p>
        </Card>
        <Card className="p-4 rounded-2xl">
          <p className="text-xs font-medium text-muted-foreground">Offen</p>
          <p className="text-2xl font-extrabold tabular-nums text-amber-600 dark:text-amber-400">
            {counts.pending}
          </p>
        </Card>
        <Card className="p-4 rounded-2xl">
          <p className="text-xs font-medium text-muted-foreground">Gespielt</p>
          <p className="text-2xl font-extrabold tabular-nums">{counts.played}</p>
        </Card>
        <Card className="p-4 rounded-2xl col-span-2 md:col-span-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5" /> Top-Song
          </p>
          {stats.top ? (
            <p className="font-bold truncate" title={`${stats.top.song_title} – ${stats.top.artist_name}`}>
              {stats.top.song_title}{" "}
              <span className="text-muted-foreground font-medium">({stats.top.request_count}×)</span>
            </p>
          ) : (
            <p className="text-muted-foreground">–</p>
          )}
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Song oder Künstler suchen…"
            className="h-11 pl-9 rounded-xl bg-card"
            aria-label="Wünsche durchsuchen"
          />
        </div>
        <div className="flex gap-2">
          <Select value={sort} onValueChange={(v) => setSort(v as SortMode)}>
            <SelectTrigger className="h-11 w-full lg:w-44 rounded-xl bg-card" aria-label="Sortierung">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="count">Meiste Wünsche</SelectItem>
              <SelectItem value="newest">Neueste zuerst</SelectItem>
            </SelectContent>
          </Select>
          {venues.length > 0 && (
            <Select value={selectedVenue} onValueChange={setSelectedVenue}>
              <SelectTrigger className="h-11 w-full lg:w-52 rounded-xl bg-card" aria-label="Disco auswählen">
                <SelectValue placeholder="Alle Discos" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">Alle Discos</SelectItem>
                {venues.map((venue) => (
                  <SelectItem key={venue.id} value={venue.id}>
                    {venue.name}
                  </SelectItem>
                ))}
                <SelectItem value="none">Ohne Disco</SelectItem>
              </SelectContent>
            </Select>
          )}
          {canManageRequests && (
            <Button
              variant="outline"
              size="icon"
              onClick={toggleSound}
              className="h-11 w-11 rounded-xl shrink-0 bg-card"
              title={soundOn ? "Ton bei neuen Wünschen: an" : "Ton bei neuen Wünschen: aus"}
              aria-label={soundOn ? "Ton ausschalten" : "Ton einschalten"}
              aria-pressed={soundOn}
            >
              {soundOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-muted-foreground" />}
            </Button>
          )}
        </div>
      </div>

      {/* Status tabs */}
      {canManageRequests && (
        <div className="flex gap-1 p-1 bg-muted rounded-xl overflow-x-auto" role="tablist">
          {STATUS_TABS.map((t) => (
            <button
              key={t.value}
              type="button"
              role="tab"
              aria-selected={tab === t.value}
              onClick={() => setTab(t.value)}
              className={`flex-1 min-w-fit px-3 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
                tab === t.value
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}{" "}
              <span
                className={`ml-1 inline-flex min-w-6 justify-center rounded-full px-1.5 text-xs tabular-nums ${
                  t.value === "pending" && counts.pending > 0
                    ? "bg-amber-500 text-white"
                    : "bg-background/70 text-muted-foreground"
                }`}
              >
                {counts[t.value]}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* List */}
      <Card className="rounded-2xl overflow-hidden">
        {isLoading ? (
          <p className="p-8 text-center text-muted-foreground">Lädt…</p>
        ) : visible.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground">
            {search ? (
              <>
                <Search className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p className="font-medium">Keine Treffer für „{search}“</p>
              </>
            ) : (
              <>
                {tab === "pending" ? (
                  <Inbox className="w-10 h-10 mx-auto mb-3 opacity-50" />
                ) : (
                  <ListMusic className="w-10 h-10 mx-auto mb-3 opacity-50" />
                )}
                <p className="font-medium">{emptyText[tab]}</p>
              </>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {visible.map((request) => {
              const isNew = newIds.has(request.id);
              return (
                <li
                  key={request.id}
                  className={`flex items-center gap-3 px-3 md:px-4 py-2.5 transition-colors ${
                    isNew ? "bg-primary/10" : "hover:bg-muted/40"
                  }`}
                >
                  <div className="w-12 md:w-14 shrink-0 text-center">
                    <span className="text-xl md:text-2xl font-extrabold tabular-nums text-primary">
                      {request.request_count}×
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold leading-tight truncate">
                      {request.song_title}
                      {isNew && (
                        <Badge className="ml-2 align-middle bg-primary text-primary-foreground text-[10px] px-1.5 py-0">
                          NEU
                        </Badge>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {request.artist_name}
                      <span className="mx-1.5">·</span>
                      {formatDistanceToNowStrict(new Date(request.created_at), {
                        locale: de,
                        addSuffix: true,
                      })}
                      {selectedVenue === "all" && venues.length > 1 && (
                        <>
                          <span className="mx-1.5">·</span>
                          {venueName(request.venue_id)}
                        </>
                      )}
                    </p>
                  </div>

                  <div className="flex gap-1.5 shrink-0">{renderActions(request)}</div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {!canManageRequests && (
        <p className="text-sm text-muted-foreground text-center flex items-center justify-center gap-1.5">
          <Music2 className="w-4 h-4" />
          Du siehst nur angenommene Wünsche.
        </p>
      )}
    </div>
  );
};
