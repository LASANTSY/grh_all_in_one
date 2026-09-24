import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useBases, useGrades, useSpecialites, useUnites } from '@/features/referentiels/hooks/useReferentiels';
import type { UsePersonnelFiltersReturn } from '@/hooks/usePersonnelFilters';

const ALL_VALUE = '__all__';

interface PersonnelFiltersProps {
  filterApi: UsePersonnelFiltersReturn;
}

export function PersonnelFilters({ filterApi }: PersonnelFiltersProps) {
  const { filters, setFilter, resetFilters, hasActiveFilters } = filterApi;

  const basesQuery = useBases();
  const gradesQuery = useGrades();
  const specialitesQuery = useSpecialites();
  const unitesQuery = useUnites(filters.baseId || undefined);

  const handleSelectChange = (key: 'baseId' | 'uniteId' | 'gradeId' | 'specialiteId') => (v: string | null) => {
    setFilter(key, v === ALL_VALUE || v === null ? '' : v);
  };

  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher par nom, prenoms, matricule ou CIN..."
            value={filters.q}
            onChange={(e) => setFilter('q', e.target.value)}
            className="pl-9"
          />
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            <X className="mr-1 h-3 w-3" />
            Effacer
          </Button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Select
          value={filters.baseId || ALL_VALUE}
          onValueChange={(v) => {
            handleSelectChange('baseId')(v);
            setFilter('uniteId', '');
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Base" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>Toutes les bases</SelectItem>
            {(basesQuery.data ?? []).map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.nom}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.uniteId || ALL_VALUE}
          onValueChange={handleSelectChange('uniteId')}
        >
          <SelectTrigger>
            <SelectValue placeholder="Unite" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>Toutes les unites</SelectItem>
            {(unitesQuery.data ?? []).map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.nom}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.gradeId || ALL_VALUE}
          onValueChange={handleSelectChange('gradeId')}
        >
          <SelectTrigger>
            <SelectValue placeholder="Grade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>Tous les grades</SelectItem>
            {(gradesQuery.data ?? []).map((g) => (
              <SelectItem key={g.id} value={g.id}>
                {g.libelle}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.specialiteId || ALL_VALUE}
          onValueChange={handleSelectChange('specialiteId')}
        >
          <SelectTrigger>
            <SelectValue placeholder="Specialite" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>Toutes les specialites</SelectItem>
            {(specialitesQuery.data ?? []).map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.libelle}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.actif}
          onValueChange={(v) => setFilter('actif', (v as 'all' | 'true' | 'false') ?? 'all')}
        >
          <SelectTrigger>
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="true">Actifs</SelectItem>
            <SelectItem value="false">Inactifs</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}