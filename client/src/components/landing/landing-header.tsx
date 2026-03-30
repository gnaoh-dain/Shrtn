'use client';

import { LogIn } from 'lucide-react';
import Link from 'next/link';

import { Logo } from '@/components/brand/logo';
import { GradientButton } from '@/components/brand/gradient-button';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';

const navLinkClass =
  'text-sm font-medium text-muted-foreground transition-colors hover:text-foreground';

export function LandingHeader({ className }: { className?: string }) {
  const { user, loading, logout } = useAuth();

  return (
    <header className={cn('relative z-10 border-b border-border/40 bg-background/80 backdrop-blur-md', className)}>
      <div className="container flex h-16 max-w-6xl items-center justify-between gap-4">
        <Logo href="/" size="md" />

        <nav className="hidden items-center gap-8 md:flex">
          <a href="#tinh-nang" className={navLinkClass}>
            Tính năng
          </a>
          <a href="#gia-ca" className={navLinkClass}>
            Giá cả
          </a>
          <a href="#faq" className={navLinkClass}>
            FAQ
          </a>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {loading ? (
            <span className="h-9 w-20 animate-pulse rounded-md bg-muted" />
          ) : user ? (
            <>
              <span className="hidden max-w-[160px] truncate text-sm text-muted-foreground lg:inline">{user.email}</span>
              <GradientButton size="sm" className="rounded-lg px-4" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </GradientButton>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="hidden text-muted-foreground sm:inline-flex"
                onClick={() => logout()}
              >
                Đăng xuất
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" className="gap-2 rounded-lg border-border bg-background shadow-sm" asChild>
                <Link href="/login?next=/dashboard">
                  <LogIn className="h-4 w-4" />
                  Đăng nhập
                </Link>
              </Button>
              <GradientButton size="sm" className="rounded-lg px-4" asChild>
                <Link href="/login?next=/dashboard">Dashboard</Link>
              </GradientButton>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
