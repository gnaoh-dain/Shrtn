import { Link2 } from 'lucide-react';
import Link from 'next/link';

import { cn } from '@/lib/utils';

type LogoProps = {
  className?: string;
  href?: string;
  size?: 'sm' | 'md' | 'lg';
};

const sizes = {
  sm: { box: 'h-8 w-8', glyph: 'h-4 w-4', text: 'text-lg' },
  md: { box: 'h-9 w-9', glyph: 'h-[18px] w-[18px]', text: 'text-xl' },
  lg: { box: 'h-11 w-11', glyph: 'h-5 w-5', text: 'text-2xl' },
};

export function Logo({ className, href = '/', size = 'md' }: LogoProps) {
  const s = sizes[size];
  const inner = (
    <span className="inline-flex items-center gap-2 font-bold tracking-tight">
      <span
        className={cn(
          'flex shrink-0 items-center justify-center rounded-lg bg-gradient-brand text-white shadow-sm',
          s.box,
        )}
      >
        <Link2 className={s.glyph} strokeWidth={2.5} />
      </span>
      <span className={cn('text-gradient-brand', s.text)}>Shrtn</span>
    </span>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          'inline-block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-blue))]/40',
          className,
        )}
      >
        {inner}
      </Link>
    );
  }

  return <span className={className}>{inner}</span>;
}
