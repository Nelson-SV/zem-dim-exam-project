import { Building2, Moon, Sun, Globe } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';

import { useAuth } from '../contexts/useAuth';


interface NavigationProps {
  userRole: 'admin' | 'client';
  activeTab: string;
  onTabChange: (tab: string) => void;
  darkMode: boolean;
  onDarkModeToggle: () => void;
  language: 'UA' | 'EN';
  onLanguageChange: (lang: 'UA' | 'EN') => void;
}

export function Navigation({
                             userRole,
                             activeTab,
                             onTabChange,
                             darkMode,
                             onDarkModeToggle,
                             language,
                             onLanguageChange,
                           }: NavigationProps) {
  const { user, logout } = useAuth();

  const adminTabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'projects', label: 'Projects' },
    { id: 'clients', label: 'Clients' },
    { id: 'messages', label: 'Messages' },
    { id: 'analytics', label: 'Analytics' },
  ];

  const clientTabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'gallery', label: 'Gallery' },
    { id: '3d', label: '3D Scans' },
    { id: 'messages', label: 'Messages', badge: 2 },
    { id: 'documents', label: 'Documents' },
    { id: 'calculator', label: 'Calculator' },
  ];

  const tabs = userRole === 'admin' ? adminTabs : clientTabs;

  return (
      <nav className="sticky top-0 z-40 border-b bg-card">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-[#F97316] to-[#F59E0B]">
                <Building2 className="size-6 text-white" />
              </div>
              <div>
                <h4 className="leading-none">ZEM-DIM</h4>
                <p className="text-muted-foreground">
                  {userRole === 'admin' ? 'Admin Panel' : 'Client Portal'}
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {tabs.map(tab => (
                  <Button
                      key={tab.id}
                      variant={activeTab === tab.id ? 'default' : 'ghost'}
                      onClick={() => onTabChange(tab.id)}
                      className={activeTab === tab.id ? 'bg-[#F97316] hover:bg-[#F97316]/90' : ''}
                  >
                    {tab.label}
                    {'badge' in tab && tab.badge ? (
                        <Badge className="ml-2 bg-destructive">{tab.badge}</Badge>
                    ) : null}
                  </Button>
              ))}
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
                  <DropdownMenuItem onClick={() => onLanguageChange('UA')}>
                    🇺🇦 Ukrainian {language === 'UA' ? '✓' : ''}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onLanguageChange('EN')}>
                    🇬🇧 English {language === 'EN' ? '✓' : ''}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Dark Mode Toggle */}
              <Button variant="ghost" size="icon" onClick={onDarkModeToggle}>
                {darkMode ? <Sun className="size-5" /> : <Moon className="size-5" />}
              </Button>

              {/* Profile */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <Avatar className="size-8">
                      <AvatarImage
                          src={
                            userRole === 'admin'
                                ? 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
                                : 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex'
                          }
                      />
                      <AvatarFallback>
                        {userRole === 'admin' ? 'AD' : 'OK'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline">
                    {userRole === 'admin' ? 'Manager' : 'Oleksandr'}
                  </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  {userRole === 'admin' && (
                      <DropdownMenuItem onClick={() => onTabChange('settings')}>
                        Settings
                      </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="lg:hidden flex gap-1 overflow-x-auto pb-2 -mx-4 px-4">
            {tabs.map(tab => (
                <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? 'default' : 'ghost'}
                    onClick={() => onTabChange(tab.id)}
                    className={`whitespace-nowrap ${activeTab === tab.id ? 'bg-[#F97316] hover:bg-[#F97316]/90' : ''}`}
                    size="sm"
                >
                  {tab.label}
                  {'badge' in tab && tab.badge ? (
                      <Badge className="ml-2 bg-destructive">{tab.badge}</Badge>
                  ) : null}
                </Button>
            ))}
          </div>

          {/* User info */}
          <div className="flex items-center gap-4">
            <span>{user?.firstName} {user?.lastName}</span>
            <span className="text-muted-foreground">({user?.role})</span>
          </div>
        </div>
      </nav>
  );
}
