import { cn } from '@/lib/utils';

export type StatusVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'muted';

export type AlerteFinDeLien = 'ACTIF' | 'ALERTE_ANNUELLE' | 'ALERTE_BIENNALE' | 'RETRAITE_DEPASSEE';

interface StatusBadgeProps {
  variant?: StatusVariant;
  alerte?: AlerteFinDeLien;
  children: React.ReactNode;
  className?: string;
}

const VARIANT_CLASSES: Record<StatusVariant, string> = {
  default: 'bg-secondary text-secondary-foreground',
  success: 'bg-[color-mix(in_oklch,var(--success)_15%,transparent)] text-[var(--success)]',
  warning: 'bg-[color-mix(in_oklch,var(--warning)_20%,transparent)] text-[var(--warning-foreground)]',
  danger: 'bg-[color-mix(in_oklch,var(--destructive)_12%,transparent)] text-[var(--destructive)]',
  info: 'bg-[color-mix(in_oklch,var(--info)_12%,transparent)] text-[var(--info)]',
  muted: 'bg-muted text-muted-foreground',
};

const ALERTE_CLASSES: Record<AlerteFinDeLien, string> = {
  ACTIF: '',
  ALERTE_ANNUELLE: 'bg-[var(--alert-annuelle-bg)] text-[var(--alert-annuelle)] border border-[var(--alert-annuelle)]/40',
  ALERTE_BIENNALE: 'bg-[var(--alert-biennale-bg)] text-[var(--alert-biennale)] border border-[var(--alert-biennale)]/40',
  RETRAITE_DEPASSEE: 'bg-[var(--alert-depassee-bg)] text-[var(--alert-depassee)] border border-[var(--alert-depassee)]/30',
};

export function StatusBadge({ variant = 'default', alerte, children, className }: StatusBadgeProps) {
  const alerteClass = alerte && alerte !== 'ACTIF' ? ALERTE_CLASSES[alerte] : '';
  const variantClass = alerte && alerte !== 'ACTIF' ? '' : VARIANT_CLASSES[variant];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantClass,
        alerteClass,
        className,
      )}
    >
      {children}
    </span>
  );
}