/** Dữ liệu minh hoạ — thay bằng API khi có endpoint list links / overview. */

export const mockOverviewStats = {
  totalLinks: 2543,
  totalLinksDelta: '+12.5% so với tháng trước',
  totalClicks: 45231,
  totalClicksDelta: '+8.2% so với tháng trước',
  clickRate: '17.8/link',
  clickRateBarPct: 30,
  activeLinks: 2401,
  activeLinksPct: '94.4% đang hoạt động',
};

export type MockLinkRow = {
  id: string;
  shortDisplay: string;
  shortHref: string;
  originalUrl: string;
  clicks: number;
  createdAt: string;
  status: 'active' | 'inactive';
};

export const mockLinkRows: MockLinkRow[] = [
  {
    id: '1',
    shortDisplay: 'shrtn.link/abc123',
    shortHref: 'https://shrtn.link/abc123',
    originalUrl: 'https://example.com/very/long/path',
    clicks: 1240,
    createdAt: '15/03/2026',
    status: 'active',
  },
  {
    id: '2',
    shortDisplay: 'shrtn.link/promo24',
    shortHref: 'https://shrtn.link/promo24',
    originalUrl: 'https://brand.com/spring-sale',
    clicks: 892,
    createdAt: '12/03/2026',
    status: 'active',
  },
  {
    id: '3',
    shortDisplay: 'shrtn.link/doc-x9',
    shortHref: 'https://shrtn.link/doc-x9',
    originalUrl: 'https://docs.internal/wiki/getting-started',
    clicks: 56,
    createdAt: '01/03/2026',
    status: 'inactive',
  },
  {
    id: '4',
    shortDisplay: 'shrtn.link/invite',
    shortHref: 'https://shrtn.link/invite',
    originalUrl: 'https://app.service.com/register?ref=vip',
    clicks: 3401,
    createdAt: '28/02/2026',
    status: 'active',
  },
];

export const mockTopCountries = [
  { code: 'VN', name: 'Việt Nam', clicks: 18200, pct: 72 },
  { code: 'US', name: 'United States', clicks: 4200, pct: 45 },
  { code: 'JP', name: 'Japan', clicks: 2100, pct: 28 },
];

export const mockDevices = [
  { id: 'mobile', label: 'Mobile', pct: 62, clicks: 28043, icon: 'phone' as const },
  { id: 'desktop', label: 'Desktop', pct: 31, clicks: 14021, icon: 'monitor' as const },
  { id: 'tablet', label: 'Tablet', pct: 7, clicks: 3167, icon: 'tablet' as const },
];
