import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { Eye, EyeOff, Loader2, LogIn } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { loginSchema, type LoginFormData } from '../schemas/loginSchema';
import { useLogin } from '../hooks/useLogin';
import type { ApiError } from '@/lib/axios';

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifiant: '',
      motDePasse: '',
    },
  });

  const onSubmit = (data: LoginFormData): void => {
    loginMutation.mutate(data);
  };

  const apiError =
    loginMutation.error instanceof AxiosError
      ? (loginMutation.error.response?.data as ApiError | undefined)
      : undefined;

  const errorMessage = apiError?.message ?? (loginMutation.error ? 'Erreur de connexion.' : null);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="identifiant">Identifiant</Label>
        <Input
          id="identifiant"
          type="text"
          autoComplete="username"
          autoFocus
          placeholder="ex. admin"
          aria-invalid={Boolean(errors.identifiant) || Boolean(apiError)}
          {...register('identifiant')}
        />
        {errors.identifiant && (
          <p className="text-xs text-destructive">{errors.identifiant.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="motDePasse">Mot de passe</Label>
        <div className="relative">
          <Input
            id="motDePasse"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            aria-invalid={Boolean(errors.motDePasse) || Boolean(apiError)}
            {...register('motDePasse')}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        {errors.motDePasse && (
          <p className="text-xs text-destructive">{errors.motDePasse.message}</p>
        )}
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          {errorMessage}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting || loginMutation.isPending}>
        {loginMutation.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connexion...
          </>
        ) : (
          <>
            <LogIn className="mr-2 h-4 w-4" />
            Se connecter
          </>
        )}
      </Button>
    </form>
  );
}