# 02 – ארכיטקטורה, קבצים, ניתוב ו-state

## 2.1 סטאק
| נושא | החלטה | למה |
|---|---|---|
| שפה | HTML5 + CSS3 + JavaScript (ES2020) וניל | אב-טיפוס להצגה; אפס תלויות; כל אחד יכול לערוך |
| טעינת JS | `<script defer src="…">` קלאסי, לא modules | עובד גם מ-`file://` |
| CSS | `tokens.css` → `components.css` → `pages.css` | טוקנים מרכזיים; רכיבים מוכנים בחבילה |
| פונטים | מקומיים, woff2 (`fonts/`) | בלי תלות ב-Google Fonts; ביצועים |
| אייקונים | SVG inline (`icons/*.svg` או `icons/icons-sprite.svg` + `<use href="icons/icons-sprite.svg#i-truck">`) | `currentColor`, קל לנגישות |
| נתונים | `js/mock-data.js` → `window.FD_DATA` | בלי fetch |
| בדיקות | Playwright + axe-core בתיקיית `qa/` נפרדת | לא נכנס לאתר |

## 2.2 עץ קבצים יעד

```
/
├─ index.html              P01B – עמוד הבית (גרסה B, ברירת מחדל)
├─ home-a.html             P01A – עמוד הבית, גרסה A (שלושה שערים)
├─ home-ar.html            P01B בערבית (טיוטה)
├─ prototype-index.html    P00 – אינדקס אב-טיפוס
├─ design-system.html      תצוגת מערכת העיצוב (כמו mockups/desktop/00_design-system.png)
├─ login.html              P02 – הזדהות
├─ otp.html                P03 – אימות קוד
├─ status.html             P04 – מסך מצב (?s=S0…S9|loading)
├─ order.html              P05–P09 – תהליך הזמנה (?step=1…5)
├─ reissue.html            P10 – הנפקה חוזרת
├─ guide.html              P11 – מה עלי לעשות עכשיו?
├─ fastest.html            P12 – רישיון הכי מהיר
├─ delivery.html           P13 – שיטות מסירה ומחירון
├─ pickup.html             P14 – עמדות איסוף עצמי
├─ faq.html                P15 – שאלות ותשובות
├─ about.html              P16 – על השירות
├─ contact.html            P17 – צור קשר
├─ accessibility.html      P18 – הצהרת נגישות
├─ error.html              P19 – תקלה זמנית (?v=temp|404)
├─ 404.html                P19 – 404 (עותק של error.html?v=404 לאחסון סטטי)
├─ css/   tokens.css · components.css · pages.css
├─ js/    mock-data.js · layout.js · ui.js · validation.js · dates.js · pages/*.js
├─ fonts/ (מ-design/fonts)
├─ icons/ (מ-design/icons + icons-sprite.svg)
├─ img/   wordmark.svg · license-card-illustration.svg · favicon.svg · docs/temp_license_photo_REQUIRED_example.jpg · docs/fee_letter_photo_ON_FILE_example.jpg
├─ qa/    (Playwright, צילומים, דוחות – לא חלק מהאתר)
└─ DECISIONS.md
```

## 2.3 שלד עמוד (כל עמוד בעברית)

```html
<!doctype html>
<html lang="he" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>[שם המסך] – רישיון עד הבית</title>
  <link rel="icon" href="img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="css/tokens.css">
  <link rel="stylesheet" href="css/components.css">
  <link rel="stylesheet" href="css/pages.css">
  <script defer src="js/mock-data.js"></script>
  <script defer src="js/ui.js"></script>
  <script defer src="js/layout.js"></script>
  <script defer src="js/pages/status.js"></script> <!-- רק בעמודים שצריכים -->
</head>
<body data-page="status">
  <div class="page">
    <div data-slot="header"></div>          <!-- layout.js מזריק: skip-link, header, trust bar, תפריט -->
    <div data-slot="demo-bar"></div>        <!-- רק בעמודים עם מצבים (status, order, login/otp, error) -->
    <main id="main" tabindex="-1">…</main>
    <div data-slot="footer"></div>          <!-- layout.js מזריק: footer + demo-pill -->
  </div>
</body>
</html>
```

- `layout.js` מסמן את קישור הניווט הפעיל עם `aria-current="page"` לפי `body[data-page]`.
- עמוד הערבית (`home-ar.html`) הוא `lang="ar"`, עם header ו-footer ייעודיים בערבית (ראה `reference/rendered-html/04_home-B-arabic.html`), ולא משתמש ב-`layout.js` העברי.

## 2.4 מפת URL ופרמטרי הדגמה
כל מצב בהדמיות זמין בקישור ישיר. זה מה שמאפשר לאינדקס, לבדיקות ולצילומים להגיע לכל מצב.

| id בהדמיות | URL |
|---|---|
| 00_design-system | `design-system.html` |
| 01_index | `prototype-index.html` |
| 02_home-B | `index.html` |
| 02b_home-B_validation-errors | `index.html?demo=errors` |
| 02c_home-B_code-sent | `index.html?demo=sent` |
| 02d_home-B_why-drawer | `index.html?demo=why` |
| 02e_home-B_accordion-open | `index.html?demo=acc3` (פריט 4 פתוח) |
| 03_home-A | `home-a.html` |
| 04_home-B-arabic | `home-ar.html` |
| 05_menu-drawer | כל עמוד ב-390, `?demo=menu` |
| 05b_more-dropdown | כל עמוד ב-1280, `?demo=more` |
| 10_P02_login | `login.html` |
| 10b / 10c | `login.html?demo=errors` / `login.html?demo=loading` |
| 11_P03_otp | `otp.html` |
| 11b / 11c / 11d | `otp.html?demo=error` / `?demo=resend` / `?demo=verified` |
| 20…29_P04_status_S0…S9 | `status.html?s=S0` … `status.html?s=S9` (ברירת מחדל: S1) |
| 20b / 20c | `status.html?s=S0&ans=1` / `status.html?s=S0&ans=0` |
| 20d | `status.html?s=S0&ans=1&docs=1` |
| 24b | `status.html?s=S4&demo=toast` |
| 27b | `status.html?s=S7&reveal=1` |
| 29b | `status.html?s=loading` |
| 30_P05_order-step1_empty | `order.html` (או `?step=1&reset=1`) |
| 30b | `order.html?step=1&m=express_home` |
| 30c | `order.html?step=1&m=pickup_bari&group=pickup` |
| 30d | `order.html?step=1&m=pickup_tlv_airport&info=pickup_tlv_airport` |
| 30e | `order.html?step=1&m=express_home&drawer=compare` |
| 31 | `order.html?step=2&m=express_home&why=1` |
| 31b / 31c | `order.html?step=2&m=express_home&auth=1&addr=other` / `…&addr=moin` |
| 32 / 32b / 32c | `order.html?step=3&m=express_home&terms=1` / `…&termsErr=1` / `order.html?step=3&m=pickup_bari&terms=1` |
| 33 / 33b | `order.html?step=4&m=express_home` / `…&demo=paying` |
| 34 | `order.html?step=5&m=express_home` |
| 35 / 35b / 35c | `reissue.html` / `?demo=error` / `?demo=done` |
| 40 / 40b | `guide.html` (פריט 2 פתוח) / `guide.html?open=4` |
| 41 | `fastest.html` |
| 42 / 42b | `delivery.html` / `delivery.html?info=pickup_tlv_airport` |
| 43 | `pickup.html` |
| 44 / 44b / 44c | `faq.html` / `faq.html?cat=צילום&open=2` / `faq.html?q=xyz` |
| 45 | `about.html` |
| 46 / 46b / 46c | `contact.html` / `?demo=error` / `?demo=sent` |
| 47 | `accessibility.html` |
| 48 / 48b | `error.html?maint=1` (תקלה זמנית + באנר תחזוקה) / `error.html?v=404` (או `404.html`) |

המיפוי המלא כ-JSON (מוכן לסקריפט הבדיקה): `tools/urls.json`, וגם בשדה `prototype_url` ב-`mockups/manifest.json`.

כלל: פרמטרים רק **מאתחלים** state. אחרי הטעינה הכול אינטראקטיבי כרגיל. פרמטר לא מוכר – מתעלמים.

## 2.5 מודולי JS (חוזים)

```js
// js/ui.js – גלובלי: window.UI
UI.qs(sel, root), UI.qsa(sel, root)
UI.icon(name, {size=24, cls=''})            // מחזיר מחרוזת <svg> מתוך מפת אייקונים פנימית (מ-design/icons)
UI.accordion(rootEl, {single=true, openIndex=-1})  // aria-expanded + hidden + aria-controls
UI.drawer.open(id, {returnFocus, onOpen, onClose}) / UI.drawer.close()   // scrim, Esc, focus trap, החזרת פוקוס, נעילת גלילה;
                                            // רשומת היסטוריה: Back סוגר את הדיאלוג (העמוד לא עוזב); סגירה אחרת מחזירה את הרשומה
UI.modal.open(id) / UI.modal.close()                   // אותו מנגנון
UI.toast(text, ms=1600)                     // role="status"
UI.copy(text) → toast("הועתק")
UI.param(name) / UI.params()                // URLSearchParams
UI.store.get(key, fallback) / UI.store.set(key, val)  // sessionStorage עם try/catch
UI.setBusy(btn, bool, busyText)             // aria-disabled + aria-busy + ספינר + טקסט טעינה (לא disabled – P3-4)
UI.fieldError(input, msg | null)            // #<id>-err (role=alert) + aria-invalid + aria-describedby; null מנקה גם את ההפניה

// js/validation.js – window.Validate
Validate.toLatinDigits(str)                // ٠–٩ / ۰–۹ → 0–9 (כל הפונקציות כאן מפעילות אותה קודם)
Validate.digits(str)                       // ספרות בלבד
Validate.israeliId(str) → boolean          // ראה 08 §8.3; כולו אפסים = לא תקין
Validate.mobile(str)    → boolean          // /^05\d{8}$/ אחרי הסרת לא-ספרות
Validate.maskMobile(str) → "054-•••-4567"
Validate.normalizeMobile(str, noTrunc) / normalizeId(str, noTrunc) / bindNormalize(input, 'mobile'|'id'|'digits', onChange)
Validate.cardNumber(str) → boolean         // 12–19 ספרות
Validate.luhn(str) → boolean               // ספרת ביקורת; כולו אפסים = לא תקין
Validate.normalizeExpiry(str) → "MM/YY"    // "12/2028", "1228", "1/28", "528" → "12/28", "12/28", "01/28", "05/28"
Validate.cardExpiry(str, now?) → {ok, reason:'format'|'past'|null}   // now ברירת מחדל = FD_DATA.now (2026-08-25)
Validate.cvv(str, cardNumber?) → boolean   // 34/37 (Amex) = 4 ספרות, אחרים 3; בלי כרטיס 3–4
Validate.email(str) → boolean              // local@domain.tld, Unicode מותר

// js/dates.js – window.Dates (תאריכים בדמה קבועים; זה למחשבון P12 בלבד)
Dates.parse(iso) / Dates.toISO(date) / Dates.isBusinessDay(date) / Dates.DAYS
Dates.nextBusinessDay(date)                // דילוג על שישי (5) ושבת (6)
Dates.fastestPickup(paidDate)              // יום העסקים שאחרי יום העסקים הבא

// js/layout.js – מזריק header/footer/demo-bar; מטפל בתפריט ו"עוד"
// js/pages/<page>.js – לוגיקה של עמוד; קורא פרמטרים, מרנדר מצבים
```

## 2.6 State
- **מסך המצב:** מצב נוכחי מ-`?s=` (ברירת מחדל S1). בורר המצבים בסרגל ההדגמה מעדכן את ה-URL (`history.replaceState`) ומרנדר מחדש בלי רענון.
- **תהליך ההזמנה:** אובייקט `order` יחיד ב-`sessionStorage['fd.order']`:
  ```json
  {"step":1,"method":null,"group":"all","auth":false,"addr":"moin","extras":{"entrance":"","care_of":"","mailbox":""},
   "other":{"city":"","street":"","house":"","entrance":"","apt":"","zip":"","care_of":"","phone":"","mailbox":""},
   "prod":"now","terms":false}
  ```
  נשמר בכל שינוי. פרמטרי URL גוברים על השמור. `?reset=1` מנקה. אם אין storage – עובדים בזיכרון.
- **שאר העמודים:** state מקומי בזיכרון בלבד.

### מפתחות האחסון (sessionStorage דרך `UI.store`; JSON; נופל לזיכרון כשהאחסון חסום)
| מפתח | נכתב ב- | צורה | נמחק ב- |
|---|---|---|---|
| `fd.order` | `order.js` (כל שינוי), `status.js` (העברה לייצור) | `{step, method, auth, addr:'moin'\|'other', nudged, extras:{entrance, care_of, mailbox}, other:{city, street, house, entrance, apt, zip, care_of, phone, mailbox}, prod:'now'\|'wait', terms, ordered, edit, paidMethod, paidTotal, committed, inv, mail}` – `committed` = עותק ההזמנה ששולמה בזמן עריכה. פרטי כרטיס **לא** נשמרים. (`group` כבר לא קיים – החלטה 3) | `?reset=1`, התנתקות |
| `fd.session` | `auth.js` (אחרי OTP), `status.js` (בחירת מסמך ב-S9) | `{id, phoneMasked, scenario:'S0'…'S9', verified:true, doc?}` | `?reset=1`, התנתקות |
| `fd.reissue` | `reissue.js` (אישור) | `{method, number, extras:{entrance, care_of, mailbox}}` | `?reset=1`, התנתקות |
| `fd.login` | `auth.js`, `home.js` (שליחת הטופס) | `{id:'9 ספרות', ph:'כפי שהוקלד'}` – מילוי חוזר אחרי Back מה-OTP | `?reset=1`, התנתקות |
| `fd.phone` | `auth.js`, `home.js` | `'05XXXXXXXX'` – הנייד למסך ה-OTP ולהסכמת ה-SMS | `?reset=1`, התנתקות |
| `fd.scenario` | `auth.js`, `home.js` (`?scenario=`, בורר התרחיש) | `'S0'…'S9'` – לאיזה מצב מגיעים אחרי OTP | `?reset=1`, התנתקות |
| `fd.demoOpen` | `layout.js` (סרגל ההדגמה וה-pill) | `true`/`false` – פתוח/מקופל; בלי ערך: מקופל במגע, ≤640 וגובה ≤500 | – |
| `fd.clean` | `layout.js` (`?clean=1` / `?clean=0`) | `true` – מסתיר את רכיבי ההדגמה | `?clean=0` |

רשימות האיפוס (`auth.js`, `home.js`, `status.js` – התנתקות) מוחקות את ששת המפתחות הראשונים; `fd.demoOpen` ו-`fd.clean` הם העדפות הדגמה ונשארים.

## 2.7 רינדור
אין templating engine. כל עמוד הוא HTML סטטי עם הנוסח המלא. חלקים מותנים מוצגים או מוסתרים עם `hidden`, ורשימות שחוזרות (שיטות מסירה, שאלות, תפריט) מרונדרות מ-`FD_DATA` בפונקציות קטנות שמחזירות מחרוזות HTML. מסך המצב: כל עשרת הבלוקים של "מה עכשיו?" קיימים ב-HTML עם `data-state="S0"` וכו', ו-JS מציג רק את הרלוונטי. את התג, ה-H1, הציר, הפרטים והעזרה JS מרנדר מטבלה (ראה 06).
