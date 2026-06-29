# Hexpose! — A Witch's Boutique & Apothecary

A full e-commerce storefront for Hexpose!, built with **Next.js 16** (App Router) and **Tailwind CSS v4**.

## Features

- **Neon occult aesthetic** — hot pink, electric blue, UV purple on black; animated glow effects, cursor-reactive radial gradient, smoke particles, flicker animations
- **21 products** pre-loaded with full copy and ingredient lists (spells/jars → apothecary → apparel)
- **All products $33 flat** — each links out to a configurable Stripe Payment Link for off-site checkout
- **Admin dashboard** (`/admin`) — upload product photos, brand assets (logo, favicon, wordmark, social share image), and paste Stripe Payment Links per product
- **Post-purchase page** (`/success`) — styled confirmation with a single "Return to Shop" button
- **API routes** for saving JSON data and handling file uploads to `/public/uploads/`

## Pages

| Route | Description |
|-------|-------------|
| `/` | Main storefront — hero, product grid, footer |
| `/admin` | Admin dashboard — manage photos, Stripe links, and brand assets |
| `/success` | Post-purchase confirmation page |

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment

### Vercel (recommended)

1. Push to GitHub
2. Import to Vercel
3. Deploy — zero config needed

> **Note:** The admin upload API writes files to `public/uploads/`. On serverless platforms like Vercel, the filesystem is read-only at runtime. For persistent uploads in production, swap `app/api/admin/upload/route.ts` to write to S3/Cloudflare R2/Supabase Storage instead.

### Self-hosted (Node.js)

```bash
npm run build
npm start
```

## Admin Setup

1. Go to `/admin`
2. Click any product row to expand it
3. Upload a product photo (PNG/JPG/WebP)
4. Paste the Stripe Payment Link for that product
5. Click **Save All Changes**
6. Repeat for all products
7. Switch to the **Brand Assets** tab to upload your logo, favicon, wordmark, and social share image

## Stripe Payment Links

Each product's "Buy Now" button opens the Stripe Payment Link To redirect customers back to your success page after purchase, set the **After-payment redirect URL** in your Stripe Payment Link settings to:

```
https://your-domain.com/success
```

## Product Data

All product copy, ingredients, and prices live in `data/products.json`. Edit this file directly or through the admin dashboard. The file is read at request time (`force-dynamic`).

## Color Palette

| Name | Hex |
|------|-----|
| Hot Pink | `#ff2d78` |
| Electric Blue | `#00c8ff` |
| UV Purple | `#9d00ff` |
| Background Black | `#000000` |
| Card Dark | `#0d0019` |
| Body Text | `#f0e6ff` |
| Muted Text | `#c4b0e0` |
