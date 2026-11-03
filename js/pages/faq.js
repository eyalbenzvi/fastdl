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
    ['אגרה ותשלום', 'מה ההבדל בין האגרה לבין התשלום על המשלוח?', 'האגרה משולמת למשרד התחבורה עבור הרישיון עצמו. אצלנו משלמים רק אם בחרתם שיטת מסירה בתשלום – ויש גם אפשרויות ללא עלות.', 'למחירון', 'delivery.html'],
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

  /* P2-12: חיפוש סלחני – אותיות לטיניות בלי רישיות, בלי ניקוד, טעמים, גרש/גרשיים ומירכאות (׳ ״ ' " ’ ”),
     אותיות סופיות = רגילות, רווחים מכווצים; וגם השוואה בלי י/ו, כך ש"רשיון" מוצא "רישיון" ו"sms" מוצא "SMS" */
  var FINALS = { 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' };
  function norm(s) {
    return String(s || '').toLowerCase()
      .replace(/[\u0591-\u05C7]/g, '')
      .replace(/[\u05F3\u05F4'"`\u2018\u2019\u201C\u201D]/g, '')
      .replace(/[ךםןףץ]/g, function (c) { return FINALS[c]; })
      .replace(/\s+/g, ' ').trim();
  }
  function loose(s) { return s.replace(/[יו]/g, ''); }
  var HAY = F.map(function (f) { var n = norm(f[1] + ' ' + f[2]); return { n: n, l: loose(n) }; });
  function matches(i, q) {
    if (!q) return true;
    if (HAY[i].n.indexOf(q) >= 0) return true;
    var lq = loose(q);
    return !!lq.trim() && HAY[i].l.indexOf(lq) >= 0;
  }
  function visible() {
    var q = norm(state.q);
    return F.map(function (f, i) { return { f: f, i: i }; }).filter(function (x) {
      return (state.cat === ALL || x.f[0] === state.cat) && matches(x.i, q);
    });
  }

  // כל השאלות נבנות פעם אחת; סינון = hidden על הפריטים (כך Flip יכול להזיז את הפריטים שנשארים למקומם החדש)
  list.innerHTML = F.map(function (f, i) {
    var open = state.open === i;
    return '<div class="acc" data-item="' + i + '" data-flip-id="faq-' + i + '">' +
      '<button type="button" class="acc__btn" id="faq-b' + i + '" aria-expanded="' + open + '" aria-controls="faq-p' + i + '" data-i="' + i + '"><span>' + esc(f[1]) + '</span>' + UI.icon('chevron-down') + '</button>' +
      '<div class="acc__panel faq-panel" id="faq-p' + i + '" role="region" aria-labelledby="faq-b' + i + '"' + (open ? '' : ' hidden') + '>' +
      '<p>' + fmt(f[2]) + '</p><a class="btn btn--secondary info-btn" href="' + f[4] + '">' + esc(f[3]) + '</a></div></div>';
  }).join('') + '<p class="faq-empty" hidden>לא מצאנו שאלה שמתאימה לחיפוש. נסו מילה אחרת, או פנו אלינו.</p>';
  var itemEls = UI.qsa('[data-item]', list);
  var emptyEl = UI.qs('.faq-empty', list);

  function apply() {
    var shown = visible().map(function (x) { return x.i; });
    itemEls.forEach(function (el) { el.hidden = shown.indexOf(Number(el.getAttribute('data-item'))) < 0; });
    emptyEl.hidden = shown.length > 0;
    count.textContent = shown.length + ' שאלות מוצגות';
  }

  // animate: רק בבחירת נושא (פעולה בדידה). הקלדה בחיפוש מסננת מיד – פעולה בתדירות גבוהה, בלי תנועה
  function render(animate) {
    UI.qsa('[data-cat]', chips).forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-cat') === state.cat ? 'true' : 'false'); });
    if (animate) UI.motion.flip(itemEls.concat(emptyEl), apply); else apply();
  }

  list.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[data-i]') : null;
    if (!b) return;
    var i = Number(b.getAttribute('data-i'));
    state.open = state.open === i ? -1 : i;
    UI.qsa('[data-i]', list).forEach(function (o) {
      var on = Number(o.getAttribute('data-i')) === state.open;
      var was = o.getAttribute('aria-expanded') === 'true';
      o.setAttribute('aria-expanded', on ? 'true' : 'false');
      var p = document.getElementById(o.getAttribute('aria-controls'));
      if (p && on !== was) { if (on) UI.reveal(p); else UI.conceal(p); }
    });
    if (state.open === i) { var pp = document.getElementById(b.getAttribute('aria-controls')); setTimeout(function () { UI.ensureVisible(pp, { anchor: b, minVisible: 80 }); }, 230); }
  });
  chips.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[data-cat]') : null;
    if (!b) return;
    state.cat = b.getAttribute('data-cat');
    render(true);
  });
  input.addEventListener('input', function () { state.q = input.value; render(); });

  render();
})();
