import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';

export function ParametresPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Parametres" description="Configuration de l application" />
      <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">
        Parametres a implementer dans une version ulterieure.
      </CardContent></Card>
    </div>
  );
}