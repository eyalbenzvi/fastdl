---
name: רישיון עד הבית
description: Official, calm Hebrew-RTL service UI for choosing how a state-issued licence reaches you.
colors:
  navy: "#15324A"
  navy-50: "#EDF3F6"
  navy-100: "#E3EAF0"
  primary: "#0351E0"
  primary-hover: "#0241B5"
  primary-50: "#F1F5FE"
  primary-100: "#E6EEFC"
  brand-cyan: "#10A9E0"
  brand-cyan-dark: "#0A6E92"
  hero-circle: "#DCEEF6"
  focus: "#FFB020"
  gate-status: "#0B6E61"
  gate-status-50: "#E6F3F1"
  guide: "#5B1FA7"
  guide-50: "#F4EEFC"
  success: "#1E7F52"
  success-bg: "#F1FAF4"
  warning-text: "#8A5A12"
  warning-bg: "#FFF6E8"
  warning-border: "#E7A13B"
  warning-marker: "#B26B00"
  danger: "#B53A3A"
  danger-bg: "#FDF1F1"
  info: "#0A6E92"
  info-bg: "#EAF6FB"
  neutral-badge: "#5A6772"
  neutral-bg: "#EEF2F4"
  tbc-border: "#C98A2E"
  text-muted: "#4F5F6B"
  border: "#D9E4EA"
  border-strong: "#B8CBD6"
  input-border: "#6E8292"
  step-future: "#8796A2"
  disabled-bg: "#C5CED6"
  disabled-text: "#3E4B55"
  bg: "#F4F6F8"
  surface: "#FFFFFF"
  row-hover: "#F7F9FB"
  footer-line: "#2E4C64"
  footer-muted: "#E3EDF3"
  demo-bg: "#2B2F36"
  demo-accent: "#FFD27A"
  demo-muted: "#D1D5DB"
  demo-toggle: "#444A53"
  footer-hover: "#CFE6F2"
  wordmark-sub-dark: "#CFE0EA"
  skel: "#E6ECF0"
  skel-shine: "#F2F5F7"
  illus-1: "#C5DAE5"
  illus-2: "#B6CCD8"
  illus-3: "#9DB7C6"
  illus-card-from: "#F7FBFD"
  illus-card-to: "#D6EBF4"
  illus-line: "#DCE4EA"
typography:
  hero:
    fontFamily: "Heebo, Assistant, Arial Hebrew, Arial, sans-serif"
    fontSize: "44px"
    fontWeight: 800
    lineHeight: 1.2
  h1:
    fontFamily: "Heebo, Assistant, Arial Hebrew, Arial, sans-serif"
    fontSize: "40px"
    fontWeight: 700
    lineHeight: 1.2
  h1-page:
    fontFamily: "Heebo, Assistant, Arial Hebrew, Arial, sans-serif"
    fontSize: "38px"
    fontWeight: 700
    lineHeight: 1.2
  h1-auth:
    fontFamily: "Heebo, Assistant, Arial Hebrew, Arial, sans-serif"
    fontSize: "36px"
    fontWeight: 700
    lineHeight: 1.25
  h1-status:
    fontFamily: "Heebo, Assistant, Arial Hebrew, Arial, sans-serif"
    fontSize: "34px"
    fontWeight: 700
    lineHeight: 1.25
  h1-flow:
    fontFamily: "Heebo, Assistant, Arial Hebrew, Arial, sans-serif"
    fontSize: "32px"
    fontWeight: 700
    lineHeight: 1.25
  h1-flow-mobile:
    fontFamily: "Heebo, Assistant, Arial Hebrew, Arial, sans-serif"
    fontSize: "26px"
    fontWeight: 700
    lineHeight: 1.25
  h1-mobile:
    fontFamily: "Heebo, Assistant, Arial Hebrew, Arial, sans-serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: 1.2
  h2:
    fontFamily: "Heebo, Assistant, Arial Hebrew, Arial, sans-serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: 1.3
  h3:
    fontFamily: "Heebo, Assistant, Arial Hebrew, Arial, sans-serif"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: 1.4
  title:
    fontFamily: "Heebo, Assistant, Arial Hebrew, Arial, sans-serif"
    fontSize: "19px"
    fontWeight: 700
    lineHeight: 1.4
  lead:
    fontFamily: "Heebo, Assistant, Arial Hebrew, Arial, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.6
  body:
    fontFamily: "Heebo, Assistant, Arial Hebrew, Arial, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.6
  ui:
    fontFamily: "Heebo, Assistant, Arial Hebrew, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.2
  small:
    fontFamily: "Heebo, Assistant, Arial Hebrew, Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.6
  xs:
    fontFamily: "Heebo, Assistant, Arial Hebrew, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.4
  tag:
    fontFamily: "Heebo, Assistant, Arial Hebrew, Arial, sans-serif"
    fontSize: "13px"
    fontWeight: 700
    lineHeight: 1.6
  button:
    fontFamily: "Heebo, Assistant, Arial Hebrew, Arial, sans-serif"
    fontSize: "17px"
    fontWeight: 600
    lineHeight: 1.2
  arabic-body:
    fontFamily: "Noto Sans Arabic, Heebo, Arial, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.7
rounded:
  xs: "6px"
  sm: "8px"
  icon: "10px"
  md: "12px"
  inner: "14px"
  lg: "16px"
  xl: "20px"
  art: "18px"
  pill: "999px"
spacing:
  sp-1: "4px"
  sp-2: "8px"
  sp-3: "12px"
  sp-4: "16px"
  sp-5: "20px"
  sp-6: "24px"
  sp-7: "28px"
  sp-8: "32px"
  sp-10: "40px"
  sp-12: "48px"
  sp-14: "56px"
  sp-16: "64px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "0 24px"
    height: "52px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.surface}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "0 24px"
    height: "52px"
  button-secondary-hover:
    backgroundColor: "{colors.primary-50}"
    textColor: "{colors.primary-hover}"
  button-small:
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "44px"
  icon-button:
    backgroundColor: "{colors.navy-50}"
    textColor: "{colors.navy}"
    rounded: "{rounded.icon}"
    size: "44px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.navy}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "52px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "28px"
  card-quiet:
    backgroundColor: "{colors.navy-50}"
    rounded: "{rounded.lg}"
    padding: "28px"
  option-card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "20px 22px"
  option-card-selected:
    backgroundColor: "{colors.primary-50}"
    rounded: "{rounded.lg}"
  tag-fast:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    typography: "{typography.tag}"
    rounded: "{rounded.pill}"
    padding: "2px 10px"
  tag-free:
    backgroundColor: "{colors.success-bg}"
    textColor: "{colors.success}"
    typography: "{typography.tag}"
    rounded: "{rounded.pill}"
    padding: "2px 10px"
  tag-notrack:
    backgroundColor: "{colors.neutral-bg}"
    textColor: "{colors.text-muted}"
    typography: "{typography.tag}"
    rounded: "{rounded.pill}"
    padding: "2px 10px"
  badge-success:
    backgroundColor: "{colors.success-bg}"
    textColor: "{colors.success}"
    rounded: "{rounded.pill}"
    padding: "6px 12px"
  badge-warning:
    backgroundColor: "{colors.warning-bg}"
    textColor: "{colors.warning-text}"
    rounded: "{rounded.pill}"
    padding: "6px 12px"
  callout-info:
    backgroundColor: "{colors.info-bg}"
    textColor: "{colors.navy}"
    rounded: "{rounded.md}"
    padding: "16px 20px"
  callout-warning:
    backgroundColor: "{colors.warning-bg}"
    textColor: "{colors.navy}"
    rounded: "{rounded.md}"
    padding: "16px 20px"
  tbc-marker:
    backgroundColor: "{colors.warning-bg}"
    textColor: "{colors.warning-text}"
    rounded: "{rounded.xs}"
    padding: "0 6px"
  chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.navy}"
    rounded: "{rounded.pill}"
    padding: "0 18px"
    height: "44px"
  chip-pressed:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.surface}"
  site-footer:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.surface}"
---

# Design System: רישיון עד הבית

<!-- Recorded by `impeccable document` (scan mode) from css/tokens.css, css/components.css and css/pages.css, plus the rendered pages at 1280 and 390. The qualitative wording was inferred, not asked (the run was told not to interview). Source of truth for values is css/tokens.css. The approved mockups in _kit/mockups/ outrank this file. -->

## Overview

**Creative North Star: "The Service Counter"**

This is a government-grade service counter rendered on a phone: one clerk, one form, one clear next step. The page is a calm, cool, light-grey hall (#F4F6F8). White cards stand on it like counter windows, with a soft lift so they read as places where something happens. Deep navy carries the institutional voice: headings, body text and the footer. A single saturated action blue marks the only thing to press. Everything else is quiet on purpose, so the one primary action and the honest state of the request are what the eye finds first.

The density is generous, and the type is large for an older, mobile and sometimes stressed reader. Body text is 17px, lead text 18px, fields and buttons 52px. The system is RTL-native: mirrored arrows (forward points left), logical properties throughout, and numbers isolated in LTR runs with tabular figures. State is never only colour: every badge, timeline step and callout pairs an icon with a word. Unconfirmed facts are not hidden or guessed. They appear in a deliberately loud dashed amber marker, `[לאישור]`, because in this product an honest gap is better than a confident invention.

Confirmed rejections (from `_kit/docs/01_product_rules.md`): the old site's light-blue and salmon palette, the jeep illustration and the single long scroll. No comic illustration and no decorative animation. No three-coloured primary buttons for the three home gates.

**Key Characteristics:**
- Cool grey ground, white raised cards, navy text, one action blue.
- One Primary button per screen or state. Everything else is a blue-outline Secondary or an underlined link.
- Large, plain Heebo type with balanced headings and tabular numerals.
- Icon + word for every status. A dashed amber `[לאישור]` for every unconfirmed value.
- Motion is functional only (150–200ms), and off under reduced motion.

## Colors

A restrained institutional palette: navy and cool greys, one action blue, and a small semantic set. Every text/background pair meets WCAG AA.

### Primary
- **Counter Blue** (`primary`): every Primary button, every link, the selected option card's border, timeline progress and the current stepper dot. 6.0:1 on white. Hover and press use **Deep Counter Blue** (`primary-hover`). **Blue Wash** (`primary-50`) fills the selected option card. **Blue Mist** (`primary-100`) is the icon-button hover.

### Secondary
- **Institution Navy** (`navy`): headings, body text, the footer ground, pressed chips and the "in production" badge text. **Navy Haze** (`navy-50`) is the trust bar, quiet cards, icon tiles and the address card. **Navy Fog** (`navy-100`) is the in-production badge ground.

### Tertiary
- **Wordmark Cyan** (`brand-cyan`): the three wordmark bars and illustration accents **only**. Never text, never a button. **Harbour Teal** (`brand-cyan-dark` / `info`) is its accessible stand-in for trust-bar icons and info text.
- Gate accents (home A only, icon and title colour): **Status Teal** (`gate-status`) and **Guide Violet** (`guide`), each with a 50 tint. Buttons stay blue.

### Neutral
- **Hall Grey** (`bg`): the page ground. **Paper** (`surface`): cards, drawers, inputs.
- **Slate** (`text-muted`): help, dt labels, secondary lines. **Mist Line** (`border`): dividers. **Steel Line** (`border-strong`): the border of an unselected option card. **Field Edge** (`input-border`, 3:1): input borders. **Future Step** (`step-future`): the ring of an unreached timeline step.
- Semantics, each a text colour on its own tint: success **Clearance Green**, warning **Amber Notice** (with `warning-border`, and `warning-marker` for the S7 timeline dot only), danger **Signal Red**, info **Harbour Teal**, neutral **Slate** on `neutral-bg`.

### Named Rules
**The One Blue Rule.** Counter Blue means "you can act here". It is never decoration, never a background block, and never on two Primary buttons in the same state.

**The Cyan Is Ink-Free Rule.** Wordmark Cyan (#10A9E0) fails contrast. It may draw bars and illustration, and nothing a person must read or press.

**The Honest Gap Rule.** Any value not confirmed by the business rules is set in the `[לאישור]` marker (Amber Notice text on `warning-bg`, dashed `tbc-border`), never filled with a plausible number.

## Typography

**Display Font:** Heebo 800 (with Assistant, Arial Hebrew, Arial)
**Body Font:** Heebo 400/500/600/700 (same stack), self-hosted woff2 in Hebrew and Latin subsets
**Arabic:** Noto Sans Arabic 400–800, line-height 1.7 (`home-ar.html`)

**Character:** a single humanist-geometric Hebrew sans used at large, friendly sizes. The hierarchy comes from size and weight steps, not from a second face. Numbers use tabular figures and are isolated LTR.

### Hierarchy
- **Hero** (800, 44px desktop / 28px ≤640, 1.2): `--fs-hero`, `.h-hero` (the design-system page title). The home H1 follows mockup 02 at the H1 step (40px) in weight 800. The second line is in Counter Blue (`.accent`) and balanced separately.
- **H1 page / auth / status / flow** (700, 38 / 36 / 34 / 32px desktop – `--fs-h1-page`, `--fs-h1-auth` (login, OTP, error), `--fs-h1-status`, `--fs-h1-flow`; 28px `--fs-h1-m` or 26px `--fs-h1-flow-m` on mobile, 1.2–1.25): one per page.
- **H2** (700, 28px / 22px, 1.3): section headings. Card headings such as "מה עכשיו?" sit at 22–24px.
- **H3** (700, 20px / 18px, 1.4): gate titles, card titles.
- **Title** (700, 19px, `--fs-title`): card titles in the info and flow pages (about, fastest, pickup, order, contact).
- **Lead** (400, 18px, 1.6): opening paragraphs.
- **Body** (400, 17px, 1.6): the floor for running text is 16px.
- **Small** (400/600, 15px, 1.6): help text, dt labels, notes.
- **Tag** (700, 13px, 1.6): pills on cards only, never running text.
- **Button** (600, 17px; 16px `--fs-ui` for the small size, chips and the menu button).
- **XS** (14px, `--fs-xs`): dense sub-lines and the demo bar only.

All `--fs-*` tokens are in rem on a 16px base (17px = `1.0625rem`), so a larger browser font size scales the text; at the default the rendering is identical. Spacing, radii and control heights stay in px. Page CSS uses the tokens; the few one-off sizes without a step (21, 24, 30, 42, 64px) are written in rem.

### Named Rules
**The Balanced Line Rule.** Headings use `text-wrap: balance` and paragraphs use `text-wrap: pretty`. Line breaks may change. The approved wording may not.

**The Isolated Number Rule.** Every ID, phone, date, order or tracking number sits in `<span class="num" dir="ltr">` with tabular figures.

## Layout

Mobile-first and single-column at ≤640. Content widths are set by the page's job: general 1248, information 1048, FAQ 968, status 928, forms and the order flow 768, accessibility and error 848 (max-width including 24px padding). The `wrap` gutter is 24px, and 16px at ≤640, extended by `env(safe-area-inset-*)`.

Breakpoints: ≤1023 the navigation collapses to a "תפריט" button plus a phone icon. ≤860 three- and four-column grids drop to two, the hero stacks and the side grids (payment, contact, fastest) stack. ≤640 is mobile: every grid is one column, H1 is 28, primary buttons go full width, drawers become bottom sheets, the timeline goes vertical or compact ("שלב N מתוך 5" + dots), the stepper becomes "שלב X מתוך 4" + a bar, order actions become a sticky bottom bar, and the hero illustration hides. At ≤374 and ≤359 the header tightens. At ≤300 (page zoom 200% on a 390 phone) the header wraps to two lines and dense pages (guide, fastest, contact, design system, prototype index) tighten padding so nothing scrolls sideways at 195px.

Spacing runs on a 4px grid (4·8·12·16·20·24·28·32·40·48·56·64). Section rhythm is 56px (40 on mobile). Cards pad 28px (20 on mobile), and order form cards 30–36px. Header 76/64px, trust bar 46px.

**The One Column Of Intent Rule.** In the Operate flows (status, order, reissue) the content lives in one narrow column, and the side gutters stay empty on desktop rather than gaining extra panels.

## Elevation & Depth

A hybrid system: flat tonal layering (Hall Grey ground → Paper cards → Navy Haze quiet panels) plus one soft ambient shadow for raised surfaces. Shadows are navy-tinted, offset downward and widely blurred. There are no glows and no hard offsets.

### Shadow Vocabulary
- **Card** (`0 1px 2px rgba(21,50,74,.06), 0 4px 16px rgba(21,50,74,.06)`): every `.card`.
- **Raised** (`0 8px 32px rgba(21,50,74,.12)`): the hero ID card and the SMS chip in the illustration.
- **Drawer** (`0 8px 32px rgba(21,50,74,.20)`): drawers, modals, bottom sheets.
- **Sticky** (`0 -4px 16px rgba(21,50,74,.12)`): the mobile order action bar.

### Named Rules
**The Quiet Card Rule.** A card inside a card is not lifted. Nested groups use Navy Haze or a 1px Mist Line, never a second shadow.

## Shapes

Gently rounded, friendly but not playful: 6px for the `[לאישור]` marker, 8px small, 10px icon buttons, 12px buttons, fields and callouts, 14px inner boxes, 16px cards and option cards, 20px modals and bottom-sheet tops, 999px tags, badges, chips and the demo pill. Borders are 1px dividers, 1.5px inputs and unselected option cards, 2px the selected option card, Secondary buttons and the error input. The only gradient is the hero ground (`#FFFFFF → #EDF3F6`, 180deg). The illustration card (tilted -5°, `--radius-art` 18px, gradient `illus-card-from → illus-card-to`) is the only rotated element. Illustration greys (`illus-1..3`, and `illus-line` for the pickup map ground) are decorative only, never text.

## Components

### Buttons
- **Shape:** gently curved (12px), 52px tall, padding 0 24px, Heebo 600 17px, icon gap 8px. The small size is 44px tall, 16px text.
- **Primary:** Counter Blue fill, white text, 2px same-colour border. At most one visible per state.
- **Hover / Focus / Press:** hover darkens to Deep Counter Blue (only under `(hover:hover) and (pointer:fine)`). Press shares the hover look and scales to .97 in 150ms. Focus is the 3px #FFB020 ring with 2px offset.
- **Secondary:** white fill, 2px Counter Blue border and text. Hover fills Blue Wash.
- **Link button:** underlined blue text with offset 3px, 44px hit height. **Icon button:** a 44px Navy Haze square at 10px radius; the ghost variant is transparent blue.
- **Disabled:** #C5CED6 ground with #3E4B55 text. **Busy:** spinner + `aria-busy`, width held.

### Chips
- **Style:** a 44px pill, 1.5px Field Edge border, white, navy 600 16px text.
- **State:** pressed (`aria-pressed`) goes solid navy with white text. Used for FAQ filters and the demo bar (dark variant).

### Cards / Containers
- **Corner Style:** 16px.
- **Background:** Paper on Hall Grey. Quiet variant in Navy Haze with no shadow.
- **Shadow Strategy:** Card shadow at rest. Raised only for the hero ID card.
- **Border:** none. The option card is the exception (1.5px Steel Line, 2px Counter Blue when selected).
- **Internal Padding:** 28px, 20px on mobile.

### Inputs / Fields
- **Style:** 52px, 1.5px Field Edge border, 12px radius, white, 18px text. Numeric fields are LTR with tabular figures, end-aligned. The label sits above at 600 weight; optional fields say "(לא חובה)" in muted text.
- **Focus:** the amber 3px ring plus a blue border.
- **Error:** 2px Signal Red border, `aria-invalid`, and a 15px/600 red message with an alert-circle icon (`role="alert"`) below the help text.
- **OTP:** six 52×60 boxes, LTR, 26px bold, shrinking to 44px below 390.

### Navigation
- **Header:** white, 76px, with a 1px bottom Mist Line. Wordmark on the start side, navy 500 nav links with a 2px Counter Blue underline for the current or hovered page, a "עוד" dropdown, the phone, a language button and the round blue accessibility button. ≤1023: "תפריט" opens a drawer from the right.
- **Trust bar:** Navy Haze, 46px, 15px/500, teal icons, and the dashed Ministry logo placeholder.
- **Flow mode** (`data-flow="order"`): wordmark + support phone + trust bar only, with a one-line footer.
- **Footer:** a navy ground, a white wordmark, two link columns, and a bottom row in `footer-muted`.

### Option card (signature)
The decision unit of the product: a full-width bordered card holding a radio, the method name, the price (with "ללא עלות" in Clearance Green), an absolute "יגיע עד …" date, ✓ benefit lines, a muted "who it suits" line and a 44px "?" that opens a details drawer. Cards are grouped under headings "עד הבית · איסוף עצמי · בדואר", all the same size, and none preselected.

### Status timeline (signature)
Five steps on a 3px track with 32px dots: done = solid blue with a check; current = a 3px blue ring with a centre dot and a gentle 2s pulse ring; future = a Future Step ring; warning and failure are amber and red with an icon. Each step carries a date. On mobile it collapses to "שלב N מתוך 5: <label>" + five dots + "כל השלבים".

### Badges, tags, callouts, `[לאישור]`
Badges are 15px/600 pills with an icon (neutral, success, info, navy, ship, warning, danger). Tags are 13px/700 pills inside option cards (fast = solid blue, free = green tint, no-track = grey, rec = solid green, hand = info tint). Callouts are 12px radius, 16/20 padding, icon + bold title, in info, warning (with a 1px border) and success. The tbc marker is described under Colors.

### Drawers, modals, toast
The info drawer enters from the left and the menu from the right, both 460px max. Modals are centred at 860px with scale .97 → 1. All become bottom sheets at ≤640 with a 20px top radius. Entry takes 200ms and exit 150ms on `cubic-bezier(.2,.7,.2,1)`, transform and opacity only. The scrim is navy at 50%. The toast is a navy pill bottom-centre: 1.6s for "הועתק", otherwise max(4s, 70ms per character), paused on hover; ✓ icon by default and ℹ for `[לאישור]` messages (`UI.toast(text, ms?, {icon})`).

## Do's and Don'ts

### Do:
- **Do** keep exactly one Counter Blue Primary per screen or state, and make every other action a Secondary outline or an underlined link.
- **Do** take every colour, size and radius from `css/tokens.css`. A new value means a new token (and an update to `_kit/docs/03_design_system.md`).
- **Do** pair every status with an icon and a word, and keep the 3px #FFB020 focus ring with 2px offset on every interactive element, with `--focus-halo` (2px white + navy to 7px) under it on light surfaces (incl. the OTP boxes).
- **Do** wrap every number in `<span class="num" dir="ltr">` and use tabular figures. Mirror arrows for RTL (forward = left).
- **Do** mark every unconfirmed fact with `<span class="tbc">[לאישור]</span>`.
- **Do** keep hit targets ≥44px, and keep motion at 150–200ms on transform and opacity, cancelled by `prefers-reduced-motion`.

### Don't:
- **Don't** use Wordmark Cyan (#10A9E0) for text or button grounds.
- **Don't** show the Ministry of Transport logo. Use only the dashed placeholder "לוגו משרד התחבורה – בכפוף לאישור".
- **Don't** bring back the old site's light-blue and salmon palette, the jeep illustration or the single long scroll. No comic illustrations, no decorative animation, no parallax.
- **Don't** colour the three home-A gate buttons differently: the gate accent colours are for icon and title only.
- **Don't** use a placeholder instead of a label, or long legal text in the page body (drawers only).
- **Don't** add a second gradient. The hero ground is the only one.
