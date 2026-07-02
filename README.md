# Hexpose! — A Witch's Boutique & Apothecary

Module 1: **Storefront Foundation + Admin Dashboard**

## Stack
- **Next.js 15** (App Router, JavaScript)
- **Supabase** (PostgreSQL via `@supabase/supabase-js`)
- **Tailwind CSS + shadcn/ui**
- **Framer Motion** animations
- **Stripe** (placeholder button for Module 2)

## Supabase Setup

1. Create a project at [app.supabase.com](https://app.supabase.com).
2. In **SQL Editor**, paste and run the contents of `supabase-schema.sql` to create all tables.
3. In **Project Settings → API**, copy your **Project URL** and **service_role** secret key.
4. Add the environment variables below to Vercel (or your `.env.local`).

The app seeds 4 demo products, 3 categories, hero, and branding data on the first API request automatically.

## Environment Variables (`.env.local` / Vercel)
```
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-secret>
ADMIN_PASSWORD=hexpose2025
CORS_ORIGINS=*
```

> **Never** expose `SUPABASE_SERVICE_ROLE_KEY` on the client side. It is only read in Next.js API routes (server-side).

## Admin Dashboard
- URL: `/admin/login`
- **Default password: `hexpose2025`** — change in `.env` and restart.

Sections: Overview · Products · Categories · Hero Builder · Branding · Orders (placeholder) · Analytics (placeholder) · Settings.

## Public Pages
- `/` Home (hero + featured + spell jars + apparel + brand story + testimonials + IG grid + newsletter)
- `/shop` — search, filter, sort, grid/list, pagination
- `/product/[slug]` — gallery, spell metadata panel, related products, add to cart
- `/about`, `/contact`, `/faq`, `/cart`

## Data Model (Supabase / PostgreSQL tables)
- `branding_settings` — single row
- `hero_sections` — single row
- `categories`
- `products` — `spell` metadata stored as a `jsonb` column
- `settings` — seed marker
- `newsletter`, `contact_messages`

Seeded automatically on first API request with 4 demo products.

## API
All API routes are under `/api/*` via a Next.js catch-all route.
- `GET/POST /api/products`, `GET/PUT/DELETE /api/products/[id]`, `GET /api/products/slug/[slug]`
- `GET/POST /api/categories`, `DELETE /api/categories/[id]`
- `GET/PUT /api/hero`
- `GET/PUT /api/branding`
- `POST /api/newsletter`, `POST /api/contact`
- `POST /api/admin/login`, `POST /api/admin/logout`, `GET /api/admin/verify`, `GET /api/admin/overview`

## Future Modules (reserved extension points)
- Stripe checkout — hook in `/cart` checkout button and `products.price` (webhooks in `/api/stripe/*`)
- Merchize — add fulfillment provider on order-created event
- Marketing — `newsletter` collection ready for CRM sync
- Tarot bookings — new `bookings` collection + `/api/bookings` routes
- Games — add `games` collection + isolated `/games/*` routes
- Marketplace — add `vendors` collection and vendor scoping to `products`
- Customer accounts — add `users`, `orders`, `sessions` collections; NextAuth or Emergent auth

## Development
```
yarn dev
```
Server is managed by supervisor (`sudo supervisorctl restart nextjs`).
