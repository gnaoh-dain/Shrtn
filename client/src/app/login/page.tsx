import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

import { AuthForms } from '@/components/auth-forms';
import { Logo } from '@/components/brand/logo';

function AuthFormsFallback() {
  return (
    <div className="h-[420px] w-full max-w-md animate-pulse rounded-2xl border border-border/60 bg-muted/40" />
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-app-radial">
      <div className="container relative max-w-lg px-4 pb-16 pt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại trang chủ
        </Link>

        <div className="mt-10 flex flex-col items-center text-center">
          <Logo href="/" size="lg" className="mb-6" />
          <p className="mb-4 text-lg font-medium text-foreground">Quản lý short link của bạn</p>
          <div className="mb-10 inline-flex items-center rounded-full bg-foreground px-4 py-1.5 text-xs font-medium text-background">
            🎉 Miễn phí 30 ngày dùng thử Pro
          </div>
        </div>

        <div className="mx-auto flex justify-center">
          <Suspense fallback={<AuthFormsFallback />}>
            <AuthForms />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
