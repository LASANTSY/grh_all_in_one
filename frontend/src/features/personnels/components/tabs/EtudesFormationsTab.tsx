import { useQuery } from '@tanstack/react-query';
import { GraduationCap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient } from '@/lib/axios';
import { formatDate } from '@/lib/formatters';

interface Cursus { id: string; etablissement: string; villePays: string | null; dateDebut: string | null; dateFin: string | null; diplomeObtenu: string | null; }
interface Stage { id: string; etablissement: string; lieu: string | null; natureFormation: string; dateDebut: string | null; dateFin: string | null; decisionEnvoi: string | null; diplomeCertificat: string | null; }

export function EtudesFormationsTab({ personnelId }: { personnelId: string }) {
  const cursusQuery = useQuery({
    queryKey: ['personnels', personnelId, 'cursus'],
    queryFn: async () => { const { data } = await apiClient.get<Cursus[]>(`/personnels/${personnelId}/cursus-scolaire`); return data; },
  });
  const stagesQuery = useQuery({
    queryKey: ['personnels', personnelId, 'stages'],
    queryFn: async () => { const { data } = await apiClient.get<Stage[]>(`/personnels/${personnelId}/stages-militaires`); return data; },
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="text-base">Cursus scolaire et universitaire</CardTitle></CardHeader>
        <CardContent className="p-0">
          {cursusQuery.isLoading ? <div className="p-4"><Skeleton className="h-24 w-full" /></div> :
           !cursusQuery.data || cursusQuery.data.length === 0 ? (
            <div className="p-4"><EmptyState icon={<GraduationCap className="h-10 w-10" />} title="Aucun cursus" description="Aucun cursus scolaire enregistre." /></div>
          ) : (
            <Table>
              <TableHeader><TableRow>
                <TableHead>Etablissement</TableHead><TableHead>Ville / Pays</TableHead>
                <TableHead>Periode</TableHead><TableHead>Diplome</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {cursusQuery.data.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.etablissement}</TableCell>
                    <TableCell className="text-xs">{c.villePays ?? '-'}</TableCell>
                    <TableCell className="text-xs">{c.dateDebut ? formatDate(c.dateDebut) : '?'} — {c.dateFin ? formatDate(c.dateFin) : '?'}</TableCell>
                    <TableCell className="text-xs">{c.diplomeObtenu ?? '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Stages et formations militaires</CardTitle></CardHeader>
        <CardContent className="p-0">
          {stagesQuery.isLoading ? <div className="p-4"><Skeleton className="h-24 w-full" /></div> :
           !stagesQuery.data || stagesQuery.data.length === 0 ? (
            <div className="p-4"><EmptyState title="Aucun stage" description="Aucun stage militaire enregistre." /></div>
          ) : (
            <Table>
              <TableHeader><TableRow>
                <TableHead>Etablissement</TableHead><TableHead>Nature</TableHead>
                <TableHead>Periode</TableHead><TableHead>Diplome / Certificat</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {stagesQuery.data.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.etablissement}</TableCell>
                    <TableCell className="text-xs">{s.natureFormation}</TableCell>
                    <TableCell className="text-xs">{s.dateDebut ? formatDate(s.dateDebut) : '?'} — {s.dateFin ? formatDate(s.dateFin) : '?'}</TableCell>
                    <TableCell className="text-xs">{s.diplomeCertificat ?? '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}