import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/card';
import { PersonnelFilters } from '@/features/personnels/components/PersonnelFilters';
import { PersonnelTable } from '@/features/personnels/components/PersonnelTable';
import { Pagination } from '@/components/shared/Pagination';
import { usePersonnels } from '@/features/personnels/hooks/usePersonnels';
import { usePersonnelFilters } from '@/hooks/usePersonnelFilters';
import { TableSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Search } from 'lucide-react';

export function RecherchePage() {
  const filterApi = usePersonnelFilters();
  const query = usePersonnels(filterApi.apiParams);
  const data = query.data;

  return (
    <div className="space-y-6">
      <PageHeader title="Recherche avancee" description="Recherche multicritere avec tolerance aux fautes" />
      <PersonnelFilters filterApi={filterApi} />
      {query.isLoading && <TableSkeleton rows={6} columns={6} />}
      {data && data.data.length === 0 && (
        <EmptyState icon={<Search className="h-10 w-10" />} title="Aucun resultat" description="Essayez d elargir vos criteres." />
      )}
      {data && data.data.length > 0 && (
        <Card>
          <PersonnelTable
            data={data.data}
            sortBy={filterApi.filters.sortBy}
            sortOrder={filterApi.filters.sortOrder}
            onSortChange={(f, o) => { filterApi.setFilter('sortBy', f); filterApi.setFilter('sortOrder', o); }}
          />
          <div className="border-t px-4">
            <Pagination page={data.page} limit={data.limit} total={data.total} totalPages={data.totalPages}
              onPageChange={(p) => filterApi.setFilter('page', p)}
              onLimitChange={(l) => filterApi.setFilter('limit', l)} />
          </div>
        </Card>
      )}
    </div>
  );
}