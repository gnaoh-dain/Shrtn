# Analytics — product spec (MVP)

Tài liệu gắn với RBAC đã triển khai: JWT + `UserRole` (`USER` | `ADMIN`).

## Quyền xem

| Đối tượng | Quyền |
|-----------|--------|
| `ADMIN` | Xem thống kê mọi `link_id` / `short_code`, và (khi có) tổng hợp toàn hệ thống. |
| `USER` | Chỉ thống kê của link có `links.user_id` trùng `sub` trong JWT. |
| Anonymous | Link `user_id` là `null`: không expose qua API user; chỉ `ADMIN` (hoặc không hiển thị — mặc định: **chỉ ADMIN**). |
| Public | `GET /:code` redirect không yêu cầu auth; không trả dữ liệu thống kê. |

## Chỉ số MVP (API/query sau này)

- Tổng click theo link (khoảng thời gian).
- Chuỗi thời gian theo **ngày** (`click_logs.created_at`, bucket theo UTC hoặc một TZ cố định — chốt khi implement).
- Top **referer** (từ cột `referer`, gom `(direct)` khi null).
- Sau khi enrich UA: phân bổ **browser** / **device** (từ cột `browser`, `device`).

**Phase sau (không MVP):** unique visitors (định nghĩa rõ: IP vs IP+UA vs cookie), bot filtering, UTM.

## Khung thời gian mặc định

- Preset: **7d**, **30d**, **all-time**.
- Query luôn có `from` / `to` hoặc preset — tránh scan bảng không giới hạn khi volume lớn.

## Export CSV

- **Out of MVP** trừ khi có yêu cầu rõ; nếu làm sau: chỉ `ADMIN` hoặc owner link, cùng policy như API JSON.

## Privacy & retention

- **IP:** hiện lưu plaintext trong `click_logs.ip_address`; có thể chuyển sang hash + salt (env) trong phase sau.
- **Retention:** chưa có job xoá tự động — định kỳ xoá log cũ hơn N ngày (N chốt khi vận hành).
- **Geo (`country`):** **defer** — không bật trong MVP; có thể thêm MaxMind/API sau.

## Geo / IP enrichment

- **Deferred.** Không triển khai lookup geo trong worker cho đến khi có yêu cầu và nguồn dữ liệu (DB/IP service) + privacy review.
