# Current Progress

> Cập nhật mỗi khi kết thúc phiên làm việc.
> Gửi file này cho Claude khi bắt đầu chat mới.

## Trạng thái hiện tại
**Phase:** 6 — Admin Enhancements + Technical Improvements
**Trạng thái:** Hoàn thành phân quyền, image upload, RSS feed, sidebar bài viết, bài viết liên quan

---

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
- [2026-02-27] SEO metadata — root layout (OG, Twitter, title template), per-page static metadata, dynamic generateMetadata
- [2026-02-27] Global Search — SearchModal (Ctrl+K), debounced search across posts + trading reports, keyboard navigation
- [2026-02-27] Trading Dashboard — time range filter, stats, cumulative PnL chart, pair breakdown
- [2026-02-27] Content styles — .post-content CSS (headings, code, blockquote, table, images)
- [2026-02-27] Refactored all pages: server component (metadata) + client component (interactive) pattern
- [2026-02-27] Sitemap.xml (dynamic) + robots.txt
- [2026-02-27] Supabase client lazy init (fix build crash khi thiếu env vars)
- [2026-02-27] Deploy lên Vercel — cả client + admin build thành công

### Phase 5 — Extensions ✅
- [2026-03-03] Trang Công cụ (/tools) — position size calculator 2 chế độ (Giá→Lot, Lot→SL/TP), hỗ trợ BTC/ETH/XAU trên Exness & FTMO
- [2026-03-03] RichEditor — nút HTML import/export ở toolbar
- [2026-03-03] PostDetailClient — Reading time "X phút đọc"
- [2026-03-03] PostDetailClient — TOC fixed bên trái, active heading tracking
- [2026-03-04] TOC — border/card style giống right sidebar
- [2026-03-04] Scroll-to-top button — opacity pattern, sát cạnh phải bài viết
- [2026-03-04] Dark mode — ThemeContext + localStorage + auto-detect system preference
- [2026-03-04] Dark mode — Ant Design darkAlgorithm, Navbar toggle (desktop + mobile), Footer, post content CSS
- [2026-03-04] globals.css — overflow-x hidden, box-sizing fix, loại bỏ duplicate rules
- [2026-03-04] Tags clickable → /posts?tag=slug
- [2026-03-04] PostsClient — filter theo tag từ URL ?tag=, badge "Đang lọc theo tag ✕"
- [2026-03-04] PostDetailClient — Right sidebar fixed bên phải (Tags + Bài viết mới nhất 5 bài)
- [2026-03-04] PostDetailClient — Bài viết liên quan cuối trang (ưu tiên chung tag → fallback cùng category, tối đa 4 bài)
- [2026-03-04] useFixedPosition hook — dùng chung cho TOC (left) và right sidebar (right)
- [2026-03-04] Navbar tab "Dashboard" → "Trading History" (client)

### Phase 6 — Admin Enhancements + Technical ✅

#### Phân quyền RBAC
- [2026-03-04] Bảng `user_roles` trong Supabase (role: admin | editor)
- [2026-03-04] RLS policies cho user_roles (user đọc role của mình)
- [2026-03-04] AuthContext: thêm `role`, `isAdmin` vào context
- [2026-03-04] Admin layout: menu ẩn/hiện theo role
  - Editor: Dashboard, Categories, Tags, Posts
  - Admin: tất cả + Trading Reports, Trades, Quản lý Users
- [2026-03-04] Trang `/admin/users`: tạo/xóa/đổi role user (chỉ admin thấy)
- [2026-03-04] API route `/api/admin/users` (GET/POST/DELETE/PATCH) dùng service_role key
- [2026-03-04] Tài khoản: `phuocpm19@gmail.com` (admin), `ngocminhmilita@gmail.com` (editor)
- [2026-03-04] Navbar dropdown user hiển thị Tag role (Admin đỏ / Biên tập viên xanh)

#### Image Upload
- [2026-03-04] Supabase Storage bucket `post-images` (public) + 3 RLS policies
- [2026-03-04] RichEditor: nút 🖼 modal 2 tab — Upload (kéo thả ≤5MB) + URL
- [2026-03-04] Fix SSR: `immediatelyRender: false`
- [2026-03-04] Fix sync content khi edit bài cũ: `useEffect` + `setContent({ emitUpdate: false })`
- [2026-03-04] Fix Divider warning: `orientation="vertical"`

#### RSS Feed
- [2026-03-04] `apps/client/src/app/feed.xml/route.ts`
- [2026-03-04] 20 bài mới nhất, XML chuẩn RSS 2.0, Cache 1 giờ
- [2026-03-04] Truy cập: `http://localhost:3000/feed.xml`

#### Vercel Analytics
- [2026-03-04] Cài `@vercel/analytics`, thêm `<Analytics />` vào root layout
- [2026-03-04] Chỉ hoạt động trên production Vercel

#### Khác
- [2026-03-04] Admin preview link bài viết dùng `NEXT_PUBLIC_CLIENT_URL` (đúng port client)

---

## 🚧 Vấn đề đang tồn tại

### Admin tabs loading mãi (Bài viết, Tags, Categories)
- SQL query trực tiếp trong Supabase trả về data đúng
- RLS policies OK (tất cả public SELECT)
- **Nghi ngờ:** `apps/admin/.env.local` thiếu hoặc sai `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Cần làm:** So sánh env vars admin với client, kiểm tra Network tab DevTools

---

## Bước tiếp theo
- [ ] Fix admin tabs loading (debug env vars)
- [ ] Deploy lên Vercel (client + admin)
- [ ] Giscus comments (repo: phuocpm19/my-blog)
- [ ] Copy code button trong bài viết
- [ ] Open Graph images (auto-generated per post)
- [ ] Thêm công cụ: Pip Value Calculator, Margin Calculator

---

## Env Variables

### apps/client/.env.local
```
NEXT_PUBLIC_SUPABASE_URL=https://ybedctecxhmswgfycnvf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### apps/admin/.env.local
```
NEXT_PUBLIC_SUPABASE_URL=https://ybedctecxhmswgfycnvf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
NEXT_PUBLIC_CLIENT_URL=http://localhost:3000
```

---

## Cấu trúc file quan trọng

### Client (apps/client/src/)
```
app/
  layout.tsx                          ← Root layout + Analytics
  feed.xml/route.ts                   ← RSS Feed
  page.tsx                            ← Homepage
  sitemap.ts / robots.ts
  posts/
    _components/PostsClient.tsx       ← tag filter + badge
    [slug]/_components/
      PostDetailClient.tsx            ← TOC fixed trái, right sidebar fixed,
                                         related posts, reading time
  trading-reports/...
  trading-dashboard/...
  tools/_components/ToolsClient.tsx
components/
  ClientLayout.tsx                    ← scroll-to-top (opacity pattern)
  Navbar.tsx                          ← dark mode toggle, "Trading History" tab
  Footer.tsx                          ← dark mode aware
  ThemeContext.tsx                    ← dark mode context + localStorage
  SearchModal.tsx
lib/supabase.ts
app/globals.css                       ← overflow-x fix, dark mode overrides
```

### Admin (apps/admin/src/)
```
app/
  layout.tsx                          ← Root layout + AuthProvider
  login/page.tsx
  api/admin/users/route.ts            ← User management API (service_role)
  (admin)/
    layout.tsx                        ← Role-based menu
    page.tsx                          ← Dashboard
    categories/page.tsx
    tags/page.tsx
    posts/
      page.tsx                        ← preview link dùng NEXT_PUBLIC_CLIENT_URL
      new/page.tsx
      [id]/edit/page.tsx
      _components/
        RichEditor.tsx                ← Image upload + HTML import
        PostForm.tsx
    trading-reports/...
    trades/page.tsx
    users/page.tsx                    ← Quản lý users (chỉ admin)
lib/
  supabase.ts
  auth-context.tsx                    ← role + isAdmin
```

### Supabase
- Project URL: https://ybedctecxhmswgfycnvf.supabase.co
- Tables: categories, tags, posts, post_tags, trading_reports, trades, **user_roles**
- Storage: bucket `post-images` (public) + 3 policies
- RLS: Public read + Authenticated write + user_roles policies

---

## Quy ước & Gotchas
- Node.js v20 (via nvm)
- `body` cần `suppressHydrationWarning` (do Grammarly extension)
- Supabase client đặt trong mỗi app (`apps/*/src/lib/supabase.ts`), không đặt trong shared
- Admin dùng route group `(admin)` để tách layout login vs dashboard
- Client dùng shared types via `import from 'shared'`
- Trang Tools dùng native HTML + inline styles (không dùng Ant Design)
- Style input: dùng `borderWidth/borderStyle/borderColor` riêng biệt, KHÔNG dùng shorthand
- Ant Design `<Divider>` dùng `orientation="vertical"` (type deprecated từ Antd 5.x)
- TipTap `useEditor`: cần `immediatelyRender: false` để tránh SSR hydration error
- TipTap `setContent`: dùng `{ emitUpdate: false }` thay vì `false` (TypeScript strict)
- `position: fixed` phải đặt NGOÀI ancestor có `overflow: hidden` mới hoạt động đúng
- ScrollToTop dùng `opacity + pointerEvents` thay vì `if/return null` để tránh mất event listener
- `useFixedPosition` hook tính vị trí fixed từ `articleRef.getBoundingClientRect()` cho cả TOC (left) và right sidebar (right)
- API route `/api/admin/users` dùng `SUPABASE_SERVICE_ROLE_KEY` — chỉ server-side, không expose ra client