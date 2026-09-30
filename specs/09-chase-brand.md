# 09 · Chase brand aesthetic

Context for agents and designers building UI that should read as Chase. Derived
from a review of `chase.com` (homepage + Home Lending) in September 2026, plus
JPMorganChase published brand references.

Status: draft for review · Depends on: nothing · Governs: `08-visual-language.md`

> **Source-of-truth warning.** Chase's real design tokens live in the internal
> Chase design system, which is not reachable from the public web. Values below
> marked `~approx` are inferred from public brand references and observed page
> behavior, not read off a computed stylesheet. Replace them with internal token
> names before this file governs production work. The octagon mark and "Chase"
> wordmark are registered trademarks — never redraw them; use supplied assets only.

**Confidence key:** `[obs]` observed directly on chase.com · `[pub]` published
brand reference · `~approx` structural placeholder, verify internally.

---

## 0. Applicability

This spec has two scopes, and conflating them produces the wrong build.

| Scope | What it covers | Sections that apply |
|---|---|---|
| **Brand** | Hue, typeface, logo, voice, accessibility | §2, §3, §9, §10 accessibility items, §11 |
| **Public surface** | Customer-facing marketing and application pages | all sections |

Astro is an **internal console**. Brand-scope sections bind it; public-surface
sections do not. Specifically, the density and rhythm rules in §4, the imagery
rules in §7, and the regulated-disclosure marks in §10 (FDIC, Equal Housing,
NMLS ID, investment-risk block, Spanish parity) govern customer-facing surfaces
and are **out of scope for Astro** — noted explicitly here so their absence is a
recorded decision rather than an oversight.

Where this spec and `08` disagree within brand scope, this spec wins. The
reconciliation table lives in `08 §9`.

---

## 1. Posture

Chase's aesthetic is **institutional calm**. It is not trying to feel like a
startup, and it is not trying to feel like a private bank. Five things define it:

1. **Blue does the identity work; everything else gets out of the way.** The
   palette is effectively monochrome-plus-blue. Color is never used
   decoratively — a colored element is either the brand, an action, or a status.
2. **Reassurance over persuasion.** Copy leads with what the customer gets, in
   plain declaratives. `[obs]` Home Lending's hero is "We're with you, all the way
   home" followed by three concrete benefit lines, not a value proposition
   paragraph.
3. **Density is low, structure is high.** Generous whitespace, one idea per band,
   full-width horizontal sections stacked vertically. Nothing is dashboard-dense
   on marketing surfaces.
4. **Disclosure is part of the visual system, not an afterthought.** `[obs]`
   Regulatory blocks (FDIC, Equal Housing, NMLS ID, all-caps investment-risk
   lists) are designed real estate. A Chase-looking page that omits them doesn't
   look like Chase.
5. **Accessibility is visible in the markup.** `[obs]` Skip links, descriptive
   link text ("Read more about prequalification details" rather than "Read more"),
   explicit "Opens overlay" suffixes on links that change context.

Posture item 1 is the one that survives translation to an internal console: the
monochrome-plus-blue discipline is the same rule `08 §1` states as "colour is
state, never decoration."

---

## 2. Color

### Brand
| Token | Value | Notes |
|---|---|---|
| `--chase-blue` | `#117ACA` | `[pub]` Primary brand blue. The identity color. |
| `--chase-navy` | `#004B87` | `[pub]` Deeper blue for weight, footers, dark bands. |
| `--chase-ink` | `#211E1E` | `[pub]` Warm near-black used in the logo lockup. |
| `--chase-white` | `#FFFFFF` | `[obs]` Dominant surface. Tile color is declared `#FFFFFF`. |

### Structural scale `~approx`
Build a single blue ramp and a single neutral ramp. Do not introduce a second hue
family for UI — Chase resists accent colors.

```
blue-50   tint wash for callout/info surfaces
blue-100  hover/selected background
blue-500  --chase-blue          primary action, links
blue-700  --chase-navy          hover on primary, dark bands
blue-900  deepest navy          footer, dark hero overlays

neutral-0    #FFFFFF            page surface
neutral-50   off-white          alternating section bands
neutral-200  hairline borders, dividers
neutral-600  secondary text
neutral-900  --chase-ink        primary text
```

### Semantic
Reserve non-blue hues **only** for status: success green, warning amber, error
red, plus a neutral informational blue. These are functional, never brand
expression. Financial figures are not colored red/green by default in Chase
marketing surfaces — that's a trading-UI convention, not a retail-banking one.

Astro's verdict triad in `08 §1` is a status palette in this sense, and is
therefore permitted. It must not be extended into decoration.

### Rules
- Blue text on white and white text on `--chase-navy` are the two canonical
  pairings.
- Never place `--chase-blue` on `--chase-navy`; contrast fails and it muddies the
  brand.
- No gradients as decoration. If a gradient appears, it's a photographic overlay
  for text legibility, not an aesthetic device.
- Target WCAG AA at minimum for all text; regulated financial UI is audited.

---

## 3. Typography

**Family:** Open Sans. `[pub]` It's Chase's long-standing web face and one of the
two UI families in Salt, JPMorganChase's published design system (alongside
Amplitude, which is the J.P. Morgan institutional face — do **not** use Amplitude
for Chase consumer surfaces). PT Mono for code, if code appears at all.

```css
--font-sans: "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
```

**Scale `~approx`** — a modest, non-dramatic ramp. Chase does not use oversized
display type; the largest headline on a marketing hero stays in the 40–56px range
on desktop.

| Role | Size / line-height | Weight |
|---|---|---|
| Hero headline | 48 / 1.15 | 600–700 |
| Section heading (h2) | 32 / 1.25 | 600 |
| Card heading (h3) | 20 / 1.35 | 600 |
| Body | 16 / 1.5 | 400 |
| Small / disclosure | 13–14 / 1.5 | 400 |
| Eyebrow | 13 / 1.4, uppercase, tracked | 600 |

**Notes**
- Sentence case for headings and buttons. Title Case reads as legacy Chase and is
  being phased out of newer surfaces.
- The uppercase eyebrow above a hero headline is genuinely part of this brand
  `[obs]` ("HOME MORTGAGE LOANS" / "We're with you, all the way home"). Keep it
  here even though it's a generic tell elsewhere — but don't spread it above every
  section heading.
- Body measure ≤ 70ch.
- Weight, not color, carries emphasis inside body copy.

The type scale above is a **marketing** ramp. An internal console does not inherit
it; `08 §2` holds for Astro. What Astro does inherit is the family (Open Sans) and
sentence case. See `08 §9`.

---

## 4. Space & layout

*Public-surface scope. Astro uses `08 §3` and `§4`.*

- **Grid:** 12 column, max content width ~1140–1200px, centered, generous gutters.
- **Spacing scale `~approx`:** 4px base — `4, 8, 12, 16, 24, 32, 48, 64, 96`.
- **Section rhythm:** vertical bands at 64–96px padding on desktop, 40–48px on
  mobile. Alternate white and off-white to separate bands rather than adding
  borders.
- **Alignment:** left-aligned by default. Centered text is reserved for short
  closing CTA bands `[obs]` ("Home is waiting for you").
- **Hero:** text left, supporting photograph right. Not full-bleed image with
  overlaid text — Chase keeps copy on a solid surface for legibility and contrast
  compliance.

---

## 5. Shape & elevation

`~approx` — verify against internal tokens.

- **Radius:** small and consistent. ~4px on inputs and cards, pill (`999px`) on
  primary buttons. Avoid mixing three radii on one screen.
- **Elevation:** minimal. Cards are defined by a hairline border or a background
  tint before they're defined by a shadow. If a shadow is used, one soft
  low-opacity token only — no per-card hover lift.
- **Borders:** 1px `neutral-200` hairlines. Horizontal rules appear beneath SEO
  footer headings `[obs]`, which is a real Chase pattern.

Astro applies the stricter no-shadow rule from `08 §3`, which is compatible.

---

## 6. Component vocabulary (observed)

*Public-surface scope.*

| Component | Behavior |
|---|---|
| **Global header** | Chase logo left, `Sign in` right, Español toggle, primary product nav. Sign-in opens an overlay rather than a route change. |
| **Product sub-nav** | Sticky secondary rail under the header on product sections: Overview / Rates / Buy / Refinance / Home equity / Calculators / Manage accounts. Renders as a scrollable rail on mobile. |
| **Hero** | Eyebrow → headline → 2–4 benefit bullets → primary + secondary CTA → image. |
| **Dual CTA** | Filled primary + text/outline secondary, always paired. `Apply now` + `See current rates`. |
| **Media block** | Image on one side, h2 + one supporting sentence + one text-link CTA on the other. Sides alternate down the page. |
| **Card grid** | 3-up: image, h3, descriptive link. Used for education/resource content. |
| **Tabs** | Segmented content (Purchase rates / Refinance rates) rather than duplicated pages. |
| **Calculator** | A first-class component, not a utility. Calculators are a core Chase content type and get their own CTAs. |
| **Award / trust badge** | Third-party recognition (J.D. Power) with mandatory attribution line. |
| **Closing CTA band** | Short centered headline, one sentence, one button. |
| **Disclosure stack** | All-caps risk list → product-specific legal paragraph → entity line → NMLS ID. |
| **SEO footer** | h2 + hairline rule + link-dense paragraph, repeated per product area. Visually quiet, small type. |

**Buttons** — brand scope, applies to Astro:
- Primary: filled `--chase-blue`, white label, pill or 4px radius.
- Secondary: transparent with blue label and border.
- Tertiary: blue text link, underlined on hover.
- Label = the action that happens. "Apply now," "Get rates," "Estimate your
  payment." Never "Submit," "Learn more," or "Click here."

---

## 7. Imagery

*Public-surface scope. Astro carries no photography.*

- Warm, natural-light documentary photography of real people in real settings
  `[obs]` (customer-story content like Chantel's Haiti-to-Brooklyn homeownership
  piece).
- Diverse, unposed, mid-action. Not stock-handshake, not conceptual abstraction.
- Product illustration is spare, flat, and blue-dominant when used.
- No photographic filters, no duotone brand washes.

---

## 8. Motion

Restrained and functional. Motion answers an action — overlay open, tab switch,
accordion expand, sticky nav pin. No scroll-triggered reveals, no parallax, no
hover lift on cards. Durations 150–250ms, standard ease-out. Respect
`prefers-reduced-motion`.

---

## 9. Voice

- Second person, active voice, present tense. "We're with you." "Get started."
- Short declaratives. Concrete numbers over adjectives: "Down payments as low as
  3%," "Guaranteed on-time closing or get $5,000" `[obs]`.
- Plain language, no jargon without a definition. Chase's Education Center voice
  is the house voice: explain the thing, then link to the tool.
- Never overpromise. Anything conditional gets a disclosure.
- Errors state what happened and what to do. They don't apologize and they aren't
  vague.
- Empty states point at the next action.

Chase's "never overpromise / anything conditional gets a disclosure" and Astro's
"state the limitation next to the number" (`08 §7`) are the same instinct at two
scales. They reinforce rather than conflict.

---

## 10. Non-negotiables for regulated surfaces

Any **customer-facing** Chase build must carry these or it isn't shippable:

- Member FDIC + Equal Housing Opportunity marks in the footer.
- NMLS ID on lending surfaces.
- All-caps investment-risk block on any surface touching investment or insurance
  products.
- Rate/term disclaimers adjacent to any displayed rate.
- Spanish parity route (`/es/...` or `/espanol`) where the surface is public.

The following apply to **every** build including internal ones:

- `Skip to main content` link.
- Visible keyboard focus on all interactive elements.
- Descriptive link text; no bare "Read more".
- Context-change announcements on links and controls that open an overlay.
- WCAG AA contrast minimum, audited.

---

## 11. Anti-patterns

- Purple, teal, or terracotta accents. Any second hue family.
- Gradient meshes, glassmorphism, glows, neon.
- Oversized display type or a serif headline face.
- Dark mode as a marketing aesthetic (product surfaces may support it; the brand
  expression is light).
- Playful microcopy, exclamation marks, emoji.
- Rounded-everything SaaS card kits with uniform shadows.
- Decorative iconography that doesn't encode information.
- A `→` glued to every link label.

---

## 12. Verify before production

- [ ] Real hex values and token names from the internal Chase design system
- [ ] Actual spacing scale and radius tokens
- [ ] Licensed Open Sans build and permitted weights
- [ ] Official logo assets (never redrawn)
- [ ] Motion tokens
- [ ] Semantic status palette and its contrast audit
- [ ] Legal review of any disclosure text reproduced from live pages

## 13. Open questions

- Does the Astro verdict triad (`08 §1`) pass the semantic-palette contrast audit
  in §12 against both the light and dark grounds?
- Is JetBrains Mono acceptable in place of the PT Mono named in §3, given that
  Astro's mono usage is structural rather than incidental code display?
- Does an internal console owe a Spanish parity route? §10 scopes the requirement
  to public surfaces; reviewer-facing tooling is unaddressed.
- Which internal token names replace the `~approx` scale, and who owns that
  mapping?
