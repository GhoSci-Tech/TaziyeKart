# TaziyeKart — Plan (single source of truth)

> This file records the decisions the implementation follows. If a decision changes, update this file first.

## 1. Product

**TaziyeKart** is a white-label digital condolence card for local funeral homes.

A funeral home creates a card from its panel; the system produces:

- a **public card** (`/k/[slug]`) with prayer location, time, burial details, condolence address/hours, map and calendar links, a QR/print view, and a moderated condolence book;
- a **private edit link** (`/duzenle/[editToken]`) the family can open without an account.

The family shares one link on WhatsApp. Visitors get directions in one tap, can add the funeral to their calendar, can print an A6 QR card, and can leave a condolence message that appears only after approval.

### Problem

In the first hours after a death, the family has to answer the same questions dozens of times: which mosque, what time, where is the condolence tent, where is the cemetery, how do we donate? Messages get lost, older relatives cannot find the address, and the family cannot focus on grief.

### Target buyer

**Single-branch local funeral homes** ("cenaze levazımatçısı") that handle several funerals per month and want a more professional service. The family is the end user, not the payer.

### Why now

Every funeral repeats the same WhatsApp/phone chaos. Existing funeral homes compete on trust and service; a dignified, branded card is a visible differentiator. The product is immediately useful, with no integration or training.

## 2. Business model

| Package | Price | Included |
|---|---:|---|
| **Tek Kart** | 350 TL one-time | 1 card, public card, edit link, condolence book, A6 QR print view |
| **Cenaze Evi** (recommended) | 1.500 TL/month | Unlimited cards, own name/phone on every card, priority support, all features |

**Families always pay 0 TL.** The funeral home is the customer. A funeral home handling 10–20 funerals per month pays 75–150 TL per card; one new customer or referral pays for the subscription.

Payment is a **demo checkout**: plan changes work, no real money is collected.

## 3. Roles

| Role | Capabilities |
|---|---|
| **SUPERADMIN** | Dashboard, all funeral homes, all cards, plan changes, suspend/activate, all condolence moderation |
| **FUNERAL_HOME** | Own brand, own cards, own messages, plan/usage; no access to other tenants |
| **Family (no account)** | Edit link: update card details, publish/unpublish, delete, moderate condolences |
| **Visitor (no account)** | Public card, map/calendar links, print/QR, submit a condolence message (pending) |

## 4. Plans and limits

| Plan | Card limit | Notes |
|---|---:|---|
| `TRIAL` | 1 | Default after registration |
| `SINGLE` | 1 | One-time card purchase (demo) |
| `MONTHLY` | Unlimited | Recommended funeral home subscription |
| `SUSPENDED` | 0 new | Existing public cards may remain until the superadmin unpublishes them |

The API enforces the limit on card creation. The UI shows usage and an upgrade path.

## 5. Core flows

### Funeral home

1. Register or use the one-click demo login.
2. Panel → "Yeni taziye kartı".
3. Enter the deceased's name, prayer place/time, burial and condolence details.
4. Save → copy the public link and the family edit link.
5. Print the A6 QR card if needed.
6. Moderate condolence messages from the panel.

### Family

1. Open the private edit link.
2. Correct details, publish/unpublish, approve/reject messages, or delete the card.
3. Share the public link on WhatsApp.

### Visitor

1. Open the public card.
2. Tap "Yol tarifi", "Takvime ekle", "WhatsApp'ta paylaş" or "Yazdır".
3. Leave a condolence message; it waits for approval.

### Superadmin

1. Log in with the seeded admin or demo admin.
2. See total homes, cards, pending messages and demo MRR.
3. Change a home's plan, suspend it, inspect cards, moderate messages.

## 6. Data model

SQLite + Prisma. Money is stored as integer kuruş. Dates/times are strings (`YYYY-MM-DD`, `HH:mm`) to avoid timezone bugs.

> **Not:** SQLite'ta Prisma enum desteklenmiyor. `role`, `plan`, `status` alanları `String`; geçerli değerler API'deki sabitlerde ve zod şemalarında tutulur (`SUPERADMIN|FUNERAL_HOME`, `TRIAL|SINGLE|MONTHLY`, `ACTIVE|SUSPENDED`, `PENDING|APPROVED|REJECTED`).

```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String
  name          String
  role          String   // SUPERADMIN | FUNERAL_HOME
  funeralHomeId String?
  funeralHome   FuneralHome? @relation(fields: [funeralHomeId], references: [id], onDelete: SetNull)
  approvedCondolences Condolence[] @relation("ApprovedCondolences")
  auditLogs           AuditLog[]   @relation("AuditActor")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([funeralHomeId])
}

model FuneralHome {
  id        String   @id @default(cuid())
  name      String
  phone     String?
  plan      String   @default("TRIAL")   // TRIAL | SINGLE | MONTHLY
  status    String   @default("ACTIVE")  // ACTIVE | SUSPENDED
  users     User[]
  cards     Card[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Card {
  id                 String   @id @default(cuid())
  funeralHomeId      String
  funeralHome        FuneralHome @relation(fields: [funeralHomeId], references: [id], onDelete: Cascade)
  slug               String   @unique
  editToken          String   @unique
  deceasedName       String
  honorific          String?  // Merhum / Merhume
  funeralPlace       String
  funeralAddress     String?
  funeralMapUrl      String?
  funeralDate        String   // YYYY-MM-DD
  funeralTime        String   // HH:mm
  cemeteryName       String?
  burialTime         String?
  condolenceAddress  String?
  condolenceHours    String?
  donationUrl        String?
  donationIban       String?
  note               String?
  published          Boolean  @default(true)
  condolences        Condolence[]
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  @@index([funeralHomeId, createdAt])
}

model Condolence {
  id              String   @id @default(cuid())
  cardId          String
  card            Card     @relation(fields: [cardId], references: [id], onDelete: Cascade)
  name            String
  message         String
  status          String   @default("PENDING") // PENDING | APPROVED | REJECTED
  approvedAt      DateTime?
  approvedByUserId String?
  approvedBy      User? @relation("ApprovedCondolences", fields: [approvedByUserId], references: [id], onDelete: SetNull)
  createdAt       DateTime @default(now())

  @@index([cardId, status, createdAt])
}
```

Public serializers never return `editToken`, `funeralHomeId`, user data or workspace secrets.

**Audit:** `AuditLog` (`actorUserId?`, `action`, `entity`, `entityId?`, `meta` JSON string, `createdAt`) records admin logins and admin actions. It never stores passwords, tokens or IBANs. The superadmin reads it from `/admin/denetim` via `GET /admin/audit`.

## 6.1 Security hardening

- HTTP-only JWT cookie, bcrypt passwords, role checks, tenant isolation.
- `WEB_ORIGIN` origin guard for state-changing browser requests; no CORS; Next rewrite keeps cookies first-party.
- Security headers: `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, COOP, restricted CSP.
- `noindex` on auth, panel, admin, public card and edit pages; `robots.txt` disallows sensitive paths.
- Rate limits on auth/demo/card creation/condolence; zod validation; generic login errors.
- `npm audit --omit=dev` currently reports 6 production advisories in transitive/build-time dependencies. Fixes require major upgrades (Prisma 7, Next 16, zod 4). This local demo has no runtime exposure path; production hardening must upgrade and re-test.

## 7. API surface

Base URL: `/api` (Next.js rewrites `/api/*` to Express on port 3002, so cookies are first-party and there is no CORS).

- **Auth:** `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`, `POST /auth/demo-home`, `POST /auth/demo-admin`.
- **Panel:** `GET /panel/overview`, `GET/PATCH /panel/home`, `GET/POST /panel/cards`, `GET/PATCH/DELETE /panel/cards/:id`, `GET /panel/messages`, `PATCH /panel/messages/:id`, `POST /panel/checkout`.
- **Public:** `GET /public/cards/:slug`, `POST /public/cards/:slug/condolences`.
- **Family edit:** `GET/PATCH/DELETE /edit/cards/:token`, `PATCH /edit/cards/:token/condolences/:id`.
- **Admin:** `GET /admin/stats`, `GET /admin/homes`, `GET/PATCH /admin/homes/:id`, `GET /admin/cards`, `PATCH/DELETE /admin/cards/:id`, `GET /admin/messages`, `PATCH/DELETE /admin/messages/:id`.
- **Health:** `GET /health`.

Detailed contracts live in `docs/API.md`.

## 8. Screens and routes

```text
/                         sales page (funeral home buyer + family-free message)
/giris                    funeral home login
/kayit                    funeral home registration
/panel                    dashboard: plan, usage, recent cards, pending messages
/panel/kartlar            card list + search
/panel/kartlar/yeni       create card form
/panel/kartlar/[id]       card detail: links, print, messages, edit, delete
/panel/marka              brand name/phone
/panel/mesajlar           condolence moderation
/panel/plan               plan/usage + demo checkout
/admin/giris              superadmin login
/admin                    superadmin dashboard
/admin/cenaze-evleri      funeral homes
/admin/kartlar            all cards
/admin/mesajlar           all messages
/k/[slug]                 public card + approved condolence book
/k/[slug]/yazdir          A6 front/back print view + QR
/duzenle/[editToken]      family edit and moderation
```

Public and edit pages are `noindex`. `robots.ts` disallows `/k/`, `/duzenle/`, `/panel/`, `/admin/`, `/api/`.

## 9. Auth and security

- Real auth for funeral homes and superadmin: email + password (bcrypt), signed JWT in an HTTP-only cookie (`taziye_session`, SameSite=Lax, Secure in production).
- Roles checked on every protected route. Tenant isolation on every panel query.
- Demo buttons log in seeded accounts only when `DEMO_MODE=true`.
- Public card access is by slug; family edit access is by high-entropy `editToken`. Neither is a login.
- Condolence messages are pending by default; only approved messages are public. The family link, panel and superadmin can moderate.
- Rate-limit registration, demo login, card creation and condolence submissions. In-memory is acceptable for the demo.
- No secrets in code. `.env` and `.env.local` are ignored; `.env.example` documents every key.
- No ads, analytics or third-party trackers on public cards.

## 10. Design direction

See `docs/DESIGN.md`. Summary: cream paper, deep forest green, muted gold, Newsreader serif headlines, Manrope UI, calm editorial tone. No purple gradients, no neon, no urgency gimmicks.

## 11. Phases and checkpoints

### Aşama A — core deliverable

1. **Faz 0:** docs (`PLAN`, `API`, `KABUL`, `DESIGN`), root config, AGENTS, README skeleton.
2. **Faz 1:** workspaces, Next.js + Express, Prisma schema, seed, auth skeleton, health, proxy, placeholder pages. Checkpoint: `npm run dev`, `/api/health`, build/typecheck.
3. **Faz 2:** auth (register/login/logout/me/demo), validation, tests, panel/public serializers, plan limits.
4. **Faz 3:** funeral home panel: dashboard, card form/list/detail, brand, messages, demo checkout.
5. **Faz 4:** public card: metadata/OG, map/calendar/WhatsApp/copy, condolence book, family edit, moderation.
6. **Faz 5:** print/QR: A6 front/back, print CSS, QR, panel/public buttons.
7. **Faz 6:** sales page: hero, sample card, B2B benefits, pricing, FAQ, trust, demo checkout, screenshot.
8. **Faz 7:** silent test, fixes, README, commits, pitch.

### Aşama B — full product

9. **Faz 8:** superadmin dashboard, homes, cards, messages, plans, suspend.
10. **Faz 9:** audit log (optional), E2E tests, security hardening, responsive/accessibility, demo data.
11. **Faz 10:** screenshots, 90-second pitch, optional deployment, final rubric audit.

Every phase must end with a working `npm run dev`, a green typecheck and a commit.

## 12. Out of scope (YAPMAYACAKLARIM)

- Real payment, invoices, subscriptions, tax handling.
- Email/SMS, verification, password reset.
- Print-on-demand ordering/shipping.
- Native mobile apps, multi-language UI.
- Maps API, geocoding, route optimization.
- Photo uploads, cloud storage.
- Staff sub-accounts, custom domains, real-time collaboration.
- Analytics, ad tracking, SEO for public cards.
- AI features of any kind.
- A site-wide CMS or editable marketing copy.

## 13. Demo and seed

- `npm run db:setup` is idempotent and seeds:
  - superadmin from `ADMIN_*` env vars;
  - demo funeral home `Örnek Cenaze Evi` (MONTHLY) and demo user from `DEMO_*`.
- No fake cards are seeded. The panel starts with a meaningful empty state; the judge creates the first card.
- Demo logins are enabled only with `DEMO_MODE=true`.
- Screenshots use clearly fictional names and no real personal data.

## 14. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Sensitive domain perception ("profiting from grief") | Family free; funeral home pays; calm tone; no ads; privacy-first public cards |
| Moderation abuse | Pending-by-default messages; family/panel/admin approve; rate limits; delete |
| Tenant data leak | Role + tenant checks; public serializers exclude tokens/IDs; tests for isolation |
| Auth complexity | Real but small: bcrypt + JWT cookie; one-click demo; no OAuth/email |
| Next.js App Router/OG complexity | Core public card first; server components; `no-store`; static fallback OG image |
| Scope creep | `YAPMAYACAKLARIM` list; phase checkpoints; superadmin after core |
| Print layout drift | A6 print route with fixed CSS, QR, real browser print/PDF |
| Fake/unverified IBAN | Optional field; label "aile tarafından sağlandı"; prefer official donation link |
| Data loss in demo | SQLite file; no auto-reset except `npm run db:reset` |

## 15. Acceptance

The 22-item rubric mapping and manual test steps live in `docs/KABUL.md`. The API contract lives in `docs/API.md`. If implementation and docs disagree, fix the docs first, then the code.
