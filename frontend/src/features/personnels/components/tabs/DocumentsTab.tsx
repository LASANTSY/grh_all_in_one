import { useRef, useState } from 'react';
import { Upload, Download, Trash2, FileText, Loader2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient } from '@/lib/axios';
import { formatDateTime, formatFileSize } from '@/lib/formatters';

interface VersionPieceJointe {
  id: string;
  numeroVersion: number;
  nomOriginal: string;
  format: string;
  tailleOctets: string;
  dateDepot: string;
  versionCourante: boolean;
}

interface PieceJointe {
  id: string;
  type: string;
  libelle: string | null;
  dateAjout: string;
  versionCourante: VersionPieceJointe | null;
  nombreVersions: number;
}

export function DocumentsTab({ personnelId }: { personnelId: string }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadType, setUploadType] = useState('CV');
  const [uploadLibelle, setUploadLibelle] = useState('');

  const query = useQuery({
    queryKey: ['personnels', personnelId, 'documents'],
    queryFn: async () => {
      const { data } = await apiClient.get<PieceJointe[]>(`/personnels/${personnelId}/documents`);
      return data;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', uploadType);
      if (uploadLibelle) formData.append('libelle', uploadLibelle);
      await apiClient.post(`/personnels/${personnelId}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      setUploadLibelle('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      void queryClient.invalidateQueries({ queryKey: ['personnels', personnelId, 'documents'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await apiClient.delete(`/personnels/${personnelId}/documents/${id}`); },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['personnels', personnelId, 'documents'] }),
  });

  const handleDownload = async (pieceId: string, nom: string): Promise<void> => {
    const response = await apiClient.get(`/personnels/${personnelId}/documents/${pieceId}/download`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', nom);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="text-base">Ajouter un document</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="type">Type de document</Label>
              <Input id="type" value={uploadType} onChange={(e) => setUploadType(e.target.value)} placeholder="CV, CIN, note..." />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="libelle">Libelle (optionnel)</Label>
              <Input id="libelle" value={uploadLibelle} onChange={(e) => setUploadLibelle(e.target.value)} placeholder="CV 2024" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="file">Fichier (PDF, JPG, PNG, DOC, DOCX)</Label>
              <Input id="file" type="file" ref={fileInputRef}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,application/pdf,image/jpeg,image/png,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadMutation.mutate(f); }}
                disabled={uploadMutation.isPending} />
            </div>
          </div>
          {uploadMutation.isPending && (
            <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Televersement en cours...
            </p>
          )}
          {uploadMutation.isError && (
            <p className="mt-3 text-sm text-destructive">Erreur lors du televersement. Verifiez le type et la taille du fichier.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Documents ({query.data?.length ?? 0})</CardTitle></CardHeader>
        <CardContent className="p-0">
          {query.isLoading ? <div className="p-4"><Skeleton className="h-32 w-full" /></div> :
           !query.data || query.data.length === 0 ? (
            <div className="p-4"><EmptyState icon={<FileText className="h-10 w-10" />} title="Aucun document" description="Aucune piece jointe enregistree." /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Libelle</TableHead>
                  <TableHead>Version courante</TableHead>
                  <TableHead>Taille</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.data.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.type}</TableCell>
                    <TableCell className="text-xs">{p.libelle ?? '-'}</TableCell>
                    <TableCell className="text-xs">
                      {p.versionCourante ? `v${p.versionCourante.numeroVersion} — ${p.versionCourante.nomOriginal}` : '-'}
                    </TableCell>
                    <TableCell className="text-xs">{p.versionCourante ? formatFileSize(p.versionCourante.tailleOctets) : '-'}</TableCell>
                    <TableCell className="text-xs">{formatDateTime(p.dateAjout)}</TableCell>
                    <TableCell className="text-right">
                      {p.versionCourante && (
                        <Button variant="ghost" size="icon" onClick={() => void handleDownload(p.id, p.versionCourante!.nomOriginal)}>
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(p.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
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