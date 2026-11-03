/* order.js – תהליך ההזמנה P05–P09 (order.html). מפרט: _kit/docs/07_order_flow.md
   state יחיד: UI.store 'fd.order' (02 §2.6). פרמטרי URL גוברים על השמור ומאתחלים בלבד. */
(function () {
  'use strict';
  var qs = UI.qs, qsa = UI.qsa;
  var D = window.FD_DATA || {};
  var KEY = 'fd.order';
  var STEP_NAMES = ['משלוח', 'כתובת', 'מועד ייצור', 'תשלום'];

  /* ---------- נתונים ---------- */
  var SPEED = ['pickup_bari', 'express_home', 'pickup_tlv_airport', 'regular_home', 'registered_mail', 'regular_mail']; // 07 §7.3
  var GROUP_KEY = { 'איסוף עצמי': 'pickup', 'משלוח עד הבית': 'home', 'בדואר': 'mail' };
  var ICON = { pickup_bari: 'store', pickup_tlv_airport: 'plane', express_home: 'truck', regular_home: 'truck', registered_mail: 'mail', regular_mail: 'mail' };
  var ETA_SHORT = { // 07 §7.5
    pickup_bari: 'איסוף 26.8 מ-11:00', express_home: 'מגיע עד 26.8', pickup_tlv_airport: 'איסוף מ-26.8',
    regular_home: 'מגיע בין 27.8 ל-1.9', registered_mail: 'מגיע עד 14.9', regular_mail: 'מגיע עד 14.9'
  };
  var TAG_CLS = { 'ללא עלות': 'tag--free', 'הכי מהיר': 'tag--fast', 'הכי מהיר עד הבית': 'tag--fast', 'ללא מעקב': 'tag--notrack' };
  var METHODS = (D.delivery_methods || []).slice().sort(function (a, b) { return SPEED.indexOf(a.id) - SPEED.indexOf(b.id); });
  METHODS.forEach(function (m) { m.g = GROUP_KEY[m.group] || 'home'; });
  function method(id) { for (var i = 0; i < METHODS.length; i++) if (METHODS[i].id === id) return METHODS[i]; return null; }
  var moin = (D.citizen && D.citizen.moin_address) || { street: 'העצמאות', house: '10', city: 'באר שבע', display: 'רחוב העצמאות 10, באר שבע' };

  function trk(m) {
    if (m.g === 'pickup') return '—';
    if (m.id === 'registered_mail') return 'מעקב דואר';
    return m.tracking ? 'כן' : 'ללא מעקב';
  }
  function priceNum(m) { return Number.isInteger(m.price) ? String(m.price) : m.price.toFixed(2); }

  /* ---------- טקסט: escape + מספרים ב-LTR + [לאישור] ---------- */
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '״'); }
  function numify(s) { return s.replace(/\d+(?:[.:,–\-\/]\d+)*/g, function (n) { return '<span class="num" dir="ltr">' + n + '</span>'; }); }
  function rich(s) {
    return String(s == null ? '' : s).split(/(\[[^\]]*\])/).map(function (part) {
      if (/^\[.*\]$/.test(part)) return '<span class="tbc">' + esc(part) + '</span>';
      return numify(esc(part));
    }).join('');
  }

  /* ---------- State ---------- */
  function fresh() {
    return {
      step: 1, method: null, group: 'all', auth: false, addr: 'moin',
      extras: { entrance: '', care_of: '', mailbox: '' },
      other: { city: '', street: '', house: '', entrance: '', apt: '', zip: '', care_of: '', phone: '', mailbox: '' },
      prod: 'now', terms: false, ordered: false
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
  var order, ui = { termsErr: false, why: false, info: null, drawer: null, paying: false, skipcc: false };
  function save() { UI.store.set(KEY, order); }

  function cur() { return method(order.method); }
  function needsAddr() { var m = cur(); return m ? m.needs_address : true; }
  function isFree() { var m = cur(); return m ? m.price === 0 : false; }
  function nextFrom(n) { if (n === 1) return needsAddr() ? 2 : 3; if (n === 3) return isFree() ? 5 : 4; return n + 1; }
  function prevFrom(n) { if (n === 3) return needsAddr() ? 2 : 1; if (n === 4) return 3; return Math.max(1, n - 1); }
  function clamp(n) {
    n = Math.min(5, Math.max(1, n || 1));
    if (n >= 2 && !cur()) order.method = 'express_home'; // שלב מתקדם בלי שיטה (קישור הדגמה) – ברירת מחדל כמו בעיצוב
    if (n === 2 && !needsAddr()) n = 3;
    if (n === 4 && isFree()) n = 3;
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
    order.step = n;
    if (n === 5) order.ordered = true;
    ui.termsErr = false;
    save();
    writeUrl(!opt.replace);
    render();
    focusStep();
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
    if (s < 5) renderStepper();
    if (s === 1) renderStep1();
    if (s === 2) renderStep2();
    if (s === 3) renderStep3();
    if (s === 4) renderStep4();
    if (s === 5) renderStep5();
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
    var skipped = [false, !!m && !m.needs_address, false, !!m && m.price === 0];
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

  /* --- שלב 1 --- */
  function methodCard(m) {
    var on = order.method === m.id;
    var tags = (m.tags || []).map(function (t) { return '<span class="tag ' + (TAG_CLS[t] || 'tag--notrack') + '">' + esc(t) + '</span>'; }).join('');
    return '<div class="opt-card-wrap">' +
      '<label class="opt-card opt-card--with-q' + (on ? ' is-selected' : '') + '">' +
      '<input type="radio" name="method" value="' + m.id + '"' + (on ? ' checked' : '') + '>' +
      '<span class="ibox ibox--44 order-opt__ibox">' + UI.icon(ICON[m.id] || 'truck') + '</span>' +
      '<span class="stack order-opt__body order-opt__body--tight"><span class="row order-opt__title"><strong class="order-opt__name">' + esc(m.name) + '</strong>' + tags + '</span>' +
      '<span class="order-opt__eta">' + rich(m.eta_display) + '</span>' +
      '<span class="small muted">' + esc(m.fit) + '</span></span>' +
      '<span class="order-opt__price' + (m.price === 0 ? ' price-free' : '') + '">' + rich(m.price_display) + '</span>' +
      '</label>' +
      '<button type="button" class="icon-btn icon-btn--ghost opt-card__q order-opt__q" data-info="' + m.id + '" aria-label="פרטים נוספים על ' + esc(m.name) + '">' + UI.icon('help-circle') + '</button>' +
      '</div>';
  }
  function renderStep1() {
    qsa('.order-chips .chip').forEach(function (c) { c.setAttribute('aria-pressed', c.getAttribute('data-group') === order.group ? 'true' : 'false'); });
    var list = METHODS.filter(function (m) { return order.group === 'all' || m.g === order.group; });
    qs('#method-list').innerHTML = list.map(methodCard).join('');
    qs('#next-1').disabled = !cur();
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
      if (!el.value.trim()) { UI.fieldError(el, 'יש למלא ' + r[1] + '.'); first = first || el; } else UI.fieldError(el, null);
    });
    var ph = document.getElementById('o-p');
    if (!Validate.mobile(ph.value)) { UI.fieldError(ph, 'מספר הנייד צריך להתחיל ב-05 ולהכיל 10 ספרות.'); first = first || ph; } else UI.fieldError(ph, null);
    if (first) UI.focus(first);
    return !first;
  }

  /* --- שלב 3 --- */
  function renderStep3() {
    var m = cur();
    qsa('input[name="prod"]').forEach(function (r) { r.checked = r.value === order.prod; r.closest('.opt-card').classList.toggle('is-selected', r.checked); });
    qs('#eta-short').innerHTML = numify(esc(m ? ETA_SHORT[m.id] : 'מועד הגעה'));
    var t = qs('#terms');
    t.checked = !!order.terms;
    UI.fieldError(t, ui.termsErr ? 'כדי להמשיך יש לאשר את תנאי השימוש.' : null);
    qs('#next-3').textContent = isFree() ? 'אישור ההזמנה' : 'המשך לתשלום';
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
    qs('#sum-prod').innerHTML = order.prod === 'now' ? 'ייצור מיידי – <span class="num" dir="ltr">25.8</span> ב-<span class="num" dir="ltr">07:00</span>' : 'אחרי סגירת החלון – <span class="num" dir="ltr">26.8</span>';
    var det = qs('#order-sum');
    var mobile = false;
    try { mobile = window.matchMedia('(max-width: 640px)').matches; } catch (e) { /* */ }
    det.open = !mobile; // פתוח בדסקטופ, מקופל במובייל
    var pay = qs('#pay');
    if (!ui.paying) { pay.disabled = false; pay.setAttribute('aria-busy', 'false'); }
  }
  var CC = [
    ['cc', function (v) { return Validate.cardNumber(v); }, 'מספר הכרטיס לא תקין. בדקו שהזנתם 12–19 ספרות.'],
    ['exp', function (v) { return Validate.cardExpiry(v); }, 'תוקף לא תקין. הזינו חודש ושנה בפורמט MM/YY.'],
    ['cvv', function (v) { return Validate.cvv(v); }, 'קוד CVV לא תקין. הזינו 3 או 4 ספרות.'],
    ['hid', function (v) { return Validate.israeliId(v); }, 'מספר תעודת הזהות לא תקין. בדקו שהזנתם 9 ספרות.'],
    ['inv', function (v) { return !!v.trim(); }, 'יש למלא שם לחשבונית.']
  ];
  function validateCC() {
    var first = null;
    CC.forEach(function (c) {
      var el = document.getElementById(c[0]);
      if (!c[1](el.value)) { UI.fieldError(el, c[2]); first = first || el; } else UI.fieldError(el, null);
    });
    if (first) UI.focus(first);
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
    qs('#done-prod').textContent = order.prod === 'now' ? '25.8, 07:00' : '26.8, 07:00';
    qs('#done-mid').textContent = needsAddr() ? 'משלוח' : 'הכנה לאיסוף';
    qs('#done-eta').innerHTML = numify(esc(m ? ETA_SHORT[m.id] : 'צפוי להגיע עד 26.8'));
    qs('#done-status').setAttribute('href', statusUrl());
    if (D.order_example) qs('#order-number').textContent = D.order_example.order_number;
  }

  /* ---------- Drawers ---------- */
  function openMethodDrawer(id, btn) {
    var m = method(id);
    if (!m) return;
    qs('#dr-method-t').textContent = m.name;
    var rows = [['זמן אספקה', m.eta_rule], ['מחיר', m.price_display], ['מעקב', trk(m)], ['מתאים ל…', m.fit]];
    if (m.g === 'pickup') rows.push(['כתובת', m.address], ['שעות', m.hours]);
    qs('#dr-method-dl').innerHTML = rows.filter(function (r) { return r[1]; }).map(function (r) {
      return '<div><dt>' + esc(r[0]) + '</dt><dd>' + rich(r[1]) + '</dd></div>';
    }).join('');
    UI.drawer.open('dr-method', { returnFocus: btn || document.activeElement });
  }
  function fillCompare() {
    qs('#compare-body').innerHTML = METHODS.map(function (m) {
      return '<tr><th scope="row">' + esc(m.name) + '</th><td>' + rich(m.eta_rule) + '</td><td class="order-tbl__price">' + rich(m.price_display) + '</td><td>' + esc(trk(m)) + '</td></tr>';
    }).join('');
  }

  /* ---------- Events ---------- */
  function bind() {
    // שלב 1
    qsa('.order-chips .chip').forEach(function (c) {
      c.addEventListener('click', function () { order.group = c.getAttribute('data-group'); save(); renderStep1(); });
    });
    var list = qs('#method-list');
    list.addEventListener('change', function (e) {
      if (e.target.name !== 'method') return;
      order.method = e.target.value; save(); writeUrl(false);
      qsa('.opt-card', list).forEach(function (l) { l.classList.toggle('is-selected', l.contains(e.target)); });
      qs('#next-1').disabled = false;
      renderStepper();
    });
    list.addEventListener('click', function (e) {
      var q = e.target.closest('[data-info]');
      if (q) openMethodDrawer(q.getAttribute('data-info'), q);
    });
    qs('#open-compare').addEventListener('click', function (e) { UI.drawer.open('dr-compare', { returnFocus: e.currentTarget }); });
    qs('#next-1').addEventListener('click', function () { if (cur()) go(nextFrom(1)); });

    // שלב 2
    qsa('input[name="addr"]').forEach(function (r) {
      r.addEventListener('change', function () { order.addr = r.value; save(); renderStep2(); });
    });
    qsa('[data-other]').forEach(function (i) {
      i.addEventListener('input', function () {
        if (i.id === 'o-p') { var v = i.value.replace(/[^\d-]/g, '').slice(0, 11); if (v !== i.value) i.value = v; }
        if (i.id === 'o-h' || i.id === 'o-z' || i.id === 'o-a') { var d = i.value.replace(/\D/g, ''); if (d !== i.value) i.value = d; }
        order.other[i.getAttribute('data-other')] = i.value; save();
        if (i.getAttribute('aria-invalid') === 'true') UI.fieldError(i, null);
      });
    });
    qsa('[data-extra]').forEach(function (i) {
      i.addEventListener('input', function () { order.extras[i.getAttribute('data-extra')] = i.value; save(); });
    });
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
      if (!order.terms) { ui.termsErr = true; UI.fieldError(terms, 'כדי להמשיך יש לאשר את תנאי השימוש.'); terms.focus(); return; }
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

    // שלב 5
    qs('#copy-order').addEventListener('click', function () { UI.copy(qs('#order-number').textContent); });

    // חזרה (כל השלבים)
    qsa('[data-back]').forEach(function (b) { b.addEventListener('click', function () { go(prevFrom(order.step)); }); });

    // Back/Forward בדפדפן
    window.addEventListener('popstate', function () {
      var q;
      try { q = new URLSearchParams(window.location.search); } catch (e) { return; }
      var st = parseInt(q.get('step'), 10) || 1;
      if (order.ordered && st < 5) { window.location.replace(statusUrl()); return; } // מהאישור חוזרים למסך המצב
      if (method(q.get('m'))) order.method = q.get('m');
      if (UI.drawer.isOpen()) UI.drawer.close();
      ui.paying = false;
      order.step = clamp(st);
      if (order.step === 5) order.ordered = true;
      ui.termsErr = false;
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
    // אחרי הזמנה שהושלמה: כניסה חדשה (בלי ?step=5) מתחילה הזמנה חדשה
    if (saved && saved.ordered && stepP !== 5) saved = null;
    order = merge(fresh(), saved);

    if (stepP >= 1 && stepP <= 5) order.step = stepP;
    else if (p.get('reset') === '1' || !saved) order.step = 1;
    if (method(p.get('m'))) order.method = p.get('m');
    if (['all', 'pickup', 'home', 'mail'].indexOf(p.get('group')) >= 0) order.group = p.get('group');
    if (p.has('auth')) order.auth = p.get('auth') === '1' || p.get('auth') === 'true';
    if (p.get('addr') === 'moin' || p.get('addr') === 'other') order.addr = p.get('addr');
    if (p.get('terms') === '1') order.terms = true;
    if (p.get('termsErr') === '1') { order.terms = false; ui.termsErr = true; }
    if (p.get('prod') === 'now' || p.get('prod') === 'wait') order.prod = p.get('prod');
    ui.why = p.get('why') === '1';
    ui.skipcc = p.get('demo') === 'skipcc';

    order.step = clamp(order.step);
    if (order.step === 5) order.ordered = true;
    save();
    writeUrl(false);

    UI.accordion(qs('.order-why'), { openIndex: ui.why ? 0 : -1 });
    fillCompare();
    bind();
    var termsErr = ui.termsErr;
    render();
    if (termsErr && order.step === 3) { ui.termsErr = true; UI.fieldError(qs('#terms'), 'כדי להמשיך יש לאשר את תנאי השימוש.'); }

    var info = p.get('info'), dr = p.get('drawer');
    if (order.step === 1 && method(info)) openMethodDrawer(info, qs('[data-info="' + info + '"]'));
    else if (dr === 'compare') UI.drawer.open('dr-compare', { returnFocus: qs('#open-compare') });
    else if (dr === 'terms') UI.drawer.open('dr-terms', { returnFocus: qs('#open-terms') });
    if (p.get('demo') === 'paying' && order.step === 4) { ui.skipcc = true; pay(); ui.skipcc = p.get('demo') === 'skipcc'; }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
