import * as DialogPrimitive from "@radix-ui/react-dialog";
import { NavLink, useNavigate } from "react-router-dom";
import { X, Moon, Sun, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useAuth } from "../contexts/useAuth";

interface NavLinkItem {
  to: string;
  label: string;
  badge?: number;
}

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  links: NavLinkItem[];
  role: "admin" | "client";
  darkMode: boolean;
  onToggleDarkMode: () => void;
  currentLanguage: string;
  onChangeLanguage: (lng: string) => void;
}

export default function MobileSidebar({
  isOpen,
  onClose,
  links,
  role,
  darkMode,
  onToggleDarkMode,
  currentLanguage,
  onChangeLanguage,
}: MobileSidebarProps) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const hasProfileLink = links.some((link) => link.to === "profile");
  const hasSettingsLink = links.some((link) => link.to === "settings");

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0"
          onClick={onClose}
        />
        <DialogPrimitive.Content
          aria-label={t('nav.closeMenu')}
          className="fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] overflow-y-auto bg-background p-6 shadow-lg outline-hidden data-[state=open]:animate-in data-[state=open]:slide-in-from-left data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar className="size-10">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.firstName || role}`} />
                <AvatarFallback>{role === "admin" ? "AD" : "CL"}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold leading-none">{user?.firstName || "User"}</p>
                <p className="text-muted-foreground text-sm">
                  {role === "admin" ? t('nav.adminPanel') : t('nav.clientPortal')}
                </p>
              </div>
            </div>
            <DialogPrimitive.Close aria-label={t('nav.closeMenu')} asChild>
              <Button variant="ghost" size="icon">
                <X className="size-5" />
              </Button>
            </DialogPrimitive.Close>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-3">
              <Button variant="outline" className="flex-1 justify-start gap-2" onClick={() => onChangeLanguage('uk')}>
                <Globe className="size-4" />
                🇺🇦 Українська {currentLanguage === 'uk' ? "✓" : ""}
              </Button>
              <Button variant="outline" className="flex-1 justify-start gap-2" onClick={() => onChangeLanguage('en')}>
                <Globe className="size-4" />
                🇬🇧 English {currentLanguage === 'en' ? "✓" : ""}
              </Button>
            </div>

            <Button variant="outline" className="w-full justify-start gap-2" onClick={onToggleDarkMode}>
              {darkMode ? <Sun className="size-4" /> : <Moon className="size-4" />}
              {darkMode ? t('common.light', 'Light') : t('common.dark', 'Dark')}
            </Button>

            <div className="border-t pt-4 space-y-2">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={`/${role}/${link.to}`}
                  className={({ isActive }) =>
                    `flex items-center justify-between rounded-md px-4 py-3 text-base font-medium transition ${
                      isActive ? "bg-[#F97316] text-white" : "hover:bg-muted"
                    }`
                  }
                  onClick={onClose}
                >
                  <span>{link.label}</span>
                  {link.badge && link.badge > 0 ? (
                    <Badge className="ml-2 bg-red-600">{link.badge}</Badge>
                  ) : null}
                </NavLink>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2">
              {!hasProfileLink && (
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    navigate(`/${role}/profile`);
                    onClose();
                  }}
                >
                  {t('nav.profile')}
                </Button>
              )}
              {role === "admin" && !hasSettingsLink && (
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    navigate(`/${role}/settings`);
                    onClose();
                  }}
                >
                  {t('nav.settings')}
                </Button>
              )}
              <Button variant="ghost" className="w-full justify-start text-red-600" onClick={() => { logout(); onClose(); }}>
                {t('nav.logout')}
              </Button>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
