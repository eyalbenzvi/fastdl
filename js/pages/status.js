/* status.js – מסך המצב P04 (S0–S9 + טעינה). תבנית אחת, טבלת STATE_UI אחת.
   פרמטרים: s, ans (S0), docs=1 (S0), reveal=1 (S7), method=express (S3), demo=toast (S4), doc=tag (סוג תעודה מ-S9). */
(function () {
  'use strict';

  var D = window.FD_DATA || {};
  var REQ = D.request || {};
  var ADDR = (D.citizen && D.citizen.moin_address && D.citizen.moin_address.display) || 'רחוב העצמאות 10, באר שבע';
  var KEYS = ['S0', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'loading'];
  var DOC_TYPES = { license: 'רישיון נהיגה', tag: 'תג חניה לנכה' };
  var STEPS = ['הבקשה התקבלה', 'בחירת משלוח', 'בייצור', 'נשלחה', 'נמסרה'];

  function I(n, o) { return UI.icon(n, o); }
  function n(s) { return '<span class="num" dir="ltr">' + s + '</span>'; }
  function tbc(s) { return '<span class="tbc">' + (s || '[לאישור]') + '</span>'; }
  function ext(text, cls, iconSize) {
    return '<a href="#" target="_blank" rel="noopener" class="' + (cls || 'ext-link') + '">' + text +
      I('external-link', { size: iconSize || 16 }) + '<span class="sr-only">(נפתח בלשונית חדשה)</span></a>';
  }
  function act(name, extra) { return ' data-action="' + name + '"' + (extra || ''); }

  /* ---------- State ---------- */
  var st = {
    s: 'S1', ans: -1, docs: false, reveal: false, method: '', doc: 'license',
    smsDone: false, notifyDone: false, gotIt: false
  };
  (function init() {
    var s = UI.param('s');
    st.s = KEYS.indexOf(s) >= 0 ? s : 'S1';
    var a = Number(UI.param('ans'));
    st.ans = UI.param('ans') !== null && a >= 0 && a <= 3 ? a : -1;
    st.docs = UI.param('docs') === '1' && st.s === 'S0' && st.ans === 1;
    st.reveal = UI.param('reveal') === '1';
    st.method = UI.param('method') === 'express' ? 'express' : '';
    st.doc = DOC_TYPES[UI.param('doc')] ? UI.param('doc') : 'license';
  })();

  /* ---------- STATE_UI ---------- */
  var STATE_UI = {
    S0: {
      tone: 'neutral', icon: 'search', badge: 'לא נמצאה בקשה', h1: 'עדיין לא מצאנו אצלנו בקשה על שמכם', step: 0,
      kv: function () { return []; },
      help: [['שאלות על אגרה ותשלום', 'faq.html'], ['מה עלי לעשות עכשיו?', 'guide.html']],
      now: nowS0
    },
    S1: {
      tone: 'success', icon: 'check', badge: 'אפשר להזמין', h1: 'הבקשה שלכם התקבלה – אפשר לבחור משלוח', step: 2,
      kv: function () {
        return [['סוג תעודה', docType()], ['התקבלה אצלנו', 'יום ב׳, ' + n('24.8.2026') + ', ' + n('05:12')], ['כתובת במשרד הפנים', ADDR]];
      },
      help: [['השוואה בין שיטות המסירה', 'delivery.html'], ['מה קורה אם לא בוחרים?', 'faq.html']],
      now: nowS1
    },
    S2: {
      tone: 'info', icon: 'order-done', badge: 'הזמנה בוצעה', h1: 'ההזמנה שלכם התקבלה', step: 2,
      kv: function () {
        return [['שיטת מסירה', 'איסוף מנתב״ג'], ['עמדה', 'נתב״ג, טרמינל 3, עמדת ״על הקו״'], ['מספר הזמנה', n('FD-2026-0841273')], ['סכום ששולם', n('118 ₪')]];
      },
      help: [['עמדות איסוף ושעות', 'pickup.html'], ['שאלות על הזמנה ומשלוח', 'faq.html']],
      now: nowS2
    },
    S3: {
      tone: 'navy', icon: 'gear-production', badge: 'בייצור', h1: 'הרישיון שלכם בייצור', step: 3,
      kv: function () {
        return [['התקבלה', n('24.8.2026') + ', ' + n('05:12')], ['הועבר לייצור', n('25.8.2026') + ', ' + n('07:00')],
          ['שיטת מסירה', st.method === 'express' ? 'משלוח מהיר עד הבית' : 'דואר רגיל (לא בוצעה הזמנה)'], ['כתובת', ADDR]];
      },
      help: [['למה אי אפשר לשנות עכשיו?', 'faq.html']],
      now: nowS3
    },
    S4: {
      tone: 'ship', icon: 'truck', badge: 'בדרך אליכם', h1: 'הרישיון בדרך אליכם', step: 4,
      kv: function () {
        return [['נשלח', n('25.8.2026')], ['שיטה', 'שליח עד הבית'], ['חברת משלוחים', tbc()],
          ['מספר מעקב', n('123456789'), { copy: '123456789' }], ['כתובת', ADDR]];
      },
      help: [['המשלוח לא הגיע', 'contact.html?topic=lost'], ['שאלות על מסירה', 'faq.html']],
      now: nowS4
    },
    S5: {
      tone: 'success', icon: 'home-check', badge: 'מחכה לכם', h1: 'הרישיון מחכה לכם לאיסוף', step: 4,
      kv: function () { return [['מוכן לאיסוף מ-', n('26.8.2026')], ['מספר הזמנה', n('FD-2026-0841273')]]; },
      help: [['עמדות איסוף ושעות', 'pickup.html']],
      now: nowS5
    },
    S6: {
      tone: 'success', icon: 'check', badge: 'נמסרה', h1: 'הרישיון נמסר', step: 5,
      kv: function () { return [['שיטה', 'משלוח מהיר עד הבית'], ['תאריך משלוח', n('25.8.2026')], ['כתובת', ADDR]]; },
      help: [['שאלות ותשובות', 'faq.html']],
      now: nowS6
    },
    S7: {
      tone: 'warning', icon: 'alert-triangle', badge: 'לא אושרה מסירה', h1: 'לא מצאנו אישור שהרישיון נמסר', step: 4, mark: 'warn',
      kv: function () { return [['נשלח', n('26.8.2026')], ['שיטה', 'דואר רגיל'], ['כתובת', ADDR]]; },
      help: [['מתי מגיעה הנפקה חוזרת?', 'faq.html'], ['צור קשר', 'contact.html']],
      now: nowS7
    },
    S8: {
      tone: 'danger', icon: 'x-circle', badge: 'המסירה נכשלה', h1: 'השליח לא הצליח למסור את הרישיון', step: 4, mark: 'fail',
      kv: function () { return [['שיטה', 'משלוח מהיר עד הבית'], ['נשלח', n('25.8.2026')], ['כתובת', ADDR]]; },
      help: [['צור קשר', 'contact.html']],
      now: nowS8
    },
    S9: {
      tone: 'neutral', icon: 'files', badge: '2 בקשות', h1: 'מצאנו אצלנו שתי בקשות על שמכם', step: -1,
      kv: function () { return []; },
      help: [['שאלות ותשובות', 'faq.html']],
      now: nowS9
    }
  };

  function docType() { return DOC_TYPES[st.doc] || REQ.document_type || DOC_TYPES.license; }

  /* ---------- Shared blocks ---------- */
  function badge(tone, icon, text) {
    return '<span class="badge badge--' + tone + '">' + I(icon, { size: 18 }) + text + '</span>';
  }

  function timeline(d) {
    var step = d.step;
    var done = step === 5 ? 4 : Math.max(0, Math.min(step - 1, 4));
    var html = '<div class="card status-tl"><ol class="timeline" aria-label="שלבי הטיפול בבקשה">' +
      '<span class="timeline__track" aria-hidden="true"></span>' +
      '<span class="timeline__fill" aria-hidden="true" style="width:' + (done * 20) + '%"></span>';
    STEPS.forEach(function (label, i) {
      var k = i + 1;
      var isDone = step === 5 || k < step;
      var isCur = k === step && step < 5;
      var cls = isDone ? 'done' : isCur ? (d.mark || 'current') : 'future';
      var dot = isDone ? I('check', { size: 18, style: 'stroke-width:3' }) : (isCur && d.mark ? '<span aria-hidden="true" class="timeline__bang">!</span>' : '');
      var sr = isDone ? ' (הושלם)' : isCur ? ' (שלב נוכחי)' : '';
      html += '<li class="timeline__step timeline__step--' + cls + '"' + (isCur ? ' aria-current="step"' : '') + '>' +
        '<span class="timeline__dot">' + dot + '</span><span>' + label + (sr ? '<span class="sr-only">' + sr + '</span>' : '') + '</span></li>';
    });
    return html + '</ol></div>';
  }

  function kvSection(rows) {
    rows = rows.filter(function (r) { return r && r[1] !== null && r[1] !== undefined && String(r[1]).trim() !== ''; });
    if (!rows.length) return '';
    return '<section class="card status-det" aria-labelledby="det-h"><h2 id="det-h" class="h2">פרטי הבקשה</h2><dl class="kv">' +
      rows.map(function (r) {
        var o = r[2] || {};
        var v = o.copy
          ? '<span class="copy-row">' + r[1] + '<button type="button" class="icon-btn icon-btn--ghost" aria-label="העתקת מספר המעקב"' + act('copy', ' data-copy="' + o.copy + '"') + '>' + I('copy', { size: 20 }) + '</button></span>'
          : r[1];
        return '<div><dt>' + r[0] + '</dt><dd>' + v + '</dd></div>';
      }).join('') + '</dl></section>';
  }

  function helpSection(list) {
    var seen = {};
    var items = list.filter(function (h) { return h[0] !== 'צור קשר'; }).concat([['צור קשר', 'contact.html']])
      .filter(function (h) { if (seen[h[0]]) return false; seen[h[0]] = 1; return true; });
    return '<section class="status-help" aria-labelledby="help-h"><h2 id="help-h" class="status-help__h">משהו לא ברור?</h2>' +
      '<ul class="status-help__list">' + items.map(function (h) { return '<li><a href="' + h[1] + '">' + h[0] + '</a></li>'; }).join('') + '</ul>' +
      '<p class="small">מוקד שירות: <a href="' + Layout.TEL + '">' + n(Layout.PHONE) + '</a> · ' + Layout.hoursLine() + '</p></section>';
  }

  function doneNote(text) {
    return '<p class="status-done" role="status" tabindex="-1">' + I('check-circle', { size: 20 }) + '<span>' + text + ' ' + tbc('[נוסח לאישור]') + '</span></p>';
  }

  /* ---------- "מה עכשיו?" per state ---------- */
  var ANS = ['היום', 'לפני 1–3 ימים', 'לפני יותר משבוע', 'לפני יותר מחודשיים / הרישיון לא הגיע'];

  function smsBlock(withConsent) {
    if (st.smsDone) return doneNote('נרשמתם לעדכון ב-SMS.');
    var h = '';
    if (withConsent) {
      h += '<div class="field"><label class="check" for="sms-consent"><input type="checkbox" id="sms-consent">' +
        '<span>אני מסכים/ה לקבל עדכון ב-SMS על הבקשה שלי לנייד ' + n((D.citizen && D.citizen.mobile_masked) || '054-•••-4567') + '</span></label></div>';
    }
    return h + '<button type="button" class="btn btn--primary btn--m-block status-self-start"' + act('sms') + '>עדכנו אותי ב-SMS</button>';
  }

  function s0Answer() {
    switch (st.ans) {
      case 0:
        return '<p>הבקשה צפויה להגיע אלינו מחר בבוקר. נשלח לכם SMS ברגע שהיא תגיע, ואז תוכלו להזמין.</p>' + smsBlock(true);
      case 1:
        return '<p class="status-strong">יש שני מקרים אפשריים:</p>' +
          '<div class="s0-ans__part"><p><strong>ייתכן שאתם צריכים להצטלם.</strong> בטופס האגרה יש ריבוע אדום שאומר אם צריך.</p>' +
          '<button type="button" class="btn btn--secondary status-self-start" id="docs-btn"' + act('docs') + '>איך יודעים אם צריך להצטלם?</button></div>' +
          '<div class="s0-ans__part s0-ans__part--sep"><p><strong>שילמתם בסניף דואר?</strong> הנתונים מגיעים אלינו מאוחר יותר.</p>' + smsBlock(false) + '</div>';
      case 2:
        return '<p>אם עדיין לא הצטלמתם – גשו לתחנת צילום מורשית. אם הצטלמתם ועבר יותר משבוע, פנו למוקד משרד התחבורה ' + n('‎*5678') + '.</p>' +
          '<div class="status-links">' + ext('לרשימת תחנות הצילום') + '<a href="tel:*5678">למוקד משרד התחבורה</a></div>';
      case 3:
        return '<p>ייתכן שהבקשה כבר טופלה ונשלחה, והנתונים נמחקו אצלנו (אנחנו שומרים רשומות 45 ימי עסקים). כדי לקבל רישיון חדש יש להזמין כפל רישיון במשרד התחבורה.</p>' +
          '<a class="btn btn--secondary status-self-start" href="fastest.html">איך מזמינים כפל רישיון</a>';
    }
    return '';
  }

  function nowS0() {
    return '<p>זה לא אומר שמשהו השתבש. בקשות מגיעות אלינו פעם ביום, לפנות בוקר. כדי שנכוון אתכם נכון:</p>' +
      '<fieldset class="s0-q"><legend class="s0-q__legend">מתי השלמתם את התשלום (והצילום, אם נדרש)?</legend><div class="g2 s0-q__grid">' +
      ANS.map(function (t, i) { return '<button type="button" class="ans-btn" aria-pressed="' + (st.ans === i) + '"' + act('ans', ' data-i="' + i + '"') + '>' + t + '</button>'; }).join('') +
      '</div></fieldset>' +
      '<div id="s0-ans" class="s0-ans" aria-live="polite"' + (st.ans < 0 ? ' hidden' : '') + '>' + s0Answer() + '</div>' +
      '<p class="small s0-foot">לא שילמתם עדיין את האגרה? ' + ext('לתשלום באתר משרד התחבורה') + '</p>';
  }

  function nowS1() {
    var countdown = REQ.countdown_reliable === true ? '<p class="muted">' + (REQ.remaining_display || 'נותרו כ-27 שעות') + '</p>' : '';
    return '<div class="time-card"><span class="ibox ibox--52 ibox--white">' + I('clock', { size: 28 }) + '</span>' +
      '<div><p class="time-card__t">אפשר להזמין עד <strong>יום ד׳, ' + n('26.8.2026') + ' בשעה ' + n('05:12') + '</strong></p>' + countdown + '</div></div>' +
      '<div class="callout callout--warning" role="note">' + I('alert-triangle') + '<p>אם לא תבחרו עד המועד הזה, הרישיון יישלח בדואר רגיל ללא מעקב, לכתובת הרשומה במשרד הפנים.</p></div>' +
      '<div class="status-actions">' +
      '<a class="btn btn--primary btn--m-block" href="order.html?reset=1">לבחירת משלוח או איסוף' + I('chevron-forward-rtl', { size: 20 }) + '</a>' +
      '<button type="button" class="btn btn--secondary btn--m-block"' + act('cal') + '>' + I('calendar', { size: 18 }) + 'הוסיפו תזכורת ליומן</button></div>';
  }

  function nowS2() {
    return '<p>בחרתם להשאיר אפשרות לשינוי. אפשר לעדכן את ההזמנה עד <strong>' + n('26.8.2026') + ' בשעה ' + n('05:12') + '</strong>. אחרי זה הרישיון יורד לייצור.</p>' +
      '<div class="status-actions"><a class="btn btn--primary btn--m-block" href="order.html">עריכת ההזמנה</a>' +
      '<button type="button" class="btn btn--secondary btn--m-block" id="prod-btn"' + act('prod') + '>העבירו לייצור עכשיו</button></div>';
  }

  function nowS3() {
    return '<p>בשלב הזה כבר אי אפשר לשנות כתובת או שיטת משלוח – זה סימן שהתהליך מתקדם, לא תקלה.</p>' +
      (st.notifyDone ? doneNote('נשלח לכם עדכון כשהרישיון יוצא.')
        : '<button type="button" class="btn btn--secondary btn--m-block status-self-start"' + act('notify') + '>' + I('message', { size: 20 }) + 'שלחו לי עדכון כשהרישיון יוצא</button>') +
      (st.method === 'express' ? '' : '<p class="small muted">דואר רגיל נמסר לתיבת הדואר רק אם מופיע עליה שם מזהה, כמו שם משפחה.</p>');
  }

  function nowS4() {
    return '<div class="time-card time-card--ship"><span class="ibox ibox--52 ibox--white">' + I('truck', { size: 28 }) + '</span>' +
      '<p class="time-card__big">צפוי להגיע עד יום ד׳, ' + n('26.8.2026') + '</p></div>' +
      '<div class="status-actions status-actions--wide">' +
      '<a class="btn btn--primary btn--m-block" href="#" target="_blank" rel="noopener">למעקב אחר המשלוח' + I('external-link', { size: 18 }) + '<span class="sr-only">(נפתח בלשונית חדשה)</span></a>' +
      '<a href="contact.html?topic=lost">המשלוח לא הגיע?</a></div>';
  }

  function nowS5() {
    return '<div class="place-card"><p class="place-card__t">' + I('plane') + 'איסוף מנתב״ג – טרמינל 3</p>' +
      '<p>אולם מקבלי הפנים, ליד שער יציאה 1, עמדת ״על הקו״</p>' +
      '<p class="muted">א׳–ה׳ ' + n('07:00–22:00') + ' · שישי וערבי חג עד ' + n('15:00') + '</p>' +
      '<p><strong>ניתן לאסוף עד ' + tbc('[תאריך לאישור]') + '</strong></p>' +
      '<p>מה להביא: תעודה מזהה</p></div>' +
      '<div class="status-actions">' +
      '<a class="btn btn--primary btn--m-block" href="#" target="_blank" rel="noopener">ניווט לעמדה' + I('external-link', { size: 18 }) + '<span class="sr-only">(נפתח בלשונית חדשה)</span></a>' +
      '<button type="button" class="btn btn--secondary btn--m-block"' + act('cal') + '>הוסיפו ליומן</button></div>' +
      '<p>מה קורה אם לא אוספים בזמן? ' + tbc('[נוסח לאישור]') + '</p>';
  }

  function nowS6() {
    return '<p class="status-lead">נמסר ב-' + n('26.8.2026') + '.</p><a href="contact.html?topic=lost" class="status-self-start">לא קיבלתם בפועל? ספרו לנו</a>';
  }

  function gotItBtn() { return '<button type="button" class="link-btn"' + act('gotit') + '>קיבלתי את הרישיון</button>'; }

  function nowS7() {
    var h = '<p class="status-lead">הרישיון נשלח בדואר רגיל ב-' + n('26.8.2026') + ', ועברו מאז 21 ימי עסקים.</p>';
    if (st.gotIt) return h + doneNote('תודה, סגרנו את הפנייה.');
    if (!st.reveal) {
      return h + '<div class="status-actions status-actions--wide"><button type="button" class="btn btn--primary btn--m-block" aria-expanded="false" aria-controls="s7-reveal"' + act('reveal') + '>לא קיבלתי את הרישיון</button>' + gotItBtn() + '</div>' +
        '<div id="s7-reveal" aria-live="polite"></div>';
    }
    return h + '<div id="s7-reveal" class="s7-reveal" aria-live="polite">' +
      '<div class="place-card"><p class="status-strong s7-reveal__t" tabindex="-1">בדיקת זכאות</p><dl class="kv">' +
      '<div><dt>תאריך משלוח</dt><dd>' + n('26.8.2026') + '</dd></div><div><dt>שיטה</dt><dd>דואר רגיל</dd></div>' +
      '<div><dt>ימי עסקים שעברו</dt><dd>' + n('21') + '</dd></div><div><dt>סטטוס מסירה</dt><dd>אין תיעוד מסירה</dd></div></dl></div>' +
      '<div class="callout callout--success" role="status">' + I('check-circle') + '<p class="callout__title">אתם זכאים להנפקה חוזרת ללא עלות.</p></div>' +
      '<div class="status-actions status-actions--wide"><a class="btn btn--primary btn--m-block" href="reissue.html">להזמנת הנפקה חוזרת' + I('chevron-forward-rtl', { size: 20 }) + '</a>' + gotItBtn() + '</div></div>';
  }

  function nowS8() {
    return '<p>הרישיון חזר אלינו. ' + tbc('[נוסח לאישור: האם אפשר לבחור מסירה מחדש / איסוף]') + '.</p>' +
      '<div class="status-actions status-actions--wide"><button type="button" class="btn btn--primary btn--m-block"' + act('redeliver') + '>לתיאום מסירה מחדש</button>' +
      '<a href="' + Layout.TEL + '">למוקד ' + n(Layout.PHONE) + '</a></div>';
  }

  function nowS9() {
    function card(title, b, s, doc) {
      return '<li class="pick-card"><p class="pick-card__t">' + title + '</p>' + b +
        '<button type="button" class="btn btn--secondary"' + act('pick', ' data-s="' + s + '" data-doc="' + doc + '"') + '>לפרטים</button></li>';
    }
    return '<p>בחרו את הבקשה שתרצו לראות.</p><ul class="g2 pick-grid">' +
      card('רישיון נהיגה', badge('success', 'check', 'אפשר להזמין'), 'S1', 'license') +
      card('תג חניה לנכה', badge('navy', 'gear-production', 'בייצור'), 'S3', 'tag') + '</ul>';
  }

  /* ---------- Render ---------- */
  var root = document.getElementById('status-root');

  function skeleton() {
    return '<div class="status-skel" aria-busy="true" aria-label="טוען את מצב הבקשה" role="status">' +
      '<div class="skel status-skel__id"></div><div class="skel status-skel__h"></div><div class="skel status-skel__tl"></div>' +
      '<div class="skel status-skel__c1"></div><div class="skel status-skel__c2"></div></div>';
  }

  function render() {
    if (st.s === 'loading') { root.innerHTML = skeleton(); return; }
    var d = STATE_UI[st.s];
    root.innerHTML =
      '<div class="status-id"><p class="muted">שלום, ישראלה · ' + docType() + '</p><a href="index.html">יציאה</a></div>' +
      '<div class="status-head">' + badge(d.tone, d.icon, d.badge) + '<h1 class="h1" id="status-h1" tabindex="-1">' + d.h1 + '</h1></div>' +
      (d.step >= 0 ? timeline(d) : '') +
      '<section class="card status-now" aria-labelledby="now-h"><h2 id="now-h" class="h2">מה עכשיו?</h2>' + d.now() + '</section>' +
      kvSection(d.kv()) +
      helpSection(d.help);
  }

  function renderDemoBar() {
    var focused = document.activeElement && document.activeElement.getAttribute('data-demo-i');
    Layout.demoBar({
      prefix: 'הצג מצב:',
      items: KEYS.map(function (k) {
        return {
          label: k === 'loading' ? 'טעינה' : k,
          title: k === 'loading' ? 'טעינה' : STATE_UI[k].badge,
          pressed: k === st.s,
          onClick: function () { go(k, { keepFocus: true }); }
        };
      })
    });
    if (focused !== null && focused !== undefined) {
      var b = document.querySelector('[data-demo-i="' + focused + '"]');
      if (b) b.focus();
    }
  }

  function go(k, opt) {
    opt = opt || {};
    st.s = k; st.ans = -1; st.reveal = false; st.docs = false; st.smsDone = false; st.notifyDone = false; st.gotIt = false;
    if (opt.method !== undefined) st.method = opt.method; else st.method = '';
    if (opt.doc) st.doc = opt.doc;
    UI.setParams({ s: k, ans: null, docs: null, reveal: null, demo: null, method: st.method || null, doc: st.doc === 'license' ? null : st.doc });
    render();
    renderDemoBar();
    if (!opt.keepFocus) { var h = document.getElementById('status-h1'); if (h) { UI.focus(h); } window.scrollTo(0, 0); }
  }

  function openDocs(btn) {
    st.docs = true;
    UI.setParams({ docs: 1 });
    UI.modal.open('docs-modal', {
      returnFocus: btn || document.getElementById('docs-btn'),
      onClose: function () { st.docs = false; UI.setParams({ docs: null }); }
    });
  }

  function placeholderToast(text) { UI.toast(text + ' [לאישור]'); }

  /* ---------- Events ---------- */
  root.addEventListener('click', function (e) {
    var b = e.target.closest('[data-action]');
    if (!b || !root.contains(b)) return;
    var a = b.getAttribute('data-action');
    if (a === 'ans') {
      st.ans = Number(b.getAttribute('data-i')); st.smsDone = false;
      UI.setParams({ ans: st.ans, docs: null });
      UI.qsa('.ans-btn', root).forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      var box = document.getElementById('s0-ans');
      box.hidden = false;
      box.innerHTML = s0Answer();
    } else if (a === 'sms') {
      var c = document.getElementById('sms-consent');
      if (c && !c.checked) { UI.fieldError(c, 'כדי לקבל עדכון יש לסמן את תיבת ההסכמה.'); c.focus(); return; }
      st.smsDone = true;
      var bx = document.getElementById('s0-ans');
      bx.innerHTML = s0Answer();
      var note = UI.qs('.status-done', bx); if (note) note.focus();
    } else if (a === 'docs') {
      openDocs(b);
    } else if (a === 'cal') {
      placeholderToast('ההוספה ליומן');
    } else if (a === 'prod') {
      UI.modal.open('prod-modal', { returnFocus: b });
    } else if (a === 'notify') {
      st.notifyDone = true; render();
      var nn = UI.qs('.status-done', root); if (nn) nn.focus();
    } else if (a === 'reveal') {
      st.reveal = true; UI.setParams({ reveal: 1 }); render();
      var t = UI.qs('.s7-reveal__t', root); if (t) t.focus();
    } else if (a === 'gotit') {
      st.gotIt = true; render();
      var g = UI.qs('.status-done', root); if (g) g.focus();
    } else if (a === 'redeliver') {
      placeholderToast('תיאום מסירה מחדש');
    } else if (a === 'copy') {
      UI.copy(b.getAttribute('data-copy'));
    } else if (a === 'pick') {
      go(b.getAttribute('data-s'), { doc: b.getAttribute('data-doc') });
    }
  });
  root.addEventListener('change', function (e) {
    if (e.target.id === 'sms-consent' && e.target.checked) UI.fieldError(e.target, null);
  });

  document.getElementById('prod-confirm').addEventListener('click', function () {
    UI.modal.close();
    go('S3', { method: '' });
    UI.toast('ההזמנה הועברה לייצור');
  });

  /* ---------- Boot ---------- */
  render();
  renderDemoBar();
  if (st.docs) openDocs(document.getElementById('docs-btn'));
  if (st.s === 'S4' && UI.param('demo') === 'toast') UI.toast('הועתק', 0);
})();
