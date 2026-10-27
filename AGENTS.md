# TaziyeKart — Agent Rules

## Project location

This project lives at:

```text
AI Kursu Ödevler/proje_yarışma_satılabilir/
```

The parent repository contains unrelated work. **Only stage files inside this project folder.** Never stage `../` content, the parent repo's deleted files, or unrelated untracked folders.

## Product

TaziyeKart is a white-label digital taziye (condolence) card for local funeral homes. A funeral home creates a card from its panel and shares two links with the family:

- a public card URL (`/k/[slug]`) with prayer location, time, burial, condolence address, map/calendar links, QR/print and a moderated condolence book;
- a private edit URL (`/duzenle/[editToken]`) the family can use without an account.

**Families never pay.** The funeral home pays: Tek Kart 350 TL (one-time) or Cenaze Evi 1.500 TL/month (unlimited cards, own brand, priority support).

## Non-negotiable constraints

- `api/` and `web/` are separate npm workspaces, each with its own `package.json`.
- Root `npm run dev` must bring both up together.
- Web port is **3000**. API port is **3002**. Never change these without updating docs.
- SQLite through Prisma is the source of truth. No hardcoded card data in the UI.
- State-changing API routes validate input with zod and return a consistent error envelope:
  `{ "error": { "code": "...", "message": "...", "fields": { "field": "..." } } }`.
- Public API serializers must not expose `editToken`, `funeralHomeId`, workspace secrets or user data.
- Tenant isolation is mandatory: a funeral home may only read/write its own cards and messages.
- Auth is a real HTTP-only JWT cookie (`taziye_session`). Roles: `SUPERADMIN`, `FUNERAL_HOME`.
- Demo login endpoints are enabled only when `DEMO_MODE=true`. They must never be treated as production auth.
- All UI copy is Turkish. Sales copy is benefit-first; no framework/technology jargon on the sales page.
- Secrets live in `.env` / `.env.local`. Never hardcode them. `.env.example` must stay current.
- No paid external services: no payment provider, no email/SMS provider, no maps API key, no print-on-demand API.
- No real payment collection. Plan changes use a clearly labelled demo checkout.
- Do not claim AI features. There are none.
- Respect the sensitive domain: calm tone, no ads, no pop-ups, no countdowns, no sensational copy.

## Commands

```powershell
npm install
npm run db:setup      # generate + push schema + seed admin/demo home
npm run dev           # api :3002 + web :3000
npm run typecheck
npm run build
npm run test          # api tests
npm run db:reset      # destructive: reset SQLite and re-seed
```

## Routes (target)

```text
/                         sales page
/giris                    funeral home login
/kayit                    funeral home registration
/panel                    funeral home dashboard
/panel/kartlar            card list
/panel/kartlar/yeni       create card
/panel/kartlar/[id]       card detail
/panel/marka              brand settings
/panel/mesajlar           condolence moderation
/panel/plan               plan and demo checkout
/admin/giris              superadmin login
/admin                    superadmin dashboard
/admin/cenaze-evleri      funeral homes
/admin/kartlar            all cards
/admin/mesajlar           all messages
/admin/denetim            admin audit log
/k/[slug]                 public card
/k/[slug]/yazdir          A6 print-ready card
/duzenle/[editToken]      family edit link
```

## Data and security rules

- Money is stored in integer kuruş. Dates/times are stored as strings (`YYYY-MM-DD`, `HH:mm`) to avoid timezone bugs.
- Plan limits: `TRIAL` and `SINGLE` = 1 card; `MONTHLY` = unlimited; suspended homes cannot create cards.
- `Card.published = false` means the public route must not expose content.
- Condolence messages are `PENDING` by default. Only `APPROVED` messages appear publicly. The family edit link, the funeral home panel and the superadmin may moderate.
- Rate-limit public card creation and condolence submissions. Keep the implementation boring and in-memory for the demo.
- Public, edit, auth, panel and admin pages must be `noindex`. `robots.ts` must disallow `/k/`, `/duzenle/`, `/panel/`, `/admin/` and `/api/`.
- Do not put real personal data in seeds, screenshots or demo content. Use clearly fictional sample data.
- State-changing browser requests must pass the `WEB_ORIGIN` origin guard; do not add CORS.
- Keep the security headers in `web/next.config.ts`: `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, COOP and restricted CSP.
- Admin actions must write to `AuditLog`. Never store passwords, tokens or IBANs in audit meta.
- Passwords are bcrypt hashes; JWT is HTTP-only; never expose tokens or hashes in serializers or logs.

## Engineering rules

- TypeScript strict mode. No `any` unless unavoidable and commented.
- Use zod at every API boundary. Convert money to kuruş in one place.
- Use TanStack Query for server state in the web app when the panel is built.
- Use `next/font` or bundled font packages; do not depend on runtime font CDNs.
- Keep files small and named for what they do. No 800-line files.
- Update `docs/PLAN.md` when a decision changes. `docs/API.md` is the contract.
- Before declaring a phase done: run typecheck, relevant tests and a production build.
- Commit after each green milestone with `feat:`, `fix:`, `docs:` or `chore:` prefixes. Stage only this folder.
- Use `docs/KABUL.md` as the rubric checklist and keep it honest.

## Out of scope for the competition build

- Real payments, invoices, subscriptions and tax handling.
- Email/SMS/verification/password reset.
- Print-on-demand ordering and shipping.
- Native mobile apps, multi-language UI, real-time collaboration.
- Maps API integration (plain Google Maps links are enough).
- Staff sub-accounts, custom domains, analytics, ad tracking.
- Cloud file uploads or photo albums.
