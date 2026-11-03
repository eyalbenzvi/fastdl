# 04 – ספריית רכיבים

לכל רכיב: מה הוא עושה, מבנה HTML מומלץ (מחלקות מ-`design/components.css`), מצבים ונגישות. ה-markup בהדמיות (`reference/rendered-html/`) משתמש בשמות מחלקות אחרים (`.btn-p`, `.acc` וכו'). **בנו לפי המחלקות כאן**, אבל לפי המראה שבהדמיות.

---

## 4.1 Header (`layout.js`)
הדמיות: כל מסך (ראש העמוד), `05_menu-drawer` (מובייל), `05b_more-dropdown`.

**דסקטופ (≥1024), גובה 76:** מימין וורדמרק (קישור ל-`index.html`, `aria-label="רישיון עד הבית – מבית דפוס בארי, לעמוד הבית"`) · באמצע `<nav aria-label="ניווט ראשי">` עם הקישורים "בדיקת מצב והזמנה" (login), "מה עלי לעשות?" (guide), "רישיון הכי מהיר" (fastest), "שיטות מסירה ומחירון" (delivery), וכפתור "עוד ▾" (`aria-expanded`) שפותח רשימה: עמדות איסוף, שאלות ותשובות, על השירות, צור קשר (כרטיס 240px, נצמד לשמאל ה-nav) · משמאל: טלפון (אייקון + `077-998-5095`, `tel:`), כפתור "العربية" (גלובוס, מסגרת #B8CBD6, `lang="ar"`, קישור ל-home-ar), וכפתור נגישות עגול 44 (רקע primary, `aria-label="אפשרויות נגישות"`, placeholder).
**טאבלט/מובייל (≤1023):** וורדמרק · משמאל אייקון טלפון (44×44, `aria-label="חיוג למוקד 077-998-5095"`) + כפתור "תפריט" (המבורגר + המילה, רקע navy-50, `aria-expanded`). במובייל הגובה 64.
**"עוד":** נסגר בלחיצה מחוץ לרשימה, ב-Esc ובמעבר פוקוס החוצה.

## 4.2 פס אמון (Trust bar)
רקע navy-50, גבול תחתון #D9E4EA, גובה מינימלי 46, טקסט 15/500.
- `shield-check` + "השירות מופעל בהרשאת משרד התחבורה ולפי הנחיותיו" (במובייל: "בהרשאת משרד התחבורה").
- `lock` + "המידע שלכם מאובטח" (מוסתר במובייל).
- משמאל (≥1024 בלבד): placeholder לוגו משרד התחבורה (34px גובה).

## 4.3 תפריט (מגירה)
הדמיה: `mobile/05_menu-drawer.png`. מגירה **מימין** (`.drawer--menu`), ובמובייל bottom-sheet.
כותרת "תפריט" + כפתור סגירה (`aria-label="סגירת התפריט"`). 9 פריטים, כל אחד קישור עם כותרת (17/700), שורת הסבר (15, muted) וחץ שמאלה:
1. בדיקת מצב והזמנת משלוח – "איפה הרישיון שלי ואיך הוא יגיע אליי"
2. מה עלי לעשות עכשיו? – "מסלול לפי המצב: אגרה, צילום, הרשמה"
3. רישיון הכי מהיר – "המסלול המהיר ביותר לקבלת הרישיון"
4. שיטות מסירה ומחירון – "השוואה בין כל אפשרויות המסירה והעלות שלהן"
5. עמדות איסוף עצמי – "כתובות, שעות פעילות והנחיות הגעה"
6. שאלות ותשובות – "המענה לשאלות הנפוצות ביותר"
7. על השירות – "מי אנחנו, וההרשאה מטעם משרד התחבורה"
8. צור קשר – "טלפון, טופס פנייה ושעות מענה"
9. הצהרת נגישות – "התאמות הנגישות באתר ובמוקד"

בתחתית: כרטיס מוקד (navy-50, radius 14: אייקון headset + "מוקד שירות", המספר ב-22/800, השעות) ובורר שפה (צ'יפים: "עברית" פעיל + "العربية").

## 4.4 Footer
הדמיה: תחתית כל מסך. רקע navy, טקסט לבן, ריפוד 56/24.
3 עמודות (עמודה אחת ב-≤860): (א) וורדמרק כהה + shield + שורת ההרשאה (15, #E3EDF3) · (ב) "שירות": שאלות ותשובות, צור קשר, עמדות איסוף, שיטות מסירה · (ג) "מידע": הצהרת נגישות, מדיניות פרטיות, תנאי שימוש, איך תדעו שזה אנחנו (→ about).
שורה תחתונה (קו #2E4C64): "© דפוס בארי" · "מוקד שירות: 077-998-5095 · א׳–ה׳ 08:00–17:00". קישורים לבנים עם קו תחתון.

## 4.5 סרגל הדגמה (אב-טיפוס בלבד)
- **Demo pill** (בכל העמודים, `layout.js`): מוצמד לפינה השמאלית-תחתונה, רקע #2B2F36, "מצב הדגמה – לא חלק מהאתר" (#FFD27A, bold) + קישור "לאינדקס המסכים" + כפתור קיפול (`aria-expanded`). לא מופיע בהדמיות כי הוא fixed. **בעמודים שיש בהם demo-bar הוא מוסתר.**
- **Demo bar** (פס מלא מתחת ל-Header, רק ב-login/otp, status, order, error): רקע #2B2F36, תווית צהובה, צ'יפים (`.demo-chip`, `aria-pressed`) ו"לאינדקס" בצד שמאל.
  - login/otp: "P02 · הזדהות", "P03 · קוד SMS" + "ת״ז לדוגמה 000000018 · קוד 123456".
  - status: "הצג מצב:" S0…S9, "טעינה".
  - order: "P05 משלוח", "P06 כתובת", "P07 ייצור", "P08 תשלום", "P09 אישור", ו-toggle "מורשה לשנות כתובת (הצטלם)".
  - error: "תקלה זמנית", "404", "באנר תחזוקה".

## 4.6 כפתורים
```html
<button class="btn btn--primary">לבחירת משלוח או איסוף <svg class="ico ico--20">…chevron-forward-rtl…</svg></button>
<a class="btn btn--secondary" href="guide.html">מה עלי לעשות עכשיו?</a>
<button class="btn btn--secondary btn--sm">הוסיפו ליומן</button>
<button class="link-btn">שלחו שוב</button>
```
גובה 52 (sm: 44), radius 12, 17/600. Primary במובייל ברוחב מלא (`.btn--m-block`).
מצבים: hover (#0241B5), focus (טבעת #FFB020), disabled (#C5CED6/#3E4B55, `disabled`), loading (`aria-busy="true"` + `disabled` + ספינר 24 מסתובב + טקסט טעינה: "שולחים קוד…", "מעבדים את התשלום…", "מנסים שוב…").
**קישור טקסט:** תמיד עם קו תחתון.

## 4.7 שדות
```html
<div class="field">
  <label class="label" for="id-num">מספר תעודת זהות</label>
  <input id="id-num" class="input input--num" inputmode="numeric" autocomplete="off" maxlength="9"
         aria-describedby="id-num-help id-num-err" aria-invalid="false">
  <p id="id-num-help" class="help">9 ספרות, כולל ספרת ביקורת</p>
  <p id="id-num-err" class="error" role="alert" hidden><svg class="ico ico--18">…alert-circle…</svg>מספר תעודת הזהות לא תקין. בדקו שהזנתם 9 ספרות.</p>
</div>
```
גובה 52, radius 12, מסגרת 1.5px #6E8292, טקסט 18. שדה מספרי: `dir="ltr"` + `text-align:right`. שגיאה: מסגרת 2px #B53A3A + הודעה מתחת. שדה אופציונלי: `<span class="opt">(לא חובה)</span>` בתווית. **בלי placeholder במקום תווית** (מותר רק בשדה חיפוש ובמספר הזמנה כדוגמת פורמט).
**OTP:** 6 תיבות 52×60 (מובייל 44×54), `dir="ltr"` על המכל, `inputmode="numeric"`, הראשונה עם `autocomplete="one-time-code"`, `aria-label="ספרה N מתוך 6"`, מעבר אוטומטי קדימה, Backspace חוזר אחורה, הדבקה של 6 ספרות ממלאת הכול.
**Checkbox:** 22×22, `accent-color: primary`, עטוף ב-label.

## 4.8 כרטיס בחירה (Radio card)
הדמיות: `30b`, `31b`, `32`, `35`.
```html
<div class="opt-card-wrap" style="position:relative">
  <label class="opt-card opt-card--with-q">
    <input type="radio" name="method" value="express_home">
    <span class="ibox" style="width:44px;height:44px;background:var(--c-navy-50);color:var(--c-primary)">…truck…</span>
    <span class="stack" style="flex:1;gap:2px">
      <span class="row" style="gap:8px"><strong style="font-size:18px">משלוח מהיר עד הבית</strong><span class="tag tag--fast">הכי מהיר עד הבית</span></span>
      <span style="font-size:20px;font-weight:700">יגיע עד יום ד׳ 26.8</span>
      <span class="small muted">למי שצריך/ה את הרישיון מחר, בלי לצאת מהבית</span>
    </span>
    <span style="font-size:19px;font-weight:700">177 ₪</span>
  </label>
  <button type="button" class="icon-btn icon-btn--ghost opt-card__q" aria-label="פרטים נוספים על משלוח מהיר עד הבית">…help-circle…</button>
</div>
```
- כל הכרטיס לחיץ. נבחר: רקע primary-50, מסגרת 2px primary, ואייקון-בוקס עובר לרקע לבן.
- הכפתור "?" **מחוץ** ל-label (כדי שלא יבחר את הרדיו), בפינה השמאלית-עליונה.
- מחיר "ללא עלות" בירוק success.
- קבוצה: `role="radiogroup"` + `aria-label`.

## 4.9 תגיות ותגי סטטוס
- **Tag** (בכרטיסים, 13/700, pill): `tag--fast` (primary/לבן) "הכי מהיר" / "הכי מהיר עד הבית" · `tag--free` "ללא עלות" · `tag--notrack` "ללא מעקב" · `tag--rec` "מומלץ".
- **Badge** (סטטוס, 15/600, אייקון 18 + מילה):

| מצב | מחלקה | אייקון | טקסט |
|---|---|---|---|
| S0 | neutral | search | לא נמצאה בקשה |
| S1 | success | check | אפשר להזמין |
| S2 | info | order-done | הזמנה בוצעה |
| S3 | navy | gear-production | בייצור |
| S4 | ship | truck | בדרך אליכם |
| S5 | success | home-check | מחכה לכם |
| S6 | success | check | נמסרה |
| S7 | warning | alert-triangle | לא אושרה מסירה |
| S8 | danger | x-circle | המסירה נכשלה |
| S9 | neutral | files | 2 בקשות |

## 4.10 ציר התקדמות (Status timeline)
הדמיות: `20…29` (דסקטופ אופקי, מובייל אנכי).
```html
<ol class="timeline" aria-label="שלבי הטיפול בבקשה">
  <span class="timeline__track" aria-hidden="true"></span>
  <span class="timeline__fill" aria-hidden="true" style="width:20%"></span>
  <li class="timeline__step timeline__step--done"><span class="timeline__dot">…check…</span>הבקשה התקבלה<span class="sr-only"> (הושלם)</span></li>
  <li class="timeline__step timeline__step--current" aria-current="step"><span class="timeline__dot"></span>בחירת משלוח<span class="sr-only"> (שלב נוכחי)</span></li>
  <li class="timeline__step timeline__step--future"><span class="timeline__dot"></span>בייצור</li>
  …נשלחה, נמסרה
</ol>
```
5 שלבים קבועים: הבקשה התקבלה · בחירת משלוח · בייצור · נשלחה · נמסרה. מתחיל מימין. רוחב המילוי = 20% × מספר השלבים שהושלמו (כשכולם הושלמו – 80%). נוכחי: טבעת 3px + נקודה 12 + פעימה עדינה (מבוטלת ב-reduced-motion). אזהרה (S7): נקודה כתומה #B26B00 עם "!". כשל (S8): נקודה אדומה עם "!". מובייל: רשימה אנכית (נקודה + תווית בשורה), בלי קו.

## 4.11 Stepper (הזמנה)
דסקטופ: 4 פריטים "משלוח · כתובת · מועד ייצור · תשלום" עם עיגול 30 (הושלם: ירוק עם ✓; נוכחי: כחול עם מספר; עתידי: מסגרת אפורה) וקו מפריד 24px. שלב שדולג: "–" + "(לא נדרש)" ליד התווית. `aria-current="step"`.
מובייל: "שלב 2 מתוך 4 – כתובת" (bold) + פס 6px עם מילוי 25%×שלב (`role="progressbar"`).

## 4.12 Callout
```html
<div class="callout callout--warning" role="note">…alert-triangle…<p>אם לא תבחרו עד המועד הזה, הרישיון יישלח בדואר רגיל ללא מעקב, לכתובת הרשומה במשרד הפנים.</p></div>
```
סוגים: info (מידע), warning (עם מסגרת), success. כותרת מודגשת אופציונלית. לסטטוס דינמי (קוד נשלח, אומת): `role="status"`.

## 4.13 כרטיס פרטים (Key-Value)
`<dl class="kv">` – 2 עמודות בדסקטופ, אחת במובייל. `dt` 15 muted, `dd` 600. **שדה ריק לא מרונדר בכלל.** ערך שמחכה לאישור: `<span class="tbc">[לאישור]</span>`. מספר מעקב/הזמנה: כפתור העתקה 44×44 (`aria-label="העתקת מספר המעקב"`) → טוסט "הועתק".

## 4.14 כרטיס זמן
רקע primary-50, radius 14, אייקון-בוקס לבן 52 עם `clock`: "אפשר להזמין עד **יום ד׳, 26.8.2026 בשעה 05:12**" (18) + "נותרו כ-27 שעות" (muted, רק כש-`countdown_reliable=true`).

## 4.15 אקורדיון
```html
<div class="card"><div class="acc">
  <button class="acc__btn" aria-expanded="false" aria-controls="faq-1" id="faq-1-btn"><span>איך תדעו שזה אנחנו?</span>…chevron-down…</button>
  <div class="acc__panel" id="faq-1" role="region" aria-labelledby="faq-1-btn" hidden>…</div>
</div></div>
```
כל השורה לחיצה (min-height 64). ברירת מחדל: פריט אחד פתוח בכל פעם. החץ מסתובב 180°.

## 4.16 מגירה ומודאל
- **מגירת מידע** (`.drawer`): נפתחת משמאל בדסקטופ (רוחב עד 460–520), bottom-sheet במובייל (עד 88vh, פינות עליונות 20). Scrim ‏rgba(21,50,74,.5).
- **מודאל** (`.modal`): ממורכז, עד 860px, radius 20; במובייל bottom-sheet.
- שניהם: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` לכותרת, כפתור סגירה 44 (`aria-label="סגירה"`), סגירה ב-Esc ובלחיצה על ה-scrim, focus trap, פוקוס ראשוני על הכותרת או על כפתור הסגירה, החזרת פוקוס לכפתור שפתח, ונעילת גלילת body. כפתור תחתון "חזרה להזמנה" / "הבנתי, חזרה לטופס" (Secondary).

## 4.17 טוסט
`role="status"`, navy, ממורכז מעל התחתית (bottom 80), 1.6 שניות. טקסט: "הועתק".

## 4.18 שלד טעינה
בלוקים בגרדיאנט מונפש (`.skel`): שורה 20×220, כותרת 40×70%, ציר 72, כרטיס 180, כרטיס 140. המכל מקבל `aria-busy="true"` ו-`aria-label="טוען את מצב הבקשה"`.

## 4.19 בלוק "איך תדעו שזה אנחנו" (חוזר: בית A/B, P15, P16)
רשימה עם ✓ ירוק:
- הודעות ה-SMS שלנו נשלחות מהשולח <span class="tbc">[שם שולח לאישור]</span>.
- האתר שלנו נמצא רק בכתובת **fastdl.co.il**.
- לא נבקש מכם פרטי אשראי בהודעת SMS או בטלפון.
- האגרה משולמת למשרד התחבורה. אצלנו משלמים רק על משלוח מהיר – אם בחרתם בו.

## 4.20 מודאל מסמכים "איך יודעים אם צריך להצטלם?"
הדמיה: `20d`. שתי תמונות זו לצד זו (במובייל אחת מתחת לשנייה), גובה 300–320, `object-fit: contain`, רקע #F4F6F8, מסגרת #D9E4EA:
- `img/docs/temp_license_photo_REQUIRED_example.jpg` – כיתוב "צריך להצטלם" (אייקון מצלמה, #8A5A12). alt: "דוגמה מושחרת של רישיון זמני: בריבוע האדום כתוב שיש לשלם את האגרה ולהצטלם בתחנת הצילום".
- `img/docs/fee_letter_photo_ON_FILE_example.jpg` – כיתוב "לא צריך להצטלם" (✓, ירוק). alt: "דוגמה מושחרת של טופס אגרה: בריבוע האדום כתוב שתמונתכם נמצאת במחשב".
מעל: "בטופס האגרה וברישיון הזמני שנשלח במייל יש ריבוע אדום בצד שמאל. הוא אומר אם צריך להצטלם." מתחת: קישור חיצוני "לרשימת תחנות הצילום".

## 4.21 קישור חיצוני
`target="_blank" rel="noopener"` + אייקון `external-link` 16–18 + `<span class="sr-only">(נפתח בלשונית חדשה)</span>`. באב-הטיפוס ה-href הוא `#` (כתובות אמיתיות: [לאישור]).
