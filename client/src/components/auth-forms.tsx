'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Github, Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { type Resolver, useForm } from 'react-hook-form';

import { GradientButton } from '@/components/brand/gradient-button';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { ApiError } from '@/lib/api';
import { authEmailPasswordSchema, authRegisterSchema } from '@/lib/validations/auth';
import { cn } from '@/lib/utils';

type Mode = 'login' | 'register';

type AuthFormValues = {
  email: string;
  password: string;
  confirmPassword?: string;
};

function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return '/dashboard';
  return raw;
}

function GoogleGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function AuthFormBody({ mode }: { mode: Mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, register: registerUser } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const isLogin = mode === 'login';
  const form = useForm<AuthFormValues>({
    resolver: zodResolver(
      isLogin ? authEmailPasswordSchema : authRegisterSchema,
    ) as Resolver<AuthFormValues>,
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    const next = safeNextPath(searchParams.get('next'));
    try {
      if (isLogin) {
        await login(values.email, values.password);
      } else {
        await registerUser(values.email, values.password);
      }
      router.push(next);
      router.refresh();
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.status === 401) {
          setFormError('Email hoặc mật khẩu không đúng.');
        } else if (e.status === 409) {
          setFormError('Email đã được đăng ký.');
        } else {
          setFormError(e.message);
        }
      } else {
        setFormError('Không kết nối được API. Kiểm tra NEXT_PUBLIC_API_BASE_URL và CORS backend.');
      }
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {formError && (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {formError}
        </p>
      )}

      <div className="space-y-2">
        <label htmlFor="auth-email" className="text-sm font-medium">
          Email
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id="auth-email"
            type="email"
            autoComplete="email"
            placeholder="email@example.com"
            className="h-11 w-full rounded-xl border border-border bg-muted/50 pl-10 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-blue))]/35"
            {...register('email')}
          />
        </div>
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="auth-password" className="text-sm font-medium">
            Mật khẩu
          </label>
          {isLogin && (
            <Link
              href="#"
              className="text-xs font-medium text-[hsl(var(--brand-blue))] hover:underline"
              onClick={(e) => e.preventDefault()}
            >
              Quên mật khẩu?
            </Link>
          )}
        </div>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id="auth-password"
            type="password"
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            placeholder="••••••••"
            className="h-11 w-full rounded-xl border border-border bg-muted/50 pl-10 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-blue))]/35"
            {...register('password')}
          />
        </div>
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>

      {!isLogin && (
        <div className="space-y-2">
          <label htmlFor="auth-confirm" className="text-sm font-medium">
            Xác nhận mật khẩu
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="auth-confirm"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              className="h-11 w-full rounded-xl border border-border bg-muted/50 pl-10 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-blue))]/35"
              {...register('confirmPassword')}
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>
      )}

      {isLogin && (
        <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
          <input type="checkbox" className="h-4 w-4 rounded border-border" />
          Ghi nhớ đăng nhập
        </label>
      )}

      <GradientButton type="submit" className="h-11 w-full rounded-xl font-semibold" disabled={isSubmitting}>
        {isSubmitting ? 'Đang xử lý…' : isLogin ? 'Đăng nhập' : 'Đăng ký'}
      </GradientButton>
    </form>
  );
}

export function AuthForms() {
  const [mode, setMode] = useState<Mode>('login');

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-xl shadow-black/[0.06] sm:p-8">
        <div className="mb-6 flex rounded-xl bg-muted/80 p-1">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={cn(
              'flex-1 rounded-lg py-2.5 text-sm font-medium transition-all',
              mode === 'login' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={cn(
              'flex-1 rounded-lg py-2.5 text-sm font-medium transition-all',
              mode === 'register' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            Đăng ký
          </button>
        </div>

        <AuthFormBody key={mode} mode={mode} />

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-3 text-muted-foreground">Hoặc</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full rounded-xl border-border bg-background"
            onClick={() => {}}
          >
            <GoogleGlyph className="h-5 w-5" />
            Tiếp tục với Google
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full rounded-xl border-border bg-background"
            onClick={() => {}}
          >
            <Github className="h-5 w-5" />
            Tiếp tục với GitHub
          </Button>
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        Protected by reCAPTCHA and subject to the Shrtn{' '}
        <Link href="#" className="text-[hsl(var(--brand-blue))] hover:underline" onClick={(e) => e.preventDefault()}>
          Privacy Policy
        </Link>{' '}
        and{' '}
        <Link href="#" className="text-[hsl(var(--brand-blue))] hover:underline" onClick={(e) => e.preventDefault()}>
          Terms of Service
        </Link>
        .
      </p>
    </div>
  );
}
