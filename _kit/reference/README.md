# reference/ – קוד מקור והדמיות HTML

## rendered-html/
HTML סטטי מרונדר של **כל** מסך ומצב (67 קבצים, שמות כמו ב-`mockups/manifest.json`). פותחים ישירות בדפדפן.
- **זה המקור לנוסח העברי.** העתיקו טקסטים מכאן מילה במילה.
- ה-CSS בפנים (בתגי `<style>`) הוא ה-CSS של הקנבס. שמות המחלקות שונים מ-`design/components.css` (`.btn-p` = `.btn--primary`, `.acc` = `.acc__btn`, `.inp` = `.input`, `.tbc` = `.tbc`). לבנייה השתמשו ב-components.css.
- הקבצים הם תמונת מצב: אין בהם JavaScript ואין אינטראקציה.

## canvas-source/
קוד המקור של העיצוב כפי שנבנה בקנבס של Claude Design (`*.dc.html` + `canvas.json`).
פורמט פנימי: `<x-dc>` עוטף את התבנית, `{{name}}` מציב ערך שמגיע מ-`renderVals()`, `<sc-if value="{{x}}">` הוא תנאי, `<sc-for list="{{items}}" as="it">` הוא לולאה, ו-`<dc-import name="Header">` משלב קובץ אחר.
- **שימושי ללוגיקה:** ב-`renderVals()` של `Status.dc.html` (אובייקט `D` – כל המצבים), `Order.dc.html` (מערך `M` של שיטות המסירה, `nextFrom`/`prevFrom` – הדילוגים), `Faq.dc.html` (מערך `F` – השאלות, התשובות והפעולות) ו-`Auth.dc.html` (ולידציה).
- **אל תעתיקו את הפורמט עצמו** לאתר. האתר הוא HTML/JS רגיל.

| קובץ | מסכים |
|---|---|
| Main | מערכת עיצוב |
| Index | P00 |
| Header / Footer | רכיבים גלובליים |
| HomeB / HomeA / HomeB-ar | P01B / P01A / ערבית |
| Auth | P02 + P03 |
| Status | P04 (S0–S9) |
| Order | P05–P09 |
| Reissue | P10 |
| Guide, Fastest, Delivery, Pickup, Faq, About, Contact, Accessibility, Error | P11–P19 |
