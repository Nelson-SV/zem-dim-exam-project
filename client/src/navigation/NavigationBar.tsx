import { useNavigate } from "react-router-dom";
import { Building2, Moon, Sun, Globe } from "lucide-react";
import { Button } from "../components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { useAuth } from "../contexts/useAuth";
import { useState, useEffect } from "react";

interface NavigationBarProps {
  role: string;
  children: React.ReactNode;
}

export function NavigationBar({ role, children }: NavigationBarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState<"UKR" | "ENG">("UKR");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <nav className="sticky top-0 z-50 border-b bg-card mb-6">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-3 px-4 py-2 sm:h-16 sm:flex-nowrap">        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate(`/${role}`)}>
          <div className="p-2 rounded-lg bg-linear-to-br from-[#F97316] to-[#F59E0B]">
            <Building2 className="size-6 text-white" />
          </div>
          <div>
            <h4 className="leading-none font-semibold">ZEM-DIM</h4>
            <p className="text-muted-foreground text-sm">{role === "admin" ? "Admin Panel" : "Client Portal"}</p>
          </div>
        </div>

        {/* Navigation bar links */}
        <div className="nav-items hidden md:flex space-x-6">
          {children}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Globe className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLanguage("UKR")}>
                🇺🇦 Ukrainian {language === "UKR" ? "✓" : ""}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage("ENG")}>
                🇬🇧 English {language === "ENG" ? "✓" : ""}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Dark Mode */}
          <Button variant="ghost" size="icon" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </Button>

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <Avatar className="size-8">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.firstName || role}`} />
                  <AvatarFallback>{role === "admin" ? "AD" : "CL"}</AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline">{user?.firstName || "User"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/${role}/profile`)}>Profile</DropdownMenuItem>
              {role === "admin" && <DropdownMenuItem onClick={() => navigate(`/${role}/settings`)}>Settings</DropdownMenuItem>}
              <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}