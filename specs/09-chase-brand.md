# 09 · Chase brand

> Owner: design lead. Status: **binding, Chase-specific**. Last reviewed: 2026-04-07.
>
> Token values that instantiate [`08-visual-language.md`](08-visual-language.md)
> for Chase. `08` is the grammar; this file is the vocabulary. A white-label
> deploy swaps this file and the font files; it does not touch `08`.

The language in `08` is Chase-shaped on purpose. Warm paper, ink, a serif that
could sit next to a printed credit memo. This file pins the values so a screen
cannot drift toward a generic dashboard and still claim the language.

---

## 1. Mark and name

| Token | Value |
| --- | --- |
| Product name | `Astro` |
| Mark | Chase octagon, single-colour, `--ink` |
| Wordmark | none in the product; the editorial setting of "Astro" is the name |
| Clear-space | `8px` around the mark in the header |

The octagon sits in the header at `20px`, optically aligned to the cap-height of
the product name. It does not appear in the footer, on empty states, or as a
favicon variant. Favicon is the octagon at `-ink`, 32px, no padding, no rounded
frame.

On a production surface the mark stays `--ink`. It does not turn `--warn` to
"match" the environment chip. The chip carries the environment; the mark does
not.

---

## 2. Typefaces

Both faces are the Adobe Fonts / Google Fonts cuts of Source Serif 4 and Source
Code Pro. Self-host the `woff2` files; do not load them from a CDN at runtime.

| Face | Files | Weights | Unicode range |
| --- | --- | --- | --- |
| Source Serif 4 | `SourceSerif4-Regular.woff2`, `SourceSerif4-Medium.woff2`, `SourceSerif4-Italic.woff2` | 400, 500, italic 400 | Latin + → \u2013 \u2014 \u2018 \u2019 \u201c \u201d |
| Source Code Pro | `SourceCodePro-Regular.woff2`, `SourceCodePro-Medium.woff2` | 400, 500 | Latin + box-drawing for tables in `<pre>` |

No other cut. No semi-bold, no black, no variable font. The variable files are
larger and they make it too easy to pick `600`.

Fallback stack:

```
editorial: "Source Serif 4", "Iowan Old Style", "Palatino Linotype", Palatino, "Times New Roman", Times, serif
numeric:   "Source Code Pro", ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Consolas, monospace
```

(The doubled Source Code Pro in the numeric stack is deliberate: ui-monospace
resolves to it on some systems and to something else on others. Pinning it twice
puts the designed face ahead of the system mono.)

---

## 3. Colour tokens

Instantiations of the jobs in `08 §2`. Values are sRGB hex, not OKLCH, because
the first surfaces are CSS and the first print target is a laser printer that
speaks sRGB.

| Token | Hex | sRGB 0–1 | Contrast vs `--paper` |
| --- | --- | --- | --- |
| `--paper` | `#f7f4ee` | 0.969, 0.957, 0.933 | — |
| `--ink` | `#1c1917` | 0.110, 0.098, 0.090 | 14.1:1 |
| `--ink-muted` | `#57534e` | 0.341, 0.325, 0.306 | 7.0:1 |
| `--rule` | `#d6d3d1` | 0.839, 0.827, 0.820 | 1.3:1 (hairlines only) |
| `--held` | `#b45309` | 0.706, 0.325, 0.035 | 4.6:1 |
| `--clear` | `#0f766e` | 0.059, 0.463, 0.431 | 4.7:1 |
| `--warn` | `#b91c1c` | 0.725, 0.110, 0.110 | 4.8:1 |
| `--info` | `#1d4ed8` | 0.114, 0.306, 0.847 | 5.1:1 |

`--held`, `--clear`, `--warn`, `--info` all clear WCAG AA against `--paper` at
body size. `--ink-muted` clears AAA. `--rule` is a hairline and is not used as
text.

Do not derive hover or focus colours by lightening these. Hover on a text link
is `--ink` underline, 1px, offset `2px`. Focus is a `2px` `--ink` ring, offset
`2px`, radius `2px`.

Print: `--paper` becomes white, `--ink` stays, `--rule` becomes `#111`. Charts
that use the `0.18` band fill become a 10% black hatch in print CSS.

---

## 4. The octagon

The Chase octagon is a custom path, not a rounded-rect. Optical size at `20px`
in the header:

```
viewBox="0 0 24 24"
<path d="M7.5 2h9l5.5 5.5v9L16.5 22h-9L2 16.5v-9L7.5 2z"/>
```

Fill `--ink`. No stroke. No inner mark (the original Chase octagon contains a
wordmark at large sizes; at 20px that wordmark is noise). The path above is the
outer octagon only.

Clear-space is `--space-2` (`8px`) on every side. The mark does not sit on a
coloured chip and does not reverse out of `--ink`.

---

## 5. Motion tokens

From `08 §5`, pinned.

| Token | Value |
| --- | --- |
| `--ease` | `cubic-bezier(0.2, 0, 0, 1)` |
| `--duration-fast` | `120ms` |
| `--duration` | `200ms` |

No Chase-specific motion. The language is mechanical on purpose; a branded
easing curve would be decoration.

---

## 6. Voice in the product

Chase's external voice is not the voice of this product. The product speaks like
a credit memo: short sentences, active verbs, numbers with units, no metaphor.

| Instead of | Write |
| --- | --- |
| "Let's get you set up" | "Choose a role to open the queue." |
| "Oops, something went wrong" | "The run crashed. The attempt is on the ledger." |
| "Great news" | the number, then what it means |
| "N/A" | em-dash |
| "click here" | the name of the surface |

Role names in the UI are the names in [`02-domain-model.md`](02-domain-model.md)
§3: reviewer, operator, overseer. Not "user", not "admin", not "credit officer"
— those are job titles, and a person may hold more than one role.

The environment chip uses the three values in `08 §9` in lowercase. Not "PROD",
not a green dot.

---

## 7. What this file does not govern

- Legal line, privacy, © Chase. Those live on the marketing site and in the
  footer of produced PDFs, not on working surfaces.
- Photography, illustration, 3-d renders of the octagon. None of those appear
  in the product.
- The Chase sans (currently a custom cut of a geometric). It is the marketing
  face. It does not appear in Astro.

---

## 8. Acceptance criteria

**AC-09.1** GIVEN the header WHEN it is rendered THEN the mark is the Chase
octagon at `20px`, fill `--ink`, no inner wordmark.

**AC-09.2** GIVEN any working surface WHEN web fonts fail to load THEN the
fallback stack in §2 is what renders, and it is still a serif + mono pairing.

**AC-09.3** GIVEN `--held`, `--clear`, `--warn`, `--info` WHEN measured against
`--paper` THEN each clears WCAG AA at body size.

**AC-09.4** GIVEN a production surface WHEN the header is shown THEN the mark
stays `--ink` and the environment chip is `--warn`.

**AC-09.5** GIVEN the typefaces WHEN they are loaded THEN they are self-hosted
`woff2`, not a runtime CDN.
