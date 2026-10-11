import { Toaster as SonnerToaster, toast } from 'sonner';
import { useTheme } from '../../contexts/ThemeContext';

function Toaster() {
  const { resolvedTheme } = useTheme();
  return (
    <SonnerToaster
      theme={resolvedTheme}
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast: 'bg-surface-raised! border-border! text-text! shadow-lg!',
          description: 'text-text-muted!',
          actionButton: 'bg-brand! text-brand-fg!',
          cancelButton: 'bg-surface-overlay! text-text!',
        },
      }}
    />
  );
}

export { Toaster, toast };
