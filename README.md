# Hexpose! — A Witch's Boutique & Apothecary

Module 1: **Storefront Foundation + Admin Dashboard**

## Stack
- **Next.js 15** (App Router, JavaScript)
- **MongoDB** (adapted from Supabase spec for this environment)
- **Tailwind CSS + shadcn/ui**
- **Framer Motion** animations
- **Stripe** (placeholder button for Module 2)

## Environment Variables (`.env`)
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=hexpose
NEXT_PUBLIC_BASE_URL=<your external URL>
CORS_ORIGINS=*
ADMIN_PASSWORD=hexpose2025
```

## Admin Dashboard
- URL: `/admin/login`
- **Default password: `hexpose2025`** — change in `.env` and restart.

Sections: Overview · Products · Categories · Hero Builder · Branding · Orders (placeholder) · Analytics (placeholder) · Settings.

## Public Pages
- `/` Home (hero + featured + spell jars + apparel + brand story + testimonials + IG grid + newsletter)
- `/shop` — search, filter, sort, grid/list, pagination
- `/product/[slug]` — gallery, spell metadata panel, related products, add to cart
- `/about`, `/contact`, `/faq`, `/cart`

## Data Model (MongoDB collections)
- `branding_settings` — single doc
- `hero_sections` — single doc
- `categories`
- `products` — embeds `spell` metadata sub-doc
- `settings` — seed marker
- `newsletter`, `contact_messages`

Seeded on first API request with 4 initial products.

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
