/**
 * Formatage des donnees pour l'affichage.
 * Localisation : francais uniquement pour l'instant (i18n prevu plus tard).
 */

const LOCALE = 'fr-FR';

export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return '-';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat(LOCALE, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function formatDateLong(value: Date | string | null | undefined): string {
  if (!value) return '-';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat(LOCALE, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function formatDateTime(value: Date | string | null | undefined): string {
  if (!value) return '-';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat(LOCALE, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return '-';
  return new Intl.NumberFormat(LOCALE).format(value);
}

export function formatFileSize(bytes: number | string | null | undefined): string {
  if (bytes === null || bytes === undefined) return '-';
  const value = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes;
  if (Number.isNaN(value) || value < 0) return '-';
  if (value < 1024) return `${value} o`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} Ko`;
  if (value < 1024 * 1024 * 1024) return `${(value / 1024 / 1024).toFixed(1)} Mo`;
  return `${(value / 1024 / 1024 / 1024).toFixed(2)} Go`;
}

export function formatNomPrenoms(nom: string, prenoms: string): string {
  return `${nom.toUpperCase()} ${prenoms}`.trim();
}

export function formatInitiales(nom: string, prenoms: string): string {
  const n = nom.trim().charAt(0).toUpperCase();
  const p = prenoms.trim().charAt(0).toUpperCase();
  return `${n}${p}`;
}