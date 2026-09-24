import { z } from 'zod';

export const changePasswordSchema = z
  .object({
    motDePasseActuel: z.string().min(1, 'Le mot de passe actuel est obligatoire.'),
    nouveauMotDePasse: z
      .string()
      .min(8, 'Le nouveau mot de passe doit contenir au moins 8 caracteres.')
      .max(128, 'Le nouveau mot de passe ne peut pas depasser 128 caracteres.')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
        'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre.',
      ),
    confirmation: z.string().min(1, 'La confirmation est obligatoire.'),
  })
  .refine((data) => data.nouveauMotDePasse === data.confirmation, {
    message: 'Les mots de passe ne correspondent pas.',
    path: ['confirmation'],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;