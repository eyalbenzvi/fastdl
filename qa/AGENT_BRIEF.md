# Brief for page-building agents (internal – build process)

You are building part of a static Hebrew RTL clickable prototype in `/home/user/fastdl` (site root).
Read first: `_kit/CLAUDE.md` (rules you must not break), `_kit/docs/01_product_rules.md`, `_kit/docs/04_components.md`,
`_kit/docs/08_interactions_a11y_rtl.md`, plus the docs named in your task. Mockups are the visual source of truth:
`_kit/mockups/desktop/<id>.png` (1280 wide, rendered @1.5x) and `_kit/mockups/mobile/<id>.png` (390 wide @2x).
Exact Hebrew copy + markup: `_kit/reference/rendered-html/<id>.html`. A readable version with styles removed and every
icon named (`<svg:truck .ico i20 {inline-style}/>`) is in
`/tmp/claude-0/-home-user-fastdl/5f88a9ab-ba19-53ad-a722-22406b6060fb/scratchpad/stripped/<id>.html` – use it.
Logic of each screen: `_kit/reference/canvas-source/*.dc.html` (`renderVals()`). Copy Hebrew text word for word.

## Infrastructure already built (do NOT edit these shared files)
`css/tokens.css`, `css/components.css`, `css/pages.css`, `js/ui.js`, `js/layout.js`, `js/icons.js`, `js/validation.js`,
`js/dates.js`, `js/mock-data.js`. If you truly need a change there, do NOT make it – describe it in your final report.
Read `js/ui.js`, `js/layout.js`, `css/pages.css` and `css/components.css` before starting; reuse their classes.

- Page skeleton: copy `accessibility.html` (head order: tokens, components, pages css; scripts mock-data, icons, ui, layout, then your page js).
  Add your own stylesheet link AFTER pages.css: `<link rel="stylesheet" href="css/parts/<your-part>.css">`
  (all your page-specific CSS goes only in your own part file(s); they will be merged later).
  Put page JS in `js/pages/<page>.js` (classic script, `defer`, IIFE, no modules, no fetch, no console.log).
- `<body data-page="...">` sets the active nav link. Pages with states have `<div data-slot="demo-bar"></div>` right after the header
  slot and call `Layout.demoBar({items:[{label, pressed, title, onClick | href}], prefix, note, index})`.
- Icons in static HTML: `<svg class="ico ico--20" data-icon="truck" aria-hidden="true"></svg>` (sizes 16/18/20/24 default/28/32/48).
  ui.js auto-fills them (also for HTML inserted later). In JS strings: `UI.icon('truck', {size:20, cls:'', style:''})`.
- Dialogs (drawers/modals): put the panel at the end of `<body>` (outside `.page`), e.g.
  `<aside class="drawer" id="x" role="dialog" aria-modal="true" aria-labelledby="x-t" hidden><div class="dialog__head"><h2 id="x-t" data-dialog-title tabindex="-1" class="drawer__title">…</h2><button type="button" class="icon-btn" aria-label="סגירה" data-close-dialog>…x…</button></div>…</aside>`;
  modal: `class="modal"`. Open with `UI.drawer.open('x', {returnFocus: btn})` or a button with `data-open-dialog="x"`; close via
  `data-close-dialog`, Esc, scrim (handled). Mobile ≤640 becomes bottom sheet automatically.
- Other helpers: `UI.accordion(root,{openIndex})` (markup `.acc > button.acc__btn[aria-controls] + .acc__panel`), `UI.toast`,
  `UI.copy`, `UI.param`, `UI.setParams(obj, push)`, `UI.store.get/set`, `UI.setBusy(btn, bool, text)`, `UI.fieldError(input, msg|null)`
  (needs input id; creates `#<id>-err` p.error role=alert), `UI.focus(el)`, `Validate.*`, `Dates.*`, `window.FD_DATA`.
- Use components.css classes (`btn btn--primary|--secondary|--sm|--block|--m-block`, `link-btn`, `icon-btn`, `card card--pad`,
  `field/label/input/input--num/help/error`, `check`, `opt-card`, `tag--*`, `badge--*`, `callout--*`, `kv`, `chip`, `timeline`,
  `stepper`, `wrap`, `g2/g3/g4`, `h1/h2/h3`, `muted/small/num/tbc`, `only-m/hide-m/only-t/hide-t`). Don't invent colors/sizes outside tokens.
- Rules: max ONE visible `btn--primary` per screen/state; numbers in `<span class="num" dir="ltr">`; logical CSS properties only;
  `[לאישור]` values as `<span class="tbc">`; external links `target="_blank" rel="noopener"` + external-link icon + `<span class="sr-only">(נפתח בלשונית חדשה)</span>`, href `#`;
  labels for every field; errors `role="alert"` + `aria-invalid`; one H1 per page; every URL param in `_kit/docs/02_architecture.md` §2.4 / `_kit/tools/urls.json`
  for your screens must reproduce its mockup state. Params only initialise state; afterwards everything stays interactive.
- Links between pages use real file names (`login.html`, `status.html?s=S1`, …), never `*.dc.html`.

## Visual check (mandatory)
Static server: `curl -s localhost:8080/index.html -o /dev/null -w '%{http_code}'`; if not 200 start `cd /home/user/fastdl && python3 -m http.server 8080 &`.
Shoot: `cd /home/user/fastdl && NODE_PATH=$(npm root -g) node qa/shot.js '<url>' <scratch>/<name>` → `<name>-d.png` (1280) and `-m.png` (390); prints console errors.
Compare: `python3 qa/cmp.py <mockup-id> <scratch>/<name> <scratch>/cmp-<name>` → side-by-side (mockup left, yours right); Read the image.
Use your own scratch dir under `/tmp/claude-0/-home-user-fastdl/5f88a9ab-ba19-53ad-a722-22406b6060fb/scratchpad/<your-area>/`.
Iterate until layout, spacing, colours, type sizes and copy match at both widths for every state id you own, with 0 console errors.
Do not commit or push – the coordinator does that. Do not touch files owned by other agents.

## Final report (short)
Files created; state ids verified (with any remaining known gaps); any decisions not covered by docs (one line each, for DECISIONS.md);
any requested changes to shared files.
