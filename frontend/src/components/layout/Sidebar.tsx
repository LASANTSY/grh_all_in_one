import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Upload,
  FileText,
  Building2,
  MapPin,
  Medal,
  Layers,
  ShieldCheck,
  UserCog,
  ClipboardCheck,
  Settings,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { usePermissions } from '@/hooks/usePermissions';

interface SidebarProps {
  onNavigate?: () => void;
  onClose?: () => void;
  showClose?: boolean;
}

interface NavItem {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  visible: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export function Sidebar({ onNavigate, onClose, showClose }: SidebarProps) {
  const perms = usePermissions();

  const groups: NavGroup[] = [
    {
      title: 'Vue d ensemble',
      items: [
        { label: 'Tableau de bord', to: '/dashboard', icon: LayoutDashboard, visible: perms.canViewDashboard },
      ],
    },
    {
      title: 'Personnel',
      items: [
        { label: 'Personnels', to: '/personnels', icon: Users, visible: perms.canViewPersonnels },
        { label: 'Recherche', to: '/recherche', icon: FileText, visible: perms.canViewPersonnels },
      ],
    },
    {
      title: 'Traitements',
      items: [
        { label: 'Imports Excel', to: '/imports', icon: Upload, visible: perms.canViewImports },
        { label: 'Demandes', to: '/demandes-modification', icon: ClipboardCheck, visible: perms.canViewPersonnels },
      ],
    },
    {
      title: 'Referentiels',
      items: [
        { label: 'Bases', to: '/referentiels/bases', icon: Building2, visible: perms.canManageReferentiels },
        { label: 'Unites', to: '/referentiels/unites', icon: MapPin, visible: perms.canManageReferentiels },
        { label: 'Grades', to: '/referentiels/grades', icon: Medal, visible: perms.canManageReferentiels },
        { label: 'Specialites', to: '/referentiels/specialites', icon: Layers, visible: perms.canManageReferentiels },
      ],
    },
    {
      title: 'Administration',
      items: [
        { label: 'Utilisateurs', to: '/utilisateurs', icon: UserCog, visible: perms.canViewUsers },
        { label: 'Audit', to: '/audit', icon: ShieldCheck, visible: perms.canViewAudit },
        { label: 'Parametres', to: '/parametres', icon: Settings, visible: perms.canManageUsers },
      ],
    },
  ];

  return (
    <aside className="flex h-full w-full flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-sidebar-border px-6">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="GRH EMMN" className="h-8 w-8 object-contain" />
          <div className="flex flex-col leading-none">
            <span className="text-sm font-semibold text-sidebar-foreground">GRH EMMN</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Marine Nationale
            </span>
          </div>
        </div>
        {showClose && onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
            <X className="h-4 w-4" />
            <span className="sr-only">Fermer</span>
          </Button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {groups.map((group) => {
          const visibleItems = group.items.filter((item) => item.visible);
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.title} className="mb-6">
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {group.title}
              </p>
              <ul className="space-y-0.5">
                {visibleItems.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      onClick={onNavigate}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                          isActive
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                            : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
                        )
                      }
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border px-6 py-3 text-[10px] text-muted-foreground">
        v0.1.0
      </div>
    </aside>
  );
}