/* order.js – תהליך ההזמנה P05–P09 (order.html). מפרט: _kit/docs/07_order_flow.md
   state יחיד: UI.store 'fd.order' (02 §2.6). פרמטרי URL גוברים על השמור ומאתחלים בלבד. */
(function () {
  'use strict';
  var qs = UI.qs, qsa = UI.qsa;
  var D = window.FD_DATA || {};
  var KEY = 'fd.order';
  var STEP_NAMES = ['משלוח', 'כתובת', 'מתי להתחיל', 'תשלום'];

  /* ---------- נתונים ---------- */
  // קבוצות עם כותרות (החלטה 2 במסמך ההמלצות): עד הבית ← איסוף עצמי ← בדואר
  var GROUPS = [
    { key: 'home', t: 'עד הבית', ids: ['express_home', 'regular_home'] },
    { key: 'pickup', t: 'איסוף עצמי', ids: ['pickup_bari', 'pickup_tlv_airport'] },
    { key: 'mail', t: 'בדואר', ids: ['registered_mail', 'regular_mail'] }
  ];
  var ORDER_IDS = GROUPS.reduce(function (a, g) { return a.concat(g.ids); }, []);
  var ICON = { pickup_bari: 'store', pickup_tlv_airport: 'plane', express_home: 'truck', regular_home: 'truck', registered_mail: 'mail', regular_mail: 'mail' };
  // מועד הגעה מוחלט לפי "מתי להתחיל" (ייצור 25.8 או 26.8 ב-07:00; ימי עסקים א׳–ה׳). 07 §7.5 + כללי 01
  // "עוד לא": רק מהיר ונתב״ג זזים ביום עסקים – כמו בציר של מסך המצב (status.js, החלטה 48). [לאישור תפעולי] – DECISIONS
  var LATER = ' (יום עסקים אחד מאוחר יותר)';
  var ETA = {
    now: {
      pickup_bari: 'אפשר לאסוף מיום ד׳ 26.8, מ-11:00', express_home: 'יגיע עד יום ד׳ 26.8', pickup_tlv_airport: 'אפשר לאסוף מיום ד׳ 26.8',
      regular_home: 'יגיע בין יום ה׳ 27.8 ליום ג׳ 1.9', registered_mail: 'יגיע עד יום ב׳ 14.9', regular_mail: 'יגיע עד יום ב׳ 14.9'
    },
    wait: {
      pickup_bari: 'אפשר לאסוף מיום ד׳ 26.8, מ-11:00', express_home: 'יגיע עד יום ה׳ 27.8' + LATER, pickup_tlv_airport: 'אפשר לאסוף מיום ה׳ 27.8' + LATER,
      regular_home: 'יגיע בין יום ה׳ 27.8 ליום ג׳ 1.9', registered_mail: 'יגיע עד יום ב׳ 14.9', regular_mail: 'יגיע עד יום ב׳ 14.9'
    }
  };
  var HOW = { express_home: 'ביד, מהשליח', regular_home: 'ביד, מהשליח', pickup_bari: 'באיסוף, עם תעודה מזהה', pickup_tlv_airport: 'באיסוף, עם תעודה מזהה', registered_mail: 'בתיבה, עם מעקב', regular_mail: 'בתיבה, ללא מעקב' };
  var IF_NOT = {
    express_home: 'רואים במעקב איפה הוא', regular_home: 'רואים במעקב איפה הוא', registered_mail: 'רואים במעקב של דואר ישראל איפה הוא',
    regular_mail: 'אפשר לבקש הנפקה חוזרת רק אחרי 19 ימי עסקים',
    pickup_bari: 'נשמר לאיסוף עד [לאישור]', pickup_tlv_airport: 'נשמר לאיסוף עד [לאישור]'
  };
  var INCL = { express_home: 'מסירה ביד · מעקב משלוח ב-SMS', regular_home: 'מסירה ביד · מעקב משלוח ב-SMS', pickup_tlv_airport: 'איסוף עם תעודה מזהה', registered_mail: 'מעקב של דואר ישראל', pickup_bari: 'איסוף עם תעודה מזהה', regular_mail: 'ללא מעקב' };
  var CAVEAT = { regular_mail: 'נמסר רק לתיבה שיש עליה שם מזהה' }; // "ללא מעקב" כבר בתג של הכרטיס
  var TAG_CLS = { 'ללא עלות': 'tag--free', 'הכי מהיר': 'tag--fast', 'הכי מהיר לאיסוף': 'tag--fast', 'הכי מהיר עד הבית': 'tag--fast', 'ללא מעקב': 'tag--notrack', 'מסירה ביד': 'tag--hand' };
  var METHODS = (D.delivery_methods || []).slice().sort(function (a, b) { return ORDER_IDS.indexOf(a.id) - ORDER_IDS.indexOf(b.id); });
  METHODS.forEach(function (m) { GROUPS.forEach(function (g) { if (g.ids.indexOf(m.id) >= 0) m.g = g.key; }); m.g = m.g || 'home'; });
  function method(id) { for (var i = 0; i < METHODS.length; i++) if (METHODS[i].id === id) return METHODS[i]; return null; }
  var moin = (D.citizen && D.citizen.moin_address) || { street: 'העצמאות', house: '10', city: 'באר שבע', display: 'רחוב העצמאות 10, באר שבע' };
  function eta(m, prod) { return m ? ETA[prod === 'wait' ? 'wait' : 'now'][m.id] || m.eta_display : ''; }
  // בסיכומים (שלב 4/5) אין מועד להשוות אליו – בלי "(יום עסקים אחד מאוחר יותר)" (QA_COPY 3.15)
  function etaPlain(m, prod) { return eta(m, prod).replace(LATER, ''); }

  // באיסוף עצמי אין מעקב – השורה לא מוצגת בכלל (CLAUDE.md §3.4: שדה בלי ערך לא מוצג)
  function trk(m) {
    if (m.g === 'pickup') return null;
    if (m.id === 'registered_mail') return 'מעקב דואר';
    return m.tracking ? 'כן, שליח' : 'ללא מעקב';
  }
  function fmtPrice(x) { x = Math.round(x * 100) / 100; return Number.isInteger(x) ? String(x) : x.toFixed(2); }

  /* ---------- טקסט: escape + מספרים ב-LTR + [לאישור] ---------- */
  // P1-1: ספרות בלבד, ‎+972/972 → 0, ואז עד 10 ספרות (validation.js יכול לספק Validate.normalizeMobile משותף)
  function normMobile(v) {
    v = lat(v);
    if (window.Validate && typeof Validate.normalizeMobile === 'function') return Validate.normalizeMobile(v);
    var d = String(v || '').replace(/\D/g, '');
    if (/^00972/.test(d)) d = '0' + d.slice(5); else if (/^972/.test(d)) d = '0' + d.slice(3);
    return d.slice(0, 10);
  }
  // P3-11: מירכאות של המשתמש נשארות כמו שהוקלדו (&quot;, לא ״)
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  // escape לכל קטע בנפרד: רצפי ספרות נעטפים על הטקסט הגולמי, כך שישות (&#39; וכו') לא נשברת (P1-1)
  function numify(s) {
    return String(s).split(/(\d+(?:[.:,\/]\d+)*)/).map(function (part, i) {
      return i % 2 ? '<span class="num" dir="ltr">' + part + '</span>' : esc(part);
    }).join('');
  }
  // P3-3 (QA_VISUAL): "יום ג׳ 1.9" ו"ב-SMS" לא נשברים באמצע
  function keep(html) {
    return html.replace(/((?:ל|מ|ב)?יום [א-ו]׳ <span class="num" dir="ltr">[\d.]+<\/span>)/g, '<span class="nowrap">$1</span>')
      .replace(/ב-SMS/g, '<span class="nowrap">ב-SMS</span>');
  }
  function rich(s) {
    return keep(String(s == null ? '' : s).split(/(\[[^\]]*\])/).map(function (part) {
      if (/^\[.*\]$/.test(part)) return '<span class="tbc">' + esc(part) + '</span>';
      return numify(part);
    }).join(''));
  }
  /* ספרות ערביות-הודיות/פרסיות → 0–9 (P1-2). validation.js (Validate.toLatinDigits) כשקיים */
  function lat(s) {
    s = String(s == null ? '' : s);
    if (window.Validate && typeof Validate.toLatinDigits === 'function') return Validate.toLatinDigits(s);
    return s.replace(/[\u0660-\u0669\u06F0-\u06F9]/g, function (c) { var k = c.charCodeAt(0); return String(k >= 0x06F0 ? k - 0x06F0 : k - 0x0660); });
  }
  // תווים בלי רוחב / סימוני כיווניות – לא נחשבים תוכן (P3-12)
  function clean(s) { return String(s == null ? '' : s).replace(/[\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g, '').trim(); }

  /* ---------- State ----------
     ordered=true – ההזמנה הושלמה (status.js מציג ממנה את S2/S3). edit=true – עריכת הזמנה קיימת (?edit=1 מ-S2):
     הבחירות נשמרות, ואם השיטה לא השתנתה לא משלמים שוב (paidMethod).
     עריכה עובדת על טיוטה (P1-4): committed = ההזמנה ששולמה, כפי שהייתה לפני העריכה. status.js מציג את committed
     כל עוד edit=true; רק complete() מחליף אותה. paidTotal – כמה שולם בפועל (בעריכה משלמים רק את ההפרש, P2-5). */
  function fresh() {
    return {
      step: 1, method: null, auth: false, addr: 'moin', nudged: false,
      extras: { entrance: '', care_of: '', mailbox: '' },
      other: { city: '', street: '', house: '', entrance: '', apt: '', zip: '', care_of: '', phone: '', mailbox: '' },
      prod: 'now', terms: false, ordered: false, edit: false, paidMethod: null, paidTotal: null, committed: null,
      inv: '', mail: '' // P3-13: שם ומייל לחשבונית נשמרים כמו שאר הטיוטה (פרטי הכרטיס – לא)
    };
  }
  function merge(base, saved) {
    if (!saved || typeof saved !== 'object') return base;
    Object.keys(base).forEach(function (k) {
      if (!(k in saved)) return;
      if (base[k] && typeof base[k] === 'object') Object.keys(base[k]).forEach(function (j) { if (saved[k] && typeof saved[k][j] === 'string') base[k][j] = saved[k][j]; });
      else base[k] = saved[k];
    });
    return base;
  }
  var order, ui = { termsErr: false, why: false, paying: false, skipcc: false, methodErr: false, nudge: false };
  /* B-04: קישור הדגמה (פרמטרי מצב ב-URL, או שלב/שיטה שלא תואמים להזמנה השמורה) עובד על הזמנה בזיכרון בלבד –
     לא נשמר ל-fd.order ולא דורס את המסע האמיתי. מסע אמיתי: order.html בלי פרמטרים, ?reset=1, ?edit=1, ריענון של כתובת שהמסע עצמו כתב */
  var demoMode = false;
  function save() { if (!demoMode) UI.store.set(KEY, order); }
  // ההזמנה שאושרה (לפני עריכה): שדות שהטיוטה משנה
  var COMMIT_KEYS = ['method', 'auth', 'addr', 'extras', 'other', 'prod', 'terms', 'paidMethod', 'paidTotal'];
  function snapshot(o) {
    var c = {};
    COMMIT_KEYS.forEach(function (k) { c[k] = o[k] && typeof o[k] === 'object' ? JSON.parse(JSON.stringify(o[k])) : o[k]; });
    return c;
  }
  // יציאה מעריכה בלי להשלים: הטיוטה נמחקת וההזמנה חוזרת למה ששולם
  function discardDraft() {
    if (!order.edit || !order.committed) return;
    var c = order.committed;
    COMMIT_KEYS.forEach(function (k) { if (k in c) order[k] = c[k]; });
    order.edit = false; order.committed = null; order.step = 5;
    save();
  }

  function cur() { return method(order.method); }
  function needsAddr() { var m = cur(); return m ? m.needs_address : true; }
  function isFree() { var m = cur(); return m ? m.price === 0 : false; }
  // כמה כבר שולם על ההזמנה (בעריכה); הזמנה ישנה בלי paidTotal – מחיר paidMethod
  function paidAmount() {
    if (typeof order.paidTotal === 'number') return order.paidTotal;
    var pm = method(order.paidMethod);
    return pm ? pm.price : 0;
  }
  // לתשלום עכשיו: הזמנה חדשה – מחיר השיטה; עריכה – המחיר המלא בניכוי מה ששולם (כפי שמובטח ב-S2, [לאישור]); לא פחות מ-0
  function due() {
    var m = cur();
    if (!m) return 0;
    return order.edit ? Math.max(0, Math.round((m.price - paidAmount()) * 100) / 100) : m.price;
  }
  function credited() { return order.edit && paidAmount() > 0 && !!cur() && cur().id !== order.paidMethod; } // מציגים "כבר שילמתם"
  function noPay() { return isFree() || due() === 0; }
  function nextFrom(n) { if (n === 1) return needsAddr() ? 2 : 3; if (n === 3) return noPay() ? 5 : 4; return n + 1; }
  function prevFrom(n) { if (n === 3) return needsAddr() ? 2 : 1; if (n === 4) return 3; return Math.max(1, n - 1); }
  function clamp(n) {
    n = Math.min(5, Math.max(1, n || 1));
    if (n >= 2 && !cur()) order.method = 'express_home'; // שלב מתקדם בלי שיטה (קישור הדגמה) – ברירת מחדל כמו בעיצוב
    if (n === 2 && !needsAddr()) n = 3;
    if (n === 4 && noPay()) n = 3;
    return n;
  }
  function statusUrl() { return 'status.html?s=' + (order.prod === 'wait' ? 'S2' : 'S3'); }

  /* ---------- URL / history ---------- */
  function urlFor(step) {
    // במצב הדגמה ה-URL נשאר מסומן (demo=…), כך שרענון לא נטען כמסע האמיתי השמור
    var demo = demoMode ? '&demo=' + (ui.skipcc ? 'skipcc' : '1') + (order.auth ? '&auth=1' : '') + (order.edit ? '&edit=1' : '') : '';
    return window.location.pathname + '?step=' + step + (order.method ? '&m=' + encodeURIComponent(order.method) : '') + demo;
  }
  function writeUrl(push) {
    try {
      var st = { fdStep: order.step };
      if (push) history.pushState(st, '', urlFor(order.step)); else history.replaceState(st, '', urlFor(order.step));
    } catch (e) { /* file:// – מתעלמים */ }
  }

  function go(n, opt) {
    opt = opt || {};
    n = clamp(n);
    var prev = order.step;
    order.step = n;
    if (n === 5) complete();
    ui.termsErr = false;
    ui.methodErr = false;
    ui.nudge = false;
    save();
    writeUrl(!opt.replace);
    render();
    focusStep();
    stepMotion(prev, n);
    if (prev !== n) lockStep();
  }

  /* P1-3: אחרי מעבר שלב, כפתורי השלב החדש (באותו מקום בדיוק כמו "המשך" הקודם) מתעלמים מהקשות ל-450ms.
     .fd-lock = שכבה שקופה מעל אזור הכפתורים (pages.css) – ההקשה נבלעת ולא עוברת לתוכן שמתחת.
     B-01: הגלילה לראש השלב מביאה מתחת לאצבע גם תוכן אחר (למשל הכרטיס "עוד לא" בשלב 3) – לכן מאזין click ב-capture
     בולע בזמן הנעילה כל הקשה בתוך main שנוחתת באותה נקודה במסך כמו ההקשה שהעבירה שלב (הקשה כפולה), בכל מקום בשלב.
     הקשה מכוונת במקום אחר במסך עוברת כרגיל */
  var LOCK_MS = 450, lockT = null, lastClick = null, lockAt = null;
  function lockTargets() {
    var sec = qs('.order__step[data-step="' + order.step + '"]');
    return [qs('#order-top')].concat(sec ? qsa('.order-actions, .order-done', sec) : []).filter(Boolean);
  }
  document.addEventListener('click', function (e) {
    if (lockT && lockAt && e.detail > 0 && Math.abs(e.clientX - lockAt.x) < 32 && Math.abs(e.clientY - lockAt.y) < 32 &&
      e.target.closest && e.target.closest('#main')) { e.preventDefault(); e.stopPropagation(); return; }
    lastClick = e.detail > 0 ? { x: e.clientX, y: e.clientY, t: Date.now() } : null;
  }, true);
  function lockStep() {
    unlock();
    lockAt = lastClick && Date.now() - lastClick.t < 1000 ? lastClick : null;
    lockTargets().forEach(function (el) { el.classList.add('fd-lock'); });
    lockT = setTimeout(unlock, LOCK_MS);
  }
  function unlock() { clearTimeout(lockT); lockT = null; qsa('.fd-lock').forEach(function (el) { el.classList.remove('fd-lock'); }); }
  // רק הקשה/קליק (detail>0) נחסמים; Enter/רווח במקלדת אחרי מעבר פוקוס מכוון הם פעולה מכוונת
  function locked(e) { return !!lockT && !(e && e.detail === 0); }

  // מעבר שלב (רק בפעולת משתמש): השלב החדש נכנס בכיוון ההתקדמות (RTL: קדימה משמאל). השלב הישן מוסתר מיד, הפוקוס כבר ב-H1.
  // שלב 5: רצף ההצלחה (עיגול + ✓). בלי GSAP / ב-reduced-motion – אין תנועה
  function stepMotion(prev, n) {
    if (prev === n) return;
    var sec = qs('.order__step[data-step="' + n + '"]');
    if (n === 5) UI.motion.success(sec, qs('.order-done__circle', sec));
    else UI.motion.enter(sec, n > prev);
  }

  // ההזמנה הושלמה: מסך המצב יציג אותה (S2/S3); הנפקה חוזרת קודמת כבר לא רלוונטית
  function complete(keepReissue) {
    if (!order.ordered || order.edit) order.paidTotal = Math.round(((order.edit ? paidAmount() : 0) + due()) * 100) / 100;
    order.ordered = true;
    order.edit = false;
    order.committed = null; // העריכה הושלמה – היא ההזמנה עכשיו
    if (!isFree()) order.paidMethod = order.method;
    if (!keepReissue && !demoMode) UI.store.remove('fd.reissue');
  }

  function focusStep() {
    var main = document.getElementById('main');
    var h = qsa('h1', qs('.order__step[data-step="' + order.step + '"]')).filter(function (x) { return !x.hidden; })[0];
    try { window.scrollTo(0, Math.max(0, main.getBoundingClientRect().top + window.pageYOffset)); } catch (e) { /* */ }
    if (h) { try { h.focus({ preventScroll: true }); } catch (e) { h.focus(); } }
  }
  // P2-2: Back/Forward – הדפדפן לא משחזר גלילה ישנה (אמצע הרשימה) מעל הגלילה לראש השלב
  try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) { /* */ }

  /* ---------- Render ---------- */
  function render() {
    var s = order.step;
    qsa('.order__step').forEach(function (sec) { sec.hidden = Number(sec.getAttribute('data-step')) !== s; });
    qs('#order-steps').hidden = s === 5;
    renderDemo();
    renderTop();
    if (s < 5) renderStepper();
    if (s === 1) renderStep1();
    if (s === 2) renderStep2();
    if (s === 3) renderStep3();
    if (s === 4) renderStep4();
    if (s === 5) renderStep5();
    updateTitle();
  }

  /* כותרת הלשונית לפי השלב (F05, תבנית GOV.UK): "שלב N מתוך 4: <תווית> – …", "שגיאה: " כשמוצגת שגיאה */
  var BASE_TITLE = 'הזמנת משלוח או איסוף – רישיון עד הבית';
  function updateTitle() {
    if (!order) return;
    var t;
    if (order.step === 5) t = 'ההזמנה התקבלה – רישיון עד הבית';
    else {
      var n = Math.min(order.step, 4);
      var sec = qs('.order__step[data-step="' + order.step + '"]');
      var err = sec && qsa('.error', sec).some(function (e) { return !e.hidden && e.textContent.trim(); });
      t = (err ? 'שגיאה – ' : '') + 'שלב ' + n + ' מתוך 4: ' + STEP_NAMES[n - 1] + ' – ' + BASE_TITLE;
    }
    if (document.title !== t) document.title = t;
  }

  function renderDemo() {
    var items = ['P05 משלוח', 'P06 כתובת', 'P07 ייצור', 'P08 תשלום', 'P09 אישור'].map(function (t, i) {
      return { label: t, pressed: order.step === i + 1, onClick: function () { demoGo(i + 1); } };
    });
    items.push({ label: 'מורשים לשנות כתובת (הצטלמו מחדש)', pressed: order.auth, onClick: function () {
      order.auth = !order.auth; save(); render();
      var b = qs('[data-slot="demo-bar"] [data-demo-i="5"]'); if (b) b.focus();
    } });
    Layout.demoBar({ items: items });
  }
  function demoGo(n) {
    // קפיצת הדגמה: מוודאים שהשלב קיים לשיטה הנוכחית
    if (n >= 2 && !cur()) order.method = 'express_home';
    if ((n === 2 && !needsAddr()) || (n === 4 && isFree())) order.method = 'express_home';
    if (n < 5) order.ordered = false;
    go(n);
  }

  function renderStepper() {
    var m = cur();
    var skipped = [false, !!m && !m.needs_address, false, !!m && noPay()];
    var html = STEP_NAMES.map(function (name, i) {
      var n = i + 1, isCur = order.step === n, done = order.step > n && !skipped[i];
      var cls = 'stepper__item' + (done ? ' stepper__item--done' : isCur ? ' stepper__item--current' : '') + (skipped[i] ? ' stepper__item--skipped' : '');
      var mark = done ? UI.icon('check', { size: 16 }) : skipped[i] ? '–' : String(n);
      var sr = done ? ' (הושלם)' : isCur ? ' (שלב נוכחי)' : '';
      return '<li class="' + cls + '"' + (isCur ? ' aria-current="step"' : '') + '><span class="stepper__num" aria-hidden="true">' + mark + '</span>' +
        '<span class="stepper__label">' + name + (skipped[i] ? '<span class="stepper__note"> (לא נדרש)</span>' : '') + (sr ? '<span class="sr-only">' + sr + '</span>' : '') + '</span>' +
        (n < 4 ? '<span class="stepper__sep" aria-hidden="true"></span>' : '') + '</li>';
    }).join('');
    qs('#stepper').innerHTML = html;
    var num = Math.min(order.step, 4);
    qs('#stepper-m-text').textContent = 'שלב ' + num + ' מתוך 4: ' + STEP_NAMES[num - 1];
    var bar = qs('#stepper-m-bar');
    bar.setAttribute('aria-valuenow', String(num));
    bar.setAttribute('aria-valuetext', 'שלב ' + num + ' מתוך 4: ' + STEP_NAMES[num - 1]);
    bar.firstElementChild.style.width = (num * 25) + '%';
  }

  /* --- "› חזרה" בראש העמוד (מובייל; בדסקטופ בסרגל הפעולות) --- */
  function backStatusUrl() { return order.edit || order.ordered ? 'status.html?s=S2' : 'status.html?s=S1'; }
  function renderTop() {
    var el = qs('#order-top');
    if (!el) return;
    var chev = UI.icon('chevron-back-rtl', { size: 18 });
    if (order.step === 5) { el.innerHTML = ''; el.hidden = true; return; }
    el.hidden = false;
    el.innerHTML = order.step === 1
      ? '<a class="back-link" href="' + backStatusUrl() + '">' + chev + 'חזרה לפרטי הבקשה</a>'
      : '<button type="button" class="link-btn back-link" data-back-top>' + chev + 'חזרה</button>';
  }

  /* --- שלב 1 --- */
  function check(t) { return '<span class="order-m__b">' + UI.icon('check', { size: 16 }) + esc(t) + '</span>'; }
  function methodCard(m) {
    var on = order.method === m.id;
    var tags = (m.tags || []).filter(function (t) { return !(t === 'ללא עלות' && m.price === 0); })
      .map(function (t) { return '<span class="tag ' + (TAG_CLS[t] || 'tag--notrack') + '">' + esc(t) + '</span>'; }).join('');
    var ben = (m.benefits || []).length ? m.benefits.map(check).join('') : (CAVEAT[m.id] ? '<span class="order-m__plain">' + esc(CAVEAT[m.id]) + '</span>' : '');
    return '<div class="opt-card-wrap order-m-wrap" data-m="' + m.id + '">' +
      '<label class="opt-card order-m' + (on ? ' is-selected' : '') + '">' +
      '<input type="radio" name="method" value="' + m.id + '"' + (on ? ' checked' : '') + '>' +
      '<span class="ibox ibox--44 order-opt__ibox order-m__ibox">' + UI.icon(ICON[m.id] || 'truck') + '</span>' +
      '<strong class="order-opt__name order-m__name">' + esc(m.name) + '</strong>' +
      '<span class="order-opt__price order-m__price' + (m.price === 0 ? ' price-free' : '') + '">' + rich(m.price_display) + '</span>' +
      '<span class="order-m__eta"><span class="order-opt__eta">' + rich(eta(m, 'now')) + '</span>' + tags + '</span>' +
      (ben ? '<span class="order-m__ben">' + ben + '</span>' : '') +
      '<span class="small muted order-m__fit">' + esc(m.fit) + '</span>' +
      '</label>' +
      '<button type="button" class="icon-btn icon-btn--ghost opt-card__q order-opt__q" data-info="' + m.id + '" aria-label="פרטים נוספים על ' + esc(m.name) + '">' + UI.icon('help-circle') + '</button>' +
      '</div>';
  }
  function renderStep1() {
    qsa('[data-back-status]').forEach(function (a) { a.setAttribute('href', backStatusUrl()); });
    qs('#moin-short').textContent = moin.display;
    qs('#method-list').innerHTML = GROUPS.map(function (g) {
      return '<div class="order-grp" role="group" aria-labelledby="grp-' + g.key + '" id="grp-box-' + g.key + '">' +
        '<h2 class="order-grp__t" id="grp-' + g.key + '">' + g.t + '</h2>' +
        '<div class="order-opts">' + g.ids.map(method).filter(Boolean).map(methodCard).join('') + '</div></div>';
    }).join('');
    renderExtras();
    renderChosen();
    renderMethodErr();
  }
  // עריכה עם שיטה אחרת: "כבר שילמתם X · לתשלום עכשיו Y" (P2-5; הכלל עצמו [לאישור], כמו ב-S2)
  function creditHTML() {
    function amt(x) { return '<span class="nowrap"><span class="num" dir="ltr">' + fmtPrice(x) + '</span> ₪</span>'; }
    return 'כבר שילמתם ' + amt(paidAmount()) + ' · ' + (due() > 0 ? 'לתשלום עכשיו ' + amt(due()) : 'אין תשלום נוסף') + ' <span class="tbc">[לאישור]</span>';
  }
  function renderChosen() {
    var m = cur(), el = qs('#chosen-line');
    if (!el) return;
    var html = m ? 'בחרתם: <strong>' + esc(m.name) + '</strong> · ' + rich(m.price_display) + (credited() ? '<span class="order-actions__credit">' + creditHTML() + '</span>' : '') : 'עוד לא בחרתם';
    el.classList.toggle('order-actions__chosen--credit', !!(m && credited()));
    if (el.innerHTML === html) return;
    el.innerHTML = html;
    if (chosenReady) UI.motion.refresh(el); // שינוי בחירה: fade קצר בסרגל הדביק (המחיר מתחלף, לא נספר)
    chosenReady = true;
  }
  var chosenReady = false;
  function renderMethodErr() {
    var e = qs('#method-err');
    e.hidden = !ui.methodErr;
    e.innerHTML = ui.methodErr ? UI.icon('alert-circle', { size: 18 }) + 'בחרו איך תרצו לקבל את הרישיון.' : '';
    qs('#method-list').setAttribute('aria-invalid', ui.methodErr ? 'true' : 'false');
    updateTitle();
  }
  // תוספות מתחת לכרטיס הנבחר: שורת בארי, וקופסת "לפני שממשיכים" לדואר רגיל (פעם אחת, לא חוסמת)
  function renderExtras() {
    qsa('.order-m-extra').forEach(function (x) { x.remove(); });
    var m = cur();
    if (!m) return;
    var wrap = qs('.order-m-wrap[data-m="' + m.id + '"]');
    if (!wrap) return;
    var ex = method('express_home'), reg = method('registered_mail'), rh = method('regular_home');
    var html = '';
    if (m.id === 'pickup_bari' && ex) {
      html = '<div class="order-m-extra order-m-extra--note"><p>האיסוף בדפוס בארי, <span class="tbc">[כתובת ושעות לאישור]</span>. ' +
        'לא בטוחים שתגיעו? משלוח מהיר עד הבית יגיע באותו יום – ' + rich(ex.price_display) + '. ' +
        '<button type="button" class="link-btn" data-pick="express_home" aria-label="להחליף למשלוח מהיר עד הבית">להחליף</button></p></div>';
    } else if (m.id === 'regular_mail' && ui.nudge) {
      html = '<div class="order-m-extra callout callout--warning order-nudge" id="mail-nudge">' + UI.icon('info') +
        '<div class="order-nudge__body"><p><strong>לפני שממשיכים:</strong> בדואר רגיל אין מעקב, והרישיון נמסר לתיבה רק אם מופיע עליה שם מזהה. אם הוא לא יגיע, אפשר לבקש הנפקה חוזרת רק אחרי <span class="num" dir="ltr">19</span> ימי עסקים.</p>' +
        '<div class="order-nudge__btns">' +
        (reg ? '<button type="button" class="btn btn--secondary btn--sm" data-pick="registered_mail"><span>דואר רשום עם מעקב – ' + rich(reg.price_display) + '</span></button>' : '') +
        (rh ? '<button type="button" class="btn btn--secondary btn--sm" data-pick="regular_home"><span>שליח עד הבית – ' + rich(rh.price_display) + '</span></button>' : '') +
        '</div><button type="button" class="link-btn" id="nudge-go">להמשיך עם דואר רגיל</button></div></div>';
    }
    if (html) {
      wrap.insertAdjacentHTML('afterend', html);
      // ההערה נפתחת מתחת לכרטיס – לוודא שהיא לא מתחת לסרגל הדביק (בלי להזיז פוקוס מקבוצת הרדיו)
      var exEl = wrap.nextElementSibling; if (exEl && renderExtras.user) UI.ensureVisible(exEl, { anchor: wrap, minVisible: exEl.offsetHeight });
    }
    var live = qs('#method-live');
    if (live) live.textContent = m.id === 'regular_mail' && ui.nudge ? 'לפני שממשיכים: בדואר רגיל אין מעקב. אפשר לבחור דואר רשום או שליח, או להמשיך עם דואר רגיל.' : '';
  }
  // nav=true – הבחירה הגיעה מדפדוף בחיצים (P2-7): בלי גלילה ובלי "לפני שממשיכים" (היא תוצג ב"המשך")
  function selectMethod(id, focus, nav) {
    order.method = id;
    if (id === 'regular_mail' && !order.nudged && !nav) { ui.nudge = true; order.nudged = true; } else if (id !== 'regular_mail') ui.nudge = false;
    ui.methodErr = false;
    save(); writeUrl(false);
    qsa('#method-list .opt-card').forEach(function (l) { var r = l.querySelector('input'); r.checked = r.value === id; l.classList.toggle('is-selected', r.checked); });
    renderExtras.user = !nav; renderExtras(); renderExtras.user = false; renderChosen(); renderMethodErr(); renderStepper();
    if (focus) { var r = qs('#method-list input[value="' + id + '"]'); if (r) UI.focus(r); }
  }
  function next1(e) {
    if (locked(e)) return;
    // דואר רגיל שנבחר בחיצים: "לפני שממשיכים" מוצגת עכשיו (פעם אחת), לפני המעבר לשלב הבא
    if (cur() && cur().id === 'regular_mail' && !order.nudged) {
      ui.nudge = true; order.nudged = true; save();
      renderExtras.user = true; renderExtras(); renderExtras.user = false;
      var nd = qs('#mail-nudge');
      if (nd) UI.focusInto(nd, { target: nd, anchor: nd.previousElementSibling || nd });
      return;
    }
    if (!cur()) {
      ui.methodErr = true; renderMethodErr();
      var first = qs('#method-list input[name="method"]');
      try { qs('#method-err').scrollIntoView({ block: 'center', behavior: 'auto' }); } catch (e) { /* */ }
      if (first) { try { first.focus({ preventScroll: true }); } catch (e) { first.focus(); } }
      return;
    }
    go(nextFrom(1));
  }

  /* --- שלב 2 --- */
  function renderStep2() {
    var sec = qs('.order__step[data-step="2"]');
    qsa('[data-auth]', sec).forEach(function (el) { el.hidden = (el.getAttribute('data-auth') === '1') !== !!order.auth; });
    sec.setAttribute('aria-labelledby', order.auth ? 'h-step2a' : 'h-step2');
    qsa('input[name="addr"]', sec).forEach(function (r) { r.checked = r.value === order.addr; r.closest('.opt-card').classList.toggle('is-selected', r.checked); });
    var other = order.auth && order.addr === 'other';
    qs('#other-form').hidden = !other;
    qs('#extras-form').hidden = other;
    qsa('[data-other]', sec).forEach(function (i) { i.value = order.other[i.getAttribute('data-other')] || ''; });
    qsa('[data-extra]', sec).forEach(function (i) { i.value = order.extras[i.getAttribute('data-extra')] || ''; });
  }
  /* [id, שם לשגיאת "יש למלא", בדיקת ערך (מחזירה הודעה כשהערך מלא אבל לא תקין)] – ההודעה מתאימה לכלל שנכשל (P3-2) */
  var OTHER_REQ = [
    ['o-city', 'עיר'], ['o-st', 'רחוב'],
    // מספר בית יכול לכלול אות ("12א") – חייב רק להכיל ספרה (M-05)
    ['o-h', 'מספר בית', function (v) { return /\d/.test(lat(v)) ? '' : 'מספר הבית צריך לכלול ספרה.'; }],
    ['o-z', 'מיקוד', function (v) { return /^\d{7}$/.test(lat(v)) ? '' : 'המיקוד צריך לכלול {7} ספרות.'; }]
  ];
  function validateOther() {
    var first = null;
    splitHouse();
    OTHER_REQ.forEach(function (r) {
      var el = document.getElementById(r[0]);
      var v = clean(el.value);
      var msg = !v ? 'יש למלא ' + r[1] + '.' : r[2] ? r[2](v) : '';
      fieldErr(el, msg || null);
      if (msg) first = first || el;
    });
    var ph = document.getElementById('o-p');
    if (!Validate.mobile(lat(ph.value))) { fieldErr(ph, clean(ph.value) ? 'מספר הנייד צריך להתחיל ב-{05} ולהכיל {10} ספרות.' : 'יש למלא נייד של המקבל.'); first = first || ph; } else UI.fieldError(ph, null);
    if (first) focusField(first);
    updateTitle();
    return !first;
  }

  // P3-10: מילוי אוטומטי של address-line1 ("הרצל 12") ממלא רק את שדה הרחוב – מספר הבית עובר לשדה שלו
  function splitHouse() {
    var st = document.getElementById('o-st'), h = document.getElementById('o-h');
    if (!st || !h || clean(h.value)) return;
    var mm = /^(.*\D)\s+(\d+\s*[א-ת]?)$/.exec(clean(lat(st.value)));
    if (!mm) return;
    st.value = mm[1].trim(); h.value = mm[2].replace(/\s+/g, '');
    order.other.street = st.value; order.other.house = h.value; save();
  }

  /* --- שלב 3 --- */
  function renderStep3() {
    var m = cur();
    qsa('input[name="prod"]').forEach(function (r) { r.checked = r.value === order.prod; r.closest('.opt-card').classList.toggle('is-selected', r.checked); });
    qs('#eta-now').innerHTML = rich(eta(m, 'now'));
    qs('#eta-wait').innerHTML = rich(eta(m, 'wait'));
    var t = qs('#terms');
    t.checked = !!order.terms;
    UI.fieldError(t, ui.termsErr ? 'כדי להמשיך יש לאשר את תנאי השימוש.' : null);
    // "המשך לתשלום" עם חץ קדימה כמו בשלבים 1–2; "אישור ההזמנה" (פעולה מחייבת) – בלי חץ (L-09)
    qs('#next-3-t').textContent = noPay() ? 'אישור ההזמנה' : 'המשך לתשלום';
    qs('#next-3-ico').style.display = noPay() ? 'none' : '';
  }

  /* --- שלב 4 --- */
  /* P2-8: הסיכום מציג את כל מה שהוזן (כמו פרטי הבקשה במסך המצב): כניסה, דירה, מיקוד, אצל, תיבת דואר.
     P3-9: "רחוב" נוסף רק כשהמשתמש לא כתב סוג דרך בעצמו ("שדרות רוטשילד", "רחוב הרצל") */
  var ROAD = /^(רחוב|רח['׳]|שדרות|שד['׳]|דרך|סמטת|סמ['׳]|כיכר|ככר|שכונת|שכ['׳]|מעלה|נתיב|שביל|כביש|טיילת|גבעת|קריית|קרית)(\s|$)/;
  function streetLine(st) { st = clean(st); return st && !ROAD.test(st) ? 'רחוב ' + st : st; }
  function extrasTail(x) {
    var t = [];
    if (x.care_of && clean(x.care_of)) t.push('אצל ' + rich(clean(x.care_of)));
    if (x.mailbox && clean(x.mailbox)) t.push('על תיבת הדואר: ' + rich(clean(x.mailbox)));
    return t.length ? ' · ' + t.join(' · ') : '';
  }
  function addrSummary() {
    var m = cur();
    if (m && !m.needs_address) return { k: 'עמדת איסוף', v: rich(m.address || '') };
    if (order.auth && order.addr === 'other') {
      var o = order.other;
      if (!clean(o.street)) return { k: 'כתובת למשלוח', v: rich('כתובת אחרת שהוזנה') };
      var line = [streetLine(o.street) + (clean(o.house) ? ' ' + clean(o.house) : '')];
      if (clean(o.entrance)) line.push('כניסה ' + clean(o.entrance));
      if (clean(o.apt)) line.push('דירה ' + clean(o.apt));
      if (clean(o.city) || clean(o.zip)) line.push((clean(o.city) + ' ' + clean(o.zip)).trim());
      return { k: 'כתובת למשלוח', v: rich(line.join(', ')) + extrasTail(o) };
    }
    var x = order.extras || {};
    return { k: 'כתובת למשלוח', v: rich(moin.display) + (clean(x.entrance) ? ' · כניסה ' + rich(clean(x.entrance)) : '') + extrasTail(x) };
  }
  function renderStep4() {
    var m = cur();
    var pn = m ? fmtPrice(due()) : '';
    var cr = !!m && credited();
    qs('#sum-paid-row').hidden = !cr;
    if (cr) qs('#sum-paid').innerHTML = '<span class="num" dir="ltr">' + fmtPrice(paidAmount()) + '</span> ₪ <span class="tbc">[לאישור]</span>';
    qs('#sum-price-row').hidden = !cr;
    if (cr) qs('#sum-price').innerHTML = rich(m.price_display);
    qs('#sum-total-k').textContent = cr ? 'לתשלום עכשיו' : 'סה״כ לתשלום';
    qs('#sum-total-s').textContent = cr ? 'לתשלום עכשיו: ' : 'סה״כ לתשלום: ';
    qsa('[data-price-num]').forEach(function (e) { e.textContent = pn; });
    qs('#sum-method').textContent = m ? m.name : '';
    var a = addrSummary();
    qs('#sum-addr-k').textContent = a.k;
    qs('#sum-addr').innerHTML = a.v;
    qs('#sum-addr-chg').hidden = !(m && m.needs_address);
    qs('#sum-prod').innerHTML = order.prod === 'now' ? 'עכשיו – ייצור <span class="nowrap">יום ג׳ <span class="num" dir="ltr">25.8</span></span>' : 'אחרי המועד – ייצור <span class="nowrap">יום ד׳ <span class="num" dir="ltr">26.8</span></span>';
    qs('#sum-incl').innerHTML = m ? rich((INCL[m.id] ? INCL[m.id] + ' · ' : '') + etaPlain(m, order.prod)) : '';
    var inv = qs('#inv'), mail = qs('#mail');
    if (inv && !inv.value) inv.value = order.inv || (D.citizen ? ((D.citizen.first_name || '') + ' ' + (D.citizen.last_name || '')).trim() : ''); // ממולא מראש, אפשר לשנות
    if (mail && !mail.value && order.mail) mail.value = order.mail;
    qs('#order-sum').open = true; // פתוח כברירת מחדל (כמו בהדמיות 33 בשני הרוחבים); אפשר לקפל
    var pay = qs('#pay');
    if (!ui.paying) { pay.disabled = false; pay.setAttribute('aria-busy', 'false'); pay.removeAttribute('aria-disabled'); }
  }
  /* בדיקות כרטיס. validation.js (A) מוסיף Validate.luhn / cardExpiry→{ok,reason} / email – משתמשים בהם כשקיימים */
  function digitsOf(v) { return lat(v).replace(/\D/g, ''); }
  function luhn(d) {
    if (window.Validate && typeof Validate.luhn === 'function') return Validate.luhn(d);
    var sum = 0, alt = false;
    for (var i = d.length - 1; i >= 0; i--) { var x = Number(d.charAt(i)); if (alt) { x *= 2; if (x > 9) x -= 9; } sum += x; alt = !alt; }
    return sum % 10 === 0;
  }
  function isAmex(v) { return /^3[47]/.test(digitsOf(v)); }
  function expCheck(v) { // {ok, reason: 'format'|'past'}; החודש הנוכחי תקין, עד 20 שנה קדימה (fallback כש-validation.js ישן)
    v = clean(lat(v));
    if (window.Validate && typeof Validate.cardExpiry === 'function') { var r = Validate.cardExpiry(v); if (r && typeof r === 'object') return r; }
    var mm = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(v);
    if (!mm) return { ok: false, reason: 'format' };
    var nm = /^(\d{4})-(\d{2})/.exec(String(D.now || '')); // "היום" של האב-טיפוס (כמו validation.js), לא שעון המכשיר
    var now = nm ? new Date(Number(nm[1]), Number(nm[2]) - 1, 1) : new Date(2026, 7, 25), y = 2000 + Number(mm[2]), mo = Number(mm[1]);
    var nowY = now.getFullYear(), nowM = now.getMonth() + 1;
    if (y < nowY || (y === nowY && mo < nowM)) return { ok: false, reason: 'past' };
    if (y > nowY + 20) return { ok: false, reason: 'format' };
    return { ok: true };
  }
  function emailOk(v) {
    if (window.Validate && typeof Validate.email === 'function') return Validate.email(v);
    return /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[^\s@<>()",;:.]{2,}$/.test(v);
  }
  /* [id, בדיקה (מחזירה '' כשתקין או את ההודעה), הודעה לשדה ריק (null = לא חובה)].
     P3-2: שדה ריק מקבל "יש למלא…"; ההודעה לערך מלא מתאימה לכלל שנכשל. {…} = מספר/טקסט LTR שלא נשבר */
  var CC = [
    ['cc', function (v) {
      var d = digitsOf(v);
      if (d.length < 12 || d.length > 19) return 'מספר הכרטיס לא תקין. בדקו שהזנתם {12–19} ספרות.';
      return /^0+$/.test(d) || !luhn(d) ? 'מספר הכרטיס לא תקין. בדקו שהספרות הוקלדו כמו שהן מופיעות על הכרטיס.' : '';
    }, 'יש למלא מספר כרטיס.'],
    ['exp', function (v) {
      var r = expCheck(v);
      return r.ok ? '' : r.reason === 'past' ? 'תוקף הכרטיס עבר. בדקו את התוקף שמופיע על הכרטיס.' : 'תוקף לא תקין. הזינו חודש ושנה, למשל {08/28}.';
    }, 'יש למלא תוקף.'],
    ['cvv', function (v) {
      var d = digitsOf(v), need = isAmex(qs('#cc').value) ? 4 : 3;
      return d.length === need && d === clean(lat(v)) ? '' : 'קוד CVV לא תקין. הזינו {' + need + '} ספרות.';
    }, 'יש למלא קוד CVV.'],
    ['hid', function (v) { return Validate.israeliId(lat(v)) ? '' : 'מספר תעודת הזהות לא תקין. בדקו את כל הספרות, כולל הספרה האחרונה (ספרת הביקורת).'; }, 'יש למלא ת״ז של בעל הכרטיס.'],
    ['inv', function (v) { return /[A-Za-z\u0590-\u05FF\u0600-\u06FF]/.test(v) ? '' : 'השם לחשבונית צריך לכלול אותיות.'; }, 'יש למלא שם לחשבונית.'],
    ['mail', function (v) { return emailOk(v) ? '' : 'כתובת המייל לא תקינה. בדקו שהיא כתובה כמו {name@example.com}.'; }, null]
  ];
  // UI.fieldError מציג טקסט; {…} הופך אחר כך ל-<span class="num" dir="ltr">
  function fieldErr(el, msg) {
    UI.fieldError(el, msg ? msg.replace(/[{}]/g, '') : null);
    if (!msg || msg.indexOf('{') < 0) return;
    var sp = qs('#' + el.id + '-err span');
    if (sp) sp.innerHTML = esc(msg).replace(/\{([^}]*)\}/g, '<span class="num" dir="ltr">$1</span>');
  }
  // שגיאה: פוקוס לשדה, והתווית שמעליו גלויה (לא חצי מחוץ למסך)
  function focusField(el) {
    try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); }
    var f = el.closest('.field') || el;
    UI.ensureVisible(f, { minVisible: f.getBoundingClientRect().height || 80 });
  }
  function validateCC() {
    var first = null;
    CC.forEach(function (c) {
      var el = document.getElementById(c[0]);
      if (c[0] === 'mail' && el.value !== el.value.trim()) el.value = el.value.trim(); // רווחים בקצוות יורדים
      var v = clean(el.value);
      var msg = !v ? c[2] : c[1](v);
      if (msg) { fieldErr(el, msg); first = first || el; } else UI.fieldError(el, null);
    });
    if (first) focusField(first);
    updateTitle();
    return !first;
  }
  function pay() {
    if (ui.paying) return;
    if (!ui.skipcc && !validateCC()) return;
    ui.paying = true;
    var btn = qs('#pay');
    var had = document.activeElement === btn;
    UI.setBusy(btn, true, 'מעבדים את התשלום…');
    // P3-4: כפתור מושבת מאבד פוקוס (BODY). חוסמים דרך ui.paying + aria-disabled, והפוקוס נשאר על הכפתור
    if (btn.disabled) { btn.disabled = false; btn.setAttribute('aria-disabled', 'true'); }
    if (had && document.activeElement !== btn) { try { btn.focus({ preventScroll: true }); } catch (e) { /* */ } }
    setTimeout(function () {
      ui.paying = false;
      UI.setBusy(btn, false);
      btn.removeAttribute('aria-disabled');
      if (order.step === 4) go(5, { replace: true });
    }, 1400);
  }

  /* --- שלב 5 --- */
  function renderStep5() {
    var m = cur();
    var a = addrSummary();
    var paid = isFree() && !(order.paidTotal > 0) ? 'ללא עלות' : typeof order.paidTotal === 'number' ? '<span class="num" dir="ltr">' + fmtPrice(order.paidTotal) + '</span> ₪'
      : (order.paidMethod && method(order.paidMethod) ? rich(method(order.paidMethod).price_display) : (m ? rich(m.price_display) : ''));
    var rows = [['שיטת מסירה', m ? esc(m.name) : ''], [a.k, a.v], ['שולם', paid],
      [m && !m.needs_address ? 'אפשר לאסוף' : 'יגיע', rich(etaPlain(m, order.prod).replace(/^(יגיע |אפשר לאסוף )/, ''))]];
    qs('#done-dl').innerHTML = rows.filter(function (r) { return r[1]; }).map(function (r) { return '<div><dt>' + r[0] + '</dt><dd>' + r[1] + '</dd></div>'; }).join('');
    var next;
    if (m && m.id === 'regular_mail') next = esc('ודאו שעל תיבת הדואר מופיע שם משפחה. הרישיון נמסר לתיבה רק אם מופיע עליה שם מזהה.');
    else if (m && m.tracking) next = esc('כשהרישיון ייצא לדרך, נשלח לכם SMS עם קישור למעקב.'); // 1.4: "נשלח" בעתיד, לא כעבר
    else if (m && m.g === 'pickup') next = esc('מה להביא לאיסוף: תעודה מזהה ומספר ההזמנה.') + ' <span class="tbc">[לאישור: האם מספר ההזמנה נדרש]</span>'; // 2.4 – אותו נוסח כמו S5
    else next = esc('נעדכן אתכם ב-SMS כשהרישיון ייצא לדרך.');
    qs('#done-next').innerHTML = keep(next);
    qs('#done-status').setAttribute('href', statusUrl());
    if (D.order_example) qs('#order-number').textContent = D.order_example.order_number;
  }

  /* ---------- Drawers ---------- */
  function openMethodDrawer(id, btn) {
    var m = method(id);
    if (!m) return;
    qs('#dr-method-t').textContent = m.name;
    var rows = [['זמן אספקה', m.eta_rule], ['מחיר', m.price_display], ['מעקב', trk(m)], ['איך מקבלים', HOW[m.id]], ['אם לא הגיע', IF_NOT[m.id]], ['למי זה מתאים', m.fit]];
    if (m.g === 'pickup') rows.push(['כתובת', m.address], ['שעות', m.hours]);
    qs('#dr-method-dl').innerHTML = rows.filter(function (r) { return r[1]; }).map(function (r) {
      return '<div><dt>' + esc(r[0]) + '</dt><dd>' + rich(r[1]) + '</dd></div>';
    }).join('');
    // "לבחור ב…" – כמו "לבחור" במגירת ההשוואה: סוגר, בוחר ומעביר פוקוס לרדיו (L-08). המגירה נפתחת רק בשלב 1
    var pick = qs('#dr-method-pick');
    pick.textContent = 'לבחור ב' + m.name;
    pick.setAttribute('data-pick-id', m.id);
    pick.hidden = order.step !== 1;
    UI.drawer.open('dr-method', { returnFocus: btn || document.activeElement });
  }
  function fillCompare() {
    qs('#compare-body').innerHTML = METHODS.map(function (m) {
      return '<tr><th scope="row">' + esc(m.name) + '</th><td data-th="מתי אצלכם">' + rich(eta(m, 'now')) + '</td><td data-th="איך מקבלים">' + esc(HOW[m.id] || '') + '</td>' +
        '<td data-th="אם לא הגיע">' + rich(IF_NOT[m.id] || '') + '</td><td data-th="מחיר" class="order-tbl__price">' + rich(m.price_display) + '</td>' +
        '<td class="order-tbl__pick"><button type="button" class="btn btn--secondary btn--sm" data-pick-cmp="' + m.id + '">לבחור<span class="sr-only"> ' + esc(m.name) + '</span></button></td></tr>';
    }).join('');
  }

  /* ---------- Events ---------- */
  function bind() {
    // שלב 1
    var list = qs('#method-list');
    var navKey = false; // שינוי מחיצים (דפדוף) ולא מהקשה/רווח (בחירה מפורשת)
    list.addEventListener('keydown', function (e) { navKey = /^Arrow/.test(e.key); });
    list.addEventListener('pointerdown', function () { navKey = false; });
    list.addEventListener('change', function (e) {
      if (e.target.name !== 'method') return;
      selectMethod(e.target.value, false, navKey);
      navKey = false;
    });
    list.addEventListener('click', function (e) {
      var q = e.target.closest('[data-info]');
      if (q) { openMethodDrawer(q.getAttribute('data-info'), q); return; }
      var pk = e.target.closest('[data-pick]');
      if (pk) { ui.nudge = false; selectMethod(pk.getAttribute('data-pick'), true); return; }
      if (e.target.closest('#nudge-go')) { if (locked(e)) return; ui.nudge = false; go(nextFrom(1)); }
    });
    qs('#open-compare').addEventListener('click', function (e) { UI.drawer.open('dr-compare', { returnFocus: e.currentTarget }); });
    qs('#compare-body').addEventListener('click', function (e) {
      var b = e.target.closest('[data-pick-cmp]');
      if (!b) return;
      UI.drawer.close();
      if (order.step !== 1) return;
      selectMethod(b.getAttribute('data-pick-cmp'), true);
    });
    qs('#dr-method-pick').addEventListener('click', function (e) {
      var id = e.currentTarget.getAttribute('data-pick-id');
      UI.drawer.close();
      if (order.step === 1 && method(id)) selectMethod(id, true);
    });
    qs('#next-1').addEventListener('click', next1);
    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-back-top]')) { if (!locked(e)) go(prevFrom(order.step)); return; }
      // "חזרה לפרטי הבקשה" בעריכה: הטיוטה נמחקת, ההזמנה ששולמה לא משתנה (P1-4)
      if (e.target.closest('[data-back-status], #order-top a.back-link')) {
        if (locked(e)) { e.preventDefault(); return; }
        discardDraft();
      }
    });

    // שלב 2
    qsa('input[name="addr"]').forEach(function (r) {
      r.addEventListener('change', function () { order.addr = r.value; save(); renderStep2(); var f = qs(order.addr === 'other' ? '#other-form' : '#extras-form'); if (f && !f.hidden) UI.ensureVisible(f, { anchor: r.closest('.opt-card'), minVisible: 120 }); });
    });
    qsa('[data-other]').forEach(function (i) {
      i.addEventListener('input', function (e) {
        if (i.id === 'o-p') {
          // P1-1: 052-123-4567 / ‎+972… בלי לאבד ספרה. P3-6: הדבקה של יותר מ-10 ספרות לא נחתכת בשקט – נשארת ומקבלת שגיאה
          var raw = lat(i.value).replace(/\D/g, '');
          var v = e && e.inputType === 'insertFromPaste' && raw.length > 10 && !/^(00)?972/.test(raw) ? raw : normMobile(i.value);
          if (v !== i.value) i.value = v;
        }
        if (i.id === 'o-z') { var d = lat(i.value).replace(/\D/g, ''); if (d !== i.value) i.value = d; } // מספר בית/דירה: גם "12א" (M-05)
        if (i.id === 'o-h' || i.id === 'o-a' || i.id === 'o-e') { var l = lat(i.value); if (l !== i.value) i.value = l; }
        order.other[i.getAttribute('data-other')] = i.value; save();
        if (i.getAttribute('aria-invalid') === 'true') UI.fieldError(i, null);
      });
    });
    qsa('[data-extra]').forEach(function (i) {
      i.addEventListener('input', function () { order.extras[i.getAttribute('data-extra')] = i.value; save(); });
    });
    var stEl = qs('#o-st'); if (stEl) stEl.addEventListener('change', splitHouse);
    qs('#to-pickup').addEventListener('click', function (e) {
      if (locked(e)) return;
      go(1);
      var g = qs('#grp-box-pickup');
      if (g) { try { g.scrollIntoView({ block: 'start' }); } catch (e) { /* */ } var gh = qs('#grp-pickup'); if (gh) { gh.setAttribute('tabindex', '-1'); try { gh.focus({ preventScroll: true }); } catch (e) { /* */ } } }
    });
    qsa('.order-sum__chg').forEach(function (b) { b.addEventListener('click', function () { go(Number(b.getAttribute('data-goto'))); }); });
    // שלב 2 בתוך <form> (P3-3): Enter בשדה הכתובת = "המשך"
    qs('#addr-form').addEventListener('submit', function (e) {
      e.preventDefault();
      if (order.auth && order.addr === 'other' && !validateOther()) return;
      go(3);
    });

    // שלב 3
    qsa('input[name="prod"]').forEach(function (r) {
      r.addEventListener('change', function () { order.prod = r.value; save(); renderStep3(); });
    });
    var terms = qs('#terms');
    terms.addEventListener('change', function () { order.terms = terms.checked; ui.termsErr = false; save(); UI.fieldError(terms, null); });
    qs('#open-terms').addEventListener('click', function (e) { e.preventDefault(); UI.drawer.open('dr-terms', { returnFocus: e.currentTarget }); });
    qs('#next-3').addEventListener('click', function (e) {
      if (locked(e)) return;
      if (!order.terms) { ui.termsErr = true; UI.fieldError(terms, 'כדי להמשיך יש לאשר את תנאי השימוש.'); terms.focus(); updateTitle(); return; }
      go(nextFrom(3));
    });

    // שלב 4
    // סינון ואז חיתוך (P2-1): ת״ז שמודבקת עם רווחים/מקף לא נחתכת לפני הסינון. ספרות ערביות/פרסיות → 0–9 (P1-2).
    // P3-6: בהדבקה לא חותכים – ערך ארוך מדי נשאר ומקבל שגיאה, ולא הופך בשקט למספר אחר שנראה תקין
    var filters = { cc: [/[^\d ]/g, 23], cvv: [/\D/g, 4], hid: [/\D/g, 9] };
    Object.keys(filters).forEach(function (id) {
      var el = document.getElementById(id);
      el.addEventListener('input', function (e) {
        var v = lat(el.value).replace(filters[id][0], '');
        if (!(e && e.inputType === 'insertFromPaste')) v = v.slice(0, filters[id][1]);
        if (v !== el.value) el.value = v;
      });
    });
    var exp = qs('#exp');
    exp.addEventListener('input', function (e) {
      // P3-3: עריכה באמצע (12/28) – הסמן נשאר אחרי אותה ספרה אחרי העיצוב מחדש
      var raw = lat(exp.value), del = /^delete/.test(e.inputType || '');
      var caret = exp.selectionStart == null ? raw.length : exp.selectionStart;
      var before = raw.slice(0, caret).replace(/\D/g, '').length;
      // P2-4: הדבקה / מילוי אוטומטי עם מפריד: "12/2028", "12 / 28", "1/28" → חודש ושנה (שנה בת 4 ספרות → 2 אחרונות)
      var parts = /^\s*(\d{1,2})\s*[\/.\-]\s*(\d{2}|\d{4})\s*$/.exec(raw);
      if (parts && del) return; // מחיקה באמצע "12/28" → "1/28": לא מזיזים את ספרת השנה לחודש
      var d;
      if (parts) { d = ('0' + parts[1]).slice(-2) + parts[2].slice(-2); before = d.length; }
      else {
        d = raw.replace(/\D/g, '');
        // P3-4: חודש בספרה אחת – "5" → "05", ו"1" + לוכסן → "01/"
        if (!del && (/^[2-9]/.test(d) || /^\s*\d\s*[\/.\-]/.test(raw))) { d = '0' + d; before++; }
        if (!del && d.length === 6) d = d.slice(0, 2) + d.slice(4); // "122028" (MMYYYY)
        d = d.slice(0, 4);
      }
      var v = d.length > 2 || (d.length === 2 && !del) ? d.slice(0, 2) + '/' + d.slice(2) : d;
      if (v === exp.value) return;
      exp.value = v;
      var pos = 0, seen = 0;
      while (pos < v.length && seen < before) { if (/\d/.test(v.charAt(pos))) seen++; pos++; }
      if (v.charAt(pos) === '/' && pos === v.length - 1) pos++; // "12" → "12/": הסמן אחרי הלוכסן
      try { if (document.activeElement === exp) exp.setSelectionRange(pos, pos); } catch (err) { /* */ }
    });
    CC.forEach(function (c) {
      var el = document.getElementById(c[0]);
      el.addEventListener('input', function () { if (el.getAttribute('aria-invalid') === 'true') UI.fieldError(el, null); });
    });
    // P3-13: שם ומייל לחשבונית נשמרים בטיוטה (לא פרטי הכרטיס)
    ['inv', 'mail'].forEach(function (id) { var el = qs('#' + id); el.addEventListener('input', function () { order[id] = el.value; save(); }); });
    // P3-19: Enter על רדיו / תיבת סימון בשלבים 1 ו-3 = "המשך" (כמו Enter בשדות של שלבים 2 ו-4)
    qs('#main').addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' || e.defaultPrevented || !e.target.matches || !e.target.matches('input[type="radio"], input[type="checkbox"]')) return;
      var stp = e.target.closest('.order__step');
      var n = stp && stp.getAttribute('data-step');
      var btn = n === '1' ? qs('#next-1') : n === '3' ? qs('#next-3') : null;
      if (!btn) return;
      e.preventDefault();
      btn.click();
    });
    // שלב 4 בתוך <form> (P3-3): Enter / "Go" במקלדת = תשלום; autocomplete של כרטיס עובד בטופס
    qs('#pay-form').addEventListener('submit', function (e) { e.preventDefault(); pay(); });
    // שגיאה שנוקתה בהקלדה/סימון – הכותרת מתעדכנת
    qs('#main').addEventListener('input', updateTitle);
    qs('#main').addEventListener('change', updateTitle);

    // שלב 5
    qs('#copy-order').addEventListener('click', function () { UI.copy(qs('#order-number').textContent); });
    var cal = qs('.order__step[data-step="5"] .order-done__btns .btn--secondary');
    if (cal) cal.addEventListener('click', function (e) { if (locked(e)) return; UI.toast('ההוספה ליומן [לאישור]', { icon: 'info' }); });
    qs('#done-status').addEventListener('click', function (e) { if (locked(e)) e.preventDefault(); });

    // חזרה (כל השלבים)
    qsa('[data-back]').forEach(function (b) { b.addEventListener('click', function (e) { if (!locked(e)) go(prevFrom(order.step)); }); });

    // P3-7: מקלדת מסך פתוחה (≤640, גובה נראה קטן) ושדה טקסט בפוקוס – הסרגל הדביק לא צף (html.kb-open, pages.css)
    function kbCheck() {
      var a = document.activeElement, vv = window.visualViewport;
      var typing = !!(a && a.matches && a.matches('input:not([type="radio"]):not([type="checkbox"]),textarea') && a.closest('.order__step'));
      var h = vv ? vv.height : window.innerHeight;
      var small = window.innerWidth <= 640 && (h < 560 || (vv && vv.height < window.innerHeight * 0.75));
      document.documentElement.classList.toggle('kb-open', typing && !!small);
    }
    document.addEventListener('focusin', kbCheck);
    document.addEventListener('focusout', function () { setTimeout(kbCheck, 0); });
    if (window.visualViewport) window.visualViewport.addEventListener('resize', kbCheck);
    window.addEventListener('resize', kbCheck);

    // Back/Forward בדפדפן
    window.addEventListener('popstate', function () {
      var q;
      try { q = new URLSearchParams(window.location.search); } catch (e) { return; }
      var st = parseInt(q.get('step'), 10) || 1;
      if (order.ordered && !order.edit && st < 5) { window.location.replace(statusUrl()); return; } // מהאישור חוזרים למסך המצב
      if (method(q.get('m'))) order.method = q.get('m');
      if (UI.drawer.isOpen()) UI.drawer.close();
      ui.paying = false;
      unlock();
      order.step = clamp(st);
      if (order.step === 5) complete();
      ui.termsErr = false;
      ui.methodErr = false;
      save();
      render();
      focusStep();
      // P2-2: גם אם הדפדפן משחזר גלילה אחרי popstate – ראש השלב, הפוקוס ב-H1
      requestAnimationFrame(function () { if (window.pageYOffset > 0) focusStep(); });
    });
  }

  /* ---------- Init ---------- */
  // B-09: "עריכת ההזמנה" ב-S2 של ההדגמה (בלי מסע שמור) – ההזמנה של S2: איסוף מנתב״ג, "עוד לא", 118 ₪
  function demoS2() {
    var o = fresh();
    o.method = 'pickup_tlv_airport'; o.prod = 'wait'; o.terms = true; o.ordered = true; o.step = 5;
    o.paidMethod = 'pickup_tlv_airport'; o.paidTotal = (method('pickup_tlv_airport') || { price: 118 }).price;
    return o;
  }
  function init() {
    var p = UI.params();
    var stepP = parseInt(p.get('step'), 10);
    var reset = p.get('reset') === '1';
    var stored = reset ? null : UI.store.get(KEY, null);
    if (reset) UI.store.remove(KEY);
    /* B-04: מצב הדגמה – פרמטר מצב ב-URL, או ?step/?m שלא תואמים להזמנה השמורה (קישור מהאינדקס, לא ריענון של המסע).
       ?reset=1 מתחיל מסע אמיתי חדש (גם עם פרמטרים); ?edit=1 בלי הזמנה שמורה = עריכה בהדגמה של S2 (B-09) */
    var DEMO_KEYS = ['auth', 'addr', 'terms', 'termsErr', 'why', 'info', 'drawer', 'group', 'demo', 'prod'];
    var mP = p.get('m');
    if (!reset) {
      if (DEMO_KEYS.some(function (k) { return p.has(k); })) demoMode = true;
      else if (p.get('edit') === '1') demoMode = !(stored && stored.ordered);
      else if (stepP >= 1 && stepP <= 5) demoMode = !(stored && (!mP || stored.method === mP) && (stepP !== 5 || stored.ordered));
    }
    var saved = demoMode ? null : stored;
    if (demoMode && p.get('edit') === '1') saved = demoS2();
    var edit = p.get('edit') === '1' && saved && saved.ordered;
    // אחרי הזמנה שהושלמה: כניסה חדשה (בלי ?step=5 ובלי עריכה) מתחילה הזמנה חדשה
    if (saved && saved.ordered && stepP !== 5 && !edit && !saved.edit) saved = null;
    // עריכה מ-S2 (?edit=1): טיוטה חדשה מההזמנה ששולמה. טיוטה קודמת שננטשה לא נמשכת (P1-4)
    var committed = null;
    if (edit) {
      committed = saved.edit && saved.committed ? saved.committed : snapshot(saved);
      var base = JSON.parse(JSON.stringify(saved));
      COMMIT_KEYS.forEach(function (k) { if (k in committed) base[k] = committed[k]; });
      saved = base;
    }
    order = merge(fresh(), saved);
    if (edit) { order.edit = true; order.committed = committed; if (!(stepP >= 1 && stepP <= 5)) order.step = 1; }

    if (stepP >= 1 && stepP <= 5) order.step = stepP;
    else if (p.get('reset') === '1' || !saved) order.step = 1;
    if (method(p.get('m'))) order.method = p.get('m');
    var grp = ['pickup', 'home', 'mail'].indexOf(p.get('group')) >= 0 ? p.get('group') : null; // הצ'יפים הוסרו (החלטה 3): ?group= רק גולל לקבוצה
    if (p.has('auth')) order.auth = p.get('auth') === '1' || p.get('auth') === 'true';
    if (p.get('addr') === 'moin' || p.get('addr') === 'other') order.addr = p.get('addr');
    if (p.get('terms') === '1') order.terms = true;
    if (p.get('termsErr') === '1') { order.terms = false; ui.termsErr = true; }
    if (p.get('prod') === 'now' || p.get('prod') === 'wait') order.prod = p.get('prod');
    ui.why = p.get('why') === '1';
    ui.skipcc = p.get('demo') === 'skipcc';

    order.step = clamp(order.step);
    if (order.step === 5 && (!order.ordered || order.edit)) complete(true);
    save();
    if (!demoMode) writeUrl(false); // הדגמה: ה-URL נשאר כמו שנטען, כך שריענון משחזר בדיוק את מצב ההדמיה
    else try { history.replaceState({ fdStep: order.step }, '', window.location.href); } catch (e) { /* file:// */ }

    UI.accordion(qs('.order-why'), { openIndex: ui.why ? 0 : -1 });
    fillCompare();
    bind();
    var termsErr = ui.termsErr;
    render();
    if (termsErr && order.step === 3) { ui.termsErr = true; UI.fieldError(qs('#terms'), 'כדי להמשיך יש לאשר את תנאי השימוש.'); updateTitle(); }

    if (grp && order.step === 1 && grp !== 'home') { var gb = qs('#grp-box-' + grp); if (gb) { try { gb.scrollIntoView({ block: 'start' }); } catch (e) { /* */ } } }
    var info = p.get('info'), dr = p.get('drawer');
    if (order.step === 1 && method(info)) openMethodDrawer(info, qs('[data-info="' + info + '"]'));
    else if (dr === 'compare') UI.drawer.open('dr-compare', { returnFocus: qs('#open-compare') });
    else if (dr === 'terms') UI.drawer.open('dr-terms', { returnFocus: qs('#open-terms') });
    if (p.get('demo') === 'paying' && order.step === 4) { ui.skipcc = true; pay(); ui.skipcc = p.get('demo') === 'skipcc'; }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
