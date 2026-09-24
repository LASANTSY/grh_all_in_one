import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Menu, Moon, Sun, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

  const initials = user ? formatInitiales(user.identifiant, user.identifiant) : '?';
  const roleLabel = user ? ROLE_LABELS[user.typeCompte] ?? user.typeCompte : '';

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenSidebar}
          className="lg:hidden"
          aria-label="Ouvrir le menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Link to="/dashboard" className="flex items-center gap-2 lg:hidden">
          <img src="/logo.png" alt="GRH EMMN" className="h-7 w-7 object-contain" />
          <span className="text-sm font-semibold">GRH EMMN</span>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleTheme}
          aria-label="Changer de theme"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden flex-col items-start leading-none md:flex">
                <span className="text-sm font-medium">{user?.identifiant ?? 'Invite'}</span>
                <span className="text-[10px] text-muted-foreground">{roleLabel}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user?.identifiant ?? 'Invite'}</span>
                <span className="text-xs text-muted-foreground">{roleLabel}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <User className="mr-2 h-4 w-4" />
              Mon profil
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Deconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}