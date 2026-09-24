import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Upload, CheckCircle2, AlertTriangle, Loader2, FileSpreadsheet } from 'lucide-react';

import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { apiClient } from '@/lib/axios';

interface PreviewLigne {
  numeroLigne: number;
  valeurs: Record<string, string | null>;
  valide: boolean;
  erreurs: Array<{ numeroLigne: number; champ: string; message: string }>;
  personnelExistantId: string | null;
}

interface PreviewResponse {
  previewId: string;
  nomFichier: string;
  nombreLignes: number;
  lignesValides: number;
  lignesErreur: number;
  lignesDoublons: number;
  lignes: PreviewLigne[];
  colonnes: string[];
}

type Step = 'upload' | 'preview' | 'executing' | 'done';

export function ImportCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<Step>('upload');
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [resultat, setResultat] = useState<{ lignesCreees: number; lignesMisesAJour: number; lignesErreur: number } | null>(null);

  const previewMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await apiClient.post<PreviewResponse>('/imports/preview', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: (data) => {
      setPreview(data);
      setStep('preview');
    },
  });

  const executeMutation = useMutation({
    mutationFn: async () => {
      if (!preview) throw new Error('Aucune preview');
      const decisions = preview.lignes
        .filter((l) => l.valide && l.personnelExistantId)
        .map((l) => ({ numeroLigne: l.numeroLigne, action: 'MISE_A_JOUR' }));
      const { data } = await apiClient.post('/imports/execute', {
        previewId: preview.previewId,
        decisions,
      });
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['personnels'] });
      void queryClient.invalidateQueries({ queryKey: ['imports'] });
      setStep('done');
      setResultat({ lignesCreees: preview?.lignesValides ?? 0, lignesMisesAJour: 0, lignesErreur: preview?.lignesErreur ?? 0 });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) previewMutation.mutate(file);
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/imports')}>
        <ArrowLeft className="mr-1 h-4 w-4" /> Retour
      </Button>

      <PageHeader
        title="Nouvel import Excel"
        description="Import en masse de personnel depuis un fichier .xlsx"
      />

      {/* Etapes visuelles */}
      <div className="flex items-center gap-2 text-xs">
        <StepBadge numero={1} label="Selection" actif={step === 'upload'} done={step !== 'upload'} />
        <div className="h-px flex-1 bg-border" />
        <StepBadge numero={2} label="Verification" actif={step === 'preview'} done={step === 'executing' || step === 'done'} />
        <div className="h-px flex-1 bg-border" />
        <StepBadge numero={3} label="Execution" actif={step === 'executing'} done={step === 'done'} />
        <div className="h-px flex-1 bg-border" />
        <StepBadge numero={4} label="Resultat" actif={step === 'done'} done={false} />
      </div>

      {step === 'upload' && (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-12">
            <FileSpreadsheet className="h-12 w-12 text-muted-foreground" />
            <div className="text-center">
              <p className="font-medium">Selectionnez un fichier Excel (.xlsx)</p>
              <p className="text-sm text-muted-foreground">Utilisez le modele officiel telechargeable depuis la page Imports.</p>
            </div>
            <label htmlFor="file-upload" className="cursor-pointer">
              <input
                id="file-upload"
                type="file"
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                className="hidden"
                onChange={handleFileChange}
                disabled={previewMutation.isPending}
              />
              <span className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                {previewMutation.isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Analyse en cours...</>
                ) : (
                  <><Upload className="h-4 w-4" /> Choisir un fichier</>
                )}
              </span>
            </label>
            {previewMutation.isError && (
              <p className="text-sm text-destructive">Erreur lors de l analyse du fichier.</p>
            )}
          </CardContent>
        </Card>
      )}

      {step === 'preview' && preview && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-4">
            <KPI label="Lignes detectees" value={preview.nombreLignes} />
            <KPI label="Lignes valides" value={preview.lignesValides} tone="success" />
            <KPI label="Lignes en erreur" value={preview.lignesErreur} tone="danger" />
            <KPI label="Doublons" value={preview.lignesDoublons} tone="warning" />
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base">Previsualisation</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Ligne</TableHead>
                    <TableHead className="w-24">Statut</TableHead>
                    <TableHead>Matricule</TableHead>
                    <TableHead>Nom et prenoms</TableHead>
                    <TableHead>Message</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.lignes.map((l) => (
                    <TableRow key={l.numeroLigne}>
                      <TableCell className="text-xs font-mono">{l.numeroLigne}</TableCell>
                      <TableCell>
                        {l.valide ? (
                          <StatusBadge variant="success">Valide</StatusBadge>
                        ) : (
                          <StatusBadge variant="danger">Erreur</StatusBadge>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{l.valeurs.matriculeRecrutement ?? '-'}</TableCell>
                      <TableCell className="text-xs">
                        {l.valeurs.nom ? `${l.valeurs.nom} ${l.valeurs.prenoms ?? ''}` : '-'}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {l.erreurs.length > 0 ? l.erreurs.map((e) => e.message).join(' ; ') : l.personnelExistantId ? 'Doublon detecte — sera mis a jour' : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => { setPreview(null); setStep('upload'); }}>
              Choisir un autre fichier
            </Button>
            <Button onClick={() => executeMutation.mutate()} disabled={executeMutation.isPending || preview.lignesValides === 0}>
              {executeMutation.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Import en cours...</>
              ) : (
                <>Lancer l import ({preview.lignesValides} lignes)</>
              )}
            </Button>
          </div>
        </div>
      )}

      {step === 'done' && resultat && (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-12 text-center">
            <CheckCircle2 className="h-16 w-16 text-[var(--success)]" />
            <h3 className="text-lg font-semibold">Import termine</h3>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div><span className="text-muted-foreground">Creees :</span> <strong>{resultat.lignesCreees}</strong></div>
              <div><span className="text-muted-foreground">Mises a jour :</span> <strong>{resultat.lignesMisesAJour}</strong></div>
              <div><span className="text-muted-foreground">Erreurs :</span> <strong className="text-destructive">{resultat.lignesErreur}</strong></div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate('/imports')}>Voir l historique</Button>
              <Button onClick={() => navigate('/personnels')}>Voir le personnel</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StepBadge({ numero, label, actif, done }: { numero: number; label: string; actif: boolean; done: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${done ? 'bg-[var(--success)] text-white' : actif ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
        {done ? <CheckCircle2 className="h-3 w-3" /> : numero}
      </div>
      <span className={actif ? 'font-medium text-foreground' : 'text-muted-foreground'}>{label}</span>
    </div>
  );
}

function KPI({ label, value, tone = 'default' }: { label: string; value: number; tone?: 'default' | 'success' | 'danger' | 'warning' }) {
  const tones = {
    default: 'text-foreground',
    success: 'text-[var(--success)]',
    danger: 'text-destructive',
    warning: 'text-[var(--warning-foreground)]',
  };
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className={`text-2xl font-semibold ${tones[tone]}`}>{value}</p>
      </CardContent>
    </Card>
  );
}