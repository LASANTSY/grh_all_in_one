import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface KpiCardProps {
  label: string;
  value: number | string;
  icon?: ReactNode;
  hint?: string;
  tone?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

const TONE_CLASSES: Record<NonNullable<KpiCardProps['tone']>, string> = {
  default: 'text-foreground',
  primary: 'text-primary',
  success: 'text-[var(--success)]',
  warning: 'text-[var(--warning-foreground)]',
  danger: 'text-destructive',
};

export function KpiCard({ label, value, icon, hint, tone = 'default' }: KpiCardProps) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className={cn('text-3xl font-semibold leading-none', TONE_CLASSES[tone])}>{value}</p>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
        {icon && <div className={cn('shrink-0', TONE_CLASSES[tone])}>{icon}</div>}
      </CardContent>
    </Card>
  );
}