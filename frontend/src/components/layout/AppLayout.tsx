import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Breadcrumbs } from './Breadcrumbs';

type Theme = 'light' | 'dark';

const THEME_KEY = 'grh-emmn-theme';

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

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden w-64 shrink-0 lg:block">
        <div className="fixed inset-y-0 left-0 w-64">
          <Sidebar />
        </div>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <Sidebar onClose={() => setMobileOpen(false)} onNavigate={() => setMobileOpen(false)} showClose />
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 flex-col">
        <Header
          onOpenSidebar={() => setMobileOpen(true)}
          onToggleTheme={toggleTheme}
          theme={theme}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto max-w-7xl px-4 py-6 lg:px-8">
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