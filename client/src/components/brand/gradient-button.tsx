import * as React from 'react';

import { Button, type ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const GradientButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, ...props }, ref) => (
    <Button
      ref={ref}
      variant={variant ?? 'default'}
      className={cn(
        'border-0 bg-gradient-brand text-white shadow-md transition-opacity hover:opacity-95 focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-blue))]/50',
        className,
      )}
      {...props}
    />
  ),
);
GradientButton.displayName = 'GradientButton';
