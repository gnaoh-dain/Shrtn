# Analytics API — Phần 1 (tài liệu kỹ thuật & vận hành)

Tài liệu này bổ sung [analytics-spec.md](./analytics-spec.md) (quyền & chỉ số sản phẩm). Giữ spec sản phẩm làm nguồn truth cho RBAC; file này mô tả **triển khai**, **công nghệ**, **trade-off**, **vận hành**.

## Mục tiêu phần 1

- API đọc thống kê click theo **một link** (tổng, theo ngày UTC, top referer, browser/device).
- **Bắt buộc JWT** trên route analytics (khác `POST /shorten` dùng optional JWT).
- **ADMIN**: xem mọi link (kể cả `user_id` null — link khách).
- **USER**: chỉ link có `links.user_id === jwt.sub`.
- **Quyết định mã lỗi:** link tồn tại nhưng USER không được xem (link khách hoặc link người khác) → **403 Forbidden**. Link không tồn tại → **404** (trước khi lộ thông tin chi tiết).

## Phạm vi ngoài phần 1

- CSV export, geo `country`, job retention, bảng rollup, cache Redis cho kết quả aggregate, unique visitors — xem [analytics-spec.md](./analytics-spec.md).

## Mã nguồn chính

- `analytics.policy.ts` — `assertCanViewLink`, `resolveAnalyticsRange` (logic thuần, dễ unit test, không phụ thuộc Prisma client trong Jest).
- `analytics.service.ts` — truy vấn Prisma / `$queryRaw`.
- `analytics.controller.ts` — route REST + JWT + throttle.

## Công nghệ

| Thành phần | Vai trò |
|------------|---------|
| NestJS `AnalyticsModule` | Controller / service / DI |
| `AuthGuard('jwt')` | Xác thực bắt buộc |
| Prisma `findUnique` (Link), `count` (ClickLog) | Đọc an toàn, type-safe |
| `prisma.$queryRaw` + `Prisma.sql` | GROUP BY ngày (UTC), top referer/browser/device |
| PostgreSQL | `date_trunc`, `COALESCE`, index `(link_id, created_at)` |
| `class-validator` | Query `preset` / `from` / `to` |
| `@nestjs/throttler` | Giới hạn tần suất đọc analytics |

### Ưu / nhược (tóm tắt)

| Lựa chọn | Ưu | Nhược |
|----------|-----|--------|
| `count` + `$queryRaw` | ORM cho filter đơn giản; SQL cho aggregate phức tạp | Raw SQL gắn Postgres; đổi DB cần review |
| Một endpoint `GET .../stats` gộp | Một round-trip cho dashboard | Payload lớn; lỗi query fail cả khối |
| Chưa rollup / ClickHouse | Đơn giản, đủ MVP | Khi `click_logs` rất lớn cần tối ưu sau |

## API (triển khai)

### `GET /analytics/links/:linkId/stats`

- **Auth:** `Authorization: Bearer <access_token>`
- **Query:** một trong hai:
  - `preset=7d` | `30d` | `all` (mặc định `7d` nếu không gửi gì)
  - `from` + `to` (ISO 8601), độ rộng tối đa **366 ngày**
- **Preset `all`:** `from = link.created_at`, `to = now` (tránh quét bảng không giới hạn theo thời gian vũ trụ).
- **Response:** `link`, `range` (đã resolve UTC), `timezone: "UTC"`, `total_clicks`, `clicks_by_day`, `top_referrers`, `by_browser`, `by_device`.

### `GET /analytics/by-short/:shortCode/stats`

- Cùng query và cùng logic phân quyền sau khi resolve `Link` theo `short_code`.

### `GET /admin/analytics/overview`

- Chỉ `ADMIN`: tổng `links`, tổng `click_logs`, clicks **24h gần nhất** (mốc `created_at`).

## Phân quyền (ownership)

- Sau `JwtAuthGuard`, service gọi `assertCanViewLink(link, user)`:
  - `role === ADMIN` → cho phép.
  - `role === USER` và `link.user_id === user.id` → cho phép.
  - `role === USER` và (`link.user_id` null hoặc khác `user.id`) → **403**.

## Vận hành

- Đảm bảo index `@@index([link_id, created_at])` trên `click_logs` (schema hiện tại).
- Giám sát thời gian thực thi query analytics trên staging/production; cân nhắc `EXPLAIN` khi tải lớn.
- **Không** log JWT hoặc body chứa token.
- Throttle analytics (env): `THROTTLE_ANALYTICS_LIMIT`, `THROTTLE_ANALYTICS_TTL_MS` trong `env.schema.ts`.

## Kiến thức áp dụng

- RBAC + **resource-based** access (ownership trên `Link`).
- SQL aggregate an toàn (chỉ bind parameter qua `Prisma.sql`).
- UTC cho bucket “theo ngày” — tránh lệch ngày theo timezone máy chủ.
- REST semantics: 401 (chưa đăng nhập), 403 (đã đăng nhập nhưng không quyền), 404 (không có link).
