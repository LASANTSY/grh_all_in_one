import * as React from 'react';
import { cn } from '@/lib/utils';

/*
 * Composants Tabs personnalises, sans dependance Base UI / Radix.
 *
 * Objectif : garantir que le conteneur des onglets ne force JAMAIS la
 * largeur de la page a depasser la fenetre, meme avec un grand nombre
 * d onglets. Le scroll horizontal se fait uniquement a l interieur du
 * conteneur TabsList.
 */

interface TabsContextValue {
  value: string;
  setValue: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined);

function useTabsContext(): TabsContextValue {
  const ctx = React.useContext(TabsContext);
  if (!ctx) {
    throw new Error('Les composants Tabs doivent etre utilises dans <Tabs>.');
  }
  return ctx;
}

interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

export function Tabs({
  defaultValue = '',
  value: controlledValue,
  onValueChange,
  className,
  children,
  ...props
}: TabsProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const setValue = React.useCallback(
    (next: string) => {
      if (!isControlled) setInternalValue(next);
      onValueChange?.(next);
    },
    [isControlled, onValueChange],
  );

  const ctx = React.useMemo<TabsContextValue>(() => ({ value, setValue }), [value, setValue]);

  return (
    <TabsContext.Provider value={ctx}>
      <div className={cn('w-full', className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Si vrai, ajoute un scroll horizontal pour les onglets qui depassent. */
  scrollable?: boolean;
}

export function TabsList({ className, children, scrollable = true, ...props }: TabsListProps) {
  // Conteneur de scroll avec largeur contrainte a celle du parent.
  // Le role="tablist" est porte par le div interne pour l'accessibilite.
  return (
    <div className="relative w-full max-w-full border-b border-border">
      <div
        className={cn(
          scrollable && 'overflow-x-auto',
          '[scrollbar-width:thin]',
        )}
      >
        <div
          role="tablist"
          className={cn(
            'flex h-auto items-center gap-1 bg-transparent p-0',
            'w-max', // largeur naturelle du contenu
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export function TabsTrigger({ value, className, children, ...props }: TabsTriggerProps) {
  const { value: current, setValue } = useTabsContext();
  const isActive = current === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      data-state={isActive ? 'active' : 'inactive'}
      data-value={value}
      onClick={() => setValue(value)}
      className={cn(
        'inline-flex shrink-0 items-center justify-center whitespace-nowrap',
        'rounded-none border-b-2 border-transparent',
        'px-4 py-2 text-sm font-medium text-muted-foreground',
        'transition-colors hover:text-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:pointer-events-none disabled:opacity-50',
        'data-[state=active]:border-primary data-[state=active]:text-foreground',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export function TabsContent({ value, className, children, ...props }: TabsContentProps) {
  const { value: current } = useTabsContext();
  if (current !== value) return null;

  return (
    <div
      role="tabpanel"
      data-state={current === value ? 'active' : 'inactive'}
      className={cn('w-full', className)}
      {...props}
    >
      {children}
    </div>
  );
}