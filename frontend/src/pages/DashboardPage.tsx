import { PageHeader } from '@/components/shared/PageHeader';
import { EffectifTotalCards } from '@/features/dashboard/components/EffectifTotalCard';
import { RepartitionBaseChart } from '@/features/dashboard/components/RepartitionBaseChart';
import { RepartitionGradeChart } from '@/features/dashboard/components/RepartitionGradeChart';
import { DepartsRetraiteChart } from '@/features/dashboard/components/DepartsRetraiteChart';
import { FinDeLienTable } from '@/features/dashboard/components/FinDeLienTable';
import { usePermissions } from '@/hooks/usePermissions';

export function DashboardPage() {
  const perms = usePermissions();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tableau de bord"
        description="Vue d ensemble de l effectif et des indicateurs cles"
      />

      {!perms.canViewDashboard ? (
        <div className="rounded-lg border border-dashed border-border bg-card/50 p-12 text-center text-sm text-muted-foreground">
          Vous n avez pas acces au tableau de bord.
        </div>
      ) : (
        <>
          <EffectifTotalCards />

          <div className="grid gap-4 lg:grid-cols-2">
            <RepartitionBaseChart />
            <RepartitionGradeChart />
          </div>

          <DepartsRetraiteChart />

          <FinDeLienTable />
        </>
      )}
    </div>
  );
}