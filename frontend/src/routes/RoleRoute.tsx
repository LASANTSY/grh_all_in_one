import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/app/auth-context';
import type { TypeCompte } from '@/types/auth';

interface RoleRouteProps {
  allowed: TypeCompte[];
}

export function RoleRoute({ allowed }: RoleRouteProps) {
  const { user } = useAuth();

  if (!user || !allowed.includes(user.typeCompte)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}