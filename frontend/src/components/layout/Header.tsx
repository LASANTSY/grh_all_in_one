import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Menu, Moon, Sun, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/app/auth-context';
import { formatInitiales } from '@/lib/formatters';

interface HeaderProps {
  onOpenSidebar: () => void;
  onToggleTheme: () => void;
  theme: 'light' | 'dark';
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN_SYSTEME: 'Administrateur systeme',
  RH_ETAT_MAJOR: 'RH Etat-Major',
  RH_BASE: 'RH Base',
  CHEF_COMMANDEMENT: 'Chef / Commandement',
  PERSONNEL: 'Personnel',
};

export function Header({ onOpenSidebar, onToggleTheme, theme }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const initials = user ? formatInitiales(user.identifiant, user.identifiant) : '?';
  const roleLabel = user ? ROLE_LABELS[user.typeCompte] ?? user.typeCompte : '';

  const handleLogout = async (): Promise<void> => {
    setMenuOpen(false);
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onOpenSidebar} className="lg:hidden" aria-label="Ouvrir le menu">
          <Menu className="h-5 w-5" />
        </Button>
        <Link to="/dashboard" className="flex items-center gap-2 lg:hidden">
          <img src="/logo.png" alt="GRH EMMN" className="h-7 w-7 object-contain" />
          <span className="text-sm font-semibold">GRH EMMN</span>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onToggleTheme} aria-label="Changer de theme">
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        <div className="relative" ref={menuRef}>
          <Button
            variant="ghost"
            className="flex items-center gap-2 px-2"
            onClick={() => setMenuOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="hidden flex-col items-start leading-none md:flex">
              <span className="text-sm font-medium">{user?.identifiant ?? 'Invite'}</span>
              <span className="text-[10px] text-muted-foreground">{roleLabel}</span>
            </div>
          </Button>

          {menuOpen && (
            <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-56 rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user?.identifiant ?? 'Invite'}</p>
                <p className="text-xs text-muted-foreground">{roleLabel}</p>
              </div>
              <div className="-mx-1 my-1 h-px bg-muted" />
              <button
                type="button"
                disabled
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm opacity-50"
              >
                <User className="h-4 w-4" /> Mon profil
              </button>
              <div className="-mx-1 my-1 h-px bg-muted" />
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm text-destructive hover:bg-accent"
              >
                <LogOut className="h-4 w-4" /> Deconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}