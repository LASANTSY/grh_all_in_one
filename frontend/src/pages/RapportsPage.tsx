import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';

export function RapportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Rapports" description="Generation de rapports et exports PDF/Excel" />
      <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">
        Rapports a implementer dans une version ulterieure.
      </CardContent></Card>
    </div>
  );
}