import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuth } from '@/app/auth-context';
import type { LoginPayload } from '@/types/auth';

interface UseLoginOptions {
  redirectTo?: string;
}

export function useLogin(options: UseLoginOptions = {}) {
  const { login } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: (response) => {
      login(response);
      navigate(options.redirectTo ?? '/dashboard', { replace: true });
    },
  });
}