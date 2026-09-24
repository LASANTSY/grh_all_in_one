import { z } from 'zod';

const optionalString = (max: number) =>
  z
    .string()
    .max(max, `Maximum ${max} caracteres.`)
    .optional()
    .or(z.literal(''));

const optionalDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format attendu : AAAA-MM-JJ.')
  .optional()
  .or(z.literal(''));

export const personnelSchema = z.object({
  // Obligatoires
  matriculeRecrutement: z
    .string()
    .min(1, 'Le matricule de recrutement est obligatoire.')
    .max(50),
  nom: z.string().min(2, 'Le nom est obligatoire.').max(100),
  prenoms: z.string().min(2, 'Les prenoms sont obligatoires.').max(150),
  dateNaissance: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format attendu : AAAA-MM-JJ.'),
  lieuNaissance: z.string().min(1, 'Le lieu de naissance est obligatoire.').max(150),
  gradeId: z.string().uuid('Le grade est obligatoire.'),
  uniteId: z.string().uuid("L'unite est obligatoire."),

  // Optionnels
  matriculeFinancier: optionalString(50),
  photoUrl: optionalString(500),
  prefecture: optionalString(150),
  sousPrefecture: optionalString(150),
  province: optionalString(150),
  email: z.string().email('Adresse e-mail invalide.').optional().or(z.literal('')),
  telephoneMobile: optionalString(30),
  adresseActuelle: optionalString(2000),
  adresseRepli: optionalString(2000),
  contactUrgence: optionalString(2000),
  numeroCIN: optionalString(50),
  dateDelivranceCIN: optionalDate,
  lieuDelivranceCIN: optionalString(150),
  dateDuplicataCIN: optionalDate,
  numeroPasseport: optionalString(50),
  dateDelivrancePasseport: optionalDate,
  religion: optionalString(50),
  groupeSanguin: optionalString(10),
  taille: z.coerce.number().int().min(100).max(250).optional().or(z.literal('')),
  statutFamilial: optionalString(50),
  numeroAutorisationMariage: optionalString(50),
  dateAutorisationMariage: optionalDate,
  nomConjoint: optionalString(150),
  dateNaissanceConjoint: optionalDate,
  lieuNaissanceConjoint: optionalString(150),
  fonctionConjoint: optionalString(150),
  nomPere: optionalString(150),
  nomMere: optionalString(150),
  sportsPratiques: optionalString(2000),
  corps: optionalString(100),
  lieuEmploi: optionalString(150),
  fonctionActuelle: optionalString(150),
  numeroCIM: optionalString(50),
  dateDelivranceCIM: optionalDate,
  situationMilitaire: optionalString(100),
  origineRecrutement: optionalString(150),
  dateEntreeService: optionalDate,
  niveauInstruction: optionalString(150),
  connaissancesInformatiques: optionalString(2000),
  specialiteId: z.string().uuid().optional().or(z.literal('')),
});

export type PersonnelFormData = z.infer<typeof personnelSchema>;