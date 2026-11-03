/* faq.js – P15: חיפוש חי (שאלה + תשובה), צ'יפים לפי נושא, מונה aria-live, אין תוצאות.
   פרמטרים: ?cat=<נושא> ?q=<טקסט> ?open=<מספר השאלה ברשימה המלאה, 1-8> (ברירת מחדל: 1). */
(function () {
  'use strict';
  var esc = UI.esc;
  var ALL = 'הכל';
  var CATS = [ALL].concat((window.FD_DATA && window.FD_DATA.faq_categories) || ['אגרה ותשלום', 'צילום', 'הזמנה ומשלוח', 'מסירה ובעיות']);

  // [נושא, שאלה, תשובה, טקסט פעולה, קישור] – מתוך Faq.dc.html (מערך F)
  var F = [
    ['מסירה ובעיות', 'שילמתי והרישיון לא הגיע – מה הסיבות האפשריות?', 'הסיבות הנפוצות: עדיין לא הצטלמתם (אם נדרש), התשלום בסניף דואר עדיין לא הגיע אלינו, או שהרישיון נשלח בדואר רגיל לתיבה בלי שם מזהה. בדקו את מצב הבקשה כדי לדעת איפה היא נמצאת.', 'לבדיקת מצב', 'login.html'],
    ['צילום', 'איך יודעים אם צריך להצטלם?', 'בטופס האגרה וברישיון הזמני יש ריבוע אדום בצד שמאל. אם כתוב שם שצריך להצטלם – גשו לתחנת צילום מורשית. אם כתוב שתמונתכם נמצאת במחשב – אין צורך.', 'לדוגמאות המסמכים', 'guide.html?open=2'],
    ['אגרה ותשלום', 'שילמתי פעמיים בטעות – מה עכשיו?', 'האגרה משולמת למשרד התחבורה, ולכן החזר על תשלום כפול נעשה מולו. פנו למוקד משרד התחבורה *5678.', 'לצור קשר', 'contact.html'],
    ['הזמנה ומשלוח', 'עברו 48 השעות – אפשר עוד לשנות כתובת או שיטת מסירה?', 'לא. אחרי סגירת חלון הבחירה הרישיון יורד לייצור ונשלח בדואר רגיל, ללא מעקב, לכתובת הרשומה במשרד הפנים.', 'לבדיקת מצב', 'login.html'],
    ['הזמנה ומשלוח', 'למה אי אפשר לשנות את הכתובת?', 'לפי הנחיות משרד התחבורה, רק מי שנדרש להצטלם מחדש רשאי לשלוח לכתובת אחרת. אפשר להוסיף מספר כניסה, ״אצל״ ומה כתוב על תיבת הדואר.', 'לשיטות המסירה', 'delivery.html'],
    ['מסירה ובעיות', 'קיבלתי SMS מכם – איך אדע שזה לא הונאה?', 'האתר שלנו נמצא רק בכתובת fastdl.co.il. לא נבקש מכם פרטי אשראי בהודעת SMS או בטלפון. הודעות ה-SMS שלנו נשלחות מהשולח [שם שולח לאישור].', 'על השירות', 'about.html'],
    ['אגרה ותשלום', 'מה ההבדל בין האגרה לבין התשלום על המשלוח?', 'האגרה משולמת למשרד התחבורה עבור הרישיון עצמו. אצלנו משלמים רק אם בחרתם שיטת מסירה בתשלום, למשל משלוח מהיר.', 'למחירון', 'delivery.html'],
    ['הזמנה ומשלוח', 'כמה זמן נשמר הרישיון בעמדת האיסוף?', '[לאישור] – הנוסח הסופי ייקבע לפי הסיכום עם עמדות האיסוף.', 'לעמדות האיסוף', 'pickup.html']
  ];

  // תשובה → HTML: [..] כ-tbc, מספרים/כתובת האתר כ-num
  function fmt(s) {
    return esc(s).split(/(\[[^\]]*\])/).map(function (part) {
      if (/^\[.*\]$/.test(part)) return '<span class="tbc">' + part + '</span>';
      return part.replace(/fastdl\.co\.il|\*?\d+(?:[.:–-]\d+)*/g, function (n) { return '<span class="num" dir="ltr">' + n + '</span>'; });
    }).join('');
  }

  var state = { q: '', cat: ALL, open: 0 };
  var pc = UI.param('cat'); if (pc && CATS.indexOf(pc) >= 0) state.cat = pc;
  var pq = UI.param('q'); if (pq) state.q = pq;
  var po = UI.param('open');
  if (po !== null) { var n = Number(po); state.open = n >= 1 && n <= F.length ? n - 1 : -1; }

  var input = document.getElementById('q');
  var chips = document.getElementById('faq-chips');
  var list = document.getElementById('faq-list');
  var count = document.getElementById('count');
  input.value = state.q;

  chips.innerHTML = CATS.map(function (c) {
    return '<button type="button" class="chip" data-cat="' + esc(c) + '" aria-pressed="false">' + esc(c) + '</button>';
  }).join('');

  function visible() {
    var q = state.q.trim();
    return F.map(function (f, i) { return { f: f, i: i }; }).filter(function (x) {
      return (state.cat === ALL || x.f[0] === state.cat) && (!q || (x.f[1] + ' ' + x.f[2]).indexOf(q) >= 0);
    });
  }

  function render() {
    UI.qsa('[data-cat]', chips).forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-cat') === state.cat ? 'true' : 'false'); });
    var items = visible();
    count.textContent = items.length + ' שאלות מוצגות';
    if (!items.length) {
      list.innerHTML = '<p class="faq-empty">לא מצאנו שאלה שמתאימה לחיפוש. נסו מילה אחרת, או פנו אלינו.</p>';
      return;
    }
    list.innerHTML = items.map(function (x) {
      var f = x.f, i = x.i, open = state.open === i;
      return '<div class="acc">' +
        '<button type="button" class="acc__btn" id="faq-b' + i + '" aria-expanded="' + open + '" aria-controls="faq-p' + i + '" data-i="' + i + '"><span>' + esc(f[1]) + '</span>' + UI.icon('chevron-down') + '</button>' +
        '<div class="acc__panel faq-panel" id="faq-p' + i + '" role="region" aria-labelledby="faq-b' + i + '"' + (open ? '' : ' hidden') + '>' +
        '<p>' + fmt(f[2]) + '</p><a class="btn btn--secondary btn--sm" href="' + f[4] + '">' + esc(f[3]) + '</a></div></div>';
    }).join('');
  }

  list.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[data-i]') : null;
    if (!b) return;
    var i = Number(b.getAttribute('data-i'));
    state.open = state.open === i ? -1 : i;
    UI.qsa('[data-i]', list).forEach(function (o) {
      var on = Number(o.getAttribute('data-i')) === state.open;
      o.setAttribute('aria-expanded', on ? 'true' : 'false');
      var p = document.getElementById(o.getAttribute('aria-controls'));
      if (p) p.hidden = !on;
    });
  });
  chips.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[data-cat]') : null;
    if (!b) return;
    state.cat = b.getAttribute('data-cat');
    render();
  });
  input.addEventListener('input', function () { state.q = input.value; render(); });

  render();
})();
