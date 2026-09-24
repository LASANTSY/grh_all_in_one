import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Fusionne des classes CSS conditionnelles en gerant les conflits Tailwind.
 *
 * Exemple :
 *   cn('px-2 py-1', condition && 'bg-primary', 'px-4')
 *   => 'py-1 bg-primary px-4'   (px-4 ecrase px-2)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}