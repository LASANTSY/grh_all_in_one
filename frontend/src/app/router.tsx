import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { RoleRoute } from '@/routes/RoleRoute';

import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { PersonnelsListPage } from '@/pages/PersonnelsListPage';
import { PersonnelDetailPage } from '@/pages/PersonnelDetailPage';
import { PersonnelEditPage } from '@/pages/PersonnelEditPage';
import { PersonnelCreatePage } from '@/pages/PersonnelCreatePage';
import { RecherchePage } from '@/pages/RecherchePage';
import { ImportsListPage } from '@/pages/ImportsListPage';
import { UtilisateursPage } from '@/pages/UtilisateursPage';
import { AuditPage } from '@/pages/AuditPage';
import { DemandesModificationPage } from '@/pages/DemandesModificationPage';
import { RapportsPage } from '@/pages/RapportsPage';
import { ParametresPage } from '@/pages/ParametresPage';
import { BasesPage, UnitesPage, GradesPage, SpecialitesPage } from '@/pages/ReferentielsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ForbiddenPage } from '@/pages/ForbiddenPage';
import type { TypeCompte } from '@/types/auth';

const RH_ROLES: TypeCompte[] = ['ADMIN_SYSTEME', 'RH_ETAT_MAJOR', 'RH_BASE', 'CHEF_COMMANDEMENT'];
const RH_WRITE_ROLES: TypeCompte[] = ['ADMIN_SYSTEME', 'RH_ETAT_MAJOR', 'RH_BASE'];
const ADMIN_ROLES: TypeCompte[] = ['ADMIN_SYSTEME'];
const AUDIT_ROLES: TypeCompte[] = ['ADMIN_SYSTEME', 'RH_ETAT_MAJOR'];

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/403', element: <ForbiddenPage /> },

  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },

          {
            element: <RoleRoute allowed={RH_ROLES} />,
            children: [
              { path: '/personnels', element: <PersonnelsListPage /> },
              { path: '/personnels/:id', element: <PersonnelDetailPage /> },
              { path: '/recherche', element: <RecherchePage /> },
              { path: '/demandes-modification', element: <DemandesModificationPage /> },
              { path: '/rapports', element: <RapportsPage /> },
            ],
          },

          {
            element: <RoleRoute allowed={RH_WRITE_ROLES} />,
            children: [
              { path: '/personnels/nouveau', element: <PersonnelCreatePage /> },
              { path: '/personnels/:id/modifier', element: <PersonnelEditPage /> },
              { path: '/imports', element: <ImportsListPage /> },
            ],
          },

          {
            element: <RoleRoute allowed={ADMIN_ROLES} />,
            children: [
              { path: '/utilisateurs', element: <UtilisateursPage /> },
              { path: '/referentiels/bases', element: <BasesPage /> },
              { path: '/referentiels/unites', element: <UnitesPage /> },
              { path: '/referentiels/grades', element: <GradesPage /> },
              { path: '/referentiels/specialites', element: <SpecialitesPage /> },
              { path: '/parametres', element: <ParametresPage /> },
            ],
          },

          {
            element: <RoleRoute allowed={AUDIT_ROLES} />,
            children: [{ path: '/audit', element: <AuditPage /> }],
          },
        ],
      },
    ],
  },

  { path: '*', element: <NotFoundPage /> },
]);