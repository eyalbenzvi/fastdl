# 09 – קריטריוני קבלה ותוכנית בדיקות

## 9.1 קריטריוני קבלה (מה-Brief + תוספות)
**מבנה ותוכן**
- [ ] כל המסכים P00–P19 קיימים ומקושרים מ-`prototype-index.html`. כל 10 המצבים S0–S9 (ו-loading) נגישים בקישור ישיר.
- [ ] כל מזהה ב-`mockups/manifest.json` נגיש ב-URL (טבלה ב-02 §2.4) ונראה כמו ההדמיה שלו ב-1280 וב-390.
- [ ] נוסח עברי זהה ל-`reference/rendered-html` (בלי ניסוח מחדש ובלי שגיאות כתיב).
- [ ] נתוני הדמה עקביים בכל המסכים (אותם שם, כתובת, תאריכים ומספרים).

**כללי עיצוב**
- [ ] בכל מסך (ובכל מצב) – לכל היותר כפתור Primary אחד גלוי.
- [ ] מסך המצב בנוי מאותה תבנית בכל המצבים, עם ציר התקדמות (חוץ מ-S9).
- [ ] אין ספירה לאחור בלי מועד מוחלט לצידה.
- [ ] אין שדות ריקים ואין "-----".
- [ ] תהליך ההזמנה שומר בחירות (גם ב-Back וגם ברענון), מדלג על כתובת באיסוף ועל תשלום בשיטה ללא עלות.
- [ ] שום קישור מתוך תהליך ההזמנה לא מוציא מהעמוד (חוץ מ"חזרה למסך המצב" ומהמעבר הסופי).
- [ ] לוגו משרד התחבורה מופיע רק כ-placeholder מסומן.
- [ ] כל טקסט [לאישור] מסומן `.tbc` וקל לאיתור (`grep -c 'class="tbc"'`).
- [ ] אין שימוש ב-#10A9E0 לטקסט או לרקע כפתור.

**RTL ונגישות**
- [ ] RTL תקין: חיצים, Stepper, ציר, מספרים בכיוון LTR.
- [ ] ניגודיות AA; פוקוס גלוי; כל התהליכים עובדים במקלדת בלבד (כולל מגירות ו-OTP).
- [ ] axe-core: 0 הפרות serious/critical בכל העמודים.
- [ ] זום 200% / reflow ב-320px – בלי גלילה אופקית.

**טכני**
- [ ] 0 שגיאות קונסול בכל העמודים ובכל המצבים.
- [ ] עובד מ-`file://` ומשרת סטטי; כל הנתיבים יחסיים.
- [ ] בלי בקשות רשת חיצוניות בזמן ריצה (פונטים מקומיים).
- [ ] עובד כש-sessionStorage חסום (מצב פרטי).
- [ ] Lighthouse (מובייל): Accessibility ≥ 95, Best Practices ≥ 95.

## 9.2 תרחישי בדיקה ידניים (End-to-end)
1. **יוסי – הזמנה מהירה:** index → ת״ז 000000018 + 0541234567 → קוד 123456 → S1 → "לבחירת משלוח" → משלוח מהיר → המשך → (כתובת, גרסה B) מוסיף "כניסה ב'" → המשך → ייצור מיידי + תנאים → המשך לתשלום → תשלום ₪177 → אישור. Back מהאישור? לא אמור לחזור לתשלום אלא למסך המצב.
2. **איסוף חינם:** S1 → איסוף מבארי → המשך (מדלג על כתובת; Stepper מראה "לא נדרש") → תנאים → "אישור ההזמנה" (מדלג על תשלום) → אישור.
3. **חזרה ושמירה:** בשלב 3 → חזרה → חזרה → החלפת שיטה → המשך: הכתובת והתוספות עדיין שם. רענון בשלב 3 → נשארים בשלב 3.
4. **שגיאות:** ת״ז 123456789 → שגיאה; נייד 0521 → שגיאה; קוד 111111 → "נותרו 2 ניסיונות"; שלב 3 בלי תנאים → שגיאה.
5. **דנה – לא הגיע:** `status.html?s=S7` → "לא קיבלתי" → זכאות → הנפקה חוזרת → בלי הצהרה → שגיאה → עם הצהרה → אישור.
6. **אברהם – צריך להצטלם?** guide → פריט 2 → שתי תמונות המסמכים, מוגדלות וברורות. `status.html?s=S0` → "לפני 1–3 ימים" → מודאל המסמכים → Esc → הפוקוס חוזר לכפתור.
7. **מוחמד – ערבית:** בורר השפה → home-ar → חזרה לעברית.
8. **מקלדת בלבד:** כל תרחיש 1 בלי עכבר.
9. **מובייל 390:** תרחיש 1 – כפתורים דביקים, bottom-sheets, Stepper מקוצר, ציר אנכי.

## 9.3 Playwright – הגדרה
```bash
mkdir -p qa && cd qa && npm init -y && npm i -D playwright @axe-core/playwright && npx playwright install chromium
```

## 9.4 סקריפט צילום והשוואה (`qa/shoot.js`)
מצלם כל מזהה מ-`mockups/manifest.json` לפי טבלת ה-URL, ומייצר דף השוואה זה לצד זה.
```js
// node qa/shoot.js http://localhost:8080
const { chromium } = require('playwright');
const fs = require('fs'); const path = require('path');
const BASE = process.argv[2] || 'http://localhost:8080';
const ROOT = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'mockups/manifest.json'), 'utf8'));
// מיפוי id → URL. השלם לפי docs/02_architecture.md §2.4
const URLS = require('./urls.json'); // {"02_home-B":"index.html", "21_P04_status_S1":"status.html?s=S1", ...}
(async () => {
  const b = await chromium.launch(); const rows = [];
  for (const m of manifest) {
    const url = URLS[m.id]; if (!url) { console.warn('missing url for', m.id); continue; }
    for (const [vp, size] of [['desktop', { width: 1280, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
      if (!m.files[vp]) continue;
      const p = await b.newPage({ viewport: size, deviceScaleFactor: vp === 'mobile' ? 2 : 1.5 });
      const errors = []; p.on('pageerror', e => errors.push(e.message)); p.on('console', c => c.type() === 'error' && errors.push(c.text()));
      await p.goto(`${BASE}/${url}`); await p.waitForLoadState('networkidle');
      const overlay = /drawer|menu|modal|toast|dropdown/.test(m.id);
      const out = `qa/screens/${vp}/${m.id}.png`; fs.mkdirSync(path.dirname(path.join(ROOT, out)), { recursive: true });
      await p.screenshot({ path: path.join(ROOT, out), fullPage: !overlay });
      rows.push(`<tr><td>${m.id}<br>${vp}${errors.length ? '<br><b style=color:red>' + errors.join('<br>') + '</b>' : ''}</td><td><img src="../mockups/${m.files[vp]}" width=420></td><td><img src="screens/${vp}/${m.id}.png" width=420></td></tr>`);
      await p.close();
    }
  }
  fs.writeFileSync(path.join(ROOT, 'qa/compare.html'), `<meta charset=utf-8><table border=1><tr><th>id</th><th>הדמיה</th><th>בפועל</th></tr>${rows.join('')}</table>`);
  await b.close();
})();
```
פתחו את `qa/compare.html` וסקרו שורה-שורה.

## 9.5 axe (`qa/a11y.js`)
```js
const { chromium } = require('playwright'); const { AxeBuilder } = require('@axe-core/playwright');
const pages = ['index.html','home-a.html','login.html','otp.html','status.html?s=S0','status.html?s=S1','status.html?s=S7&reveal=1','order.html?step=1','order.html?step=2&m=express_home&auth=1&addr=other','order.html?step=3&m=express_home','order.html?step=4&m=express_home','order.html?step=5&m=express_home','reissue.html','guide.html','fastest.html','delivery.html','pickup.html','faq.html','about.html','contact.html','accessibility.html','error.html','home-ar.html'];
(async () => { const b = await chromium.launch(); let bad = 0;
  for (const u of pages) { const p = await b.newPage(); await p.goto('http://localhost:8080/' + u);
    const r = await new AxeBuilder({ page: p }).analyze();
    const v = r.violations.filter(x => ['serious','critical'].includes(x.impact));
    if (v.length) { bad++; console.log(u, v.map(x => x.id + ' ×' + x.nodes.length).join(', ')); }
    await p.close(); }
  console.log(bad ? `${bad} pages with issues` : 'axe: all clean'); await b.close(); process.exit(bad ? 1 : 0); })();
```

## 9.6 בדיקות יחידה קטנות (אפשר בקונסול או ב-`qa/unit.html`)
- `Validate.israeliId('000000018') === true`, `('18') === true` (השלמה), `('123456789') === false`, `('') === false`.
- `Validate.mobile('054-1234567') === true`, `('0541234') === false`, `('0641234567') === false`.
- `Validate.maskMobile('0541234567') === '054-•••-4567'`.
- מחשבון P12: 23.8.2026 (א׳) → 25.8.2026 (ג׳); 27.8.2026 (ה׳) → 31.8.2026 (ב׳).
- order: `pickup_bari` מ-step 1 → 3; מ-step 3 → 5. `express_home` מ-step 3 → 4.
