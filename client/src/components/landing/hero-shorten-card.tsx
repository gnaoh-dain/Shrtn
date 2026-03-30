'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Link2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { GradientButton } from '@/components/brand/gradient-button';
import { useAuth } from '@/contexts/auth-context';
import { ApiError, shortenLink } from '@/lib/api';
import { getStoredToken } from '@/lib/auth-storage';
import { type ShortenDemoValues, shortenDemoSchema } from '@/lib/validations/shorten-demo';
import { cn } from '@/lib/utils';

type Tab = 'simple' | 'custom';

function mockShortUrl(): string {
  const code = Math.random().toString(36).slice(2, 9);
  return `https://shrtn.link/${code}`;
}

export function HeroShortenCard() {
  const { token, user } = useAuth();
  const bearer = token ?? getStoredToken();
  const [tab, setTab] = useState<Tab>('simple');
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ShortenDemoValues>({
    resolver: zodResolver(shortenDemoSchema),
    defaultValues: { url: '', customAlias: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setApiError(null);
    setShortUrl(null);
    const useCustom = tab === 'custom' && values.customAlias.trim();
    const payload = {
      url: values.url,
      ...(useCustom ? { customAlias: values.customAlias.trim() } : {}),
    };
    try {
      const { short_url } = await shortenLink(payload, bearer);
      setShortUrl(short_url);
      reset({ url: '', customAlias: '' });
    } catch (e) {
      if (e instanceof ApiError) {
        setApiError(e.message);
      } else {
        setShortUrl(mockShortUrl());
        setApiError(null);
        reset({ url: '', customAlias: '' });
      }
    }
  });

  return (
    <div className="mx-auto w-full max-w-2xl rounded-2xl border border-border/60 bg-card p-6 shadow-lg shadow-black/[0.04] sm:p-8">
      <div className="mb-6 flex rounded-xl bg-muted/80 p-1">
        <button
          type="button"
          onClick={() => setTab('simple')}
          className={cn(
            'flex-1 rounded-lg py-2.5 text-sm font-medium transition-all',
            tab === 'simple' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          Rút gọn đơn giản
        </button>
        <button
          type="button"
          onClick={() => setTab('custom')}
          className={cn(
            'flex-1 rounded-lg py-2.5 text-sm font-medium transition-all',
            tab === 'custom' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          Tùy chỉnh
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {apiError && (
          <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{apiError}</p>
        )}
        {shortUrl && (
          <div className="rounded-lg border border-[hsl(var(--brand-blue)/0.25)] bg-[hsl(var(--brand-blue)/0.06)] px-4 py-3 text-sm">
            <span className="text-muted-foreground">Link rút gọn: </span>
            <a
              href={shortUrl}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-[hsl(var(--brand-blue))] underline-offset-2 hover:underline"
            >
              {shortUrl}
            </a>
            {!user && (
              <p className="mt-1 text-xs text-muted-foreground">
                Link khách có thể hết hạn theo server. Đăng nhập để lưu lâu hơn.
              </p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="hero-url" className="text-sm font-semibold text-foreground">
            URL của bạn
          </label>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
            <input
              id="hero-url"
              placeholder="https://example.com/your-very-long-url"
              autoComplete="url"
              className="h-12 flex-1 rounded-xl border border-border bg-muted/50 px-4 text-sm shadow-inner transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-blue))]/35"
              {...register('url')}
            />
            <GradientButton
              type="submit"
              disabled={isSubmitting}
              className="h-12 shrink-0 rounded-xl px-6 font-semibold sm:w-auto sm:min-w-[140px]"
            >
              <Link2 className="h-4 w-4" />
              {isSubmitting ? 'Đang gửi…' : 'Rút gọn'}
            </GradientButton>
          </div>
          {errors.url && <p className="text-sm text-destructive">{errors.url.message}</p>}
        </div>

        {tab === 'custom' && (
          <div className="space-y-2">
            <label htmlFor="hero-alias" className="text-sm font-medium text-muted-foreground">
              Custom alias
            </label>
            <input
              id="hero-alias"
              placeholder="my-link"
              className="h-11 w-full rounded-xl border border-border bg-muted/50 px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-blue))]/35"
              {...register('customAlias')}
            />
            {errors.customAlias && <p className="text-sm text-destructive">{errors.customAlias.message}</p>}
          </div>
        )}
      </form>
    </div>
  );
}
