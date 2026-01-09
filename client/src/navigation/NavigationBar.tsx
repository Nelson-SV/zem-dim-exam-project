import { useNavigate } from "react-router-dom";
import { Building2, Moon, Sun, Globe, Menu } from "lucide-react";
import { Button } from "../components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { useAuth } from "../contexts/useAuth";
import { useTranslation } from 'react-i18next';

interface NavigationBarProps {
  role: string;
  children: React.ReactNode;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  currentLanguage: string;
  onChangeLanguage: (lng: string) => void;
  onOpenMobileMenu: () => void;
  isMobileMenuOpen: boolean;
}

export function NavigationBar({
  role,
  children,
  darkMode,
  onToggleDarkMode,
  currentLanguage,
  onChangeLanguage,
  onOpenMobileMenu,
  isMobileMenuOpen,
}: NavigationBarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <nav className="sticky top-0 z-50 border-b bg-card mb-6">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-3 px-4 py-2 sm:h-16 sm:flex-nowrap">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate(`/${role}`)}>
          <div className="p-2 rounded-lg bg-linear-to-br from-[#F97316] to-[#F59E0B]">
            <Building2 className="size-6 text-white" />
          </div>
          <div>
            <h4 className="leading-none font-semibold">ZEM-DIM</h4>
            <p className="text-muted-foreground text-sm">
              {role === "admin" ? t('nav.adminPanel') : t('nav.clientPortal')}
            </p>
          </div>
        </div>

        {/* Navigation bar links */}
        <div className="nav-items hidden md:flex space-x-6">
          {children}
        </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label={t('nav.openMenu', 'Open navigation')}
          aria-expanded={isMobileMenuOpen}
          aria-haspopup="dialog"
          onClick={onOpenMobileMenu}
        >
          <Menu className="size-5" />
        </Button>

          <div className="hidden md:flex items-center gap-2">
            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Globe className="size-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onChangeLanguage('uk')}>
                  🇺🇦 Українська {currentLanguage === 'uk' ? "✓" : ""}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onChangeLanguage('en')}>
                  🇬🇧 English {currentLanguage === 'en' ? "✓" : ""}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Dark Mode */}
            <Button variant="ghost" size="icon" onClick={onToggleDarkMode}>
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
                <DropdownMenuItem onClick={() => navigate(`/${role}/profile`)}>
                  {t('nav.profile')}
                </DropdownMenuItem>
                {role === "admin" && (
                  <DropdownMenuItem onClick={() => navigate(`/${role}/settings`)}>
                    {t('nav.settings')}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={logout}>
                  {t('nav.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
