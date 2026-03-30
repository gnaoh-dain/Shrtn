# Hợp đồng HTTP API — Shrtn (cho frontend)

Tài liệu tham chiếu để SPA / mobile / BFF gọi đúng backend NestJS. Chi tiết nghiệp vụ analytics xem [analytics-spec.md](./analytics-spec.md); triển khai kỹ thuật analytics xem [analytics-api-part1.md](./analytics-api-part1.md).

---

## 1. Cấu hình chung

| Mục | Giá trị |
|-----|---------|
| **Base URL** | `API_BASE_URL` trên frontend, ví dụ `http://localhost:50000` (cổng mặc định backend: `PORT` trong env) |
| **JSON** | `Content-Type: application/json` cho mọi request có body (trừ redirect) |
| **Auth** | `Authorization: Bearer <access_token>` khi endpoint yêu cầu |

### Lỗi (NestJS mặc định)

Thường có dạng:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

Validation chi tiết có thể trả `message` là **mảng** chuỗi. Ví dụ:

```json
{
  "statusCode": 400,
  "message": ["email must be an email"],
  "error": "Bad Request"
}
```

---

## 2. Bảng tóm tắt

| Method | Path | Auth |
|--------|------|------|
| GET | `/` | Không |
| POST | `/auth/register` | Không |
| POST | `/auth/login` | Không |
| GET | `/auth/me` | Bearer JWT |
| POST | `/shorten` | Tuỳ chọn Bearer JWT |
| GET | `/:code` | Không |
| GET | `/analytics/links/:linkId/stats` | Bearer JWT |
| GET | `/analytics/by-short/:shortCode/stats` | Bearer JWT |
| GET | `/admin/ping` | Bearer JWT + ADMIN |
| GET | `/admin/analytics/overview` | Bearer JWT + ADMIN |

---

## 3. Auth

### `POST /auth/register`

- **Body:** `{ "email": string, "password": string }` — `password` tối thiểu **8** ký tự, `email` hợp lệ.
- **200:** `{ "access_token": string }`
- **409:** Email đã tồn tại (`ConflictException`).

### `POST /auth/login`

- **Body:** `{ "email": string, "password": string }`
- **200:** `{ "access_token": string }`
- **401:** Sai thông tin đăng nhập.

### `GET /auth/me`

- **Headers:** `Authorization: Bearer <access_token>`
- **200:** `{ "id": string (uuid), "email": string, "role": "USER" | "ADMIN" }`
- **401:** Thiếu token, token hết hạn hoặc chữ ký không hợp lệ.

---

## 4. Rút gọn link & redirect

### `POST /shorten`

- **Headers:** tuỳ chọn `Authorization: Bearer <access_token>`
- **Body:** `{ "url": string (URL hợp lệ), "customAlias"?: string }`
- **200:** `{ "short_url": string }` — URL đầy đủ dạng `{BASE_URL}/{shortCode}` (BASE_URL do server cấu hình).

**Hành vi JWT:**

- **Token hợp lệ:** link gắn user đăng nhập, không hết hạn mặc định (`expires_at` null).
- **Không gửi token, hoặc token sai/hết hạn:** xử lý như **khách** — link có thời điểm hết hạn theo `GUEST_LINK_TTL_HOURS` trên server (không cần 401 cho shorten).

### `GET /:code`

- **`:code`:** mã rút gọn (một segment path).
- **Response:** **301 Moved Permanently**, header `Location` trỏ tới URL gốc.
- **404:** Không có link, link inactive, hoặc đã hết hạn.

**Gợi ý cho SPA gọi `fetch`:** dùng `redirect: 'manual'` rồi đọc header `Location` nếu cần URL đích mà không điều hướng trang.

**Lưu ý routing:** `GET /` trả chuỗi hello (không phải JSON). `GET /:code` khớp **mọi** path một segment ở root — nếu frontend và API cùng origin, tránh đường dẫn app trùng pattern mã ngắn. Thông thường frontend chạy origin/port khác backend.

---

## 5. Analytics (theo link)

**Prefix:** `/analytics`  
**Bắt buộc:** `Authorization: Bearer <access_token>`  
**Rate limit:** server có throttle riêng (`THROTTLE_ANALYTICS_LIMIT`, `THROTTLE_ANALYTICS_TTL_MS` trong env). Có thể nhận **429** khi gọi quá dày.

### `GET /analytics/links/:linkId/stats`

- **`:linkId`:** UUID hợp lệ (sai định dạng → **400** từ `ParseUUIDPipe`).
- **Query (một trong hai cách):**
  - `preset`: `7d` | `30d` | `all` — nếu không gửi query, mặc định tương đương **`7d`**.
  - Hoặc **cả hai** `from` và `to`: chuỗi **ISO 8601** (date-time), khoảng tối đa **366 ngày**.
- **403:** User thường xem link không thuộc mình, hoặc link **khách** (`user_id` null).
- **404:** Không tìm thấy link.

**200 — ví dụ cấu trúc:**

```json
{
  "link": {
    "id": "uuid",
    "short_code": "string",
    "original_url": "string"
  },
  "range": {
    "from": "ISO-8601",
    "to": "ISO-8601",
    "preset": "7d | 30d | all | null"
  },
  "timezone": "UTC",
  "total_clicks": 0,
  "clicks_by_day": [{ "date": "YYYY-MM-DD", "count": 0 }],
  "top_referrers": [{ "referer": "string hoặc (direct)", "count": 0 }],
  "by_browser": [{ "browser": "string hoặc unknown", "count": 0 }],
  "by_device": [{ "device": "string hoặc unknown", "count": 0 }]
}
```

### `GET /analytics/by-short/:shortCode/stats`

- Giống query và response như trên; resolve link bằng `short_code` (URL-encode nếu mã có ký tự đặc biệt).

---

## 6. Admin

**Prefix:** `/admin`  
**Bắt buộc:** `Authorization: Bearer <access_token>` và **`role === "ADMIN"`** trong JWT.

### `GET /admin/ping`

- **200:** `{ "ok": true }`

### `GET /admin/analytics/overview`

- **200:** `{ "total_links": number, "total_click_logs": number, "clicks_last_24h": number }`
- **403:** User không phải admin.

---

## 7. Mã HTTP thường gặp

| Mã | Tình huống |
|----|------------|
| 400 | Validation body/query, UUID sai định dạng |
| 401 | Thiếu/sai JWT trên route bắt buộc auth |
| 403 | Đủ auth nhưng không đủ quyền (analytics link người khác / khách; không phải admin) |
| 404 | Link không tồn tại; redirect không tìm thấy / hết hạn |
| 409 | Đăng ký trùng email |
| 429 | Vượt rate limit (throttle) |

---

## 8. Gợi ý tích hợp frontend

1. Sau `login` / `register`, lưu `access_token` (bộ nhớ, `sessionStorage`, hoặc cookie httpOnly nếu có BFF — tài liệu này chỉ mô tả header Bearer).
2. Gắn interceptor: nếu có token thì thêm `Authorization: Bearer …` cho các route cần auth.
3. **CORS:** Hiện tại [main.ts](../server/src/main.ts) **chưa** gọi `enableCors`. Nếu frontend chạy origin khác (vd. `http://localhost:5173`), cần bật CORS trên backend hoặc dùng proxy dev server — cấu hình cụ thể do team thêm vào Nest.

---

## 9. Liên kết nội bộ

- [analytics-spec.md](./analytics-spec.md) — quyền xem stats, phạm vi MVP.
- [analytics-api-part1.md](./analytics-api-part1.md) — thiết kế triển khai analytics, env throttle, policy code.
