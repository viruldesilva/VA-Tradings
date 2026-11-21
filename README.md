# VA Tradings

Online shop for tech accessories in Sri Lanka. Customers order on the site
(Cash on Delivery or PayHere card payments). The owner buys each item from a
supplier and ships it. Products are managed in a private admin panel.

**Stack:** Next.js 16 (App Router, Cache Components) · TypeScript · Tailwind CSS 4 ·
shadcn/ui · Supabase (Postgres, Auth, Storage) · Vercel · PayHere

---

## 1. Supabase setup (one time)

1. Create a project at [supabase.com](https://supabase.com). The **Singapore** region is closest to Sri Lanka.
2. **SQL Editor:** paste all of [`supabase/schema.sql`](supabase/schema.sql) and click **Run**.
   - Already have tables from an older script? Run
     [`supabase/migrations/001_move_supplier_fields.sql`](supabase/migrations/001_move_supplier_fields.sql)
     first, then `schema.sql`.
3. **Authentication → Users → Add user:** enter your email and a password, and tick *Auto confirm*.
4. Make that user an admin (SQL Editor):
   ```sql
   insert into public.admin_users (user_id)
   select id from auth.users where email = 'you@example.com';
   ```
5. **Authentication → Sign In / Providers:** turn **off** "Allow new users to sign up".
6. **Project Settings → API:** copy the URL, the `anon` key and the `service_role` key for the next step.

## 2. Run locally

```bash
cp .env.example .env.local   # then fill in the values
npm install
npm run dev
```

| Variable | Where it comes from |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | same page, `anon` `public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | same page, `service_role` key. **Secret: never share or commit it** |
| `PAYHERE_MERCHANT_ID` | PayHere → Integrations (leave empty to hide card payments) |
| `PAYHERE_MERCHANT_SECRET` | PayHere → Integrations → your domain's secret |
| `PAYHERE_SANDBOX` | `true` (default) = test payments, `false` = real payments |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` locally, `https://your-domain.lk` in production |

Open http://localhost:3000 for the shop and http://localhost:3000/admin for the admin panel.
In **Admin → Settings**, set the delivery fee, shop phone and WhatsApp number.

Before going live, fill in your business **address** and **email** in
[`src/lib/config.ts`](src/lib/config.ts) (`siteConfig.business`). They appear on
the Contact page, and PayHere checks for them.

## 3. Deploy to Vercel

1. Push this repo to GitHub (`.env.local` is git-ignored and must stay that way).
2. Go to [vercel.com/new](https://vercel.com/new), import the repo, and keep the detected **Next.js** settings.
3. **Settings → Environment Variables:** add every variable from the table above.
   Set `NEXT_PUBLIC_SITE_URL` to your real domain, e.g. `https://vatradings.lk`.
4. **Deploy.** After adding your domain under **Settings → Domains**, update
   `NEXT_PUBLIC_SITE_URL` to match and **redeploy**. Environment changes only
   apply to new deployments.
5. Smoke-test production: place a COD order, check it in `/admin/orders`, and update its status.

## 4. PayHere (card payments)

1. Create a **sandbox** merchant account at [sandbox.payhere.lk](https://sandbox.payhere.lk).
2. **Integrations → Add Domain/App:** add your Vercel domain (approval can take up to 24 h),
   then copy the **Merchant Secret** shown for that domain.
3. Set `PAYHERE_MERCHANT_ID`, `PAYHERE_MERCHANT_SECRET` and `PAYHERE_SANDBOX=true` in Vercel, then redeploy.
4. Place a test order with "Card / online payment". After paying, the order should
   show **Paid** in the admin panel.
   - PayHere confirms payments by calling `/api/payhere/notify`. That URL must be
     public, so **this cannot be tested on localhost**; test on your Vercel deployment.
5. **Go live:** get your live PayHere account approved (they review the policy pages
   at `/about`, `/contact`, `/delivery`, `/returns`, `/privacy`, `/terms`), add your
   domain under the live account's Integrations, then set the live merchant ID and
   secret and `PAYHERE_SANDBOX=false`, and redeploy.

## How it fits together

```
src/
  app/
    (shop)/            storefront: home, shop, product, cart, checkout, order, track, pay, policies
    admin/             login + (dashboard): orders, products, categories, settings
    api/orders/        POST: creates orders (server-side prices, service role)
    api/payhere/notify PayHere payment callback (md5sig verified)
  components/          UI by area (layout, product, cart, checkout, admin, ui = shadcn)
  lib/
    data/              data access: catalog.ts (public, cached) · admin/* (requires admin)
    orders/            pricing, order creation, customer lookup, status labels
    payhere/           config, hash/signature, checkout fields
    supabase/          clients: browser, server, public (cacheable), admin (service role), proxy
    validation/        zod schemas
  proxy.ts             protects /admin (Next 16's replacement for middleware)
supabase/schema.sql    tables, RLS policies, storage bucket
```

**Security model**
- Supplier prices and URLs are in `product_private`, which only admins can read (RLS).
- Admin = a user listed in `admin_users`. Every admin page and action checks this on the server.
- Customers never write to the database directly. Orders go through `/api/orders`,
  which re-reads prices and stock from the database.
- Order confirmation links contain a random token, so orders can't be viewed by guessing numbers.
