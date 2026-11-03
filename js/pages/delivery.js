/* delivery.js – P13: טבלה (דסקטופ) / כרטיסים (≤640) מתוך FD_DATA.delivery_methods,
   כפתור "?" פותח מגירה. ?info=<method id> פותח את המגירה בטעינה. */
(function () {
  'use strict';
  var M = (window.FD_DATA && window.FD_DATA.delivery_methods) || [];
  var esc = UI.esc;

  // טקסט מהנתונים → HTML: [..] מסומן כ-tbc, מספרים/שעות עטופים ב-num
  function fmt(s) {
    return esc(s).split(/(\[[^\]]*\])/).map(function (part) {
      if (/^\[.*\]$/.test(part)) return '<span class="tbc">' + part + '</span>';
      return part.replace(/\d+(?:[.:–-]\d+)*/g, function (n) { return '<span class="num" dir="ltr">' + n + '</span>'; });
    }).join('');
  }
  function track(m) {
    if (m.tracking) return m.group === 'בדואר' ? 'מעקב דואר' : 'כן, שליח';
    return m.group === 'איסוף עצמי' ? '—' : 'ללא מעקב';
  }
  function tagCls(t) {
    if (t === 'ללא עלות') return 'tag--free';
    if (t === 'ללא מעקב') return 'tag--notrack';
    return 'tag--fast';
  }
  function tags(m) {
    return (m.tags || []).map(function (t) { return '<span class="tag ' + tagCls(t) + '">' + esc(t) + '</span>'; }).join('');
  }
  function qBtn(m) {
    return '<button type="button" class="dl-q" data-info="' + esc(m.id) + '" aria-label="' + esc('פרטים נוספים על ' + m.name) + '">' + UI.icon('help-circle', { size: 20 }) + '</button>';
  }
  function priceCls(m) { return m.price === 0 ? ' price-free' : ''; }
  var ORDER = '<a class="btn btn--secondary btn--sm" href="login.html">להזמנה</a>';

  var rows = document.getElementById('dl-rows');
  var cards = document.getElementById('dl-cards');
  rows.innerHTML = M.map(function (m) {
    return '<tr><th scope="row"><span class="dl-name">' + esc(m.name) + tags(m) + qBtn(m) + '</span></th>' +
      '<td>' + fmt(m.eta_rule) + '</td>' +
      '<td class="dl-price' + priceCls(m) + '">' + fmt(m.price_display) + '</td>' +
      '<td>' + track(m) + '</td>' +
      '<td>' + ORDER + '</td></tr>';
  }).join('');
  cards.innerHTML = M.map(function (m) {
    var t = tags(m);
    return '<li class="card dl-card">' +
      '<div class="dl-card__head"><p class="dl-card__name">' + esc(m.name) + '</p>' + qBtn(m) + '</div>' +
      (t ? '<div class="dl-card__tags">' + t + '</div>' : '') +
      '<p>' + fmt(m.eta_rule) + ' · מעקב: ' + track(m) + '</p>' +
      '<div class="dl-card__foot"><span class="dl-card__price' + priceCls(m) + '">' + fmt(m.price_display) + '</span>' + ORDER + '</div></li>';
  }).join('');

  var title = document.getElementById('dl-drawer-t');
  var dl = document.getElementById('dl-drawer-dl');
  var pick = document.getElementById('dl-drawer-pickup');

  function open(id, btn) {
    var m = M.filter(function (x) { return x.id === id; })[0];
    if (!m) return;
    title.textContent = m.name;
    var list = [['זמן אספקה', fmt(m.eta_rule)], ['מחיר', fmt(m.price_display)], ['מעקב', track(m)], ['מתאים ל…', fmt(m.fit)]];
    var isPickup = m.group === 'איסוף עצמי';
    if (isPickup) {
      if (m.address) list.push(['כתובת', fmt(m.address)]);
      if (m.hours) list.push(['שעות', fmt(m.hours)]);
    }
    dl.innerHTML = list.map(function (r) { return '<div><dt>' + r[0] + '</dt><dd>' + r[1] + '</dd></div>'; }).join('');
    pick.hidden = !isPickup;
    UI.setParams({ info: m.id });
    UI.drawer.open('dl-drawer', { returnFocus: btn, onClose: function () { UI.setParams({ info: null }); } });
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[data-info]') : null;
    if (b) open(b.getAttribute('data-info'), b);
  });

  var initial = UI.param('info');
  if (initial && M.some(function (x) { return x.id === initial; })) {
    var vis = UI.qsa('[data-info="' + initial + '"]').filter(function (x) { return x.offsetParent !== null; })[0];
    open(initial, vis);
  }
})();
