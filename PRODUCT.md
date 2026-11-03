# Product

<!-- impeccable:product-schema 1 -->

> Written by `impeccable init` without an interview (the request said to infer from the project docs). Every fact below comes from `_kit/CLAUDE.md`, `_kit/docs/01_product_rules.md`, `_kit/docs/03_design_system.md`, `_kit/docs/08_interactions_a11y_rtl.md`, `UX_RECOMMENDATIONS.md` and `DECISIONS.md`. Lines marked *(inferred)* are my reading of those sources. They are not confirmed answers.

## Platform

web

## Users

Israeli citizens who have paid the Ministry of Transport fee for a **driving licence, a boating licence (רישיון משיט) or a disabled-parking tag (תג חניה לנכה)**, and have been photographed if that was required. They come to the site to find out where their document is and to choose delivery or pickup. They have **48 business hours** from the moment the request reaches Bari (the overnight file at about 05:00) to choose. Most arrive on a phone, often from an SMS ("בקשתך התקבלה").

Personas from `_kit/docs/01_product_rules.md` §1.4, the working audience:
- **Ronit, 34, under pressure:** lost her licence and needs it tomorrow. She wants the fastest path (P12 → order).
- **Avraham, 71:** got a renewal letter and is unsure whether he needs a new photo. He needs a simple explanation, a phone number and large text.
- **Mohammed, 45, Arabic speaker:** got an SMS and suspects fraud. He needs to see that the site is official ("איך תדעו שזה אנחנו") and to find help in Arabic.
- **Dana, 22:** paid three weeks ago and the licence has not arrived. She needs to know where it is and what she can do (S0, S7 → reissue).
- **Yossi, 40:** got the "request received" SMS. He wants to order express delivery in a few taps (S1 → order steps 1–5).

## Product Purpose

A service hub run by **Bari Printing (דפוס בארי)**, which produces these documents for the Ministry of Transport under a state tender. For each citizen the site:
1. identifies the request (ID number + mobile + SMS code);
2. shows an honest status (states S0–S9) and the one next action;
3. takes an order for one of six delivery or pickup methods within the window. If no method is chosen, the document goes by regular mail with no tracking.

Success means fewer citizens who choose nothing and get untracked regular mail, fewer lost licences and fewer complaints. The way to get there is to show what each price buys, not to push the most expensive option (`UX_RECOMMENDATIONS.md`, "התובנה המשותפת").

## Positioning

This is the official channel, authorised by the state, where the producer of the document itself lets you choose how it reaches you. The site's standing comes from trust in that authorisation, so every claim must be a fact taken from the business rules. *(inferred from 01 §1.2 and the red lines in UX_RECOMMENDATIONS)*

## Operating Context

- The day-cycle is part of the product. One intake file arrives each morning (about 05:00, on the business day after payment and photo). The production file closes at 07:00. The 48-hour window counts business days only, with no Friday or holiday eves. "Now" in the prototype is Tuesday 25.8.2026, 02:12.
- Step 3 of an order offers two choices: **immediate production** (no changes after that) or **wait until the window closes** (changes allowed).
- An address can change only for someone who must be re-photographed. Everyone else gets the Ministry of Interior address and may add an entrance number, "care of" and the name on the mailbox.
- A free reissue is available 19–45 business days after dispatch when there is no proof of delivery. Records are deleted after 45 business days.
- Support line 077-998-5095 (Sun–Thu 08:00–17:00, Fri and holiday eves 08:00–13:00). Ministry of Transport call centre \*5678.
- Surfaces and their modes (Impeccable modes, per surface):

| Surface | Files | Mode |
|---|---|---|
| Home B (default), Home A (three gates), Home AR | `index.html`, `home-a.html`, `home-ar.html` | Persuade |
| Info pages: guide, fastest, delivery, pickup, FAQ, about, contact, accessibility | `guide.html`, `fastest.html`, `delivery.html`, `pickup.html`, `faq.html`, `about.html`, `contact.html`, `accessibility.html` | Read |
| Identification | `login.html`, `otp.html` | Operate |
| Status (S0–S9, loading) | `status.html` | Operate |
| Order steps 1–5 | `order.html` | Operate |
| Free reissue | `reissue.html` | Operate |
| Error and 404 | `error.html`, `404.html` | Operate (recovery) |
| Internal: design system, prototype index | `design-system.html`, `prototype-index.html` | Read (internal, not part of the site) |

## Capabilities and Constraints

- A static clickable **prototype**: HTML5 + CSS + vanilla JS, classic `<script defer>` (no modules, no build, no fetch), working from `file://` too. Mock data lives in `js/mock-data.js` (`window.FD_DATA`). Fonts and icons are local.
- Hebrew RTL first (`lang="he" dir="rtl"`), logical CSS properties only. Numbers go in `<span class="num" dir="ltr">`. Forward = left arrow, back = right arrow.
- Hard rules (`_kit/CLAUDE.md` §3): at most one Primary button per screen or state. One status template (identity line → tag + H1 → timeline → "מה עכשיו?" → details → "משהו לא ברור?"). No countdown without an absolute date and time. A field with no value is not shown. No link inside the order flow leaves the page (secondary info opens in a drawer). Cyan is decorative only. The Ministry logo appears only as a dashed placeholder. Every unconfirmed value is marked `<span class="tbc">[לאישור]</span>`. No placeholder instead of a label. No long legal text in the page body. Storage only for order choices, inside try/catch.
- Six methods and prices (01 §1.3): pickup from Bari (free), pickup from Ben Gurion airport (118 ₪), express home (177 ₪), regular home (41 ₪), registered mail (14.99 ₪), regular mail (free, no tracking).
- **Undecided, never to be invented** (UX_RECOMMENDATIONS §ד, 10_open_items): the reminder SMS before the window closes; the cancellation, refund and upgrade-difference policy; signature on registered mail; express coverage on a reissue; payment-intake time at post offices; the last date for pickup and reissue; options after a failed delivery; receipt by SMS or email; Bari's address and hours; the Ministry logo; the accessibility widget; WhatsApp support.
- Decisions already taken (do not reopen): `UX_RECOMMENDATIONS.md` §א decisions 1–12, and every row in `DECISIONS.md`.

## Brand Commitments

- Name: **"רישיון עד הבית"**, with the HTML wordmark "מבית דפוס בארי" and three cyan bars. Operator credit: "השירות מופעל בהרשאת משרד התחבורה ולפי הנחיותיו".
- Voice (01 §1.5): plain Hebrew, short sentences, plural imperative ("בחרו", "הזינו"), no jargon, legal text only in drawers. Say what is known, what is not known and what to do now. Never present a guess as fact.
- Character: an official service that is clean and spacious. No comic illustrations and no unnecessary animation. Do not copy the old site (light blue and salmon, the jeep illustration, one long scroll).
- **The design is closed** (`_kit/CLAUDE.md`): the mockups in `_kit/mockups/` are the visual source of truth, and changes are refinements within that design, not a redesign.

## Evidence on Hand

- 67 approved mockups (desktop 1280 and mobile 390): `_kit/mockups/`. Exact copy: `_kit/reference/rendered-html/`.
- Real assets: two redacted document photos, `img/docs/*.jpg` (the only document images allowed). Brand SVGs in `_kit/design/brand/`.
- Three expert reviews were consolidated into `UX_RECOMMENDATIONS.md`, and every adopted item is implemented (§ה).
- **Absent, and not to be fabricated:** testimonials, usage statistics ("most popular"), the Ministry logo, the real map, the real video, Bari's address and hours, SLA numbers beyond the business-rule table.

## Product Principles

1. **One next action.** Every screen and state leads to a single primary action. Everything else is secondary or a link.
2. **Truth before persuasion.** A paid method is never preselected. Free methods stay visible at the same size. Urgency comes only from the real window date. No claim without a business rule behind it.
3. **Known / unknown / do now.** Status screens separate what the system knows from what it does not, and give the recovery path.
4. **Never strand the citizen.** No dead-end buttons, no leaving the order flow. Every unconfirmed fact is visibly marked [לאישור] rather than guessed.
5. **Mobile and low literacy first.** Design for a 390px phone, an older reader and an Arabic speaker before the desktop.

## Accessibility & Inclusion

WCAG 2.x **AA** is mandatory (`_kit/CLAUDE.md` §3.7, `08_interactions_a11y_rtl.md` §8.5): contrast ≥4.5:1, a visible 3px #FFB020 focus ring with 2px offset, targets ≥44px, `<label for>` on every field, errors with `role="alert"` + `aria-invalid`, status never conveyed by colour alone, a skip link, reflow at 320px, and 200% text without loss. `prefers-reduced-motion` cancels all motion, including fades (an explicit decision in DECISIONS). Arabic: a draft translation of the home page plus a help line in Arabic. The rest of the flow stays in Hebrew (UX_RECOMMENDATIONS §ג).
