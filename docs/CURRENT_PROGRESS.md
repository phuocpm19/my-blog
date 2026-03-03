# Current Progress

> Cập nhật mỗi khi kết thúc phiên làm việc.
> Gửi file này cho Claude khi bắt đầu chat mới.

## Trạng thái hiện tại
**Phase:** 5 — Extensions (đang mở rộng)
**Trạng thái:** Project cơ bản hoàn thành, đang thêm tính năng UX cho trang bài viết

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

### Phase 4 — Polish & Deploy ✅
- [2026-02-27] SEO metadata — root layout (OG, Twitter, title template), per-page static metadata, dynamic generateMetadata cho post/report detail
- [2026-02-27] Global Search — SearchModal (Ctrl+K), debounced search across posts + trading reports, keyboard navigation
- [2026-02-27] Trading Dashboard — time range filter, stats (PnL, win rate, profit factor), cumulative PnL chart, pair breakdown, long/short performance
- [2026-02-27] Content styles — .post-content CSS (headings, code, blockquote, table, images)
- [2026-02-27] Refactored all pages: server component (metadata) + client component (interactive) pattern
- [2026-02-27] Sitemap.xml (dynamic, fetch posts + reports từ Supabase) + robots.txt
- [2026-02-27] Supabase client lazy init (fix build crash khi thiếu env vars)
- [2026-02-27] Deploy lên Vercel — cả client + admin build thành công

### Phase 5 — Extensions (đang làm)
- [2026-03-03] Trang Công cụ (/tools) — position size calculator với 2 chế độ:
  - **Giá → Lot**: tính khối lượng từ entry/SL/TP + risk %
  - **Lot → SL/TP**: tính giá SL/TP từ volume + RR
  - Hỗ trợ BTC/USD, ETH/USD, XAU/USD trên Exness & FTMO
  - Validation SL/TP theo chiều Buy/Sell (border đỏ + error message)
  - TP tuỳ chọn — RR chỉ hiện khi nhập đủ SL + TP
  - Result card luôn hiện (— khi chưa nhập), cập nhật real-time
  - UI dark theme, không dùng Ant Design (native HTML + inline styles)
  - Kết quả hiển thị 2 hàng: hàng 1 (price change + %), hàng 2 ($ amount, to hơn, căn giữa)
- [2026-03-03] RichEditor (admin) — thêm nút **HTML** ở toolbar, mở modal với TextArea để paste/import HTML trực tiếp vào TipTap editor
- [2026-03-03] PostDetailClient — Reading time ✅ hiển thị "X phút đọc" cạnh meta
- [2026-03-03] PostDetailClient — Table of Contents ✅ hiển thị đúng, active heading tracking hoạt động, TOC nằm bên trái bài viết

## 🚧 Đang làm dở — CẦN FIX Ở CHAT MỚI

### 1. Scroll-to-top button (CHƯA HIỂN THỊ)
- Button định nghĩa trong `ClientLayout.tsx`, đặt ngoài `<Layout>` (sau thẻ đóng `</Layout>`)
- Scroll event **đã hoạt động** (verified qua console: `ClientLayout scroll: 3276...`)
- `window.scrollY` cập nhật đúng
- **Vấn đề:** Button không hiển thị dù đã scroll > 400px, dù dùng `if (!visible) return null` hay `opacity: 0`
- **Đã thử:** createPortal vào document.body, opacity toggle, if/return null — đều không hiệu quả
- **Nghi ngờ:** Ant Design Layout (`<Layout>`) tạo stacking context che button dù nằm ngoài `<Layout>`
- **Chưa thử:** Đặt button trong `Navbar.tsx` (vốn đã fixed) hoặc trong `app/layout.tsx` (root layout ngoài hoàn toàn Ant Design)

### 2. TOC sticky (CHƯA HOẠT ĐỘNG)
- TOC chỉ xuất hiện ở trên cùng khi load trang, không sticky khi scroll xuống
- TOC element tìm thấy đúng qua querySelector, parent overflow = `visible` (đã verify qua console)
- **Vấn đề:** `position: sticky` không hoạt động trong flex container của Ant Design `<Content>`
- **Đã thử:** `alignSelf: flex-start`, `height: 100%` trên flex container, tách sticky ra wrapper div riêng
- **Chưa thử:** Dùng `position: fixed` + tính toán top/left thủ công thay vì sticky

### 3. Reading Progress Bar (TẠM BỎ QUA)
- Bar render đúng (thấy khi scroll lên), nhưng mất khi scroll xuống
- **Nguyên nhân nghi ngờ:** Navbar có z-index cao hơn che bar
- **Ý tưởng thay thế từ user:** Bỏ progress bar ngang ở top, thay bằng highlight heading đang đọc trong TOC (đã có active tracking, chỉ cần style tốt hơn) — tuy nhiên ưu tiên thấp, giải quyết sau khi fix xong sticky và scroll-to-top

## Bước tiếp theo (sau khi fix xong)
- [ ] Commit + push lên GitHub
- [ ] Open Graph images (auto-generated per post)
- [ ] RSS feed
- [ ] Dark mode
- [ ] Comments system (Giscus hoặc Supabase-based)
- [ ] Analytics (Vercel Analytics hoặc Umami)
- [ ] Thêm công cụ: Pip Value Calculator
- [ ] Thêm công cụ: Margin Calculator

## Cấu trúc hiện tại

### Client (apps/client/src/)
```
app/
  layout.tsx                ← Root layout + AntdRegistry + ClientLayout + SEO metadata
  page.tsx                  ← Homepage (server → _components/HomePage.tsx)
  sitemap.ts                ← Dynamic sitemap (fetches posts + reports from Supabase)
  robots.ts                 ← robots.txt configuration
  _components/
    HomePage.tsx            ← Homepage client component
  posts/
    page.tsx                ← Blog listing (server + metadata)
    _components/
      PostsClient.tsx       ← Posts list client component
    [slug]/
      page.tsx              ← Blog detail (server + generateMetadata)
      _components/
        PostDetailClient.tsx ← Post detail client component (TOC + reading time)
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
  tools/
    page.tsx                ← Công cụ giao dịch (server + metadata)
    _components/
      ToolsClient.tsx       ← Calculator UI (native HTML, dark theme, no Antd)
components/
  Navbar.tsx                ← Responsive navbar + search button + Ctrl+K
  Footer.tsx                ← Footer với links
  ClientLayout.tsx          ← Layout wrapper (Navbar + Content + Footer) + ScrollToTop (đang fix)
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
        RichEditor.tsx  ← TipTap rich text editor + nút HTML import/export
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
- Scroll-to-top button không hiển thị (xem mục 🚧 bên trên)
- TOC không sticky (xem mục 🚧 bên trên)

## Quy ước
- Node.js v20 (via nvm)
- body cần suppressHydrationWarning (do Grammarly extension)
- Supabase client đặt trong mỗi app (apps/*/src/lib/supabase.ts), không đặt trong shared
- Admin dùng route group (admin) để tách layout login vs dashboard
- Client dùng shared types via `import from 'shared'`
- Trang Tools dùng native HTML + inline styles (không dùng Ant Design) để tránh conflict styling
- Style input: dùng `borderWidth/borderStyle/borderColor` riêng biệt, KHÔNG dùng shorthand `border` kết hợp với `borderColor` trong cùng object (React warning)
- Ant Design `<Divider>` dùng `type="vertical"` KHÔNG dùng `orientation="vertical"`
- Ant Design `<Layout>` tạo stacking context — cẩn thận với `position: fixed` và `position: sticky` bên trong