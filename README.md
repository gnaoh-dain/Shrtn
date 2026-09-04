# Shrtn

Monorepo gồm API NestJS và frontend Next.js (App Router).

## Cấu trúc

| Thư mục | Nội dung |# Shrtn

Monorepo gồm API NestJS và frontend Next.js (App Router).

> Dự án thực hiện theo đề bài [URL Shortening Service](https://roadmap.sh/projects/url-shortening-service) trên roadmap.sh.
|---------|----------|
| `server/` | Backend NestJS, Prisma, Redis/BullMQ theo code hiện tại |
| `client/` | Next.js (App Router), TypeScript, Tailwind, shadcn/ui, TanStack Query, RHF + Zod, Recharts |
| `docs/` | Hợp đồng API cho frontend: [docs/frontend-api.md](docs/frontend-api.md) |

## Yêu cầu

- [pnpm](https://pnpm.io/)
- Docker (tuỳ chọn): Postgres + Redis — `docker compose` chạy từ `server/`

## Cài đặt

Ở **root** repo:

```bash
pnpm install
```

- Backend: `.env` trong `server/` (xem `server/src/config/env.schema.ts`).
- Frontend: tuỳ chọn `client/.env.local` với `NEXT_PUBLIC_API_BASE_URL` (vd. `http://localhost:50000`) — xem `client/.env.example`.

## Scripts

| Lệnh | Mô tả |
|------|--------|
| `pnpm dev:server` | Nest watch mode (`server/`) |
| `pnpm dev:client` | Next.js dev (Turbopack), mặc định port 3000 |
| `pnpm build` | Build cả `server` và `client` |
| `pnpm build:server` / `pnpm build:client` | Build từng package |

Trong `server/` vẫn có thể chạy trực tiếp `pnpm start:dev`, `pnpm test`, v.v.

## Ghi chú

- Nếu trước đây `.env` nằm ở root, hãy chuyển vào `server/.env`.
- Frontend khác origin với API: xem mục CORS trong [docs/frontend-api.md](docs/frontend-api.md).
