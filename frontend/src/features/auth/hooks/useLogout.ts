import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/auth-context';

export function useLogout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => logout(),
    onSettled: () => {
      navigate('/login', { replace: true });
    },
  });
}