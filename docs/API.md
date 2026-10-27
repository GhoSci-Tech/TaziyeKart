# TaziyeKart — API Contract

Base path: **`/api`**. In development the browser calls `http://localhost:3000/api/*`; Next.js rewrites to Express at `http://localhost:3002/api/*`. This keeps the session cookie first-party and removes CORS.

## Conventions

### Authentication

- Session cookie: `taziye_session` (HTTP-only, SameSite=Lax, Secure in production, 7 days).
- Send cookies with `credentials: "include"` from the browser.
- Roles: `SUPERADMIN`, `FUNERAL_HOME`.
- Protected routes return `401 UNAUTHORIZED` without a valid session and `403 FORBIDDEN` for the wrong role.
- Demo routes work only when `DEMO_MODE=true`.

### Error envelope

Every error uses:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Girdiğiniz bilgileri kontrol edin.",
    "fields": {
      "deceasedName": "Merhumun adı gerekli."
    }
  }
}
```

`fields` is optional. Common codes: `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `PLAN_LIMIT`, `PLAN_SUSPENDED`, `RATE_LIMITED`, `CARD_NOT_PUBLISHED`, `INTERNAL_ERROR`.

### Money and dates

- API request/response money values are **TL numbers** (e.g. `1500`, `349.9`). The database stores integer kuruş.
- Card dates are `YYYY-MM-DD`; times are `HH:mm`. Do not send JavaScript `Date` objects for card dates.
- `createdAt`/`updatedAt` are ISO strings.

### Public serializers

Public card responses **must not** include:

- `editToken`
- `funeralHomeId`
- user records, emails, password hashes
- internal IDs other than what the public page needs

The public card includes only the funeral home's display name and phone.

### Rate limits (demo)

In-memory limits are acceptable:

- registration/demo login: 10 requests / 15 min / IP
- card creation: 30 / hour / home
- condolence submission: 5 / hour / IP + card

Return `429 RATE_LIMITED`.

---

## Health

### `GET /health`

Public. No auth.

```json
{
  "ok": true,
  "service": "taziyekart-api",
  "time": "2026-10-26T12:00:00.000Z"
}
```

---

## Auth

### `POST /auth/register`

Creates a funeral home with a `TRIAL` plan and its first `FUNERAL_HOME` user, then sets the session cookie.

Request:

```json
{
  "homeName": "Örnek Cenaze Evi",
  "contactName": "Ayşe Yılmaz",
  "email": "ayse@example.com",
  "password": "en-az-8-karakter",
  "phone": "0212 000 00 00"
}
```

Response `201`:

```json
{
  "user": {
    "id": "usr_...",
    "email": "ayse@example.com",
    "name": "Ayşe Yılmaz",
    "role": "FUNERAL_HOME",
    "funeralHomeId": "home_...",
    "funeralHome": {
      "id": "home_...",
      "name": "Örnek Cenaze Evi",
      "phone": "0212 000 00 00",
      "plan": "TRIAL",
      "status": "ACTIVE"
    }
  }
}
```

Errors: `VALIDATION_ERROR`, `CONFLICT` (email already registered), `RATE_LIMITED`.

### `POST /auth/login`

Request:

```json
{ "email": "demo@taziyekart.local", "password": "Demo123!" }
```

Response `200`: same `user` shape as register. Sets the cookie.

Errors: `VALIDATION_ERROR`, `UNAUTHORIZED` (generic message; do not reveal whether the email exists).

### `POST /auth/logout`

Clears the cookie. Response `204`.

### `GET /auth/me`

Requires auth. Returns the current user + home (same shape as register). `401` when absent/expired.

### `POST /auth/demo-home`

Requires `DEMO_MODE=true`. Logs in the seeded demo funeral home. Response `200`: `user` shape. `404 DEMO_DISABLED` when off.

### `POST /auth/demo-admin`

Requires `DEMO_MODE=true`. Logs in the seeded superadmin. Response `200`: `user` shape. `404 DEMO_DISABLED` when off.

---

## Panel (FUNERAL_HOME)

All routes require `FUNERAL_HOME` and are scoped to `req.user.funeralHomeId`. A superadmin calling panel routes gets `403`.

### `GET /panel/overview`

```json
{
  "home": { "id": "home_...", "name": "Örnek Cenaze Evi", "phone": "...", "plan": "MONTHLY", "status": "ACTIVE" },
  "usage": { "cards": 4, "limit": null, "messagesPending": 2 },
  "recentCards": [
    { "id": "card_...", "deceasedName": "Ahmet Yılmaz", "slug": "ahmet-yilmaz-7f3a", "funeralDate": "2026-10-26", "funeralTime": "14:30", "published": true }
  ]
}
```

`limit` is `1` for `TRIAL`/`SINGLE`, `null` for `MONTHLY`, `0` for `SUSPENDED`.

### `GET /panel/home`

Returns the current home.

### `PATCH /panel/home`

Request:

```json
{ "name": "Örnek Cenaze Evi", "phone": "0212 000 00 00" }
```

Response `200`: updated home. Errors: `VALIDATION_ERROR`.

### `GET /panel/cards`

Query: `search?`, `published?`, `limit?` (default 50, max 200).

Response:

```json
{
  "cards": [
    {
      "id": "card_...",
      "deceasedName": "Ahmet Yılmaz",
      "honorific": "Merhum",
      "funeralPlace": "Merkez Camii",
      "funeralDate": "2026-10-26",
      "funeralTime": "14:30",
      "slug": "ahmet-yilmaz-7f3a",
      "editToken": "private-edit-token",
      "published": true,
      "pendingMessages": 2,
      "createdAt": "2026-10-26T09:00:00.000Z"
    }
  ]
}
```

`editToken` is intentionally included **only** in authenticated panel/admin responses so the home can copy the family edit link.

### `POST /panel/cards`

Request:

```json
{
  "deceasedName": "Ahmet Yılmaz",
  "honorific": "Merhum",
  "funeralPlace": "Merkez Camii",
  "funeralAddress": "Cumhuriyet Mah. ...",
  "funeralMapUrl": "https://maps.google.com/...",
  "funeralDate": "2026-10-26",
  "funeralTime": "14:30",
  "cemeteryName": "Şehir Mezarlığı",
  "burialTime": "15:30",
  "condolenceAddress": "Taziye Çadırı, ...",
  "condolenceHours": "12:00-22:00",
  "donationUrl": "https://...",
  "donationIban": "TR00 0000 0000 0000 0000 0000 00",
  "note": "Çiçek yerine bağış rica ederiz."
}
```

Required: `deceasedName`, `funeralPlace`, `funeralDate` (`YYYY-MM-DD`), `funeralTime` (`HH:mm`).

Response `201`:

```json
{
  "card": {
    "id": "card_...",
    "slug": "ahmet-yilmaz-7f3a",
    "editToken": "private-edit-token",
    "publicPath": "/k/ahmet-yilmaz-7f3a",
    "editPath": "/duzenle/private-edit-token"
  }
}
```

Errors: `VALIDATION_ERROR`, `PLAN_LIMIT` (TRIAL/SINGLE already has 1 card), `PLAN_SUSPENDED`, `RATE_LIMITED`.

### `GET /panel/cards/:id`

Tenant-scoped. Returns the full card + `editToken` + message counts. `404` if not owned.

### `PATCH /panel/cards/:id`

Tenant-scoped. Same fields as create, all optional. `published` may be toggled. Response `200`: updated card.

### `DELETE /panel/cards/:id`

Tenant-scoped. Deletes the card and its messages. Response `204`.

### `GET /panel/messages`

Query: `status?` (`PENDING|APPROVED|REJECTED`), `cardId?`, `limit?`.

Response:

```json
{
  "messages": [
    {
      "id": "msg_...",
      "cardId": "card_...",
      "card": { "deceasedName": "Ahmet Yılmaz", "slug": "ahmet-yilmaz-7f3a" },
      "name": "Mehmet K.",
      "message": "Başsağlığı dilerim.",
      "status": "PENDING",
      "createdAt": "2026-10-26T10:00:00.000Z"
    }
  ]
}
```

### `PATCH /panel/messages/:id`

Request: `{ "status": "APPROVED" }` or `{ "status": "REJECTED" }`.

Tenant-scoped. Sets `approvedAt`/`approvedByUserId` for approvals. Response `200`: updated message.

### `POST /panel/checkout`

Requires `DEMO_MODE=true`. Updates the home plan for the demo; no money is collected.

Request: `{ "plan": "SINGLE" }` or `{ "plan": "MONTHLY" }`.

Response `200`:

```json
{
  "home": { "id": "home_...", "plan": "MONTHLY", "status": "ACTIVE" },
  "demo": true,
  "message": "Demo ödeme alındı; gerçek tahsilat yapılmadı."
}
```

Errors: `VALIDATION_ERROR`, `FORBIDDEN` (suspended), `404 DEMO_DISABLED`.

---

## Public (no auth)

### `GET /public/cards/:slug`

Response `200`:

```json
{
  "card": {
    "slug": "ahmet-yilmaz-7f3a",
    "deceasedName": "Ahmet Yılmaz",
    "honorific": "Merhum",
    "funeralPlace": "Merkez Camii",
    "funeralAddress": "Cumhuriyet Mah. ...",
    "funeralMapUrl": "https://maps.google.com/...",
    "funeralDate": "2026-10-26",
    "funeralTime": "14:30",
    "cemeteryName": "Şehir Mezarlığı",
    "burialTime": "15:30",
    "condolenceAddress": "Taziye Çadırı, ...",
    "condolenceHours": "12:00-22:00",
    "donationUrl": "https://...",
    "donationIban": "TR00 ...",
    "note": "Çiçek yerine bağış rica ederiz.",
    "home": { "name": "Örnek Cenaze Evi", "phone": "0212 000 00 00" },
    "condolences": [
      { "id": "msg_...", "name": "Mehmet K.", "message": "Başsağlığı dilerim.", "createdAt": "2026-10-26T10:00:00.000Z" }
    ]
  }
}
```

Only `APPROVED` condolences are returned, newest first, max 50.

Errors: `404 NOT_FOUND` (unknown slug), `404 CARD_NOT_PUBLISHED` (unpublished). Never expose the edit token or home ID.

### `POST /public/cards/:slug/condolences`

Request:

```json
{
  "name": "Mehmet K.",
  "message": "Başsağlığı dilerim.",
  "website": ""
}
```

`website` is a honeypot; if filled, return `201` without storing. `name` 1–80 chars, `message` 1–500 chars.

Response `201`:

```json
{
  "message": "Mesajınız aile onayına gönderildi.",
  "status": "PENDING"
}
```

Errors: `VALIDATION_ERROR`, `RATE_LIMITED`, `CARD_NOT_PUBLISHED`.

---

## Family edit (edit token, no account)

The token is high-entropy and secret. Treat it as a capability URL. Never include it in public responses or logs.

### `GET /edit/cards/:token`

Response `200`: full card fields + `publicPath` + all condolences (all statuses). No home user data.

Errors: `404 NOT_FOUND`.

### `PATCH /edit/cards/:token`

Same editable fields as panel create, all optional, including `published`. Response `200`: updated card.

Errors: `VALIDATION_ERROR`, `NOT_FOUND`.

### `DELETE /edit/cards/:token`

Deletes the card and messages. Response `204`.

### `PATCH /edit/cards/:token/condolences/:id`

Request: `{ "status": "APPROVED" }` or `{ "status": "REJECTED" }`.

Only messages belonging to this card can be moderated. Response `200`: updated message.

---

## Admin (SUPERADMIN)

All routes require `SUPERADMIN`. Public serializers do not apply; admin responses may include internal IDs but never password hashes.

### `GET /admin/stats`

```json
{
  "homes": { "total": 3, "active": 2, "suspended": 1 },
  "cards": { "total": 12, "published": 10, "unpublished": 2 },
  "messages": { "pending": 4, "approved": 30, "rejected": 1 },
  "demoMrrTry": 3000
}
```

`demoMrrTry` is computed from active homes' MONTHLY plan price; it is not real revenue.

### `GET /admin/homes`

Query: `search?`, `plan?`, `status?`, `limit?`.

Response: homes with `_count.cards`, `_count.users`, `pendingMessages`.

### `GET /admin/homes/:id`

Home + users (without password hashes) + cards summary + message counts.

### `PATCH /admin/homes/:id`

Request: `{ "plan": "MONTHLY", "status": "ACTIVE" }` (either/both). Response `200`: updated home.

### `GET /admin/cards`

Query: `search?`, `homeId?`, `published?`, `limit?`. Returns cards with home name and message counts.

### `PATCH /admin/cards/:id`

Request: `{ "published": false }`. Response `200`: updated card.

### `DELETE /admin/cards/:id`

Deletes the card and its messages. Response `204`.

### `GET /admin/messages`

Query: `status?`, `homeId?`, `cardId?`, `limit?`. Returns messages with card + home names.

### `PATCH /admin/messages/:id`

Request: `{ "status": "APPROVED" | "REJECTED" }`. Response `200`: updated message.

### `DELETE /admin/messages/:id`

Deletes a message. Response `204`.

### `GET /admin/audit`

Query: `limit?` (default 100, max 200). Requires `SUPERADMIN`.

```json
{
  "logs": [
    {
      "id": "audit_...",
      "action": "HOME_UPDATE",
      "entity": "funeral_home",
      "entityId": "home_...",
      "meta": { "plan": "MONTHLY", "status": "ACTIVE" },
      "actor": { "id": "usr_...", "name": "Süper Admin", "email": "admin@taziyekart.local" },
      "createdAt": "2026-10-27T20:00:00.000Z"
    }
  ]
}
```

Actions: `ADMIN_LOGIN`, `HOME_UPDATE`, `CARD_PUBLISH`, `CARD_UNPUBLISH`, `CARD_DELETE`, `MESSAGE_APPROVE`, `MESSAGE_REJECT`, `MESSAGE_DELETE`.

Audit meta never contains passwords, tokens or IBANs.

---

## Validation rules (shared)

- `deceasedName`: 1–120 chars.
- `honorific`: optional, max 40 chars.
- `funeralPlace`: 1–160 chars.
- `funeralDate`: `^\d{4}-\d{2}-\d{2}$` and a real date.
- `funeralTime`: `^\d{2}:\d{2}$`.
- `burialTime`: optional, same time format.
- URLs (`funeralMapUrl`, `donationUrl`): optional, `http(s)` only, max 500 chars.
- `donationIban`: optional; normalize spaces; if present, `TR` + 24 digits.
- `note`: optional, max 500 chars.
- `condolenceHours`: optional, max 80 chars.
- Email: valid, lowercased, unique.
- Password: min 8 chars, max 100.
- Phone: optional, max 30 chars.
- `published`: boolean.

## Security notes

- Do not log request bodies containing passwords, tokens or IBANs.
- Use generic login errors.
- Rate-limit auth and public writes.
- Public and edit pages must be `noindex`. Auth, panel and admin pages are also `noindex`; `robots.txt` disallows sensitive paths.
- State-changing browser requests are limited to `WEB_ORIGIN`; CORS is disabled and the Next rewrite keeps the cookie first-party.
- Security headers (`X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, COOP, restricted CSP) live in `web/next.config.ts`.
- Admin actions write an `AuditLog` row; never store passwords, tokens or IBANs in audit meta.
- The family edit token is a capability; if it leaks, the card can be edited. The panel can regenerate it in a later version (not in the MVP).
- The superadmin demo endpoint must be disabled in production (`DEMO_MODE=false`).
