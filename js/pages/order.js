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
  var ETA = {
    now: {
      pickup_bari: 'אפשר לאסוף מיום ד׳ 26.8, מ-11:00', express_home: 'יגיע עד יום ד׳ 26.8', pickup_tlv_airport: 'אפשר לאסוף מיום ד׳ 26.8',
      regular_home: 'יגיע בין יום ה׳ 27.8 ליום ג׳ 1.9', registered_mail: 'יגיע עד יום ב׳ 14.9', regular_mail: 'יגיע עד יום ב׳ 14.9'
    },
    wait: {
      pickup_bari: 'אפשר לאסוף מיום ה׳ 27.8, מ-11:00 (יום אחד מאוחר יותר)', express_home: 'יגיע עד יום ה׳ 27.8 (יום אחד מאוחר יותר)', pickup_tlv_airport: 'אפשר לאסוף מיום ה׳ 27.8 (יום אחד מאוחר יותר)',
      regular_home: 'יגיע בין יום א׳ 30.8 ליום ד׳ 2.9', registered_mail: 'יגיע עד יום ג׳ 15.9', regular_mail: 'יגיע עד יום ג׳ 15.9'
    }
  };
  var HOW = { express_home: 'ביד, מהשליח', regular_home: 'ביד, מהשליח', pickup_bari: 'באיסוף, עם תעודה מזהה', pickup_tlv_airport: 'באיסוף, עם תעודה מזהה', registered_mail: 'בתיבה, עם מעקב', regular_mail: 'בתיבה, ללא מעקב' };
  var IF_NOT = {
    express_home: 'רואים במעקב איפה הוא', regular_home: 'רואים במעקב איפה הוא', registered_mail: 'רואים במעקב של דואר ישראל איפה הוא',
    regular_mail: 'אפשר לבקש הנפקה חוזרת רק אחרי 19 ימי עסקים',
    pickup_bari: 'שמור לאיסוף עד [לאישור]', pickup_tlv_airport: 'שמור לאיסוף עד [לאישור]'
  };
  var INCL = { express_home: 'מסירה ביד · מעקב משלוח ב-SMS', regular_home: 'מסירה ביד · מעקב משלוח ב-SMS', pickup_tlv_airport: 'איסוף עם תעודה מזהה', registered_mail: 'מעקב של דואר ישראל', pickup_bari: 'איסוף עם תעודה מזהה', regular_mail: 'ללא מעקב' };
  var CAVEAT = { regular_mail: 'נמסר רק לתיבה שיש עליה שם' }; // "ללא מעקב" כבר בתג של הכרטיס
  var TAG_CLS = { 'ללא עלות': 'tag--free', 'הכי מהיר': 'tag--fast', 'הכי מהיר לאיסוף': 'tag--fast', 'הכי מהיר עד הבית': 'tag--fast', 'ללא מעקב': 'tag--notrack', 'מסירה ביד': 'tag--hand' };
  var METHODS = (D.delivery_methods || []).slice().sort(function (a, b) { return ORDER_IDS.indexOf(a.id) - ORDER_IDS.indexOf(b.id); });
  METHODS.forEach(function (m) { GROUPS.forEach(function (g) { if (g.ids.indexOf(m.id) >= 0) m.g = g.key; }); m.g = m.g || 'home'; });
  function method(id) { for (var i = 0; i < METHODS.length; i++) if (METHODS[i].id === id) return METHODS[i]; return null; }
  var moin = (D.citizen && D.citizen.moin_address) || { street: 'העצמאות', house: '10', city: 'באר שבע', display: 'רחוב העצמאות 10, באר שבע' };
  function eta(m, prod) { return m ? ETA[prod === 'wait' ? 'wait' : 'now'][m.id] || m.eta_display : ''; }

  // באיסוף עצמי אין מעקב – השורה לא מוצגת בכלל (CLAUDE.md §3.4: שדה בלי ערך לא מוצג)
  function trk(m) {
    if (m.g === 'pickup') return null;
    if (m.id === 'registered_mail') return 'מעקב דואר';
    return m.tracking ? 'כן' : 'ללא מעקב';
  }
  function priceNum(m) { return Number.isInteger(m.price) ? String(m.price) : m.price.toFixed(2); }

  /* ---------- טקסט: escape + מספרים ב-LTR + [לאישור] ---------- */
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '״'); }
  function numify(s) { return s.replace(/\d+(?:[.:,\/]\d+)*/g, function (n) { return '<span class="num" dir="ltr">' + n + '</span>'; }); }
  function rich(s) {
    return String(s == null ? '' : s).split(/(\[[^\]]*\])/).map(function (part) {
      if (/^\[.*\]$/.test(part)) return '<span class="tbc">' + esc(part) + '</span>';
      return numify(esc(part));
    }).join('');
  }

  /* ---------- State ----------
     ordered=true – ההזמנה הושלמה (status.js מציג ממנה את S2/S3). edit=true – עריכת הזמנה קיימת (?edit=1 מ-S2):
     הבחירות נשמרות, ואם השיטה לא השתנתה לא משלמים שוב (paidMethod). */
  function fresh() {
    return {
      step: 1, method: null, auth: false, addr: 'moin', nudged: false,
      extras: { entrance: '', care_of: '', mailbox: '' },
      other: { city: '', street: '', house: '', entrance: '', apt: '', zip: '', care_of: '', phone: '', mailbox: '' },
      prod: 'now', terms: false, ordered: false, edit: false, paidMethod: null
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
  var order, ui = { termsErr: false, why: false, info: null, drawer: null, paying: false, skipcc: false, methodErr: false, nudge: false };
  function save() { UI.store.set(KEY, order); }

  function cur() { return method(order.method); }
  function needsAddr() { var m = cur(); return m ? m.needs_address : true; }
  function isFree() { var m = cur(); return m ? m.price === 0 : false; }
  function noPay() { return isFree() || (order.edit && !!order.method && order.paidMethod === order.method); }
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
    return window.location.pathname + '?step=' + step + (order.method ? '&m=' + encodeURIComponent(order.method) : '');
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
  }

  // מעבר שלב (רק בפעולת משתמש): השלב החדש נכנס בכיוון ההתקדמות (RTL: קדימה משמאל). השלב הישן מוסתר מיד, הפוקוס כבר ב-H1.
  // שלב 5: רצף ההצלחה (עיגול + ✓). בלי GSAP / ב-reduced-motion – אין תנועה
  function stepMotion(prev, n) {
    if (prev === n) return;
    var sec = qs('.order__step[data-step="' + n + '"]');
    if (n === 5) UI.motion.success(sec, qs('.order-done__circle', sec));
    else UI.motion.enter(sec, n > prev);
  }

  // ההזמנה הושלמה: מסך המצב יציג אותה (S2/S3); הנפקה חוזרת קודמת כבר לא רלוונטית
  function complete() {
    order.ordered = true;
    order.edit = false;
    if (!isFree()) order.paidMethod = order.method;
    UI.store.remove('fd.reissue');
  }

  function focusStep() {
    var main = document.getElementById('main');
    var h = qsa('h1', qs('.order__step[data-step="' + order.step + '"]')).filter(function (x) { return !x.hidden; })[0];
    try { window.scrollTo(0, Math.max(0, main.getBoundingClientRect().top + window.pageYOffset)); } catch (e) { /* */ }
    if (h) { try { h.focus({ preventScroll: true }); } catch (e) { h.focus(); } }
  }

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
      t = (err ? 'שגיאה: ' : '') + 'שלב ' + n + ' מתוך 4: ' + STEP_NAMES[n - 1] + ' – ' + BASE_TITLE;
    }
    if (document.title !== t) document.title = t;
  }

  function renderDemo() {
    var items = ['P05 משלוח', 'P06 כתובת', 'P07 ייצור', 'P08 תשלום', 'P09 אישור'].map(function (t, i) {
      return { label: t, pressed: order.step === i + 1, onClick: function () { demoGo(i + 1); } };
    });
    items.push({ label: 'מורשה לשנות כתובת (הצטלם)', pressed: order.auth, onClick: function () {
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
    qs('#stepper-m-text').textContent = 'שלב ' + num + ' מתוך 4 – ' + STEP_NAMES[num - 1];
    var bar = qs('#stepper-m-bar');
    bar.setAttribute('aria-valuenow', String(num));
    bar.setAttribute('aria-valuetext', 'שלב ' + num + ' מתוך 4 – ' + STEP_NAMES[num - 1]);
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
  function renderChosen() {
    var m = cur(), el = qs('#chosen-line');
    if (!el) return;
    var html = m ? 'בחרתם: <strong>' + esc(m.name) + '</strong> · ' + rich(m.price_display) : 'עוד לא בחרתם';
    if (el.innerHTML === html) return;
    el.innerHTML = html;
    if (chosenReady) UI.motion.refresh(el); // שינוי בחירה: fade קצר בסרגל הדביק (המחיר מתחלף, לא נספר)
    chosenReady = true;
  }
  var chosenReady = false;
  function renderMethodErr() {
    var e = qs('#method-err');
    e.hidden = !ui.methodErr;
    e.innerHTML = ui.methodErr ? UI.icon('alert-circle', { size: 18 }) + 'בחרו איך תרצו לקבל את הרישיון' : '';
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
        '<div class="order-nudge__body"><p><strong>לפני שממשיכים:</strong> בדואר רגיל אין מעקב, והרישיון נמסר לתיבה רק אם מופיע עליה שם מזהה. אם הוא לא מגיע, אפשר לבקש הנפקה חוזרת רק אחרי <span class="num" dir="ltr">19</span> ימי עסקים.</p>' +
        '<div class="order-nudge__btns">' +
        (reg ? '<button type="button" class="btn btn--secondary btn--sm" data-pick="registered_mail"><span>דואר רשום עם מעקב – ' + rich(reg.price_display) + '</span></button>' : '') +
        (rh ? '<button type="button" class="btn btn--secondary btn--sm" data-pick="regular_home"><span>שליח עד הבית – ' + rich(rh.price_display) + '</span></button>' : '') +
        '</div><button type="button" class="link-btn" id="nudge-go">להמשיך עם דואר רגיל</button></div></div>';
    }
    if (html) wrap.insertAdjacentHTML('afterend', html);
    var live = qs('#method-live');
    if (live) live.textContent = m.id === 'regular_mail' && ui.nudge ? 'לפני שממשיכים: בדואר רגיל אין מעקב. אפשר לבחור דואר רשום או שליח, או להמשיך עם דואר רגיל.' : '';
  }
  function selectMethod(id, focus) {
    order.method = id;
    if (id === 'regular_mail' && !order.nudged) { ui.nudge = true; order.nudged = true; } else if (id !== 'regular_mail') ui.nudge = false;
    ui.methodErr = false;
    save(); writeUrl(false);
    qsa('#method-list .opt-card').forEach(function (l) { var r = l.querySelector('input'); r.checked = r.value === id; l.classList.toggle('is-selected', r.checked); });
    renderExtras(); renderChosen(); renderMethodErr(); renderStepper();
    if (focus) { var r = qs('#method-list input[value="' + id + '"]'); if (r) UI.focus(r); }
  }
  function next1() {
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
  var OTHER_REQ = [['o-city', 'עיר'], ['o-st', 'רחוב'], ['o-h', 'מספר בית'], ['o-z', 'מיקוד']];
  function validateOther() {
    var first = null;
    OTHER_REQ.forEach(function (r) {
      var el = document.getElementById(r[0]);
      // מספר בית יכול לכלול אות ("12א") – חייב רק להכיל ספרה (M-05)
      var bad = !el.value.trim() || (r[0] === 'o-h' && !/\d/.test(el.value));
      if (bad) { UI.fieldError(el, 'יש למלא ' + r[1] + '.'); first = first || el; } else UI.fieldError(el, null);
    });
    var ph = document.getElementById('o-p');
    if (!Validate.mobile(ph.value)) { UI.fieldError(ph, 'מספר הנייד צריך להתחיל ב-05 ולהכיל 10 ספרות.'); first = first || ph; } else UI.fieldError(ph, null);
    if (first) UI.focus(first);
    updateTitle();
    return !first;
  }

  /* --- שלב 3 --- */
  function renderStep3() {
    var m = cur();
    qsa('input[name="prod"]').forEach(function (r) { r.checked = r.value === order.prod; r.closest('.opt-card').classList.toggle('is-selected', r.checked); });
    qs('#eta-now').innerHTML = rich(eta(m, 'now'));
    qs('#eta-wait').innerHTML = rich(eta(m, 'wait'));
    qs('#late-note').hidden = !(order.prod === 'wait' && m && (m.id === 'express_home' || m.id === 'pickup_tlv_airport'));
    var t = qs('#terms');
    t.checked = !!order.terms;
    UI.fieldError(t, ui.termsErr ? 'כדי להמשיך יש לאשר את תנאי השימוש.' : null);
    // "המשך לתשלום" עם חץ קדימה כמו בשלבים 1–2; "אישור ההזמנה" (פעולה מחייבת) – בלי חץ (L-09)
    qs('#next-3-t').textContent = noPay() ? 'אישור ההזמנה' : 'המשך לתשלום';
    qs('#next-3-ico').style.display = noPay() ? 'none' : '';
  }

  /* --- שלב 4 --- */
  function addrSummary() {
    var m = cur();
    if (m && !m.needs_address) return { k: 'עמדה', v: rich(m.address || '') };
    if (order.auth && order.addr === 'other') {
      var o = order.other;
      var line = ('רחוב ' + o.street + ' ' + o.house).trim() + (o.city ? ', ' + o.city : '');
      return { k: 'כתובת', v: rich(o.street ? line : 'כתובת אחרת שהוזנה') };
    }
    return { k: 'כתובת', v: rich(moin.display) };
  }
  function renderStep4() {
    var m = cur();
    var pn = m ? priceNum(m) : '';
    qsa('[data-price-num]').forEach(function (e) { e.textContent = pn; });
    qs('#sum-method').textContent = m ? m.name : '';
    var a = addrSummary();
    qs('#sum-addr-k').textContent = a.k;
    qs('#sum-addr').innerHTML = a.v;
    qs('#sum-addr-chg').hidden = !(m && m.needs_address);
    qs('#sum-prod').innerHTML = order.prod === 'now' ? 'עכשיו – ייצור <span class="nowrap">יום ג׳ <span class="num" dir="ltr">25.8</span></span>' : 'אחרי המועד – ייצור <span class="nowrap">יום ד׳ <span class="num" dir="ltr">26.8</span></span>';
    qs('#sum-incl').innerHTML = m ? rich((INCL[m.id] ? INCL[m.id] + ' · ' : '') + eta(m, order.prod)) : '';
    var inv = qs('#inv');
    if (inv && !inv.value && D.citizen) inv.value = ((D.citizen.first_name || '') + ' ' + (D.citizen.last_name || '')).trim(); // ממולא מראש, אפשר לשנות
    qs('#order-sum').open = true; // פתוח כברירת מחדל (כמו בהדמיות 33 בשני הרוחבים); אפשר לקפל
    var pay = qs('#pay');
    if (!ui.paying) { pay.disabled = false; pay.setAttribute('aria-busy', 'false'); }
  }
  var CC = [
    ['cc', function (v) { return Validate.cardNumber(v); }, 'מספר הכרטיס לא תקין. בדקו שהזנתם 12–19 ספרות.'],
    ['exp', function (v) { return Validate.cardExpiry(v); }, 'תוקף לא תקין. הזינו חודש ושנה בפורמט MM/YY.'],
    ['cvv', function (v) { return Validate.cvv(v); }, 'קוד CVV לא תקין. הזינו 3 או 4 ספרות.'],
    ['hid', function (v) { return Validate.israeliId(v); }, 'מספר תעודת הזהות לא תקין. בדקו את כל הספרות, כולל הספרה האחרונה (ספרת הביקורת).'],
    ['inv', function (v) { return !!v.trim(); }, 'יש למלא שם לחשבונית.']
  ];
  function validateCC() {
    var first = null;
    CC.forEach(function (c) {
      var el = document.getElementById(c[0]);
      if (!c[1](el.value)) { UI.fieldError(el, c[2]); first = first || el; } else UI.fieldError(el, null);
    });
    if (first) UI.focus(first);
    updateTitle();
    return !first;
  }
  function pay() {
    if (ui.paying) return;
    if (!ui.skipcc && !validateCC()) return;
    ui.paying = true;
    var btn = qs('#pay');
    UI.setBusy(btn, true, 'מעבדים את התשלום…');
    setTimeout(function () {
      ui.paying = false;
      UI.setBusy(btn, false);
      if (order.step === 4) go(5, { replace: true });
    }, 1400);
  }

  /* --- שלב 5 --- */
  function renderStep5() {
    var m = cur();
    var a = addrSummary();
    var paid = isFree() ? 'ללא עלות' : (order.paidMethod && method(order.paidMethod) ? rich(method(order.paidMethod).price_display) : (m ? rich(m.price_display) : ''));
    var rows = [['שיטה', m ? esc(m.name) : ''], [a.k === 'עמדה' ? 'עמדת איסוף' : 'כתובת', a.v], ['שולם', paid],
      [m && !m.needs_address ? 'אפשר לאסוף' : 'יגיע', rich(eta(m, order.prod).replace(/^(יגיע |אפשר לאסוף )/, ''))]];
    qs('#done-dl').innerHTML = rows.filter(function (r) { return r[1]; }).map(function (r) { return '<div><dt>' + r[0] + '</dt><dd>' + r[1] + '</dd></div>'; }).join('');
    var next;
    if (m && m.id === 'regular_mail') next = 'ודאו שעל תיבת הדואר מופיע שם משפחה. הרישיון נמסר לתיבה רק אם מופיע עליה שם מזהה.';
    else if (m && m.tracking) next = 'נשלח לכם SMS עם קישור למעקב ברגע שהרישיון יוצא לדרך.';
    else next = 'באיסוף צריך להציג תעודה מזהה ואת מספר ההזמנה.';
    qs('#done-next').textContent = next;
    qs('#done-status').setAttribute('href', statusUrl());
    if (D.order_example) qs('#order-number').textContent = D.order_example.order_number;
  }

  /* ---------- Drawers ---------- */
  function openMethodDrawer(id, btn) {
    var m = method(id);
    if (!m) return;
    qs('#dr-method-t').textContent = m.name;
    var rows = [['זמן אספקה', m.eta_rule], ['מחיר', m.price_display], ['מעקב', trk(m)], ['איך מקבלים', HOW[m.id]], ['אם לא הגיע', IF_NOT[m.id]], ['מתאים ל…', m.fit]];
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
    list.addEventListener('change', function (e) {
      if (e.target.name !== 'method') return;
      selectMethod(e.target.value, false);
    });
    list.addEventListener('click', function (e) {
      var q = e.target.closest('[data-info]');
      if (q) { openMethodDrawer(q.getAttribute('data-info'), q); return; }
      var pk = e.target.closest('[data-pick]');
      if (pk) { ui.nudge = false; selectMethod(pk.getAttribute('data-pick'), true); return; }
      if (e.target.closest('#nudge-go')) { ui.nudge = false; go(nextFrom(1)); }
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
    document.addEventListener('click', function (e) { if (e.target.closest('[data-back-top]')) go(prevFrom(order.step)); });

    // שלב 2
    qsa('input[name="addr"]').forEach(function (r) {
      r.addEventListener('change', function () { order.addr = r.value; save(); renderStep2(); });
    });
    qsa('[data-other]').forEach(function (i) {
      i.addEventListener('input', function () {
        if (i.id === 'o-p') { var v = i.value.replace(/[^\d-]/g, '').slice(0, 11); if (v !== i.value) i.value = v; }
        if (i.id === 'o-z') { var d = i.value.replace(/\D/g, ''); if (d !== i.value) i.value = d; } // מספר בית/דירה: גם "12א" (M-05)
        order.other[i.getAttribute('data-other')] = i.value; save();
        if (i.getAttribute('aria-invalid') === 'true') UI.fieldError(i, null);
      });
    });
    qsa('[data-extra]').forEach(function (i) {
      i.addEventListener('input', function () { order.extras[i.getAttribute('data-extra')] = i.value; save(); });
    });
    qs('#to-pickup').addEventListener('click', function () {
      go(1);
      var g = qs('#grp-box-pickup');
      if (g) { try { g.scrollIntoView({ block: 'start' }); } catch (e) { /* */ } }
    });
    qsa('.order-sum__chg').forEach(function (b) { b.addEventListener('click', function () { go(Number(b.getAttribute('data-goto'))); }); });
    qs('#next-2').addEventListener('click', function () {
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
    qs('#next-3').addEventListener('click', function () {
      if (!order.terms) { ui.termsErr = true; UI.fieldError(terms, 'כדי להמשיך יש לאשר את תנאי השימוש.'); terms.focus(); updateTitle(); return; }
      go(nextFrom(3));
    });

    // שלב 4
    var filters = { cc: /[^\d ]/g, cvv: /\D/g, hid: /\D/g };
    Object.keys(filters).forEach(function (id) {
      var el = document.getElementById(id);
      el.addEventListener('input', function () { var v = el.value.replace(filters[id], ''); if (v !== el.value) el.value = v; });
    });
    var exp = qs('#exp');
    exp.addEventListener('input', function (e) {
      var d = exp.value.replace(/\D/g, '').slice(0, 4);
      var v = d.length > 2 || (d.length === 2 && e.inputType !== 'deleteContentBackward') ? d.slice(0, 2) + '/' + d.slice(2) : d;
      if (v !== exp.value) exp.value = v;
    });
    CC.forEach(function (c) {
      var el = document.getElementById(c[0]);
      el.addEventListener('input', function () { if (el.getAttribute('aria-invalid') === 'true') UI.fieldError(el, null); });
    });
    qs('#pay').addEventListener('click', pay);
    // שגיאה שנוקתה בהקלדה/סימון – הכותרת מתעדכנת
    qs('#main').addEventListener('input', updateTitle);
    qs('#main').addEventListener('change', updateTitle);

    // שלב 5
    qs('#copy-order').addEventListener('click', function () { UI.copy(qs('#order-number').textContent); });
    var cal = qs('.order__step[data-step="5"] .order-done__btns .btn--secondary');
    if (cal) cal.addEventListener('click', function () { UI.toast('ההוספה ליומן [לאישור]', { icon: 'info' }); });

    // חזרה (כל השלבים)
    qsa('[data-back]').forEach(function (b) { b.addEventListener('click', function () { go(prevFrom(order.step)); }); });

    // Back/Forward בדפדפן
    window.addEventListener('popstate', function () {
      var q;
      try { q = new URLSearchParams(window.location.search); } catch (e) { return; }
      var st = parseInt(q.get('step'), 10) || 1;
      if (order.ordered && !order.edit && st < 5) { window.location.replace(statusUrl()); return; } // מהאישור חוזרים למסך המצב
      if (method(q.get('m'))) order.method = q.get('m');
      if (UI.drawer.isOpen()) UI.drawer.close();
      ui.paying = false;
      order.step = clamp(st);
      if (order.step === 5) complete();
      ui.termsErr = false;
      ui.methodErr = false;
      save();
      render();
      focusStep();
    });
  }

  /* ---------- Init ---------- */
  function init() {
    var p = UI.params();
    var stepP = parseInt(p.get('step'), 10);
    var saved = p.get('reset') === '1' ? null : UI.store.get(KEY, null);
    var edit = p.get('edit') === '1' && saved && saved.ordered;
    // אחרי הזמנה שהושלמה: כניסה חדשה (בלי ?step=5 ובלי עריכה) מתחילה הזמנה חדשה
    if (saved && saved.ordered && stepP !== 5 && !edit && !saved.edit) saved = null;
    order = merge(fresh(), saved);
    if (edit) { order.edit = true; if (!(stepP >= 1 && stepP <= 5)) order.step = 1; }

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
    if (order.step === 5) { order.ordered = true; order.edit = false; if (!isFree()) order.paidMethod = order.method; }
    save();
    writeUrl(false);

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
