# Architecture

## Sơ đồ tổng quan

```
┌─────────────────┐     ┌─────────────────┐
│   Client App    │     │   Admin App     │
│   (Next.js)     │     │   (Next.js)     │
│   Public blog   │     │   Protected     │
└────────┬────────┘     └────────┬────────┘
         │                       │
         │    ┌──────────────┐   │
         └────┤   Shared     ├───┘
              │   Package    │
              │  (types,     │
              │   utils)     │
              └──────┬───────┘
                     │
              ┌──────▼───────┐
              │   Supabase   │
              │  ┌─────────┐ │
              │  │ Postgres │ │
              │  │   Auth   │ │
              │  │ Storage  │ │
              │  │   API    │ │
              │  └─────────┘ │
              └──────────────┘
```

## Monorepo Structure

```
my-blog/
  ├── /docs                     ← Documentation toàn dự án
  ├── /apps
  │     ├── /client             ← Next.js client app
  │     └── /admin              ← Next.js admin app
  ├── /packages
  │     └── /shared             ← Shared types, utils, constants
  └── package.json              ← npm workspaces root
```

## Deploy Strategy

| App    | Platform | Root Directory | Domain                  |
| ------ | -------- | -------------- | ----------------------- |
| Client | Vercel   | apps/client    | blog.yourdomain.com     |
| Admin  | Vercel   | apps/admin     | admin.yourdomain.com    |

## Data Flow

### Client (Read-heavy)
1. User truy cập blog → Next.js SSR/SSG render page
2. Page gọi Supabase SDK → lấy data (posts, categories, trades...)
3. Hiển thị UI với Ant Design components

### Admin (Read + Write)
1. Admin login → Supabase Auth xác thực
2. Admin thao tác CRUD → Supabase SDK gọi database
3. Data cập nhật → Client tự động có data mới

### Onchain Data (Mở rộng sau)
1. Next.js API Route gọi API bên thứ 3 (giấu API key)
2. Hoặc embed iframe từ TradingView, Dune Analytics...
