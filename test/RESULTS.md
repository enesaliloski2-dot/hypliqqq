# Flow test results (mock Supabase, no-JS form posts) — Hyperliquid Card build

Run: `bash test/run.sh` and `MOCK_CONFIRM=1 bash test/run.sh` after `next build`; `bash test/assets.sh` for asset/brand checks.

## Auto-confirm mode
```
signup (valid)
  PASS  redirects to /dashboard with session cookie
dashboard
  PASS  renders the signed-in customer's own name
  PASS  wallet empty state
  PASS  card availability label
  PASS  topbar welcome uses saved first name
  PASS  /dashboard/card opens
  PASS  /dashboard/wallets opens
  PASS  /dashboard/transactions opens
  PASS  /dashboard/settings opens
  PASS  /dashboard/support opens
  PASS  logged-in visit to /login redirects to /dashboard
  PASS  homepage shows Dashboard link when signed in
settings
  PASS  profile edit persists through backend
admin
  PASS  customer is denied /admin/design-review (originals stay owner-only)
  PASS  customer is denied /preview
  PASS  customer gets 403 on the concept image API
  PASS  anonymous gets 403 on the concept image API
  PASS  customer is denied /admin (server-side)
  PASS  admin role (set in DB) opens /admin
  PASS  /admin/users opens
  PASS  /admin/applications opens
  PASS  /admin/wallets opens
  PASS  /admin/support opens
  PASS  /admin/promotions opens
  PASS  /admin/settings opens
  PASS  /admin/audit opens
  PASS  /admin/design-review opens
  PASS  admin customers table shows real record
  PASS  admin receives the byte-identical original via the API
  PASS  /preview renders originals with the preview ribbon for the owner
logout
  PASS  logout posts and redirects
  PASS  session cleared: /dashboard redirects to /login
login
  PASS  invalid credentials rejected
  PASS  valid login redirects to /dashboard
  PASS  returning customer lands on own dashboard
duplicate + validation
  PASS  duplicate email handled
  PASS  server-side validation errors rendered
password reset
  PASS  reset request accepted

38 passed, 0 failed
```
## Email-verification-required mode
```
verification required
  PASS  signup shows verification screen with the address
  PASS  resend verification works
  PASS  unverified login shows verification screen instead of dashboard
  PASS  after verification, login reaches dashboard

4 passed, 0 failed
```
## Assets and brand
```
/                                                200
/login                                           200
/signup                                          200
/favicon.svg                                     200
/home.js                                         200
/hyperliquid/cards/card-front.webp               200
/hyperliquid/cards/card-back.webp                200
/hyperliquid/backgrounds/cosmic-horizon.webp     200
/hyperliquid/backgrounds/metal-curves.webp       200
/hyperliquid/backgrounds/metal-ribbed.webp       200
NORYX on rendered pages: 0
independent disclosure on home: 2
```
