import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useRepartitionBase } from '../hooks/useRepartitions';
import { EmptyState } from '@/components/shared/EmptyState';
import { Building2 } from 'lucide-react';

const COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
];

export function RepartitionBaseChart() {
  const { data, isLoading, isError } = useRepartitionBase();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Repartition par base</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-72 w-full" />
        ) : isError || !data || data.length === 0 ? (
          <EmptyState
            icon={<Building2 className="h-8 w-8" />}
            title="Aucune donnee"
            description="Aucun personnel enregistre pour le moment."
          />
        ) : (
          <ResponsiveContainer width="100%" height={288}>
            <PieChart>
              <Pie
                data={data}
                dataKey="total"
                nameKey="libelle"
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={55}
                paddingAngle={2}
                label={(entry) => `${entry.libelle} (${entry.total})`}
                labelLine={false}
              >
                {data.map((_entry, index) => (
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
                formatter={(value: number, _name, entry) => [
                  `${value} (${(entry.payload as { pourcentage: number }).pourcentage}%)`,
                  'Effectif',
                ]}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}