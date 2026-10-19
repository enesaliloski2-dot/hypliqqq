# Hyperliquid Card — platform

Independent crypto-card concept for users of the Hyperliquid ecosystem. Not affiliated with, endorsed by, or issued by Hyperliquid Labs or any card network; the name is used descriptively and every public surface carries that disclosure.

Public site + customer accounts + wallet connections + administration, on Next.js 15.5 (App Router; patched for CVE-2025-55182 / React2Shell, with React 19.2.8), Supabase (Auth + Postgres with Row Level Security), wagmi/viem (EVM wallets) and the Solana wallet adapter (Phantom). The NORYX identity has been removed from every route; database identifiers were deliberately left unchanged so existing accounts and data migrate untouched (the repo folder name is cosmetic).

## Brand and card artwork
- `public/hyperliquid/cards/` — the supplied front/back renders with the Hyperliquid wordmark and the Visa mark removed (mask-aware fill + synthesized brushed grain, 4K source kept). They are labelled concept artwork on every surface.
- The supplied 360° video was not used: every frame carries both third-party marks. The hero spins the two cleaned renders with a CSS 3D flip instead; swap in a mark-free render of the video when you have one.
- Backgrounds: cosmic horizon (hero, auth pages), curved metal (card showcase), ribbed metal (founding program).
- Logo: a text lockup with a mint ring. If authorization from Hyperliquid Labs is obtained, `components/brand/Logo.tsx` and the `.brand` block in `content/home.html` are the only places to change.

## Owner-only previews
`/admin/design-review` shows the supplied branded mockups (unmodified, hashes in `private/card-concept/SHA256.txt`). They are stored outside `public/` and served only through `/api/concept/*`, which returns 403 to anyone who is not an admin — static hosts expose everything in `public/`. `/preview` renders the full public page with those originals swapped in, under a persistent *Design preview · not for publication* ribbon. Both require the admin role; the public `/` route keeps the mark-free artwork until brand authorization exists.

## Promotions (migration 0002)
`promotions` holds status, verified reward amount, approved budget, caps, dates, eligibility, geographic restrictions, disclosures and terms URL, edited from `/admin/promotions` (audited). A promotion cannot be set to *open* without an approved budget, terms URL and disclosures. `reward_records` is the ledger; the app role has **no insert/update policy** on it — credits come only from a backend crediting service with a payment reference. The $5 issuance price, 30 USDT welcome credit and 5,000 USDT founding reward are presented as proposed throughout; nothing charges or credits.

## Setup

1. Create a Supabase project. In **Authentication → Providers → Email**, keep "Confirm email" on. Set the site URL and add `http://localhost:3000/auth/callback` (and your production domain) under redirect URLs.
2. Apply the schema: `supabase db push` with the CLI, or paste `supabase/migrations/0001_init.sql` into the SQL editor.
3. `cp .env.example .env.local` and fill in `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`. Optional: `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` (adds WalletConnect), `NEXT_PUBLIC_SOLANA_RPC`.
4. `npm install && npm run dev` → http://localhost:3000

## Granting an administrator

There is deliberately no UI for this. Run once, as the database owner (SQL editor / service role), never from the app:

```sql
update public.profiles set role = 'admin' where email = 'owner@example.com';
```

`/admin` re-reads the role from `profiles` on every request (`lib/auth/require.ts`), RLS forbids customers from changing `role` or `status`, and the signup trigger always creates `customer`. Turn on MFA for admin accounts in Supabase Auth.

## What is real vs. labelled early access

| Area | Status |
|---|---|
| Register / verify email / login / logout / password reset / protected routes | Real (Supabase Auth, httpOnly cookies, server actions, per-instance rate limit; pair with Supabase's own auth limits) |
| Customer isolation | RLS on every table; admin visibility via `is_admin()` |
| Wallet connect (MetaMask & injected, Coinbase Wallet, WalletConnect if configured, Phantom) | Real user-approved connection; stores the public address only; reads native balance on-chain. No signatures, approvals or allowances are ever requested |
| Card status / controls | Driven by `cards.status`; default `not_issued`. Controls show **Planned** until an issuer integration exists. Nothing simulates freeze/unfreeze |
| Card transactions | Table + UI exist; rows come only from an issuer webhook you add. Empty state otherwise |
| Founding 100 | Registration + admin eligibility review; no balances, no payouts |
| Admin panel | Live counts, customer status, applications (cannot mark `issued` by hand), wallet metadata, support tickets with internal notes, settings, audit log of every admin write |

## Deploy (Netlify via GitHub)

1. Push the repo (`.gitignore` excludes `node_modules`, `.next`, `.env*`). Never commit `.env.local`.
2. Netlify → Add new site → Import from GitHub. `netlify.toml` sets the build (`npm run build`, Next.js runtime plugin, Node 20); leave the UI defaults.
3. Site settings → Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL` (your Netlify URL, e.g. `https://yoursite.netlify.app`, no trailing slash), optionally `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` and `NEXT_PUBLIC_SOLANA_RPC`. Do **not** add a service-role key.
4. Supabase → Authentication → URL configuration: Site URL = the same Netlify URL; add `https://yoursite.netlify.app/auth/callback` to Redirect URLs (and the `deploy-preview-*` pattern if you use previews). Keep "Confirm email" on. Apply `supabase/migrations/0001_init.sql` then `0002_promotions.sql`.
5. Deploy, create your own account on the live site, verify the email, then grant yourself admin with the SQL in "Granting an administrator". Enable MFA on that account in Supabase.
6. Smoke test on the live URL: signup → email → `/dashboard`; `/admin` denied before the SQL, allowed after; `/api/concept/front.png` → 403 when logged out.

Notes: the per-instance login rate limiter resets per serverless invocation on Netlify, so rely on Supabase's built-in auth rate limits (Authentication → Rate limits) and consider Netlify's rate-limiting rules for `/login` and `/signup`. Security headers come from `next.config.ts`. Wallet connect only works over HTTPS, which Netlify provides.

## Tests

`test/mock-supabase.mjs` is an in-memory stand-in for the Supabase Auth and REST APIs (same wire format). `test/flow.sh` drives the built app through the real server actions using the no-JS form posts Next renders, so middleware, cookies, redirects and pages are all exercised. Results are in `test/RESULTS.md`:

- Auto-confirm mode: 31/31 — signup → session cookie → dashboard with the customer's own name; every dashboard route; profile edit persisted; logged-in `/login` → `/dashboard`; auth-aware homepage; customer denied `/admin`; DB-granted admin opens every admin route and sees the real record; logout clears the session; invalid credentials rejected; valid login → dashboard; duplicate email and server-side validation messages; password-reset request.
- Verification-required mode: 4/4 — "One last step" screen, resend, unverified login blocked, verified login succeeds.

`tsc --noEmit` and `next build` pass with zero server errors during the runs.

**Still to run against your real project** (the mock cannot stand in for these): Supabase's actual email delivery and link exchange at `/auth/callback`, RLS policies in Postgres (the mock enforces ownership in JS), and wallet approve/reject/disconnect in a browser with MetaMask/Phantom installed. See "Setup" and then run the same flow by hand.

## Fixes in this revision

- Public preview: Log In / Create Account no longer dead-link off the static host; with `APP_BASE_URL` unset they explain that accounts open with the deployed app and offer early access. Inside the app they are real routes, and switch to Dashboard when signed in.
- Sidebar icons were passed as functions across the server→client boundary and 500'd every dashboard/admin page — now referenced by name.
- Admin selects received closures instead of bound server actions — fixed.
- Added: verification screen with rate-limited resend, unverified-login handling, notifications panel with mark-as-read, Founding 100 registration flow (`/signup?next=/dashboard?founding=1`), quick actions, spec'd copy, member-since date.

## Structure

```
app/              page.tsx (public site), login, signup, forgot-password, auth/callback, auth/reset,
                  dashboard/{card,wallets,transactions,settings,support}, admin/{users,applications,wallets,support,founding,settings,audit}
components/       brand (official wordmark/monogram), cards (CardViewer), auth, dashboard (shell, nav, account menu), wallet (providers, connect modal, wallet card), admin, ui
lib/              supabase (server/client/middleware), auth (actions, require), dashboard, wallet, admin, validation
content/home.html + public/home.js + app/home.css   the approved public page, served verbatim
public/assets/noryx   noryx-front.png, noryx-back.png (alpha preserved), hero-background.webp
public/brand          logo and monogram SVGs
supabase/migrations   schema, triggers, RLS
```
