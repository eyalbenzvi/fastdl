# tools/ – הכלים שייצרו את ההדמיות (אופציונלי)

- `dc-static-renderer.js` – רנדרר קטן שהופך קבצי `.dc.html` ל-HTML סטטי בדפדפן. פרמטרים: `?st={JSON}` (state התחלתי), `&hs={JSON}` (state ל-Header).
- `shoot-mockups.js` – סקריפט Playwright שצילם את כל 67 המצבים ב-1280 וב-390.
- `urls.json` – **מיפוי בין מזהה הדמיה ל-URL באתר שיבנה**. מוכן לשימוש ב-`qa/shoot.js` (ראו `docs/09_qa_acceptance.md` §9.4).

לשחזור ההדמיות: מעתיקים את `reference/canvas-source/*.dc.html` לתיקייה, משנים את שם `dc-static-renderer.js` ל-`support.js`, מוסיפים `fonts/` (מ-`design/fonts`) ו-`assets/` (שתי תמונות המסמכים), מריצים שרת סטטי ואז `node shoot-mockups.js http://localhost:8765 <out> <htmlOut>`.
