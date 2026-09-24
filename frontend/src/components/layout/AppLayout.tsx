import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Breadcrumbs } from './Breadcrumbs';

type Theme = 'light' | 'dark';

const THEME_KEY = 'grh-emmn-theme';
const SIDEBAR_WIDTH = 256; // px = w-64

function loadTheme(): Theme {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function AppLayout() {
  const [theme, setTheme] = useState<Theme>(() => loadTheme());
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = (): void => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  return (
    <div className="min-h-screen bg-background">
      {/* ============================================================
          Sidebar DESKTOP : position fixe, largeur fixe, hors du flux
          ============================================================ */}
      <aside
        className="fixed inset-y-0 left-0 z-40 hidden border-r border-sidebar-border bg-sidebar lg:block"
        style={{ width: `${SIDEBAR_WIDTH}px` }}
      >
        <Sidebar />
      </aside>

      {/* ============================================================
          Sidebar MOBILE : drawer
          ============================================================ */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <Sidebar
            onClose={() => setMobileOpen(false)}
            onNavigate={() => setMobileOpen(false)}
            showClose
          />
        </SheetContent>
      </Sheet>

      {/* ============================================================
          Zone de contenu : decalee par un margin-left sur desktop
          ============================================================ */}
      <div
        className="flex min-h-screen flex-col lg:pl-64"
        style={{ minWidth: 0 }}
      >
        <Header
          onOpenSidebar={() => setMobileOpen(true)}
          onToggleTheme={toggleTheme}
          theme={theme}
        />

        <main className="flex-1 overflow-x-hidden">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8">
            <Breadcrumbs />
            <div className="mt-4">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}