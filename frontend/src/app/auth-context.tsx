import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { AuthenticatedUser, LoginResponse } from '@/types/auth';
import { authService } from '@/features/auth/services/authService';

interface AuthContextValue {
  user: AuthenticatedUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  login: (response: LoginResponse) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'grh-emmn-auth';

interface StoredAuth {
  accessToken: string;
  user: AuthenticatedUser;
}

function loadFromStorage(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredAuth;
  } catch {
    return null;
  }
}

function saveToStorage(value: StoredAuth): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

function clearStorage(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoredAuth | null>(() => loadFromStorage());
  const [isBootstrapping, setIsBootstrapping] = useState<boolean>(() => loadFromStorage() === null);

  /**
   * Bootstrap : au demarrage, si aucun utilisateur n'est en stockage mais
   * qu'un cookie de refresh existe, on tente un refresh silencieux pour
   * restaurer la session.
   */
  useEffect(() => {
    let cancelled = false;

    async function bootstrap(): Promise<void> {
      if (state) {
        setIsBootstrapping(false);
        return;
      }
      try {
        const response = await authService.refresh();
        if (!cancelled) {
          const stored: StoredAuth = {
            accessToken: response.accessToken,
            user: response.user,
          };
          saveToStorage(stored);
          setState(stored);
        }
      } catch {
        // Aucune session active : mode anonyme.
      } finally {
        if (!cancelled) {
          setIsBootstrapping(false);
        }
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Ecoute l evenement emis par l intercepteur Axios lorsque le refresh
   * echoue : on vide alors le contexte pour forcer la deconnexion.
   */
  useEffect(() => {
    const handler = (): void => {
      clearStorage();
      setState(null);
    };
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, []);

  const login = useCallback((response: LoginResponse) => {
    const stored: StoredAuth = {
      accessToken: response.accessToken,
      user: response.user,
    };
    saveToStorage(stored);
    setState(stored);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // On ignore les erreurs : l utilisateur doit pouvoir se deconnecter
      // meme si le serveur est injoignable.
    } finally {
      clearStorage();
      setState(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: state?.user ?? null,
      accessToken: state?.accessToken ?? null,
      isAuthenticated: Boolean(state?.accessToken),
      isBootstrapping,
      login,
      logout,
    }),
    [state, isBootstrapping, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit etre utilise dans AuthProvider');
  }
  return context;
}