import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmDialog } from "./ConfirmDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

interface Venue {
  id: string;
  name: string;
  active: boolean;
  created_at: string;
}

export const VenueManagement = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [newVenueName, setNewVenueName] = useState("");
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [venueToDelete, setVenueToDelete] = useState<Venue | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    const { data, error } = await supabase
      .from("venues")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching venues:", error);
      toast({
        title: "Fehler",
        description: "Discos konnten nicht geladen werden.",
        variant: "destructive",
      });
    } else {
      setVenues(data || []);
    }
  };

  const handleCreateVenue = async () => {
    if (!newVenueName.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte gib einen Namen ein.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("venues")
      .insert([{ name: newVenueName.trim() }]);

    if (error) {
      console.error("Error creating venue:", error);
      toast({
        title: "Fehler",
        description: "Disco konnte nicht erstellt werden.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Erfolg",
        description: "Disco wurde erstellt.",
      });
      setNewVenueName("");
      setIsDialogOpen(false);
      fetchVenues();
    }
  };

  const handleUpdateVenue = async () => {
    if (!editingVenue) return;

    const { error } = await supabase
      .from("venues")
      .update({ 
        name: editingVenue.name,
        active: editingVenue.active
      })
      .eq("id", editingVenue.id);

    if (error) {
      console.error("Error updating venue:", error);
      toast({
        title: "Fehler",
        description: "Disco konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Erfolg",
        description: "Disco wurde aktualisiert.",
      });
      setEditingVenue(null);
      fetchVenues();
    }
  };

  const handleToggleActive = async (venue: Venue, active: boolean) => {
    setVenues((prev) => prev.map((v) => (v.id === venue.id ? { ...v, active } : v)));
    const { error } = await supabase.from("venues").update({ active }).eq("id", venue.id);
    if (error) {
      console.error("Error updating venue:", error);
      setVenues((prev) => prev.map((v) => (v.id === venue.id ? { ...v, active: venue.active } : v)));
      toast({
        title: "Fehler",
        description: "Status konnte nicht geändert werden.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteVenue = async (id: string) => {
    const { error } = await supabase
      .from("venues")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting venue:", error);
      toast({
        title: "Fehler",
        description: "Disco konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Erfolg",
        description: "Disco wurde gelöscht.",
      });
      fetchVenues();
    }
  };

  return (
    <Card className="rounded-2xl overflow-hidden">
      <div className="flex justify-between items-center gap-3 p-4 md:p-5 border-b border-border/60">
        <div>
          <h2 className="text-lg font-bold">Discos ({venues.length})</h2>
          <p className="text-xs text-muted-foreground">Nur aktive Discos können auf der Startseite ausgewählt werden.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5 rounded-lg bg-gradient-button hover:opacity-90">
              <Plus className="w-4 h-4" />
              Neue Disco
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle>Neue Disco erstellen</DialogTitle>
            </DialogHeader>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateVenue();
              }}
            >
              <Input
                placeholder="Name der Disco"
                value={newVenueName}
                onChange={(e) => setNewVenueName(e.target.value)}
                className="rounded-xl"
                autoFocus
              />
              <Button type="submit" className="w-full rounded-xl">
                Erstellen
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {venues.length === 0 ? (
        <p className="p-8 text-center text-muted-foreground">Noch keine Discos angelegt.</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="w-32">Aktiv</TableHead>
                <TableHead className="text-right w-32">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {venues.map((venue) => {
                const isEditing = editingVenue?.id === venue.id;
                return (
                  <TableRow key={venue.id}>
                    <TableCell className="font-semibold">
                      {isEditing ? (
                        <Input
                          value={editingVenue.name}
                          onChange={(e) => setEditingVenue({ ...editingVenue, name: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleUpdateVenue();
                            if (e.key === "Escape") setEditingVenue(null);
                          }}
                          className="h-9 rounded-lg max-w-sm"
                          autoFocus
                          aria-label="Name der Disco"
                        />
                      ) : (
                        venue.name
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={isEditing ? editingVenue.active : venue.active}
                          onCheckedChange={(checked) =>
                            isEditing
                              ? setEditingVenue({ ...editingVenue, active: checked })
                              : handleToggleActive(venue, checked)
                          }
                          aria-label={`${venue.name} aktiv`}
                        />
                        <span className="text-xs text-muted-foreground">
                          {(isEditing ? editingVenue.active : venue.active) ? "Aktiv" : "Inaktiv"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      {isEditing ? (
                        <>
                          <Button size="icon" variant="ghost" className="h-9 w-9 text-green-600" onClick={handleUpdateVenue} title="Speichern" aria-label="Speichern">
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-9 w-9" onClick={() => setEditingVenue(null)} title="Abbrechen" aria-label="Abbrechen">
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="icon" variant="ghost" className="h-9 w-9" onClick={() => setEditingVenue(venue)} title="Umbenennen" aria-label={`${venue.name} umbenennen`}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-9 w-9 text-destructive hover:text-destructive" onClick={() => setVenueToDelete(venue)} title="Löschen" aria-label={`${venue.name} löschen`}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <ConfirmDialog
        open={venueToDelete !== null}
        onOpenChange={(open) => !open && setVenueToDelete(null)}
        title="Disco löschen?"
        description={`„${venueToDelete?.name ?? ""}“ wird gelöscht. Das kann nicht rückgängig gemacht werden. Tipp: Wenn du die Disco nur vorübergehend nicht brauchst, schalte sie stattdessen auf „Inaktiv“.`}
        onConfirm={() => {
          if (venueToDelete) handleDeleteVenue(venueToDelete.id);
          setVenueToDelete(null);
        }}
      />
    </Card>
  );
};
