import { Users, AlertTriangle, UserCheck } from 'lucide-react';
import { KpiCard } from './KpiCard';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { Skeleton } from '@/components/ui/skeleton';

export function EffectifTotalCards() {
  const { data, isLoading, isError } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-lg" />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return null;
  }

  const officiersGeneraux = data.parCategorie.find(
    (c) => c.categorie === 'OFFICIER_GENERAL',
  )?.total ?? 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        label="Effectif total"
        value={data.effectifTotal}
        icon={<Users className="h-8 w-8" />}
        tone="primary"
      />
      <KpiCard
        label="Officiers generaux"
        value={officiersGeneraux}
        icon={<UserCheck className="h-8 w-8" />}
      />
      <KpiCard
        label="Fin de lien"
        value={data.personnelFinDeLien}
        hint="Retraite dans moins de 2 ans"
        icon={<AlertTriangle className="h-8 w-8" />}
        tone="warning"
      />
      <KpiCard
        label="Retraite depassee"
        value={data.personnelRetraite}
        hint="A traiter en priorite"
        icon={<AlertTriangle className="h-8 w-8" />}
        tone="danger"
      />
    </div>
  );
}