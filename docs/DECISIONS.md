# Decisions Log

> Ghi lại các quyết định kỹ thuật quan trọng và lý do đằng sau chúng.
> Format: [Ngày] Quyết định — Lý do

## Stack & Architecture

### [2026-02-25] Monorepo với npm workspaces
- **Quyết định:** Gộp client + admin vào 1 repo, dùng npm workspaces
- **Lý do:** 1 người phát triển, shared code (types, utils), dễ quản lý. Vercel hỗ trợ tốt monorepo.
- **Thay thế đã cân nhắc:** 2 repo riêng → phức tạp khi sync shared code

### [2026-02-25] Next.js cho cả Client và Admin
- **Quyết định:** Dùng Next.js (App Router) cho cả 2 app
- **Lý do:** SSR/SSG cho SEO (client blog). Thống nhất stack, không cần học 2 framework.

### [2026-02-25] Ant Design (antd) thay vì Tailwind + shadcn/ui
- **Quyết định:** Dùng Ant Design làm UI library chính
- **Lý do:** Component đầy đủ (Table, Form, Layout, Charts...), hạn chế cài thêm library. Documentation chi tiết. Trade-off: bundle size lớn hơn → chấp nhận được cho personal blog.

### [2026-02-25] Supabase làm backend
- **Quyết định:** Dùng Supabase thay vì tự viết backend
- **Lý do:** Developer là frontend dev, chưa có kinh nghiệm backend. Supabase cung cấp DB + Auth + Storage + API sẵn, learning curve thấp.
- **Thay thế đã cân nhắc:** Headless CMS (Strapi) → thiếu linh hoạt cho trading features. Full-stack tự viết → quá phức tạp hiện tại.

## Conventions

### [2026-02-25] Code conventions
- **TypeScript:** Strict mode
- **Naming:** camelCase cho variables/functions, PascalCase cho components, kebab-case cho files/folders
- **Commit messages:** Conventional Commits format (feat:, fix:, docs:, chore:)
