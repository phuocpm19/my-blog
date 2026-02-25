# Database Schema

> Database: Supabase (PostgreSQL)
> Trạng thái: DRAFT — chưa triển khai, sẽ cập nhật khi tạo tables trên Supabase

## Bảng dự kiến

### categories
Quản lý thể loại / phân loại bài viết.

| Column      | Type      | Note                     |
| ----------- | --------- | ------------------------ |
| id          | uuid      | Primary key              |
| name        | text      | Tên category             |
| slug        | text      | URL-friendly (unique)    |
| description | text      | Mô tả (nullable)        |
| created_at  | timestamp | Tự động                  |
| updated_at  | timestamp | Tự động                  |

### tags
Thẻ gắn cho bài viết (many-to-many với posts).

| Column     | Type      | Note                  |
| ---------- | --------- | --------------------- |
| id         | uuid      | Primary key           |
| name       | text      | Tên tag               |
| slug       | text      | URL-friendly (unique) |
| created_at | timestamp | Tự động               |

### posts
Bài viết review sách, tài liệu, kiến thức.

| Column      | Type      | Note                           |
| ----------- | --------- | ------------------------------ |
| id          | uuid      | Primary key                    |
| title       | text      | Tiêu đề bài viết              |
| slug        | text      | URL-friendly (unique)          |
| content     | text      | Nội dung (HTML hoặc Markdown)  |
| excerpt     | text      | Mô tả ngắn                    |
| cover_image | text      | URL ảnh bìa                   |
| category_id | uuid      | FK → categories                |
| author_name | text      | Tên tác giả sách/tài liệu     |
| status      | enum      | draft / published              |
| published_at| timestamp | Ngày xuất bản                  |
| created_at  | timestamp | Tự động                        |
| updated_at  | timestamp | Tự động                        |

### post_tags (bảng trung gian)
Quan hệ many-to-many giữa posts và tags.

| Column  | Type | Note         |
| ------- | ---- | ------------ |
| post_id | uuid | FK → posts   |
| tag_id  | uuid | FK → tags    |

### trading_reports
Báo cáo phân tích, chiến lược giao dịch theo session/ngày.

| Column     | Type      | Note                            |
| ---------- | --------- | ------------------------------- |
| id         | uuid      | Primary key                     |
| title      | text      | Tiêu đề báo cáo                |
| content    | text      | Nội dung phân tích              |
| session    | text      | Session (SS1, SS2...)           |
| report_date| date      | Ngày báo cáo                   |
| status     | enum      | draft / published               |
| created_at | timestamp | Tự động                         |
| updated_at | timestamp | Tự động                         |

### trades
Chi tiết từng giao dịch.

| Column      | Type      | Note                                  |
| ----------- | --------- | ------------------------------------- |
| id          | uuid      | Primary key                           |
| pair        | text      | Cặp giao dịch (BTC/USDT, ETH/USDT..)|
| side        | enum      | long / short                          |
| entry_price | decimal   | Giá vào lệnh                         |
| exit_price  | decimal   | Giá đóng lệnh                        |
| quantity    | decimal   | Khối lượng                            |
| pnl         | decimal   | Lãi / Lỗ (USDT)                      |
| pnl_percent | decimal   | % Lãi / Lỗ                           |
| fee         | decimal   | Phí giao dịch                         |
| leverage    | integer   | Đòn bẩy                              |
| strategy    | text      | Chiến lược sử dụng                   |
| notes       | text      | Ghi chú                              |
| trade_date  | timestamp | Thời điểm giao dịch                  |
| report_id   | uuid      | FK → trading_reports (nullable)       |
| created_at  | timestamp | Tự động                               |
| updated_at  | timestamp | Tự động                               |

## Quan hệ giữa các bảng

```
categories  1 ──── N  posts
posts       N ──── N  tags (qua post_tags)
trading_reports  1 ──── N  trades
```

## Ghi chú
- Tất cả ID dùng UUID (Supabase default)
- created_at, updated_at dùng trigger tự động trên Supabase
- RLS (Row Level Security) sẽ được bật: client chỉ đọc published, admin đọc/ghi tất cả
