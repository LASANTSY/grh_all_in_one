import { useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { personnelSchema, type PersonnelFormData } from '@/features/personnels/schemas/personnelSchema';
import { useBases, useGrades, useSpecialites, useUnites } from '@/features/referentiels/hooks/useReferentiels';
import { apiClient } from '@/lib/axios';
import type { ApiError } from '@/lib/axios';
import type { PersonnelListItem } from '@/types/personnel';
import { useState } from 'react';

interface FormFieldProps {
  label: string;
  register: ReturnType<typeof useForm<PersonnelFormData>>['register'];
  name: keyof PersonnelFormData;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
}

function FormField({ label, register, name, type = 'text', placeholder, required, error }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={String(name)}>
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      <Input
        id={String(name)}
        type={type}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        {...register(name)}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function PersonnelCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('general');

  const basesQuery = useBases();
  const gradesQuery = useGrades();
  const specialitesQuery = useSpecialites();

  const methods = useForm<PersonnelFormData>({
    resolver: zodResolver(personnelSchema),
    defaultValues: {
      matriculeRecrutement: '',
      nom: '',
      prenoms: '',
      dateNaissance: '',
      lieuNaissance: '',
      gradeId: '',
      uniteId: '',
    },
  });

  const { register, handleSubmit, watch, formState: { errors } } = methods;
  const selectedBaseId = watch('uniteId');

  // Charger les unites filtrees par base
  const unitesQuery = useUnites();

  const mutation = useMutation({
    mutationFn: async (data: PersonnelFormData) => {
      const payload = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== '' && v !== undefined && v !== null),
      );
      const { data: result } = await apiClient.post<PersonnelListItem>('/personnels', payload);
      return result;
    },
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: ['personnels'] });
      navigate(`/personnels/${result.id}`);
    },
  });

  const apiError =
    mutation.error instanceof AxiosError
      ? (mutation.error.response?.data as ApiError | undefined)
      : undefined;

  const onSubmit = (data: PersonnelFormData): void => {
    mutation.mutate(data);
  };

  return (
    <FormProvider {...methods}>
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/personnels')}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Retour
        </Button>

        <PageHeader
          title="Nouveau personnel"
          description="Saisie d une nouvelle fiche individuelle"
        />

        {apiError && (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {apiError.message}
            {apiError.details && Array.isArray(apiError.details) && (
              <ul className="mt-2 list-disc pl-5 text-xs">
                {(apiError.details as Array<{ champ: string; valeur: string }>).map((d, i) => (
                  <li key={i}>{d.champ} : {d.valeur}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="flex-wrap">
              <TabsTrigger value="general">Informations generales</TabsTrigger>
              <TabsTrigger value="militaire">Renseignements militaires</TabsTrigger>
              <TabsTrigger value="famille">Situation familiale</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="mt-4">
              <Card>
                <CardContent className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
                  <FormField label="Matricule de recrutement" register={register} name="matriculeRecrutement" required error={errors.matriculeRecrutement?.message} />
                  <FormField label="Matricule financier" register={register} name="matriculeFinancier" error={errors.matriculeFinancier?.message} />
                  <FormField label="Nom" register={register} name="nom" required error={errors.nom?.message} />
                  <FormField label="Prenoms" register={register} name="prenoms" required error={errors.prenoms?.message} />
                  <FormField label="Date de naissance" register={register} name="dateNaissance" type="date" required error={errors.dateNaissance?.message} />
                  <FormField label="Lieu de naissance" register={register} name="lieuNaissance" required error={errors.lieuNaissance?.message} />
                  <FormField label="Prefecture" register={register} name="prefecture" error={errors.prefecture?.message} />
                  <FormField label="Sous-prefecture" register={register} name="sousPrefecture" error={errors.sousPrefecture?.message} />
                  <FormField label="Province" register={register} name="province" error={errors.province?.message} />
                  <FormField label="Numero CIN" register={register} name="numeroCIN" error={errors.numeroCIN?.message} />
                  <FormField label="Religion" register={register} name="religion" error={errors.religion?.message} />
                  <FormField label="Groupe sanguin" register={register} name="groupeSanguin" error={errors.groupeSanguin?.message} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="militaire" className="mt-4">
              <Card>
                <CardContent className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="gradeId">Grade <span className="text-destructive">*</span></Label>
                    <select id="gradeId" {...register('gradeId')} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                      <option value="">-- Selectionner --</option>
                      {(gradesQuery.data ?? []).map((g) => (
                        <option key={g.id} value={g.id}>{g.libelle}</option>
                      ))}
                    </select>
                    {errors.gradeId && <p className="text-xs text-destructive">{errors.gradeId.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="uniteId">Unite <span className="text-destructive">*</span></Label>
                    <select id="uniteId" {...register('uniteId')} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                      <option value="">-- Selectionner --</option>
                      {(unitesQuery.data ?? []).map((u) => (
                        <option key={u.id} value={u.id}>{u.nom} ({u.code})</option>
                      ))}
                    </select>
                    {errors.uniteId && <p className="text-xs text-destructive">{errors.uniteId.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="specialiteId">Specialite</Label>
                    <select id="specialiteId" {...register('specialiteId')} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                      <option value="">-- Aucune --</option>
                      {(specialitesQuery.data ?? []).map((s) => (
                        <option key={s.id} value={s.id}>{s.libelle}</option>
                      ))}
                    </select>
                  </div>

                  <FormField label="Corps" register={register} name="corps" error={errors.corps?.message} />
                  <FormField label="Lieu d emploi" register={register} name="lieuEmploi" error={errors.lieuEmploi?.message} />
                  <FormField label="Fonction actuelle" register={register} name="fonctionActuelle" error={errors.fonctionActuelle?.message} />
                  <FormField label="Situation militaire" register={register} name="situationMilitaire" error={errors.situationMilitaire?.message} />
                  <FormField label="Origine de recrutement" register={register} name="origineRecrutement" error={errors.origineRecrutement?.message} />
                  <FormField label="Date d entree en service" register={register} name="dateEntreeService" type="date" error={errors.dateEntreeService?.message} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="famille" className="mt-4">
              <Card>
                <CardContent className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
                  <FormField label="Statut familial" register={register} name="statutFamilial" error={errors.statutFamilial?.message} />
                  <FormField label="Nom du conjoint" register={register} name="nomConjoint" error={errors.nomConjoint?.message} />
                  <FormField label="Date de naissance du conjoint" register={register} name="dateNaissanceConjoint" type="date" error={errors.dateNaissanceConjoint?.message} />
                  <FormField label="Lieu de naissance du conjoint" register={register} name="lieuNaissanceConjoint" error={errors.lieuNaissanceConjoint?.message} />
                  <FormField label="Fonction du conjoint" register={register} name="fonctionConjoint" error={errors.fonctionConjoint?.message} />
                  <FormField label="Nom du pere" register={register} name="nomPere" error={errors.nomPere?.message} />
                  <FormField label="Nom de la mere" register={register} name="nomMere" error={errors.nomMere?.message} />
                  <FormField label="Sports pratiques" register={register} name="sportsPratiques" error={errors.sportsPratiques?.message} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact" className="mt-4">
              <Card>
                <CardContent className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
                  <FormField label="Email" register={register} name="email" type="email" error={errors.email?.message} />
                  <FormField label="Telephone mobile" register={register} name="telephoneMobile" error={errors.telephoneMobile?.message} />
                  <FormField label="Adresse actuelle" register={register} name="adresseActuelle" error={errors.adresseActuelle?.message} />
                  <FormField label="Adresse de repli" register={register} name="adresseRepli" error={errors.adresseRepli?.message} />
                  <FormField label="Contact d urgence" register={register} name="contactUrgence" error={errors.contactUrgence?.message} />
                  <FormField label="Niveau d instruction" register={register} name="niveauInstruction" error={errors.niveauInstruction?.message} />
                  <FormField label="Connaissances informatiques" register={register} name="connaissancesInformatiques" error={errors.connaissancesInformatiques?.message} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate('/personnels')}>
              Annuler
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enregistrement...</>
              ) : (
                <><Save className="mr-2 h-4 w-4" /> Enregistrer</>
              )}
            </Button>
          </div>
        </form>
      </div>
    </FormProvider>
  );
}