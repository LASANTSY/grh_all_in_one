import { Link } from 'react-router-dom';
import { Plus, Users } from 'lucide-react';

import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { TableSkeleton } from '@/components/shared/LoadingSkeleton';
import { Pagination } from '@/components/shared/Pagination';
import { Button } from '@/components/ui/button';

import { PersonnelFilters } from '@/features/personnels/components/PersonnelFilters';
import { PersonnelTable } from '@/features/personnels/components/PersonnelTable';
import { usePersonnels } from '@/features/personnels/hooks/usePersonnels';
import { usePersonnelFilters } from '@/hooks/usePersonnelFilters';
import { usePermissions } from '@/hooks/usePermissions';
import { useDebounce } from '@/hooks/useDebounce';
import { useEffect, useState } from 'react';

export function PersonnelsListPage() {
  const perms = usePermissions();
  const filterApi = usePersonnelFilters();
  const { filters, apiParams, setFilter } = filterApi;

  // Debounce la recherche textuelle pour eviter une requete par frappe
  const [searchInput, setSearchInput] = useState(filters.q);
  const debouncedSearch = useDebounce(searchInput, 300);

  useEffect(() => {
    if (debouncedSearch !== filters.q) {
      setFilter('q', debouncedSearch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  useEffect(() => {
    setSearchInput(filters.q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const query = usePersonnels(apiParams);
  const data = query.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Personnels"
        description={
          data
            ? `${data.total} fiche${data.total > 1 ? 's' : ''} trouvee${data.total > 1 ? 's' : ''}`
            : 'Chargement...'
        }
        actions={
          perms.canCreatePersonnel ? (
            <Button asChild>
              <Link to="/personnels/nouveau">
                <Plus className="mr-2 h-4 w-4" />
                Nouveau personnel
              </Link>
            </Button>
          ) : undefined
        }
      />

      <PersonnelFilters
        filterApi={{
          ...filterApi,
          filters: { ...filters, q: searchInput },
          setFilter: (key, value) => {
            if (key === 'q') {
              setSearchInput(String(value));
            } else {
              setFilter(key, value);
            }
          },
        }}
      />

      {query.isLoading && <TableSkeleton rows={8} columns={6} />}

      {query.isError && (
        <ErrorState
          message="Impossible de charger la liste du personnel. Verifiez votre connexion ou reessayez."
          onRetry={() => void query.refetch()}
        />
      )}

      {data && data.data.length === 0 && (
        <EmptyState
          icon={<Users className="h-10 w-10" />}
          title="Aucun personnel trouve"
          description={
            filterApi.hasActiveFilters
              ? 'Aucun resultat ne correspond aux filtres appliques. Essayez de les elargir.'
              : "Aucun personnel n'est enregistre pour le moment."
          }
          action={
            perms.canCreatePersonnel && !filterApi.hasActiveFilters ? (
              <Button asChild>
                <Link to="/personnels/nouveau">
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter le premier personnel
                </Link>
              </Button>
            ) : undefined
          }
        />
      )}

      {data && data.data.length > 0 && (
        <div className="rounded-lg border border-border bg-card">
          <PersonnelTable
            data={data.data}
            sortBy={filters.sortBy}
            sortOrder={filters.sortOrder}
            onSortChange={(field, order) => {
              setFilter('sortBy', field);
              setFilter('sortOrder', order);
            }}
          />
          <div className="border-t border-border px-4">
            <Pagination
              page={data.page}
              limit={data.limit}
              total={data.total}
              totalPages={data.totalPages}
              onPageChange={(p) => setFilter('page', p)}
              onLimitChange={(l) => setFilter('limit', l)}
            />
          </div>
        </div>
      )}
    </div>
  );
}