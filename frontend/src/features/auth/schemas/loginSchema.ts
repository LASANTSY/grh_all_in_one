import { z } from 'zod';

export const loginSchema = z.object({
  identifiant: z
    .string()
    .min(3, "L'identifiant doit contenir au moins 3 caracteres.")
    .max(50, "L'identifiant ne peut pas depasser 50 caracteres."),
  motDePasse: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caracteres.')
    .max(128, 'Le mot de passe ne peut pas depasser 128 caracteres.'),
});

export type LoginFormData = z.infer<typeof loginSchema>;