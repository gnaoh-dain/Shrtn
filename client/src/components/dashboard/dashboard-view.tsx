'use client';

import {
  BarChart3,
  Bell,
  ChevronDown,
  Clock,
  Copy,
  Download,
  ExternalLink,
  Filter,
  LineChart,
  Link2,
  Monitor,
  MoreVertical,
  MousePointerClick,
  Search,
  Smartphone,
  Tablet,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Logo } from '@/components/brand/logo';
import { GradientButton } from '@/components/brand/gradient-button';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import {
  mockDevices,
  mockLinkRows,
  mockOverviewStats,
  mockTopCountries,
} from '@/lib/mock/dashboard-data';
import { cn } from '@/lib/utils';

function countryCodeToFlag(code: string): string {
  const cc = code.toUpperCase();
  if (cc.length !== 2) return '🌐';
  const pts = [...cc].map((c) => 127397 + c.charCodeAt(0));
  return String.fromCodePoint(...pts);
}

function displayNameFromEmail(email: string): string {
  const local = email.split('@')[0] ?? email;
  return local
    .replace(/[._-]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

export function DashboardView() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?next=/dashboard');
    }
  }, [loading, user, router]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const rows = useMemo(() => {
    if (tab === 'active') return mockLinkRows.filter((r) => r.status === 'active');
    if (tab === 'inactive') return mockLinkRows.filter((r) => r.status === 'inactive');
    return mockLinkRows;
  }, [tab]);

  const counts = useMemo(() => {
    const all = mockLinkRows.length;
    const active = mockLinkRows.filter((r) => r.status === 'active').length;
    const inactive = mockLinkRows.filter((r) => r.status === 'inactive').length;
    return { all, active, inactive };
  }, []);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[hsl(var(--brand-blue))] border-t-transparent" />
      </div>
    );
  }

  const displayName = displayNameFromEmail(user.email);

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/95 backdrop-blur">
        <div className="container flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
          <Logo href="/" size="sm" />

          <nav className="hidden items-center gap-1 md:flex">
            <Link
              href="/dashboard"
              className="rounded-lg bg-muted px-4 py-2 text-sm font-medium text-foreground"
            >
              Links
            </Link>
            <Link
              href="/dashboard"
              className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Analytics
            </Link>
            <Link
              href="/dashboard"
              className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Settings
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="icon" className="relative text-muted-foreground">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background" />
            </Button>
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-lg border border-border/60 bg-background px-2 py-1.5 pl-2 pr-2 shadow-sm transition-colors hover:bg-muted/50"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-brand text-xs font-bold text-white">
                  {displayName.slice(0, 1)}
                </span>
                <span className="hidden max-w-[140px] truncate text-sm font-medium lg:inline">{displayName}</span>
                <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition', menuOpen && 'rotate-180')} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-border bg-popover py-1 shadow-lg">
                  <p className="truncate px-3 py-2 text-xs text-muted-foreground">{user.email}</p>
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                      router.push('/');
                    }}
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-7xl space-y-8 px-4 py-8">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Tổng Links</span>
              <span className="rounded-lg bg-muted p-2 text-[hsl(var(--brand-blue))]">
                <Link2 className="h-4 w-4" />
              </span>
            </div>
            <p className="text-2xl font-bold tracking-tight">
              {mockOverviewStats.totalLinks.toLocaleString('vi-VN')}
            </p>
            <p className="mt-1 text-xs font-medium text-emerald-600">{mockOverviewStats.totalLinksDelta}</p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Tổng Clicks</span>
              <span className="rounded-lg bg-muted p-2 text-[hsl(var(--brand-blue))]">
                <MousePointerClick className="h-4 w-4" />
              </span>
            </div>
            <p className="text-2xl font-bold tracking-tight">
              {mockOverviewStats.totalClicks.toLocaleString('vi-VN')}
            </p>
            <p className="mt-1 text-xs font-medium text-emerald-600">{mockOverviewStats.totalClicksDelta}</p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Click Rate</span>
              <span className="rounded-lg bg-muted p-2 text-[hsl(var(--brand-blue))]">
                <LineChart className="h-4 w-4" />
              </span>
            </div>
            <p className="text-2xl font-bold tracking-tight">{mockOverviewStats.clickRate}</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-brand"
                style={{ width: `${mockOverviewStats.clickRateBarPct}%` }}
              />
            </div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Active Links</span>
              <span className="rounded-lg bg-muted p-2 text-[hsl(var(--brand-blue))]">
                <Clock className="h-4 w-4" />
              </span>
            </div>
            <p className="text-2xl font-bold tracking-tight">
              {mockOverviewStats.activeLinks.toLocaleString('vi-VN')}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{mockOverviewStats.activeLinksPct}</p>
          </div>
        </section>

        <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Quản lý Links</h2>
              <p className="text-sm text-muted-foreground">Xem và quản lý tất cả short links của bạn</p>
            </div>
            <GradientButton type="button" className="rounded-xl" asChild>
              <Link href="/">+ Tạo link mới</Link>
            </GradientButton>
          </div>

          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="Tìm kiếm links..."
                className="h-10 w-full rounded-xl border border-border bg-muted/40 pl-10 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-blue))]/30"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" variant="outline" size="icon" className="rounded-xl border-border">
                <Filter className="h-4 w-4" />
              </Button>
              <select className="h-10 rounded-xl border border-border bg-background px-3 text-sm">
                <option>Tất cả</option>
              </select>
              <Button type="button" variant="outline" className="gap-2 rounded-xl border-border">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          <div className="mb-4 flex flex-wrap gap-2 border-b border-border pb-4">
            {(
              [
                ['all', `Tất cả (${counts.all})`],
                ['active', `Active (${counts.active})`],
                ['inactive', `Inactive (${counts.inactive})`],
              ] as const
            ).map(([k, label]) => (
              <button
                key={k}
                type="button"
                onClick={() => setTab(k)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                  tab === k ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-muted',
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto rounded-xl border border-border/80">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-border bg-muted/40 text-xs font-medium uppercase text-muted-foreground">
                <tr>
                  <th className="w-10 px-3 py-3">
                    <input type="checkbox" className="rounded border-border" aria-label="Chọn tất cả" />
                  </th>
                  <th className="px-3 py-3">Short Link</th>
                  <th className="px-3 py-3">URL gốc</th>
                  <th className="px-3 py-3">Clicks</th>
                  <th className="px-3 py-3">Ngày tạo</th>
                  <th className="px-3 py-3">Trạng thái</th>
                  <th className="w-10 px-3 py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-border/60 last:border-0 hover:bg-muted/20">
                    <td className="px-3 py-3">
                      <input type="checkbox" className="rounded border-border" aria-label={`Chọn ${row.shortDisplay}`} />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <a
                          href={row.shortHref}
                          className="font-medium text-[hsl(var(--brand-blue))] hover:underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {row.shortDisplay}
                        </a>
                        <button
                          type="button"
                          className="text-muted-foreground hover:text-foreground"
                          aria-label="Sao chép"
                          onClick={() => void navigator.clipboard.writeText(row.shortHref)}
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                    <td className="max-w-[200px] px-3 py-3">
                      <a
                        href={row.originalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 truncate text-muted-foreground hover:text-foreground"
                      >
                        <span className="truncate">{row.originalUrl}</span>
                        <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                      </a>
                    </td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center gap-1 font-medium">
                        <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
                        {row.clicks.toLocaleString('vi-VN')}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">{row.createdAt}</td>
                    <td className="px-3 py-3">
                      <span
                        className={cn(
                          'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold',
                          row.status === 'active'
                            ? 'bg-foreground text-background'
                            : 'bg-muted text-muted-foreground',
                        )}
                      >
                        {row.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <button type="button" className="text-muted-foreground hover:text-foreground" aria-label="Thao tác">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Dữ liệu bảng là minh hoạ — API danh sách link sẽ thay thế sau.</p>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
            <h3 className="mb-4 font-semibold">Top Countries</h3>
            <ul className="space-y-4">
              {mockTopCountries.map((c) => (
                <li key={c.code}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-medium">
                      <span className="text-lg leading-none">{countryCodeToFlag(c.code)}</span>
                      {c.name}
                    </span>
                    <span className="text-muted-foreground">{c.clicks.toLocaleString('vi-VN')} clicks</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-[hsl(var(--brand-blue))]" style={{ width: `${c.pct}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
            <h3 className="mb-4 font-semibold">Devices</h3>
            <ul className="space-5">
              {mockDevices.map((d) => {
                const Icon = d.icon === 'phone' ? Smartphone : d.icon === 'tablet' ? Tablet : Monitor;
                return (
                  <li key={d.id}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm font-medium">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        {d.label}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {d.pct}% · {d.clicks.toLocaleString('vi-VN')}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-gradient-brand"
                        style={{ width: `${d.pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
