# סקירת Apple HIG – "רישיון עד הבית"

**תאריך:** 3.11.2026 · **כלי:** הסקיל `apple-design-hig` (github.com/dickwu/apple-design-skill, 123 עמודי HIG ב-`references/hig/`), ובנקודות שבהן הוא מוסיף משהו גם `apple-design` של Emil Kowalski. הסקיל הוא הנחיה של צד שלישי, לא סמכות. כל ציטוט כאן נלקח מקובץ שנפתח בפועל, וכל מה שאין לו מקור מסומן **[שיקול דעת]**.
**היקף:** קריאה בלבד. לא שונה קוד באתר. נבדקו בית B/A/AR, כניסה, OTP, מצב S0–S9 (כולל ans/docs/reveal/toast/loading), הזמנה שלבים 1–5 ומגירות, הנפקה חוזרת, מדריך, הכי מהיר, משלוח, איסוף, FAQ, אודות, צור קשר, נגישות, שגיאה/404. סה״כ 65 מצבים מ-`qa/urls.json`.
**כבוד להחלטות קיימות:** כל מה שנקבע ב-`DECISIONS.md`, ב-`UX_RECOMMENDATIONS.md` (החלטות 1–12) וב-`_kit/CLAUDE.md` §3 נשאר. אין כאן עולם חזותי חדש, ואין שינוי בפלטה, בפונטים או במותג. המלצות שדורשות עיצוב מחדש מסומנות **"לא רלוונטי – עיצוב מחדש"**.

---

## 1. הקשר (שלב 1 בתהליך של הסקיל)

| | |
|---|---|
| פלטפורמה | אתר מובייל-first (Safari ב-iOS, Chrome ב-Android), HTML/CSS/JS וניל, RTL בעברית. דסקטופ משני |
| מה מה-HIG חל | העקרונות (`design-principles.md`) והיסודות: נגישות, צבע, טיפוגרפיה, פריסה, כתיבה ו-RTL. מעמודי הרכיבים חלים העקרונות בלבד: כפתורים, שדות, sheets, alerts, טעינה, עזרה. **מוסכמות הפלטפורמה של iOS** (tab bar, toolbar, swipe-back, Liquid Glass) לא חלות על אתר בדפדפן. ניווט "אחורה" שייך לדפדפן (`cross-platform.md`: "Speak the framework") |
| קהל | אזרחים ברמות אוריינות שונות, בעיקר בטלפון, בשירות שמופעל בהרשאת המדינה. האמון הוא הנכס |
| התזה של העיצוב | "תגיד לי מה המצב ומה לעשות עכשיו – עם תאריך מוחלט". הדבר שזוכרים: **ציר מצב שאומר אמת + "מה עכשיו?" עם מועד מוחלט**, וכרטיסי שיטות עם "יגיע עד…" בגדול |
| הארטיפקט | הקוד המלא + רינדור אמיתי ב-390×844 (עדיפות) וב-1280×900. מדידות ב-Playwright: יעדי לחיצה אפקטיביים (דגימת `elementFromPoint` ±21px, כולל הרחבות `::after`), ניגודיות מחושבת מצבעים בפועל, גלישה אופקית ב-390/320/260/195 (195 = זום עמוד 200% בטלפון 390), סדר Tab, ומאפייני שדות |
| מה לא ניתן לאמת | VoiceOver אמיתי במכשיר, Switch Control, חומרה אמיתית (notch או פס הבית). בנוסף, הניגודיות חושבה רק מעל רקעים אטומים, לא מעל גרדיאנטים |

**עמודי HIG שנקראו:** `accessibility.md`, `layout.md`, `typography.md`, `color.md`, `designing-for-ios.md`, `buttons.md`, `text-fields.md`, `entering-data.md`, `virtual-keyboards.md`, `sheets.md`, `modality.md`, `alerts.md`, `toggles.md`, `segmented-controls.md`, `progress-indicators.md`, `loading.md`, `feedback.md`, `dark-mode.md`, `onboarding.md`, `offering-help.md`, `web-views.md`, `writing.md`, `right-to-left.md`, `motion.md`. קבצי עזר: `references/cross-platform.md`, `references/code-audit.md` (Apple Pay).

---

## 2. סיכום

**דירוג כולל: Good.** אין ממצא Critical (P0). יש שלושה ממצאי P1. שניים מהם נגישות מקלדת/פוקוס, והשלישי שבירה נקודתית של כלל 3.4. האתר כבר עומד ברוב מה שה-HIG דורש מאתר: כפתור Primary אחד לכל היותר בכל אחד מ-65 המצבים (נמדד). כל השדות מתויגים, בגודל 18px (בלי זום אוטומטי ב-iOS), עם `inputmode`/`autocomplete` נכונים (`cc-number`, `cc-exp`, `cc-csc`, `one-time-code`, `tel`, `postal-code`). אין גלישה אופקית ב-320. אין טקסט מתחת ל-AA (נמדד). דיאלוגים עם focus trap, Esc, החזרת פוקוס ו-inert. RTL אמיתי: חצים, ציר שמתמלא מימין ומספרים מבודדים ב-LTR.

**מה חסר:** ליטוש בשכבת "הגמישות" (Flexibility, `design-principles.md`). פוקוס מקלדת שנבלע מתחת לסרגל הדביק. טבעת פוקוס צהובה שלא נראית על לבן (1.8:1). כותרת שלא נשברת בזום עמוד של 200%. כמה שדות שמכריחים מקלדת ספרות במקום שבו יש גם אותיות (מספר בית "12א"). טוסטים שנעלמים אחרי 1.6 שניות גם כשהם נושאים מידע.

**ספירה:** P0 – 0 · P1 – 3 · P2 – 6 · P3 – 14 · לא רלוונטי (עיצוב מחדש) – 7.

### מדידות עיקריות (390×844, כל 65 המצבים)
| בדיקה | תוצאה |
|---|---|
| Primary גלוי לכל מצב | מקסימום 1 בכל המצבים ✓ |
| H1 | אחד בכל עמוד. במצבי מגירה/מודאל הוא inert, וזה תקין ✓ |
| טקסט בניגודיות מתחת ל-AA | 0 ✓ |
| גופן מינימלי | 13px (תגים, `.tag`) / 14px (וורדמרק משני). ה-HIG: מינימום 11pt, ברירת מחדל 17pt. גוף הטקסט 17px ✓ |
| גלישה אופקית | 390 ✓ · 320 ✓ · **260/195: 278–311px** (הכותרת, ראו M-02) |
| יעדי לחיצה אפקטיביים <44 | "יציאה" 40×27 · קישורים בתוך שורת טקסט (24–27px) · שורת ה-checkbox של תנאי השימוש 27px · קישורי ה-Footer (25px, מורחבים ל-33 לפי ההחלטה) |
| סדר Tab | תקין והגיוני בכל העמודים שנבדקו (בית, OTP, שלבים 1/4, S1). **אבל** בשלב 1 במובייל 3 עצירות פוקוס נופלות מתחת לסרגל הדביק (H-01) |
| Apple Pay | אין כפתור או סימן Apple Pay באתר (ארנקים הוסתרו, החלטה 11) ✓. נשאר CSS מת (L-12) |

---

## 3. ממצאים

פורמט: **מסך/קובץ · ראיה · הפניה ל-HIG · תיקון מדויק · חבילה**. חבילות: **A** = הזמנה/הנפקה חוזרת/קבצים משותפים, **B** = מסך המצב, **C** = שאר העמודים (פירוט בסעיף 5).

### P0 – חוסם
אין.

### P1 – קריטי לנגישות או שבירת כלל

**H-01 · פוקוס מקלדת נבלע מתחת לסרגל הדביק (שלב 1, וגם 2 ו-3 במובייל)**
- **קובץ:** `css/components.css:282` (`.sticky-actions` ב-≤640), `order.html`.
- **ראיה:** מעבר Tab ב-390 על `order.html?step=1`. כפתורי "?" של שיטות 2 ו-5, ואחריהם הקישורים שמתחת לכרטיסים, מקבלים פוקוס כשהם מאחורי הסרגל (88px). הדפדפן גולל רק עד קצה החלון, לא עד מעל הסרגל. משתמשי Full Keyboard Access, Switch Control ו-Voice Control לא רואים איפה הפוקוס (WCAG 2.4.11).
- **HIG:** `accessibility.md › Mobility`: "Support mobility-related assistive technologies. Features like VoiceOver, AssistiveTouch, Full Keyboard Access, Pointer Control, and Switch Control…". וגם `layout.md › Visual hierarchy`: "Differentiate controls from content".
- **תיקון:** ב-`components.css`, בתוך `@media (max-width:640px)`:
  `html:has(.sticky-actions){scroll-padding-block-end:calc(104px + env(safe-area-inset-bottom,0px))}`.
  104 = גובה הסרגל (88) + 16 מרווח. אפשר גם `body[data-flow="order"]` כדי לא להסתמך על `:has`. הבדיקה: Tab על כל הכרטיסים ב-390, ואף עצירה לא נופלת מתחת לסרגל. · **A**

**H-02 · "מעקב: —" במגירות המידע: שדה בלי ערך מוצג (שבירת CLAUDE.md §3.4)**
- **קבצים:** `js/pages/order.js:45–49` (`trk()` מחזיר `'—'` בשיטות איסוף), `js/pages/delivery.js:15–17,90` (המגירה). בטבלת הדסקטופ: `delivery.js:64`.
- **ראיה:** `order.html?step=1&info=pickup_tlv_airport` במובייל: שורה "מעקב" עם "—". אותו דבר ב-`delivery.html?info=pickup_tlv_airport`. בכרטיס המובייל של delivery זה כבר מסונן (`delivery.js:76`), ולכן גם יש כאן חוסר עקביות.
- **HIG:** `writing.md › Getting started`: "Be clear… Check each word to be sure it needs to be there." וגם `layout.md`: "Use progressive disclosure to make layouts cleaner".
- **תיקון:** `trk()` מחזיר `null` בשיטות איסוף, ובונה השורות במגירה מדלג על ערך `null`. ב-`delivery.js:90` צריך לסנן את `['מעקב', track(m)]` כש-`track(m)==='—'`. בטבלת הדסקטופ (תא שאי אפשר להשמיט) אפשר להשאיר תא ריק עם `<span class="sr-only">לא רלוונטי באיסוף עצמי</span>` במקום "—". · **A** (order.js) + **C** (delivery.js)

**H-03 · טבעת הפוקוס #FFB020 על לבן/‎#F4F6F8 = 1.8:1 / 1.7:1**
- **קבצים:** `css/components.css:38` (`:focus-visible`), `:117` (`.input:focus`), `css/pages.css:170` (OTP), `.opt-card:has(:focus-visible)`.
- **ראיה (מחושב):** ‎#FFB020 L=0.524 · מול לבן 1.83:1 · מול ‎#F4F6F8 1.69:1. WCAG 2.1 §1.4.11 דורש 3:1 לסימון מצב. על ה-Footer הכהה (‎#15324A) הניגודיות 7.2:1 ✓.
- **HIG:** `accessibility.md › Vision`: "Strive to meet color contrast minimum standards… between foreground text and icons and background colors". וגם `color.md › Inclusive color`: "Avoid using colors that make it hard to perceive content".
- **תיקון בתוך כלל §3.7** (הצבע, העובי וה-offset נשארים): מוסיפים הילה כהה מחוץ לטבעת. בכל ארבעת המקומות:
  `outline:3px solid var(--c-focus);outline-offset:2px;box-shadow:0 0 0 2px #fff,0 0 0 7px var(--c-navy)`.
  התוצאה: רווח לבן 2px, צהוב 3px, נייבי 2px (צהוב↔נייבי 7.2:1, נייבי↔לבן 12.6:1). זה דפוס מוכר (GOV.UK, Apple Focus ring כפול). ב-`.opt-card` וב-`.card` שכבר יש להם `box-shadow`, מוסיפים את ההילה לפני ה-shadow הקיים.
  **שינוי מראה – דורש אישור הבעלים לפני יישום.** אם לא מאשרים, מתעדים ב-DECISIONS שהאתר עומד ב-IS 5568 (WCAG 2.0) ולא ב-2.1 §1.4.11. · **A** (components.css) + **C** (pages.css:170, OTP)

### P2 – חשוב

**M-01 · Checkbox תנאי השימוש: כפתור בתוך `<label>` ושורה בגובה 27px**
- **קובץ:** `order.html:126`, `css/components.css:121`.
- **ראיה:** `<label class="check" for="terms"><input …><span>אישור: קראתי את <button class="link-btn">תנאי השימוש</button></span></label>`. כפתור (רכיב שאפשר לתייג) בתוך label של רכיב אחר הוא לא חוקי ב-HTML. שני יעדים צמודים בשורה אחת של 27px (מדוד), כך שקל לפספס ולסמן במקום לקרוא, או להפך.
- **HIG:** `accessibility.md › Mobility`: "Consider spacing between controls as important as size… about 12 points of padding around elements that include a bezel". וגם `toggles.md › Checkboxes`: "Accurately reflect a checkbox's state…".
- **תיקון (המראה והנוסח נשארים, לפי UX ב.1 P3):**
  `<div class="check order-terms__row"><input type="checkbox" id="terms" aria-labelledby="terms-l open-terms" aria-invalid="false"><label id="terms-l" for="terms">אישור: קראתי את</label> <button type="button" class="link-btn order-terms__link" id="open-terms">תנאי השימוש</button></div>`.
  ב-CSS: `.order-terms__row{min-height:44px;align-items:center;column-gap:10px}` ו-`.order-terms__row label{cursor:pointer;padding-block:10px}`. · **A**

**M-02 · הכותרת לא נשברת בזום עמוד 200% (רוחב 195–260): גלישה אופקית בכל עמוד**
- **קבצים:** `css/components.css:241` (`.site-header__bar` בגובה קבוע, בלי wrap), `.wordmark{flex:none}` (183px), `js/layout.js` (header-tools-m, header-phone--flow).
- **ראיה:** ב-195px: `scrollWidth` 278 (הזמנה), 303 (בית), 311 (מצב). ה-wordmark (183px) וה-header-tools (92px) לא מתכווצים. ב-320 אין בעיה (WCAG 1.4.10 עובר), אבל Safari ב-iOS עם "גודל טקסט" 200% (aA) מגיע בדיוק ל-195.
- **HIG:** `layout.md › Adaptability`: "Be prepared for text-size changes". וגם `typography.md › Supporting Dynamic Type`: "Make sure your app's layout adapts to all font sizes".
- **תיקון:** ב-`components.css`:
  `@media (max-width:300px){.site-header__bar{height:auto;min-height:var(--header-h-m);flex-wrap:wrap;row-gap:8px;padding-block:8px}.wordmark{flex:1 1 auto;min-width:0}.wordmark__bars{display:none}.header-phone--flow .num{display:none}}`.
  לטלפון בכותרת התהליך צריך להוסיף `aria-label="חיוג למוקד 077-998-5095"` ב-`layout.js:flowHeaderHTML`. ב-≥320 אין שום שינוי. הבדיקה: `scrollWidth===clientWidth` ב-195. · **A**

**M-03 · טוסט של 1.6 שניות לכל הודעה, ותמיד עם ✓**
- **קבצים:** `js/ui.js:259–273`. קריאות: `js/layout.js:238` ("תפריט הנגישות [לאישור]"), `js/pages/status.js:587,657` ("…[לאישור]", "ההזמנה הועברה לייצור"), `order.js:512`, `reissue.js:60`.
- **ראיה:** 08 §8.4 קובע 1.6 שניות רק ל"הועתק". הודעות ארוכות יותר (כולל תג `[לאישור]`) נעלמות לפני שקוראים אותן. אייקון ✓ מוצג גם כשלא קרה כלום ("תפריט הנגישות [לאישור]").
- **HIG:** `accessibility.md › Cognitive`: "Minimize use of time-boxed interface elements… Prefer dismissing views with an explicit action." וגם `feedback.md`: "When it makes sense, confirm that a significant action or task has completed".
- **תיקון:** ב-`ui.js`, `toast(text, ms, opt)`: אם `ms` לא הועבר, `ms = text === 'הועתק' ? 1600 : Math.max(4000, text.length * 70)`. הפרמטר `opt.icon` (ברירת מחדל `'check'`) מאפשר `'info'` להודעות [לאישור]. ההודעה לא נסגרת כשהעכבר מעליה או כשיש בה פוקוס (`mouseenter`/`focusin` → clearTimeout). ב-`status.js:587` מעבירים `{icon:'info'}`, וכך גם ב-`layout.js:238`, `order.js:512`, `reissue.js:60`. "ההזמנה הועברה לייצור" נשאר עם ✓ ו-4 שניות. · **A** (ui.js, layout.js, order.js, reissue.js) + **B** (status.js)

**M-04 · שלב 4: "תוקף" ו-CVV בשדות ברוחב מלא במובייל**
- **קובץ:** `order.html:150–153` (`.g3.order-grid` מצטמצם לעמודה אחת ב-≤640, `components.css:368`).
- **ראיה:** צילום 33 ב-390: שלושה שדות ברוחב 310px זה מתחת לזה, לערכים של 5, 3 ו-9 תווים. הטופס מתארך ב-~150px, והכפתור יורד ל-1690px.
- **HIG:** `text-fields.md › Best practices`: "To the extent possible, match the size of a text field to the quantity of anticipated text."
- **תיקון:** מוסיפים `order-pay-grid` ל-div ב-`order.html:150`. ב-`pages.css` (קטע ההזמנה): `@media (max-width:640px){.order-pay-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.order-pay-grid>.field:last-child{grid-column:1/-1}}`. תוקף ו-CVV בשורה אחת, ת״ז מתחתיהם. · **A**

**M-05 · מספר בית ודירה: אי אפשר להקליד "12א" / "3ב"**
- **קבצים:** `order.html:80,82` (`inputmode="numeric"`), `js/pages/order.js:460` (מסיר כל תו שאינו ספרה ב-`o-h` וב-`o-a`).
- **ראיה:** בכתובות בישראל יש מספרי בית ודירה עם אות. מקלדת הספרות ב-iOS לא מציעה אותיות, וגם הדבקה של "12א" הופכת ל-"12". הכתובת שנשמרת שגויה, ובמשלוח זה ממש נזק.
- **HIG:** `virtual-keyboards.md › Best practices`: "Choose a keyboard that matches the type of content people are editing". וגם `entering-data.md`: "Be clear about the data you need".
- **תיקון:** ב-`order.html:80,82` מורידים את `inputmode="numeric"` ואת `input--num` מ-`o-h` ומ-`o-a` (המיקוד `o-z` נשאר נומרי). ב-`order.js:460` משאירים את הסינון רק ל-`o-z`. הוולידציה של `o-h` הופכת ל-"חייב להכיל ספרה" (`/\d/`), עם אותה הודעה "יש למלא מספר בית." · **A**

**M-06 · S0: הבחירה ב"מתי השלמתם את התשלום?" מסומנת רק במסגרת וגוון**
- **קבצים:** `js/pages/status.js:415`, `css/pages.css:902–904` (קטע המצב).
- **ראיה:** כשכפתור נבחר (`aria-pressed=true`) המסגרת עוברת מ-1.5 ל-2px והרקע ל-‎#F1F5FE (1.07:1 מול לבן). אין סימן צורה. בשמש או אצל עיוורי צבעים קשה לראות מה נבחר.
- **HIG:** `toggles.md › Best practices`: "Make sure the visual differences in a toggle's state are obvious… change the inner details you display — like a checkmark or dot". וגם `accessibility.md › Vision`: "Convey information with more than color alone."
- **תיקון:** ב-`status.js:415` מוסיפים בתחילת התווית `UI.icon('check',{size:20,cls:'ans-btn__ico'})`. ב-CSS: `.ans-btn{display:flex;align-items:center;gap:10px}.ans-btn__ico{visibility:hidden;color:var(--c-primary)}.ans-btn[aria-pressed="true"] .ans-btn__ico{visibility:visible}`. זו אותה שפה כמו ✓ בשורות התועלת, וגובה הכפתור לא משתנה. · **B**

### P3 – ליטוש

**L-01 · אין `color-scheme` מוצהר (מצב כהה – החלק הבטוח בלבד)**. כל ה-HTML + `components.css`. **ראיה:** אין `color-scheme` באף קובץ. ב-Chrome ל-Android עם "Auto dark" ובדפדפנים עם מצב כהה כפוי, הצבעים (כולל Primary ונייבי) מומרים אוטומטית, והטוקנים שנבדקו ל-AA נשברים. **HIG:** `dark-mode.md › Best practices`: "Ensure that your app looks good in both appearance modes." עיצוב כהה מלא = **לא רלוונטי – עיצוב מחדש**. **תיקון בטוח:** `<meta name="color-scheme" content="light">` אחרי `theme-color` בכל עמוד, ו-`:root{color-scheme:light}` בראש `components.css`. אין שינוי ויזואלי במצב בהיר. · **A** (components.css, order.html, reissue.html) · **B** (status.html) · **C** (שאר ה-HTML)

**L-02 · "יציאה" במסך המצב: יעד ברוחב 40px**. `js/pages/status.js:537`, `pages.css:40–41`. ההרחבה ב-`::after` מגדילה רק את הגובה. **HIG:** `accessibility.md › Mobility` (44×44). **תיקון:** `.status-id a{min-inline-size:44px;display:inline-flex;justify-content:center}`. · **B**

**L-03 · קישורים בתוך שורת טקסט מתחת ל-44px.** "למה אנחנו מבקשים את זה?" בבית B (24px, `index.html:42`). "להחליף למשלוח מהיר…" בשורת בארי (24px, order.js). "‎*5678" ב-fastest/contact (22–25px). WCAG פוטר קישורים בתוך שורת טקסט, אבל ה-HIG לא. **HIG:** `accessibility.md › Mobility`. **תיקון:** ל"למה אנחנו מבקשים…" מעבירים את הכפתור לשורה משלו מתחת לפסקה (`<p class="small muted">…</p><button class="link-btn">…</button>`), כך שה-min-height:44 של `.link-btn` חל. ב"להחליף" מוסיפים `display:inline-flex;min-height:44px;align-items:center` (בלי `min-height:0` ב-`pages.css:1014`). "‎*5678" – אותו `::after` של `pages.css:41`. · **C** (index/fastest/contact) + **A** ("להחליף")

**L-04 · קישורי ה-Footer מורחבים רק ל-33px.** `js/layout.js` (footerHTML), `pages.css`. זו החלטה מתועדת (DECISIONS: הרחבה עד אמצע הרווח). המינימום של ה-HIG (28) עומד, אבל ברירת המחדל (44) לא. **אופציה, דורשת אישור כי משנה ריווח בהדמיה:** ב-≤640 `.site-footer__list a{display:block;padding-block:10px}`. · **A**

**L-05 · שלד הטעינה בלי טקסט, ו-`aria-busy` על אזור ה-status.** `js/pages/status.js:526`. **HIG:** `loading.md › Showing progress`: "Clearly communicate that content is loading and how long it might take". `progress-indicators.md`: "Avoid vague terms like loading". **תיקון:** בתוך השלד מוסיפים שורה גלויה `<p class="muted small">מאתרים את הבקשה שלכם…</p>`. מעבירים את `aria-busy="true"` ל-`<main>` ומשאירים `role="status"` עם הטקסט (כך שקורא המסך מכריז). בלי תנועה נוספת, לפי 08 §8.1. · **B**

**L-06 · פעימה אינסופית בשלב הנוכחי בציר.** `components.css:197` (`animation:pulse 2s … infinite`). **HIG:** `accessibility.md › Cognitive`: "reducing automatic and repetitive animations". `motion.md`: "Add motion purposefully". Emil (`apple-design` §14): תנועה חוזרת היא עלות קבועה לתשומת הלב. **תיקון (08 §8.1 מגדיר פעימה, לא אינסוף):** `animation-iteration-count:3`. הפעימה מושכת את העין בכניסה ואז נעצרת. reduced-motion ממשיך לבטל. · **A**

**L-07 · Bottom sheet בלי grabber ובלי החלקה לסגירה.** `ui.js` + `components.css` (≤640: `.drawer`/`.modal`). **HIG:** `sheets.md › Mobile`: "Support swiping to dismiss a sheet" ו-"Include a grabber in a resizable sheet". **תיקון (אופציונלי):** פס אחיזה דקורטיבי 36×5 (`--c-border-strong`, radius-pill) מעל `dialog__head`. גרירה כלפי מטה ב-pointer events על הראש בלבד: `translateY` עוקב אחרי האצבע, סוגר אם עבר 25% מהגובה או שהמהירות מעל 0.5px/ms, ואחרת חוזר ב-`--dur-base`. מהירות השחרור עוברת לאנימציה, לפי Emil §5: "Velocity handoff". כפתור ✕ נשאר, לפי `accessibility.md`: "Offer alternatives to gestures". ב-reduced-motion – סגירה מיידית. · **A**

**L-08 · מגירת המידע של שיטה (שלב 1) בלי פעולת בחירה, בניגוד למגירת ההשוואה.** `order.html` (`dr-info`), `order.js`. **HIG:** `offering-help.md › Creating tips`: "Use buttons to direct people to information or options". **תיקון:** מעל "חזרה להזמנה" מוסיפים Secondary "לבחור ב<שם השיטה>", שסוגר, בוחר ומעביר פוקוס לרדיו (אותה פונקציה כמו "לבחור" במגירת ההשוואה). אין Primary במגירה. · **A**

**L-09 · עקביות כפתור ההתקדמות: בשלב 3 "המשך לתשלום" אין חץ קדימה.** `order.html:130`. **HIG:** `writing.md › Best practices`: "use consistent language throughout processes with multiple steps". **תיקון:** כשהתווית היא "המשך לתשלום" מוסיפים את אותו `chevron-forward-rtl` כמו בשלבים 1–2 (`order.js:330` מעדכן כעת רק textContent, צריך לעדכן span פנימי). ב"אישור ההזמנה" (שיטה חינמית) – בלי חץ, כי זו פעולה מחייבת. · **A**

**L-10 · שלב 4: הסכום חוזר 3 פעמים.** כותרת הכרטיס "סה״כ לתשלום: 177 ₪", שורת "סה״כ לתשלום", וכפתור "לתשלום מאובטח – 177 ₪". **HIG:** `design-principles.md` (Simplicity), `layout.md`: "Group related items". **תיקון:** מורידים את הסכום מכותרת הכרטיס ומשאירים "סיכום ההזמנה" בלבד. **בכפוף להדמיה 33** – אם הכותרת מופיעה שם, משאירים ומתעדים. · **A**

**L-11 · delivery.html במובייל: "ללא מעקב" מופיע עד 4 פעמים בכרטיס דואר רגיל, ו"למחרת יום ההזמנה, מ-11:00" פעמיים בבארי.** `js/pages/delivery.js:76`. **HIG:** `writing.md`: "Check each word to be sure it needs to be there". **תיקון:** בשורת `eta · מעקב:` משמיטים את "· מעקב: …" כשהתג "ללא מעקב" כבר מוצג. משמיטים את שורת ה-eta כשהיא זהה לפריט בשורת התועלת. · **C**

**L-12 · Apple Pay: CSS מת שמצייר כפתור "Apple" בעיצוב עצמי.** `css/pages.css:787–790,845` (`.order-wallet--apple` ברקע נייבי). כרגע לא מוצג (החלטה 11), אבל זה מתכון לדחייה ברגע שהארנקים יחזרו. **HIG/סקיל:** `code-audit.md › Apple Pay`: "A styled button… whose label is 'Apple Pay'… built from `<button>`" = Critical. `apple-pay.md › Using Apple Pay buttons`: "Don't create custom Apple Pay button designs". **תיקון:** למחוק את הכללים, ולהוסיף שורה ב-DECISIONS: "כשיאושרו ארנקים – Apple Pay רק דרך `<apple-pay-button>` (‏apple-pay-sdk.js) או `-webkit-appearance:-apple-pay-button`, בגודל ≥140×30, מוצג רק אם `ApplePaySession.canMakePayments()`, השם 'Apple Pay' לא מתורגם (גם לא בערבית)". · **A**

**L-13 · אין תגובה ל-`prefers-contrast: more`.** `components.css`. **HIG:** `accessibility.md › Vision`: "ensure it at least provides a higher contrast color scheme when the system setting Increase Contrast is turned on". הטוקנים כבר עומדים ב-AA, ולכן P3. **תיקון:** `@media (prefers-contrast: more){:root{--c-text-muted:#3E4B55;--c-border-strong:var(--c-input-border);--c-border:#8796A2}}`. אלה טוקנים קיימים, בלי צבע חדש. · **A**

**L-14 · ערבית: "لمساعدة بالعربية" → "للمساعدة بالعربية".** `home-ar.html:55`. העמוד מסומן כטיוטת תרגום, ולכן זו הערה למתרגם, לא שינוי באתר. **HIG:** `writing.md › Write for everyone`. · **C**

---

## 4. לא רלוונטי – עיצוב מחדש (נבדק ונדחה בכוונה)
| נושא | HIG | למה לא עכשיו |
|---|---|---|
| מצב כהה מלא | `dark-mode.md` | האתר בהיר בלבד לפי מערכת העיצוב המאושרת. פלטה כהה = עולם חזותי חדש. רק L-01 בטוח |
| Dynamic Type מלא (`font: -apple-system-body` + rem) | `typography.md › Supporting Dynamic Type` | כל סקאלת הגופנים ב-px. מעבר לסקאלה שמגיבה להגדרת המערכת משנה פריסה בכל המסכים. M-02 מכסה את הזום |
| Tab bar תחתון / toolbar | `tab-bars.md`, `designing-for-ios.md` | אתר בדפדפן. תפריט ההמבורגר והכותרת הם ההחלטה המאושרת |
| Liquid Glass / חומרים שקופים בכותרת ובסרגל | `liquid-glass.md`, `materials.md`, Emil §11 | סרגלים אטומים הם חלק מהשפה. שקיפות מעל טקסט מורידה ניגודיות |
| שדה OTP יחיד | `text-fields.md` | החלטה 6: להשאיר 6 תיבות (one-time-code והדבקה כבר עובדים) |
| Apple Pay / ארנקים בשלב התשלום | `apple-pay.md` | החלטה 11: מוסתרים עד אישור. ראו L-12 |
| Medium detent ל-sheets | `sheets.md › Mobile` | דורש מנגנון גובה כפול. לא נדרש לתוכן הקצר של המגירות |

**הערות פלטפורמה:** `web-views.md` חל רק אם האתר ייפתח בתוך אפליקציה (למשל אפליקציית ממשלה). במקרה כזה קישורי `target="_blank"` בתהליך ההזמנה (footer) צריכים להיפתח ב-`SFSafariViewController` או בדפדפן, לא בתוך ה-web view. iPhone Duo ומתקפלים: אין רוחבים קבועים מלבד `min-width` של כפתורים (200–240), שמתבטל ב-`btn--m-block` ✓.

---

## 5. מה עובד – לשמור
- **Primary אחד** בכל מצב, ושאר הפעולות Secondary או קישור. `buttons.md › Style`: "Keep the number of prominent buttons to one or two per view" ✓.
- **כפתור בטעינה** עם ספינר ותווית ("מעבדים את התשלום…") ורוחב קבוע. `buttons.md › Mobile`: "display an activity indicator… a different label alongside" ✓.
- **דיאלוגים:** פוקוס לכותרת, trap, Esc, scrim, החזרת פוקוס, ודיאלוג אחד בכל פעם (`openDialog` סוגר את הקודם). `sheets.md`: "Display only one sheet at a time" ✓, `modality.md`: "Make it easy to identify a modal view's task" ✓. כניסה ויציאה באותו מסלול (Emil §7) ✓.
- **אישור "להתחיל להכין עכשיו?"**: כותרת שמתארת את המצב, כפתור עם פועל ספציפי ("כן, להתחיל עכשיו") ו"ביטול". `alerts.md › Buttons`: "Avoid using OK… Always use the title 'Cancel'" ✓.
- **שורת רעננות** ("המידע עודכן היום… העדכון הבא: מחר בבוקר"). `feedback.md`: "Consider integrating status feedback into your interface" ✓.
- **עזרה בהקשר:** "?" בגודל 44 בכל כרטיס, ו"משהו לא ברור?" לפי המצב. `offering-help.md`: "Let your app's tasks inform the types of help" ✓.
- **שדות:** label גלוי לכל שדה, בלי placeholder במקום label, 18px, `inputmode`/`autocomplete` נכונים, שגיאות דינמיות ליד השדה. `entering-data.md`: "Get information from the system", "Dynamically validate" ✓. `writing.md`: "display it as close to the problem as possible" ✓.
- **RTL:** חץ "המשך" שמאלה, "חזרה" ימינה, ציר ו-stepper שמתמלאים מימין, מספרים לא הפוכים (`.num` + `unicode-bidi:isolate`). `right-to-left.md › Controls`: "Flip controls that show progress" ✓, "Don't reverse the order of numerals in a specific number" ✓.
- **משוב לחיצה ב-pointer-down** (`scale(.97)`), hover רק במכשירי עכבר, `touch-action:manipulation`. `buttons.md`: "Always include a press state for a custom button" ✓, Emil §1 ✓.
- **Safe areas** (`viewport-fit=cover` + `env()`), `100svh`/`dvh`, `overscroll-behavior:contain`. `layout.md › Guides and safe areas` ✓.
- **Craft:** זה כלי שירות שקט בכוונה. הנקודה הבולטת היחידה היא "יגיע עד יום ד׳ 26.8" בגדול והציר, וזו הבחירה הנכונה למוצר אמון ממשלתי. אין צורך להוסיף "אופי".

---

## 6. חבילות יישום (לפי בעלות על קבצים)

> `css/pages.css` משותף: כל חבילה עורכת **רק את הקטע של העמודים שלה** (הזמנה/הנפקה → A, מצב → B, השאר → C). את `tokens.css` לא עורכים (L-13 נכתב ב-`components.css`).

### חבילה A – `order.html`, `js/pages/order.js`, `reissue.*`, `js/mock-data.js`, `js/layout.js`, `js/ui.js`, `css/components.css` (+ קטע ההזמנה ב-pages.css)
| ID | עד׳ | מה |
|---|---|---|
| H-01 | P1 | `scroll-padding-block-end` מתחת לסרגל הדביק |
| H-02 | P1 | `trk()` → null בשיטות איסוף ודילוג על השורה במגירה |
| H-03 | P1 | הילה נייבית סביב טבעת הפוקוס (components.css:38,117, opt-card). **דורש אישור** |
| M-01 | P2 | Checkbox תנאי השימוש: הכפתור מחוץ ל-label, ושורה בגובה 44 |
| M-02 | P2 | כותרת שנשברת ב-≤300px + aria-label לטלפון בכותרת התהליך |
| M-03 | P2 | `UI.toast`: משך לפי אורך, אייקון info, השהיה בפוקוס/ריחוף. עדכון הקריאות ב-layout/order/reissue |
| M-04 | P2 | תוקף + CVV בשורה אחת במובייל |
| M-05 | P2 | מספר בית/דירה עם אותיות |
| L-01 | P3 | `color-scheme: light` (components.css, order.html, reissue.html) |
| L-03 | P3 | "להחליף…" בשורת בארי – 44px |
| L-04 | P3 | Footer 44px (אופציה, **דורש אישור**) |
| L-06 | P3 | פעימה: 3 חזרות |
| L-07 | P3 | grabber + החלקה לסגירה (אופציונלי) |
| L-08 | P3 | "לבחור ב…" במגירת המידע |
| L-09 | P3 | חץ ב"המשך לתשלום" |
| L-10 | P3 | סכום כפול בכותרת הסיכום (בכפוף להדמיה) |
| L-12 | P3 | מחיקת `.order-wallet*` + שורה ב-DECISIONS |
| L-13 | P3 | `prefers-contrast: more` |

### חבילה B – `status.html`, `js/pages/status.js` (+ קטע המצב ב-pages.css)
| ID | עד׳ | מה |
|---|---|---|
| M-03 | P2 | קריאות הטוסט: `{icon:'info'}` ב-placeholderToast (תלוי ב-A) |
| M-06 | P2 | ✓ בתשובה שנבחרה ב-S0 |
| L-01 | P3 | `<meta name="color-scheme" content="light">` |
| L-02 | P3 | "יציאה" ברוחב 44 |
| L-05 | P3 | טקסט גלוי בשלד הטעינה, ו-aria-busy על main |

### חבילה C – שאר העמודים וה-JS שלהם (+ קטעיהם ב-pages.css)
| ID | עד׳ | מה |
|---|---|---|
| H-02 | P1 | `delivery.js:90` – בלי שורת "מעקב: —". `:64` – תא ריק עם sr-only |
| H-03 | P1 | `pages.css:170` (OTP) – אותה הילת פוקוס (**דורש אישור**, יחד עם A) |
| L-01 | P3 | `color-scheme` בכל שאר ה-HTML (index, home-a, home-ar, login, otp, guide, fastest, delivery, pickup, faq, about, contact, accessibility, error, 404, prototype-index, design-system) |
| L-03 | P3 | "למה אנחנו מבקשים את זה?" בשורה משלו (index.html). "‎*5678" עם `::after` (fastest, contact) |
| L-11 | P3 | delivery במובייל – בלי כפילויות "ללא מעקב" ו-eta |
| L-14 | P3 | הערה למתרגם: "للمساعدة" |

**סדר מומלץ (לפי הסקיל: נגישות → מוסכמות → craft → ליטוש):** H-01, H-02, M-01, M-05, M-02, M-04, M-06, M-03, ואחריהם H-03 (אחרי אישור), ובסוף P3.
**בדיקה אחרי יישום:** `qa/urls.json` ב-390/1280 בלי שגיאות קונסול. Tab על שלב 1 ב-390 בלי עצירה מתחת לסרגל. `scrollWidth===clientWidth` ב-195. הקלדת "12א" נשמרת. ספירת Primary ≤1 בכל מצב.
