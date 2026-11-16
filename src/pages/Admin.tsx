import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LogOut, MonitorPlay, Home } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MusicRequestsList } from "@/components/admin/MusicRequestsList";
import { UserManagement } from "@/components/admin/UserManagement";
import { ThemeManagement } from "@/components/admin/ThemeManagement";
import { VenueManagement } from "@/components/admin/VenueManagement";

const Admin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [canManageRequests, setCanManageRequests] = useState(false);
  const [canChangeTheme, setCanChangeTheme] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loggedIn = localStorage.getItem("adminLoggedIn");
    const userId = localStorage.getItem("adminUserId");
    if (loggedIn === "true" && userId) {
      setIsLoggedIn(true);
      setCurrentUserId(userId);
      checkUserPermissions(userId);
    }
  }, []);

  const checkUserPermissions = async (userId: string) => {
    try {
      // Check if user is admin
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

      if (roleError) {
        console.error("Error fetching role:", roleError);
      }

      const hasAdminRole = roleData?.role === "admin";
      setIsAdmin(hasAdminRole);

      // Check if user can manage requests and themes
      const { data: userData, error: userError } = await supabase
        .from("admin_users")
        .select("can_manage_requests, can_change_theme")
        .eq("id", userId)
        .maybeSingle();

      if (userError) {
        console.error("Error fetching user data:", userError);
      }

      setCanManageRequests(userData?.can_manage_requests || false);
      setCanChangeTheme(userData?.can_change_theme || false);

      console.log("Permissions loaded:", {
        isAdmin: hasAdminRole,
        canManageRequests: userData?.can_manage_requests,
        canChangeTheme: userData?.can_change_theme
      });
    } catch (error) {
      console.error("Error in checkUserPermissions:", error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from("admin_users")
        .select("*")
        .eq("username", username)
        .eq("password", password)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        localStorage.setItem("adminLoggedIn", "true");
        localStorage.setItem("adminUserId", data.id);
        setIsLoggedIn(true);
        setCurrentUserId(data.id);
        await checkUserPermissions(data.id);
        toast({
          title: "Erfolgreich angemeldet",
          description: `Willkommen, ${username}!`,
        });
      } else {
        toast({
          title: "Login fehlgeschlagen",
          description: "Benutzername oder Passwort falsch.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Fehler",
        description: "Es gab ein Problem beim Login.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    localStorage.removeItem("adminUserId");
    setIsLoggedIn(false);
    setIsAdmin(false);
    setCanManageRequests(false);
    navigate("/");
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="w-full max-w-md animate-fade-in">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
              Admin Login
            </h1>
            <p className="text-muted-foreground">
              Melde dich an um die Musikwünsche zu sehen
            </p>
          </div>

          <Card className="p-8 glass-card rounded-3xl shadow-xl">
            <form onSubmit={handleLogin} className="space-y-5">
              <Input
                type="text"
                placeholder="Benutzername"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12 px-4 text-base rounded-2xl border-border/50 glass-input"
                required
              />

              <Input
                type="password"
                placeholder="Passwort"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 px-4 text-base rounded-2xl border-border/50 glass-input"
                required
              />

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-base font-semibold rounded-2xl bg-gradient-button hover:opacity-90 transition-opacity shadow-lg shadow-primary/15"
              >
                {isLoading ? "Wird angemeldet..." : "Anmelden"}
              </Button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Zurück zur Startseite
                </button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    );
  }

  const tabTrigger = "rounded-lg px-3 py-1.5 data-[state=active]:bg-gradient-button data-[state=active]:text-white";

  return (
    <div className="min-h-screen bg-background">
      <Tabs defaultValue="requests" className="w-full">
        {/* Sticky compact header: always reachable while scrolling long lists */}
        <header className="sticky top-0 z-30 border-b border-border/60 bg-background/95 supports-[backdrop-filter]:bg-background/80 supports-[backdrop-filter]:backdrop-blur-sm">
          <div className="max-w-5xl mx-auto px-4 md:px-6 py-2.5 flex flex-wrap items-center gap-x-4 gap-y-2">
            <h1 className="mr-auto text-xl font-extrabold bg-gradient-primary bg-clip-text text-transparent whitespace-nowrap">
              Admin
            </h1>

            <div className="flex items-center gap-1.5 order-2 md:order-3">
              <Button asChild variant="ghost" size="sm" className="gap-1.5 rounded-lg" title="Startseite">
                <Link to="/"><Home className="w-4 h-4" /><span className="hidden lg:inline">Startseite</span></Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="gap-1.5 rounded-lg" title="Top-Wünsche fürs Whiteboard (neuer Tab)">
                <a href="/top" target="_blank" rel="noopener noreferrer">
                  <MonitorPlay className="w-4 h-4" /><span className="hidden lg:inline">Whiteboard</span>
                </a>
              </Button>
              <Button onClick={handleLogout} variant="outline" size="sm" className="gap-1.5 rounded-lg">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Abmelden</span>
              </Button>
            </div>

            <TabsList className="order-3 md:order-2 w-full md:w-auto justify-start overflow-x-auto bg-muted/70 p-1 rounded-xl h-auto">
              <TabsTrigger value="requests" className={tabTrigger}>Wünsche</TabsTrigger>
              {isAdmin && <TabsTrigger value="users" className={tabTrigger}>Benutzer</TabsTrigger>}
              {isAdmin && <TabsTrigger value="venues" className={tabTrigger}>Discos</TabsTrigger>}
              {canChangeTheme && <TabsTrigger value="themes" className={tabTrigger}>Design</TabsTrigger>}
            </TabsList>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 md:px-6 py-5">
          <TabsContent value="requests" className="mt-0">
            <MusicRequestsList canManageRequests={canManageRequests} />
          </TabsContent>
          
          {isAdmin && (
            <TabsContent value="users" className="mt-0">
              <UserManagement currentUserId={currentUserId} />
            </TabsContent>
          )}

          {isAdmin && (
            <TabsContent value="venues" className="mt-0">
              <VenueManagement />
            </TabsContent>
          )}

          {canChangeTheme && (
            <TabsContent value="themes" className="mt-0">
              <ThemeManagement />
            </TabsContent>
          )}
        </main>
      </Tabs>
    </div>
  );
};

export default Admin;
