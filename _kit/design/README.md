# design/ – נכסים מוכנים לאתר

| קובץ | העתקה לאתר | הערות |
|---|---|---|
| `tokens.css` | `css/tokens.css` | כל הצבעים, הגדלים והריווחים. לא להמציא ערכים מחוץ לקובץ |
| `components.css` | `css/components.css` | מניח שהפונטים ב-`../fonts/` ביחס לקובץ |
| `fonts/*.woff2` | `fonts/` | Heebo (hebrew + latin, 400–800), Noto Sans Arabic (400/600/700/800). רישיון SIL OFL 1.1 |
| `icons/*.svg` | `icons/` | 43 אייקונים, קו 2px, `currentColor`. תצוגה: `icons/_preview.html` |
| `icons-sprite.svg` | `icons/icons-sprite.svg` | `<svg class="ico"><use href="icons/icons-sprite.svg#i-truck"/></svg>` |
| `brand/wordmark.svg` / `wordmark-on-dark.svg` | `img/` | לשימושים מחוץ לאתר (מסמכים, OG). באתר בונים את הוורדמרק ב-HTML |
| `brand/mark-bars.svg` | `img/` | שלושת הפסים לבד |
| `brand/favicon.svg` | `img/favicon.svg` | |
| `brand/license-card-illustration.svg` | `img/` | איור ה-Hero. אפשר גם לבנות ב-HTML כמו בהדמיה |
| `brand/mot-logo-placeholder.svg` | `img/` | Placeholder בלבד |
| `brand/sms-chip.svg` | `img/` | הצ'יפ שבאיור של גרסה B (או לבנות ב-HTML) |

**לא לשימוש באתר:** `assets/logos/mot_logo_ref.png` (רפרנס בלבד), `assets/current_site_before/*` ("לפני"), `assets/hero/hero_license_hand.png` (הוחלף באיור).
