# Current Progress

> Cập nhật mỗi khi kết thúc phiên làm việc.
> Gửi file này cho Claude khi bắt đầu chat mới, hoặc paste vào Project Instructions.

## Trạng thái hiện tại
**Phase:** 8 — UI Improvements ✅ HOÀN THÀNH
**Trạng thái:** Trades CRUD hoàn chỉnh, bảng 17 cột + 6 bộ lọc, tài khoản giao dịch

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
- [2026-03-04] Fix TypeScript: thêm `placeholder` vào `RichEditorProps` interface

#### RSS Feed + Analytics
- [2026-03-04] `apps/client/src/app/feed.xml/route.ts` — RSS 2.0, cache 1h
- [2026-03-04] Vercel Analytics — `<Analytics />` vào root layout client

#### Deploy Production ✅
- [2026-03-04] Fix build errors, deploy thành công
- [2026-03-04] **Production URLs:**
  - Client: `https://phuocpm19.vercel.app`
  - Admin: `https://phuocpm19-admin.vercel.app`

### Phase 7 — Trading Reports Overhaul ✅

#### Database
- [2026-03-07] Thêm cột `pair` (TEXT) vào bảng `trading_reports`
- [2026-03-07] Cập nhật RLS: thay "Public read published reports" → "Public read all reports" (`USING (true)`)
- [2026-03-07] Update tất cả report cũ: `SET status = 'published'`

#### Shared Types
- [2026-03-07] `packages/shared/src/index.ts` — thêm `pair: string | null` vào `TradingReport` interface

#### Admin — Trading Reports (/admin/trading-reports)
- [2026-03-07] `page.tsx` — layout 2 cột: Báo cáo gần đây (col-10) + Tất cả báo cáo (col-14)
- [2026-03-07] Recent panels: 3 cột trong panel trái
  - Cột 1: Hôm nay / Hôm qua / Hôm kia (theo ngày)
  - Cột 2: Session 1 / Session 3 / Session 5
  - Cột 3: Session 2 / Session 4
  - Card cố định 5 item, border/màu theo session
  - Click tên → mở modal xem chi tiết
- [2026-03-07] Bộ lọc: tìm tên + DatePicker ngày + Select cặp (BTC/ETH/XAU) + Select session — bỏ filter trạng thái
- [2026-03-07] Bảng: cột Tiêu đề / Ngày / Cặp / Session / Hành động — bỏ cột trades/trạng thái
- [2026-03-07] Hành động: Xem (modal) + Xuất .txt + Sửa + Xóa
- [2026-03-07] Click tiêu đề → mở modal xem chi tiết
- [2026-03-07] Export .txt: tên file `Report_YYYYMMDD_BTC_Session1.txt`, nội dung plain text
- [2026-03-07] Modal xem: Descriptions (tiêu đề/ngày/cặp/session) + `<pre>` render nội dung
- [2026-03-07] `ReportForm.tsx` — thay RichEditor bằng `Input.TextArea` (monospace, maxHeight 600px)
  - Layout: info card sticky bên trái (col-8) + textarea bên phải (col-16)
  - Tên báo cáo tự động generate từ ngày+cặp+session (read-only)
  - Ngày mặc định hôm nay, cặp mặc định BTC
  - Select session (Session 1-5), Select cặp (BTC/ETH/XAU)
  - Lưu với `status: 'published'` — bỏ nút Lưu nháp

#### Client — Homepage
- [2026-03-07] `HomePage.tsx` — Trading Reports gần đây: 2 cột → 3 cột, limit 4 → 6
- [2026-03-07] Card content mới: Ngày + Tag Cặp + Tag Session + Tiêu đề (bỏ preview nội dung)
- [2026-03-07] Fix `sessionColors` từ `SS1/SS2` → `Session 1/Session 2`
- [2026-03-07] Bỏ filter `.eq('status', 'published')` khỏi report queries

#### Client — Trading Reports (/trading-reports)
- [2026-03-07] `ReportsClient.tsx` — redesign toàn bộ
- [2026-03-07] Phần trên: Recent panels 2 hàng
  - Hàng 1 (5 cột đều): Hôm nay / 06/03 / 05/03 + 2 cột trống
  - Hàng 2 (5 cột đều): Session 1 → Session 5
  - Card cố định 5 item (32px/item), border màu theo session
  - Click tên → link đến trang chi tiết
- [2026-03-07] Phần dưới: bộ lọc (tên + ngày + cặp + session) + danh sách 3 cột
- [2026-03-07] Card content: Ngày + Tag Cặp + Tag Session + Tiêu đề
- [2026-03-07] PAGE_SIZE 10 → 9 (chia hết 3 cột)

---

### Phase 8 — UI Improvements ✅

#### Client — /trading-reports
- [2026-03-09] ReportsClient: hàng 1 recent panels đổi "05/03" → card "Daily Handoff" (5 item gần nhất, tím)
- [2026-03-09] ReportsClient: bổ sung bộ lọc "Loại báo cáo" (Session / Daily Handoff)
- [2026-03-09] ReportDetailClient: đổi render content từ `dangerouslySetInnerHTML` → `<pre whiteSpace:pre-wrap>` (fix vỡ layout plain text)
- [2026-03-09] ReportDetailClient: fix sessionColors key SS1→Session 1, bỏ filter status=published

#### Client — /tools
- [2026-03-09] ToolsClient: thêm tab "📊 Giá → RR" ở giữa (3 tab: Giá→Lot / Giá→RR / Lot→SL/TP)
- [2026-03-09] Tab Giá→RR: input vốn + lot + entry + SL + TP → tính RR, % risk SL/TP, dollar SL/TP

#### Admin — /trading-reports
- [2026-03-09] ReportForm: thêm field "Loại báo cáo" (Session / Daily Handoff) — chia 50/50 với Tên báo cáo
- [2026-03-09] ReportForm: Daily Handoff → title format "YYYYMMDD BTC Daily Handoff", disable Session field
- [2026-03-09] ReportForm: khi edit — tự detect loại từ title (endsWith 'Daily Handoff'), set state đúng
- [2026-03-09] ReportForm: fix TypeScript lỗi onChange DatePicker/Select — dùng `() => updateTitle()`
- [2026-03-09] page.tsx: cột Session trong bảng — hiển thị Tag "Daily Handoff" khi session null
- [2026-03-09] page.tsx: recent panels cột 1 — giữ Hôm nay + Hôm qua, đổi Hôm kia → "Daily Handoff"
- [2026-03-09] page.tsx: pageSize bảng 8 → 20
- [2026-03-09] page.tsx: bổ sung bộ lọc "Loại báo cáo" (Session / Daily Handoff)

#### Admin — Tài khoản giao dịch (/admin/trading-accounts) — MỚI
- [2026-03-09] Tạo bảng `trading_accounts` trên Supabase (id, name, platform, account_name, account_type) + RLS
- [2026-03-09] Tạo trang `/admin/trading-accounts/page.tsx` — CRUD đầy đủ
- [2026-03-09] Bộ lọc: tên tài khoản + nền tảng + loại tài khoản
- [2026-03-09] Popup tạo/sửa: auto-generate tên theo format "Platform AccountType AccountName"
- [2026-03-09] Nền tảng Exness: Pro - USD / Pro - VND; FTMO: 12 loại (10K/25K/50K/100K/200K × Step1/Step2/Live)
- [2026-03-09] Thêm menu "Tài khoản" (WalletOutlined) vào admin layout — chỉ admin thấy

#### Admin — /trades
- [2026-03-09] Thêm cột DB: title, account_name, entry_order, order_status, actual_entry_price, open_time, actual_exit_price, close_time, swap, actual_pnl, trade_code
- [2026-03-09] Modal form 9 hàng:
  - H1: Tên GD (read-only auto) | Ngày | Lần vào lệnh
  - H2: Nền tảng | Tên tài khoản (select từ trading_accounts) | Trạng thái lệnh
  - H3: Cặp | Vị thế | Khối lượng
  - H4: Entry | Entry TT | Thời gian mở
  - H5: Giá đóng | Giá đóng TT | Thời gian đóng
  - H6: Stop Loss | Take Profit | Mã giao dịch
  - H7: PnL | Phí GD | Phí qua đêm | PnL TT
  - H8: Trading Report | Lý do đóng lệnh (Stop Loss / Take Profit / Thủ công)
  - H9: Lý do vào lệnh (textarea 5 rows) | Bài học rút ra (textarea 5 rows)
- [2026-03-09] Auto-generate title: "YYYYMMDD CẶP VỊ_THẾ LẦN_VÀO TÊN_TÀI_KHOẢN"
- [2026-03-09] Bộ lọc 6 field: tên GD + ngày + nền tảng + trạng thái + cặp + vị thế + nút xóa ✕
- [2026-03-09] Bảng 17 cột: scroll ngang, Ngày+Tên fixed trái, Actions fixed phải
  - Ngày / Tên GD / Cặp / Vị thế / Trạng thái / Entry / Entry TT / T.g mở / Exit / Exit TT / T.g đóng / SL / TP / PnL / Phí GD / Phí ĐM / PnL TT

---

## Bước tiếp theo
- [ ] Giscus comments (repo: phuocpm19/my-blog)
- [ ] Copy code button trong bài viết
- [ ] Open Graph images (auto-generated per post)
- [ ] Thêm công cụ: Pip Value Calculator, Margin Calculator

---

## Env Variables

### apps/client/.env.local
```
NEXT_PUBLIC_SUPABASE_URL=https://ybedctecxhmswgfycnvf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_6SIKt4jSkaGZXp20pryvJA_FHI3PF6t
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### apps/admin/.env.local
```
NEXT_PUBLIC_SUPABASE_URL=https://ybedctecxhmswgfycnvf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_6SIKt4jSkaGZXp20pryvJA_FHI3PF6t
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
NEXT_PUBLIC_CLIENT_URL=http://localhost:3000
```

### Vercel — my-blog-admin
```
NEXT_PUBLIC_SUPABASE_URL=https://ybedctecxhmswgfycnvf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_6SIKt4jSkaGZXp20pryvJA_FHI3PF6t
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
NEXT_PUBLIC_CLIENT_URL=https://phuocpm19.vercel.app
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
  _components/HomePage.tsx            ← 3 cột reports, no content preview
  posts/
    page.tsx                          ← Bọc PostsPageClient trong <Suspense>
    _components/PostsClient.tsx       ← tag filter + badge
    [slug]/_components/
      PostDetailClient.tsx            ← TOC fixed trái, right sidebar fixed,
                                         related posts, reading time
  trading-reports/
    page.tsx
    _components/ReportsClient.tsx     ← recent panels + filter + 3-col grid
    [id]/_components/ReportDetailClient.tsx
  trading-dashboard/...
  tools/_components/ToolsClient.tsx
components/
  ClientLayout.tsx / Navbar.tsx / Footer.tsx / ThemeContext.tsx / SearchModal.tsx
lib/supabase.ts
app/globals.css
```

### Admin (apps/admin/src/)
```
app/
  layout.tsx / login/page.tsx
  api/admin/users/route.ts
  (admin)/
    layout.tsx                        ← Role-based menu
    page.tsx                          ← Dashboard
    categories/page.tsx / tags/page.tsx
    posts/...
    trading-reports/
      page.tsx                        ← 2-col layout: recent panels + table
      _components/ReportForm.tsx      ← TextArea editor, auto title, pair/session select
      new/page.tsx / [id]/edit/page.tsx
    trading-accounts/page.tsx         ← CRUD tài khoản, auto-gen name
    trades/page.tsx                   ← 17-col table, 6 bộ lọc, modal 9 hàng
    users/page.tsx
lib/
  supabase.ts
  auth-context.tsx
```

### Packages
```
packages/shared/src/index.ts          ← TradingReport có thêm pair: string | null
```

### Supabase
- Project URL: https://ybedctecxhmswgfycnvf.supabase.co
- Tables: categories, tags, posts, post_tags, trading_reports (+ cột pair), trades (+ 11 cột mới), trading_accounts, user_roles
- Storage: bucket `post-images` (public) + 3 policies
- RLS trading_reports: "Public read all reports" (`USING (true)`) — không còn filter status

---

## Quy ước & Gotchas
- Node.js v20 (via nvm)
- `body` cần `suppressHydrationWarning` (do Grammarly extension)
- Supabase client đặt trong mỗi app (`apps/*/src/lib/supabase.ts`), không đặt trong shared
- Admin dùng route group `(admin)` để tách layout login vs dashboard
- Client dùng shared types via `import from 'shared'`
- Trang Tools dùng native HTML + inline styles (không dùng Ant Design)
- Style input: dùng `borderWidth/borderStyle/borderColor` riêng biệt, KHÔNG dùng shorthand
- Ant Design `<Divider>`: KHÔNG dùng `orientation="left"/"right"` (deprecated 5.x) — chỉ dùng `"center"` hoặc bỏ prop
- Ant Design `<Space direction="vertical">` deprecated — dùng `<div style={{ display: 'flex', flexDirection: 'column', gap: N }}>`
- TipTap `useEditor`: cần `immediatelyRender: false` để tránh SSR hydration error
- TipTap `setContent`: dùng `{ emitUpdate: false }` thay vì `false` (TypeScript strict)
- `position: fixed` phải đặt NGOÀI ancestor có `overflow: hidden` mới hoạt động đúng
- ScrollToTop dùng `opacity + pointerEvents` thay vì `if/return null` để tránh mất event listener
- `useFixedPosition` hook tính vị trí fixed từ `articleRef.getBoundingClientRect()` cho cả TOC (left) và right sidebar (right)
- API route `/api/admin/users` dùng `SUPABASE_SERVICE_ROLE_KEY` — chỉ server-side, không expose ra client
- `auth-context.tsx`: KHÔNG dùng `getSession` + `onAuthStateChange` cùng lúc — gây race condition. Chỉ dùng `onAuthStateChange` (tự fire `INITIAL_SESSION`)
- `useSearchParams()` trong Next.js phải bọc trong `<Suspense>` ở page.tsx nếu không sẽ lỗi build
- Trading Reports KHÔNG dùng RichEditor — dùng `Input.TextArea` (monospace) vì dữ liệu gốc là .txt
- `trading_reports.status` vẫn tồn tại trong DB nhưng không dùng trong UI — luôn lưu `status: 'published'`
- Supabase import: dùng `supabase` singleton trực tiếp, KHÔNG dùng `createClient()` factory
- Trading Reports: loại báo cáo detect từ title — endsWith('Daily Handoff') → type='Daily Handoff', ngược lại → 'Session'
- Trades form: `account_name` lưu TEXT (tên tài khoản), không lưu UUID — để tiện hiển thị không cần join
- `trading_accounts.name` = auto-generate từ "Platform AccountType AccountName" ở thời điểm tạo