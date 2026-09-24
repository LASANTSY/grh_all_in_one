import { useEffect, useState } from 'react';

/**
 * Retourne une version debouncee d'une valeur.
 * Utile pour la recherche : on n'envoie la requete qu'apres un delai
 * d'inactivite (par defaut 300ms).
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}