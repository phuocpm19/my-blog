# Project Overview

## Tên dự án
**My Blog** — Personal blog & Trading journal

## Mô tả
Blog cá nhân kết hợp review sách/tài liệu/kiến thức và công cụ quản lý giao dịch crypto. Bao gồm 2 ứng dụng: Client (public) và Admin (private).

## Mục tiêu
- Chia sẻ bài viết review sách, tài liệu, kiến thức phân loại theo category/tag
- Đưa ra nhận định, phân tích, chiến lược giao dịch crypto theo từng session/ngày
- Thống kê giao dịch với biểu đồ trực quan (PnL, win rate, drawdown...)
- Mở rộng: tích hợp onchain data, embed biểu đồ từ nền tảng bên ngoài

## Tech Stack

| Layer            | Công nghệ                  | Ghi chú                          |
| ---------------- | -------------------------- | -------------------------------- |
| Frontend Client  | Next.js + Ant Design       | SSR/SSG cho SEO                  |
| Frontend Admin   | Next.js + Ant Design       | SPA, protected routes            |
| Backend + DB     | Supabase                   | PostgreSQL, Auth, Storage, API   |
| Shared Code      | TypeScript package         | Types, constants, utils dùng chung |
| Deploy Frontend  | Vercel                     | 2 projects từ 1 monorepo        |
| Deploy Backend   | Supabase Cloud             | Free tier                        |
| Monorepo         | npm workspaces             | Đơn giản, không cần Turborepo   |

## Domains (dự kiến)
- Client: `blog.yourdomain.com`
- Admin: `admin.yourdomain.com`

## Người phát triển
- 1 Frontend Developer (ReactJS)
- Chưa có kinh nghiệm backend/database → sử dụng Supabase (BaaS)
