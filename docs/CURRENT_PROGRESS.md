# Current Progress

> Cập nhật mỗi khi kết thúc phiên làm việc.
> Gửi file này cho Claude khi bắt đầu chat mới.

## Trạng thái hiện tại
**Phase:** 2 — Admin Core
**Đang làm:** CRUD Categories (tiếp theo)

## Đã hoàn thành

### Phase 1 — Setup & Foundation ✅
- [2026-02-25] Thảo luận ý tưởng, chốt stack: Next.js + Antd + Supabase + Vercel
- [2026-02-25] Tạo monorepo structure (npm workspaces)
- [2026-02-25] Tạo bộ documentation (docs/)
- [2026-02-25] Setup Next.js + Antd cho client app (port 3000)
- [2026-02-25] Setup Next.js + Antd cho admin app (port 3001)
- [2026-02-25] Shared package với TypeScript types (packages/shared)
- [2026-02-25] Tạo Supabase project (region: Singapore)
- [2026-02-25] Tạo database tables (6 bảng) + RLS policies + sample data
- [2026-02-25] Kết nối Supabase SDK với client app — test thành công
- [2026-02-25] Deploy demo lên Vercel (2 projects từ 1 repo)

### Phase 2 — Admin Core (đang làm)
- [2026-02-25] Admin authentication (login/logout) với Supabase Auth
- [2026-02-25] Admin layout (sidebar, header, route group)
- [2026-02-25] Admin dashboard với stats từ database
- [2026-02-25] CRUD Categories (list, search, create, edit, delete + auto slug)
- [2026-02-26] CRUD Tags (list, search, create, edit, delete + auto slug)
- [2026-02-26] CRUD Posts (list, search, filter, create, edit, delete + TipTap editor + tags + category)
- [2026-02-26] CRUD Trading Reports (list, search, filter, create, edit, delete + DatePicker + session)
- [2026-02-26] CRUD Trades (list, search, filter, create, edit, delete + summary bar + PnL/winrate)

## Đang làm
- Phase 2 hoàn thành! Chuẩn bị Phase 3 — Client App

## Bước tiếp theo
- [x] ~~CRUD Trades~~
- [x] ~~CRUD Trading Reports~~
- [x] ~~CRUD Posts (với rich text editor)~~
- [x] ~~CRUD Tags~~
- [x] ~~CRUD Categories (list, create, edit, delete)~~
- [ ] CRUD Posts (với rich text editor)
- [ ] CRUD Trading Reports
- [ ] CRUD Trades

## Cấu trúc hiện tại

### Client (apps/client/src/)
```
app/
  layout.tsx          ← Root layout + AntdRegistry
  page.tsx            ← Homepage (demo + Supabase test)
lib/
  supabase.ts         ← Supabase client
```

### Admin (apps/admin/src/)
```
app/
  layout.tsx          ← Root layout + AntdRegistry + AuthProvider
  login/page.tsx      ← Login page
  (admin)/
    layout.tsx        ← Sidebar + Header layout
    page.tsx          ← Dashboard
    categories/page.tsx ← CRUD Categories
    tags/page.tsx       ← CRUD Tags
    posts/
      page.tsx          ← Posts list
      new/page.tsx      ← Tạo bài mới
      [id]/edit/page.tsx ← Chỉnh sửa bài
      _components/
        RichEditor.tsx  ← TipTap rich text editor
        PostForm.tsx    ← Shared form (create/edit)
    trading-reports/
      page.tsx          ← Reports list
      new/page.tsx      ← Tạo report mới
      [id]/edit/page.tsx ← Chỉnh sửa report
      _components/
        ReportForm.tsx  ← Shared form (create/edit)
    trades/
      page.tsx          ← CRUD Trades (modal-based)
lib/
  supabase.ts         ← Supabase client
  auth-context.tsx    ← Auth context provider
```

### Supabase
- Project URL: https://ybedctecxhmswgfycnvf.supabase.co
- Tables: categories, tags, posts, post_tags, trading_reports, trades
- RLS: Public read (published only) + Admin write (authenticated)
- Sample data: 4 categories, 6 tags

## Blocker / Vấn đề cần giải quyết
- (Chưa có)

## Quy ước
- Node.js v20 (via nvm)
- body cần suppressHydrationWarning (do Grammarly extension)
- Supabase client đặt trong mỗi app (apps/*/src/lib/supabase.ts), không đặt trong shared
- Admin dùng route group (admin) để tách layout login vs dashboard