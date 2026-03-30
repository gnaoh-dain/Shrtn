import { LandingHeader } from '@/components/landing/landing-header';
import { HeroShortenCard } from '@/components/landing/hero-shorten-card';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-app-radial">
      <LandingHeader />
      <main>
        <section className="container max-w-6xl px-4 pb-20 pt-10 md:pt-16">
          <div className="mx-auto mb-10 max-w-3xl text-center md:mb-14">
            <div className="mb-6 inline-flex items-center rounded-full bg-foreground px-4 py-1.5 text-xs font-medium text-background shadow-sm">
              🚀 Miễn phí mãi mãi
            </div>
            <h1 className="mb-4 py-2 text-4xl font-bold tracking-tight text-gradient-brand md:text-5xl lg:text-6xl">
              Rút gọn link của bạn
            </h1>
            <p className="mx-auto max-w-xl text-base text-muted-foreground md:text-lg">
              Tạo short link nhanh chóng, theo dõi analytics và quản lý tất cả ở một nơi
            </p>
          </div>

          {/* <div className="mb-16 grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-[hsl(var(--brand-blue))] md:text-4xl">10M+</p>
              <p className="mt-1 text-sm text-muted-foreground">Links đã tạo</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-[hsl(var(--brand-blue))] md:text-4xl">50K+</p>
              <p className="mt-1 text-sm text-muted-foreground">Người dùng</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-emerald-600 md:text-4xl">99.9%</p>
              <p className="mt-1 text-sm text-muted-foreground">Uptime</p>
            </div>
          </div> */}

          <HeroShortenCard />
        </section>

        {/* <section id="tinh-nang" className="border-t border-border/60 bg-card/50 py-16">
          <div className="container max-w-6xl px-4">
            <h2 className="mb-8 text-center text-2xl font-bold md:text-3xl">Tính năng</h2>
            <ul className="mx-auto grid max-w-3xl gap-4 text-muted-foreground md:grid-cols-2">
              <li className="rounded-xl border border-border/60 bg-background p-4 shadow-sm">Rút gọn URL tức thì, có hỗ trợ alias tuỳ chỉnh</li>
              <li className="rounded-xl border border-border/60 bg-background p-4 shadow-sm">Theo dõi clicks, thiết bị và nguồn traffic</li>
              <li className="rounded-xl border border-border/60 bg-background p-4 shadow-sm">Quản lý link tập trung trên dashboard</li>
              <li className="rounded-xl border border-border/60 bg-background p-4 shadow-sm">Dùng thử miễn phí — đăng ký khi cần lưu link lâu dài</li>
            </ul>
          </div>
        </section>

        <section id="gia-ca" className="py-16">
          <div className="container max-w-6xl px-4 text-center">
            <h2 className="mb-4 text-2xl font-bold md:text-3xl">Giá cả</h2>
            <p className="mx-auto max-w-lg text-muted-foreground">
              Gói miễn phí đủ cho cá nhân. Pro và team sẽ được công bố sau (dữ liệu minh hoạ).
            </p>
          </div>
        </section>

        <section id="faq" className="border-t border-border/60 bg-muted/30 py-16">
          <div className="container max-w-2xl px-4">
            <h2 className="mb-8 text-center text-2xl font-bold md:text-3xl">FAQ</h2>
            <dl className="space-6 text-left">
              <div>
                <dt className="font-semibold text-foreground">Có cần đăng ký để rút gọn?</dt>
                <dd className="mt-1 text-sm text-muted-foreground">Không — bạn có thể rút gọn như khách; đăng nhập để quản lý và analytics đầy đủ hơn.</dd>
              </div>
              <div>
                <dt className="font-semibold text-foreground">Link khách có hết hạn không?</dt>
                <dd className="mt-1 text-sm text-muted-foreground">Có thể, tùy cấu hình server (TTL khách). Link của tài khoản thường không hết hạn mặc định.</dd>
              </div>
            </dl>
          </div>
        </section> */}
      </main>
    </div>
  );
}
