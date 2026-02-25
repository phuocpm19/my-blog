# My Blog

Personal blog & Trading journal — built with Next.js, Ant Design & Supabase.

## Structure

```
apps/client   → Public blog (reviews, trading reports, dashboard)
apps/admin    → Admin panel (manage content, trades)
packages/shared → Shared types & utilities
docs/         → Project documentation
```

## Getting Started

```bash
# Install dependencies (from root)
npm install

# Run client (port 3000)
npm run dev:client

# Run admin (port 3001)
npm run dev:admin

# Run both
npm run dev
```

## Tech Stack

- **Frontend:** Next.js 15 + Ant Design 5
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Deploy:** Vercel
- **Monorepo:** npm workspaces

## Documentation

See `/docs` folder for detailed project documentation.
