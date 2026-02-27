# Current Progress

> Cập nhật mỗi khi kết thúc phiên làm việc.
> Gửi file này cho Claude khi bắt đầu chat mới.

## Trạng thái hiện tại
**Phase:** 4 — Polish & Deploy
**Đang làm:** SEO, global search, Trading Dashboard, deploy Vercel

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

### Phase 2 — Admin Core ✅
- [2026-02-25] Admin authentication (login/logout) với Supabase Auth
- [2026-02-25] Admin layout (sidebar, header, route group)
- [2026-02-25] Admin dashboard với stats từ database
- [2026-02-25] CRUD Categories (list, search, create, edit, delete + auto slug)
- [2026-02-26] CRUD Tags (list, search, create, edit, delete + auto slug)
- [2026-02-26] CRUD Posts (list, search, filter, create, edit, delete + TipTap editor + tags + category)
- [2026-02-26] CRUD Trading Reports (list, search, filter, create, edit, delete + DatePicker + session)
- [2026-02-26] CRUD Trades (list, search, filter, create, edit, delete + summary bar + PnL/winrate)

### Phase 3 — Client App ✅
- [2026-02-27] Public layout (responsive Navbar + Footer + ClientLayout wrapper)
- [2026-02-27] Homepage với real Supabase data (stats, recent posts, recent reports)
- [2026-02-27] Blog listing page (/posts) — search, category filter, pagination
- [2026-02-27] Blog detail page (/posts/[slug]) — content, tags, related posts
- [2026-02-27] Trading Reports listing (/trading-reports) — search, session filter, pagination
- [2026-02-27] Trading Report detail (/trading-reports/[id]) — content, trades table, PnL summary

### Phase 4 — Polish & Deploy (in progress)
- [2026-02-27] SEO metadata — root layout (OG, Twitter, title template), per-page static metadata, dynamic generateMetadata cho post/report detail
- [2026-02-27] Global Search — SearchModal (Ctrl+K), debounced search across posts + trading reports, keyboard navigation
- [2026-02-27] Trading Dashboard — time range filter, stats (PnL, win rate, profit factor), cumulative PnL chart, pair breakdown, long/short performance
- [2026-02-27] Content styles — .post-content CSS (headings, code, blockquote, table, images)
- [2026-02-27] Refactored all pages: server component (metadata) + client component (interactive) pattern

## Đang làm
- Phase 4 — Polish & Deploy (finishing up)

## Bước tiếp theo
- [ ] Deploy lên Vercel + test production
- [ ] (Optional) Thêm Open Graph images
- [ ] (Optional) Sitemap.xml + robots.txt

## Cấu trúc hiện tại

### Client (apps/client/src/)
```
app/
  layout.tsx                ← Root layout + AntdRegistry + ClientLayout + SEO metadata
  page.tsx                  ← Homepage (server → _components/HomePage.tsx)
  _components/
    HomePage.tsx            ← Homepage client component
  posts/
    page.tsx                ← Blog listing (server + metadata)
    _components/
      PostsClient.tsx       ← Posts list client component
    [slug]/
      page.tsx              ← Blog detail (server + generateMetadata)
      _components/
        PostDetailClient.tsx ← Post detail client component
  trading-reports/
    page.tsx                ← Reports listing (server + metadata)
    _components/
      ReportsClient.tsx     ← Reports list client component
    [id]/
      page.tsx              ← Report detail (server + generateMetadata)
      _components/
        ReportDetailClient.tsx ← Report detail client component
  trading-dashboard/
    page.tsx                ← Dashboard (server + metadata)
    _components/
      DashboardClient.tsx   ← Dashboard client component
components/
  Navbar.tsx                ← Responsive navbar + search button + Ctrl+K
  Footer.tsx                ← Footer với links
  ClientLayout.tsx          ← Layout wrapper (Navbar + Content + Footer)
  SearchModal.tsx           ← Global search modal (posts + reports)
lib/
  supabase.ts               ← Supabase client (lazy init)
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
- Client dùng shared types via `import from 'shared'`