# TaziyeKart — Design Direction

## Feeling

Calm, respectful, editorial. A funeral home should feel it can hand this link to a grieving family without embarrassment. No urgency, no ads, no bright gradients, no emoji, no exclamation marks.

The visual metaphor is **paper and ink**, not a startup dashboard. Deep green and muted gold, generous whitespace, large serif names, thin rules.

## Palette

| Token | Hex | Use |
|---|---|---|
| `cream` | `#F7F3EA` | page background |
| `paper` | `#FCFAF5` | cards, panels, print card |
| `forest` | `#1F3D33` | primary actions, headings |
| `forest-deep` | `#152B24` | hover/active, dark bands |
| `gold` | `#B08D57` | thin rules, eyebrow, focus ring, accents |
| `ink` | `#1B1B1B` | body text |
| `muted` | `#6B6B6B` | secondary text |
| `line` | `#E5DED0` | borders, dividers |

Avoid: purple/blue gradient SaaS look, neon, pure black `#000`, bright red errors as large blocks. Errors use a restrained rust/red text on a soft tint.

## Typography

- **Newsreader Variable** (`font-serif`) — public card name, sales hero, section titles, print card name.
- **Manrope Variable** (`font-sans`) — UI, forms, tables, body copy.
- Use `tabular-nums` for stats and prices.
- Sizes:
  - public name: `text-4xl`–`text-6xl`, `font-serif`, `leading-[1.05]`
  - sales hero: `text-5xl`–`text-7xl`, `font-serif`
  - section titles: `text-3xl`–`text-4xl`
  - body: `text-base`/`text-lg`, `leading-relaxed`
  - labels: `text-xs` uppercase tracking-wide with gold/muted

## Tone of voice

- Address the funeral home as "siz"; the family as "aile".
- Say "merhum/merhume", "cenaze namazı", "taziye", "defin"; avoid clinical words.
- Benefits over features: "Her cenazede aynı 40 telefonu bitirin", not "Next.js ile hızlı".
- Sales page can be persuasive; the public card is never salesy.
- No fake urgency, no countdowns, no "hemen son 3 kontenjan".

## Page directions

### Sales page `/`

- Header: wordmark "TaziyeKart" + "Giriş" + primary "Demo panele gir".
- Hero: eyebrow "Yerel cenaze evleri için", H1 "Her cenazede aynı 40 telefonu bitirin.", supporting paragraph, two CTAs.
- Right side: a sample public card (cream paper, serif name, gold rule, three info rows, QR). It should look like the real product, not a generic illustration.
- Trust band: "Aileler için ücretsiz · Reklamsız · Arama motorunda görünmez".
- Problem section: the same WhatsApp questions repeated; a before/after list.
- Solution: 3 steps (kart oluştur → linki aileye ver → herkes zamanında gelsin).
- Benefits: 3 cards (telefon trafiği, marka, her cenazede aynı kalite).
- Screenshot: real panel/public card.
- Pricing: Tek Kart 350 TL / Cenaze Evi 1.500 TL/ay (recommended); family-free band above.
- FAQ: 5 real objections.
- Final CTA + small demo disclaimer.

### Funeral home panel `/panel`

- Light cream background, paper cards, forest primary buttons.
- Sidebar or top tabs: Genel Bakış, Kartlar, Taziye Mesajları, Marka, Plan.
- Dashboard: plan/usage card, "Yeni kart" CTA, recent cards, pending messages.
- Empty state: a short, calm explanation and one primary action.
- Card list: table on desktop, cards on mobile. Status badges: Yayında (green), Yayında değil (muted), Askıda (rust).
- Card form: two columns on desktop — form left, live preview card right. Group fields: Merhum, Cenaze, Taziye, Bağış, Yayın.
- Success screen: public link + edit link + copy/WhatsApp buttons; a warning to save the edit link.
- Destructive actions use a confirm dialog and name the card.

### Public card `/k/[slug]`

- Paper-like centered column, max-width ~640px, generous vertical padding.
- Small eyebrow "Taziye" + funeral home name.
- Large serif name; honorific small above.
- Gold hairline.
- Three clear blocks:
  1. Cenaze namazı — place, date/time, "Yol tarifi" + "Takvime ekle".
  2. Defin — cemetery/time.
  3. Taziye — address/hours, map link.
- Donation block only if provided; official link preferred; IBAN with copy + "aile tarafından sağlandı" note.
- Action row: WhatsApp paylaş, Linki kopyala, Yazdır.
- Condolence book: approved messages, then a small form. Pending message confirmation.
- Footer: funeral home name/phone, "TaziyeKart" mark, "Bu sayfa arama motorlarında görünmez."
- No sticky ads, no share counts, no reactions.

### Print `/k/[slug]/yazdir`

- A6 (105 × 148 mm), two pages: front and back.
- Front: "Taziye" eyebrow, large name, honorific, prayer place/time, burial, thin gold rule, funeral home mark.
- Back: taziye address/hours, QR (about 35 mm), "Yol tarifi için okutun", URL in small text, funeral home name/phone.
- `@page { size: A6; margin: 0; }`; no browser header/footer; high contrast; serif name.
- "Yazdır / PDF olarak kaydet" button outside the printable area.

### Superadmin `/admin`

- Same palette, slightly denser. Top navigation: Genel Bakış, Cenaze Evleri, Kartlar, Mesajlar.
- Dashboard: stat cards with tabular numbers, recent activity, pending moderation.
- Tables with search, plan/status badges, row actions.
- Plan change and suspend use a dialog with a clear consequence sentence.
- No destructive mass actions in the MVP.

## Components

- Buttons: pill-shaped, forest/gold/outline/ghost; 44px min height.
- Cards: `rounded-2xl`, paper background, `border-line`, subtle shadow only on hover/important.
- Forms: labels above inputs, helper text, inline errors, 44px inputs, focus ring gold.
- Tables: thin row dividers, no heavy borders, sticky header on long lists.
- Badges: small, uppercase tracking, soft tint; no emoji.
- Dialogs: paper background, clear title, consequence text, cancel + destructive action.
- Empty states: a short sentence + one action; no illustrations that make light of death.

## Accessibility

- Contrast: ink on cream, forest on cream, paper on forest. Gold is an accent, not body text.
- Visible focus rings (`ring-2 ring-gold ring-offset-2`).
- Labels for every input; errors linked with `aria-describedby`.
- Keyboard: dialogs trap focus, escape closes, tables/links reachable.
- Motion: minimal; no auto-playing animation; respect `prefers-reduced-motion`.
- Print: high contrast, no background images that fail in grayscale.

## Content rules

- No real personal data in screenshots, seeds or demo cards.
- Use clearly fictional sample names ("Ahmet Yılmaz") in marketing only.
- No claims of moderation unless the moderation flow is actually built.
- No claims of real payment; demo checkout is labelled.
- No technology names on the sales page or in the pitch.
