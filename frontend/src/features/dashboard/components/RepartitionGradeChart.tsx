import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useRepartitionGrade } from '../hooks/useRepartitions';
import { EmptyState } from '@/components/shared/EmptyState';
import { Medal } from 'lucide-react';

const COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
];

const LABELS: Record<string, string> = {
  OFFICIER_GENERAL: 'Officiers generaux',
  OFFICIER_MARINE: 'Officiers de marine',
  OFFICIER_MARINIER: 'Officiers mariniers',
  QMO: 'QMO',
};

export function RepartitionGradeChart() {
  const { data, isLoading, isError } = useRepartitionGrade();

  const displayData = (data ?? []).map((item) => ({
    ...item,
    libelle: LABELS[item.id] ?? item.libelle,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Repartition par categorie de grade</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-72 w-full" />
        ) : isError || displayData.length === 0 ? (
          <EmptyState
            icon={<Medal className="h-8 w-8" />}
            title="Aucune donnee"
            description="Aucun personnel enregistre pour le moment."
          />
        ) : (
          <ResponsiveContainer width="100%" height={288}>
            <PieChart>
              <Pie
                data={displayData}
                dataKey="total"
                nameKey="libelle"
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={55}
                paddingAngle={2}
                label={false}
                labelLine={false}
              >
                {displayData.map((_entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 12,
                }}
                formatter={(value, _name, entry) => {
                  const payload = entry?.payload as { pourcentage?: number } | undefined;
                  return [
                    `${Number(value)} (${payload?.pourcentage ?? 0}%)`,
                    'Effectif',
                  ];
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}