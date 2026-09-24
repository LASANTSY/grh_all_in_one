import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUp, ArrowUpDown, Eye, Pencil } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatDate, formatInitiales } from '@/lib/formatters';
import { usePermissions } from '@/hooks/usePermissions';
import type { PersonnelListItem } from '@/types/personnel';
import type { PersonnelFiltersState } from '@/hooks/usePersonnelFilters';

interface PersonnelTableProps {
  data: PersonnelListItem[];
  sortBy: PersonnelFiltersState['sortBy'];
  sortOrder: PersonnelFiltersState['sortOrder'];
  onSortChange: (field: PersonnelFiltersState['sortBy'], order: 'ASC' | 'DESC') => void;
}

type SortableField = PersonnelFiltersState['sortBy'];

const SORTABLE: Array<{ key: SortableField; label: string; className?: string }> = [
  { key: 'nom', label: 'Nom et prenoms' },
  { key: 'matriculeRecrutement', label: 'Matricule', className: 'hidden md:table-cell' },
  { key: 'dateNaissance', label: 'Naissance', className: 'hidden lg:table-cell' },
];

export function PersonnelTable({ data, sortBy, sortOrder, onSortChange }: PersonnelTableProps) {
  const perms = usePermissions();

  const handleSort = (field: SortableField): void => {
    if (field === sortBy) {
      onSortChange(field, sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      onSortChange(field, 'ASC');
    }
  };

  const renderSortIcon = (field: SortableField) => {
    if (field !== sortBy) return <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />;
    return sortOrder === 'ASC' ? (
      <ArrowUp className="ml-1 h-3 w-3" />
    ) : (
      <ArrowDown className="ml-1 h-3 w-3" />
    );
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12"></TableHead>
          {SORTABLE.map((col) => (
            <TableHead key={col.key} className={col.className}>
              <button
                type="button"
                onClick={() => handleSort(col.key)}
                className="flex items-center text-xs font-medium uppercase tracking-wider hover:text-foreground"
              >
                {col.label}
                {renderSortIcon(col.key)}
              </button>
            </TableHead>
          ))}
          <TableHead className="hidden md:table-cell">Grade</TableHead>
          <TableHead className="hidden lg:table-cell">Unite</TableHead>
          <TableHead className="hidden xl:table-cell">Fin de lien</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((personnel) => (
          <TableRow key={personnel.id}>
            <TableCell>
              <Avatar className="h-9 w-9">
                {personnel.photoUrl && <AvatarImage src={personnel.photoUrl} alt="" />}
                <AvatarFallback className="bg-primary/10 text-xs text-primary">
                  {formatInitiales(personnel.nom, personnel.prenoms)}
                </AvatarFallback>
              </Avatar>
            </TableCell>
            <TableCell>
              <Link
                to={`/personnels/${personnel.id}`}
                className="font-medium hover:text-primary hover:underline"
              >
                {personnel.nom.toUpperCase()} {personnel.prenoms}
              </Link>
              <div className="md:hidden text-xs text-muted-foreground">
                {personnel.matriculeRecrutement}
              </div>
            </TableCell>
            <TableCell className="hidden md:table-cell font-mono text-xs">
              {personnel.matriculeRecrutement}
            </TableCell>
            <TableCell className="hidden lg:table-cell text-xs">
              {formatDate(personnel.dateNaissance)}
            </TableCell>
            <TableCell className="hidden md:table-cell text-xs">
              {personnel.grade.libelle}
            </TableCell>
            <TableCell className="hidden lg:table-cell text-xs">
              <div className="flex flex-col">
                <span>{personnel.unite.nom}</span>
                <span className="text-muted-foreground">{personnel.unite.code}</span>
              </div>
            </TableCell>
            <TableCell className="hidden xl:table-cell text-xs">
              {personnel.dateFinDeLien ? formatDate(personnel.dateFinDeLien) : '-'}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-1">
                <Button asChild variant="ghost" size="icon" aria-label="Consulter">
                  <Link to={`/personnels/${personnel.id}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
                {perms.canEditPersonnel && (
                  <Button asChild variant="ghost" size="icon" aria-label="Modifier">
                    <Link to={`/personnels/${personnel.id}/modifier`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}