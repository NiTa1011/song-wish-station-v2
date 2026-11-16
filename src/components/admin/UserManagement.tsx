import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Shield, User as UserIcon, Plus, Pencil, Trash2, Check, Minus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmDialog } from "./ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface AdminUser {
  id: string;
  username: string;
  can_manage_requests: boolean;
  can_change_theme: boolean;
  role?: string;
}

interface UserManagementProps {
  currentUserId: string;
}

export const UserManagement = ({ currentUserId }: UserManagementProps) => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    can_manage_requests: false,
    can_change_theme: false,
    is_admin: false,
  });
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data: adminUsers, error } = await supabase
      .from("admin_users")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Fehler",
        description: "Benutzer konnten nicht geladen werden.",
        variant: "destructive",
      });
      return;
    }

    if (adminUsers) {
      const usersWithRoles = await Promise.all(
        adminUsers.map(async (user) => {
          const { data: roleData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id)
            .maybeSingle();

          return {
            ...user,
            role: roleData?.role || "user",
          };
        })
      );
      setUsers(usersWithRoles);
    }
  };

  const handleOpenDialog = (user?: AdminUser) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        password: "",
        can_manage_requests: user.can_manage_requests || false,
        can_change_theme: user.can_change_theme || false,
        is_admin: user.role === "admin",
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: "",
        password: "",
        can_manage_requests: false,
        can_change_theme: false,
        is_admin: false,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingUser(null);
    setFormData({
      username: "",
      password: "",
      can_manage_requests: false,
      can_change_theme: false,
      is_admin: false,
    });
  };

  const handleSubmit = async () => {
    if (!formData.username || (!editingUser && !formData.password)) {
      toast({
        title: "Fehler",
        description: "Bitte fülle alle Pflichtfelder aus.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingUser) {
        // Update existing user
        const updateData: {
          username: string;
          can_manage_requests: boolean;
          can_change_theme: boolean;
          password?: string;
        } = {
          username: formData.username,
          can_manage_requests: formData.can_manage_requests,
          can_change_theme: formData.can_change_theme,
        };

        if (formData.password) {
          updateData.password = formData.password;
        }

        const { error: updateError } = await supabase
          .from("admin_users")
          .update(updateData)
          .eq("id", editingUser.id);

        if (updateError) throw updateError;

        // Update role
        const { error: deleteRoleError } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", editingUser.id);

        if (formData.is_admin) {
          const { error: roleError } = await supabase
            .from("user_roles")
            .insert({ user_id: editingUser.id, role: "admin" });

          if (roleError && roleError.code !== "23505") throw roleError;
        }

        toast({
          title: "Erfolg",
          description: "Benutzer wurde aktualisiert.",
        });
      } else {
        // Create new user
        const { data: newUser, error: insertError } = await supabase
          .from("admin_users")
          .insert({
            username: formData.username,
            password: formData.password,
            can_manage_requests: formData.can_manage_requests,
            can_change_theme: formData.can_change_theme,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        // Add admin role if selected
        if (formData.is_admin && newUser) {
          const { error: roleError } = await supabase
            .from("user_roles")
            .insert({ user_id: newUser.id, role: "admin" });

          if (roleError) throw roleError;
        }

        toast({
          title: "Erfolg",
          description: "Neuer Benutzer wurde erstellt.",
        });
      }

      handleCloseDialog();
      fetchUsers();
    } catch (error) {
      console.error("Error saving user:", error);
      toast({
        title: "Fehler",
        description: "Benutzer konnte nicht gespeichert werden.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (userId: string) => {
    if (userId === currentUserId) {
      toast({
        title: "Fehler",
        description: "Du kannst dich nicht selbst löschen.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("admin_users")
        .delete()
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Benutzer wurde gelöscht.",
      });

      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Fehler",
        description: "Benutzer konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card className="rounded-2xl overflow-hidden">
        <div className="flex justify-between items-center gap-3 p-4 md:p-5 border-b border-border/60">
          <h2 className="text-lg font-bold">Benutzer ({users.length})</h2>
          <Button onClick={() => handleOpenDialog()} size="sm" className="gap-1.5 rounded-lg bg-gradient-button hover:opacity-90">
            <Plus className="w-4 h-4" />
            Neuer Benutzer
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Rolle</TableHead>
                <TableHead className="text-center">Wünsche verwalten</TableHead>
                <TableHead className="text-center">Design ändern</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-2 min-w-[8rem]">
                      {user.role === "admin" ? (
                        <Shield className="w-4 h-4 text-primary shrink-0" />
                      ) : (
                        <UserIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                      )}
                      <span className="font-semibold">
                        {user.username}
                        {user.id === currentUserId && (
                          <span className="ml-1.5 text-xs font-normal text-muted-foreground">(du)</span>
                        )}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                      {user.role === "admin" ? "Admin" : "Benutzer"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <PermissionMark on={user.can_manage_requests} />
                  </TableCell>
                  <TableCell className="text-center">
                    <PermissionMark on={user.can_change_theme} />
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(user)}
                      className="h-9 w-9"
                      title="Bearbeiten"
                      aria-label={`${user.username} bearbeiten`}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    {user.id !== currentUserId && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setUserToDelete(user)}
                        className="h-9 w-9 text-destructive hover:text-destructive"
                        title="Löschen"
                        aria-label={`${user.username} löschen`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <ConfirmDialog
        open={userToDelete !== null}
        onOpenChange={(open) => !open && setUserToDelete(null)}
        title="Benutzer löschen?"
        description={`„${userToDelete?.username ?? ""}“ wird mit allen Rechten gelöscht. Das kann nicht rückgängig gemacht werden.`}
        onConfirm={() => {
          if (userToDelete) handleDelete(userToDelete.id);
          setUserToDelete(null);
        }}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "Benutzer bearbeiten" : "Neuer Benutzer"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="username">Benutzername *</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                placeholder="Benutzername eingeben"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">
                Passwort {editingUser ? "(leer lassen für keine Änderung)" : "*"}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder={editingUser ? "Neues Passwort" : "Passwort eingeben"}
              />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="admin">Admin-Rechte</Label>
                <Switch
                  id="admin"
                  checked={formData.is_admin}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_admin: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="manage">Wünsche verwalten</Label>
                <Switch
                  id="manage"
                  checked={formData.can_manage_requests}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, can_manage_requests: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="theme">Design ändern</Label>
                <Switch
                  id="theme"
                  checked={formData.can_change_theme}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, can_change_theme: checked })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Abbrechen
            </Button>
            <Button onClick={handleSubmit} className="bg-gradient-button hover:opacity-90">
              {editingUser ? "Speichern" : "Erstellen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const PermissionMark = ({ on }: { on: boolean }) =>
  on ? (
    <Check className="w-5 h-5 text-green-600 mx-auto" aria-label="ja" />
  ) : (
    <Minus className="w-4 h-4 text-muted-foreground/50 mx-auto" aria-label="nein" />
  );
