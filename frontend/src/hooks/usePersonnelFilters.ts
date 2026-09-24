import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { PersonnelSearchParams } from '@/types/personnel';

const DEFAULTS = {
  page: 1,
  limit: 20,
  sortBy: 'nom' as const,
  sortOrder: 'ASC' as const,
};

export interface PersonnelFiltersState {
  q: string;
  baseId: string;
  uniteId: string;
  gradeId: string;
  specialiteId: string;
  actif: 'all' | 'true' | 'false';
  page: number;
  limit: number;
  sortBy: NonNullable<PersonnelSearchParams['sortBy']>;
  sortOrder: 'ASC' | 'DESC';
}

export interface UsePersonnelFiltersReturn {
  filters: PersonnelFiltersState;
  apiParams: PersonnelSearchParams;
  setFilter: <K extends keyof PersonnelFiltersState>(
    key: K,
    value: PersonnelFiltersState[K],
  ) => void;
  resetFilters: () => void;
  hasActiveFilters: boolean;
}

export function usePersonnelFilters(): UsePersonnelFiltersReturn {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo<PersonnelFiltersState>(() => {
    const page = parseInt(searchParams.get('page') ?? '', 10);
    const limit = parseInt(searchParams.get('limit') ?? '', 10);

    return {
      q: searchParams.get('q') ?? '',
      baseId: searchParams.get('baseId') ?? '',
      uniteId: searchParams.get('uniteId') ?? '',
      gradeId: searchParams.get('gradeId') ?? '',
      specialiteId: searchParams.get('specialiteId') ?? '',
      actif: (searchParams.get('actif') as PersonnelFiltersState['actif']) ?? 'all',
      page: Number.isNaN(page) ? DEFAULTS.page : page,
      limit: Number.isNaN(limit) ? DEFAULTS.limit : limit,
      sortBy:
        (searchParams.get('sortBy') as PersonnelFiltersState['sortBy']) ?? DEFAULTS.sortBy,
      sortOrder:
        (searchParams.get('sortOrder') as PersonnelFiltersState['sortOrder']) ?? DEFAULTS.sortOrder,
    };
  }, [searchParams]);

  const setFilter = useCallback(
    <K extends keyof PersonnelFiltersState>(key: K, value: PersonnelFiltersState[K]) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          const stringValue = String(value);

          if (
            stringValue === '' ||
            (key === 'page' && value === DEFAULTS.page) ||
            (key === 'limit' && value === DEFAULTS.limit) ||
            (key === 'sortBy' && value === DEFAULTS.sortBy) ||
            (key === 'sortOrder' && value === DEFAULTS.sortOrder) ||
            (key === 'actif' && value === 'all')
          ) {
            next.delete(key);
          } else {
            next.set(key, stringValue);
          }

          // Revenir a la page 1 si on change un filtre (sauf page/limit/sort)
          if (!['page', 'limit', 'sortBy', 'sortOrder'].includes(key)) {
            next.delete('page');
          }

          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const resetFilters = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  const apiParams = useMemo<PersonnelSearchParams>(() => {
    const params: PersonnelSearchParams = {
      page: filters.page,
      limit: filters.limit,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    };

    if (filters.q.trim()) params.q = filters.q.trim();
    if (filters.baseId) params.baseId = filters.baseId;
    if (filters.uniteId) params.uniteId = filters.uniteId;
    if (filters.gradeId) params.gradeId = filters.gradeId;
    if (filters.specialiteId) params.specialiteId = filters.specialiteId;
    if (filters.actif !== 'all') params.actif = filters.actif === 'true';

    return params;
  }, [filters]);

  const hasActiveFilters =
    filters.q !== '' ||
    filters.baseId !== '' ||
    filters.uniteId !== '' ||
    filters.gradeId !== '' ||
    filters.specialiteId !== '' ||
    filters.actif !== 'all';

  return { filters, apiParams, setFilter, resetFilters, hasActiveFilters };
}