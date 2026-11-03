/* delivery.js – P13: טבלה (דסקטופ) / כרטיסים (≤640) מתוך FD_DATA.delivery_methods,
   כפתור "?" פותח מגירה. ?info=<method id> פותח את המגירה בטעינה. */
(function () {
  'use strict';
  var M = (window.FD_DATA && window.FD_DATA.delivery_methods) || [];
  var esc = UI.esc;

  // טקסט מהנתונים → HTML: [..] מסומן כ-tbc, מספרים/שעות עטופים ב-num
  function fmt(s) {
    // מירכאות ישרות בנתונים (עמדת "על הקו") → ״…״ לפי סגנון הבית (QA_COPY 2.6)
    s = String(s == null ? '' : s).replace(/"([^"]+)"/g, '״$1״');
    return esc(s).split(/(\[[^\]]*\])/).map(function (part) {
      if (/^\[.*\]$/.test(part)) return '<span class="tbc">' + part + '</span>';
      return part.replace(/\d+(?:[.:–-]\d+)*/g, function (n) { return '<span class="num" dir="ltr">' + n + '</span>'; });
    }).join('');
  }
  // באיסוף עצמי אין משלוח, ולכן אין ערך למעקב: null → השורה לא מוצגת (CLAUDE.md §3.4, H-02)
  function track(m) {
    if (m.tracking) return m.group === 'בדואר' ? 'מעקב דואר' : 'כן, שליח';
    return m.group === 'איסוף עצמי' ? null : 'ללא מעקב';
  }
  // השוואה בלי פיסוק ורווחים: "למחרת יום ההזמנה, מ-11:00" = "למחרת יום ההזמנה מ-11:00"
  function norm(s) { return String(s || '').replace(/[\s,.·]/g, ''); }
  function tagCls(t) {
    if (t === 'ללא עלות') return 'tag--free';
    if (t === 'ללא מעקב') return 'tag--notrack';
    if (/מהיר/.test(t)) return 'tag--fast';
    return 'tag--free';
  }
  // התגים מהנתונים; "ללא עלות" לא חוזר כתג כשהמחיר עצמו כבר "ללא עלות"
  function tags(m) {
    return (m.tags || []).filter(function (t) { return !(t === 'ללא עלות' && m.price === 0); })
      .map(function (t) { return '<span class="tag ' + tagCls(t) + '">' + esc(t) + '</span>'; }).join('');
  }
  // שורת התועלת (כמו בשלב 1 בהזמנה): ✓ לכל benefit; דואר רגיל – שורה ניטרלית
  function benefits(m) {
    var b = m.benefits || [];
    if (!b.length) {
      return m.id === 'regular_mail' ? '<p class="dl-ben dl-ben--plain">ללא מעקב · נמסר רק לתיבה שיש עליה שם מזהה</p>' : '';
    }
    return '<ul class="dl-ben">' + b.map(function (x) {
      return '<li>' + UI.icon('check', { size: 16 }) + '<span>' + fmt(x) + '</span></li>';
    }).join('') + '</ul>';
  }
  function qBtn(m) {
    return '<button type="button" class="dl-q" data-info="' + esc(m.id) + '" aria-label="' + esc('פרטים נוספים על ' + m.name) + '">' + UI.icon('help-circle', { size: 20 }) + '</button>';
  }
  function priceCls(m) { return m.price === 0 ? ' price-free' : ''; }
  var ORDER = '<a class="btn btn--secondary info-btn" href="login.html">להזמנה</a>';

  // אותן קבוצות ואותו סדר כמו בשלב 1 בהזמנה (UX_RECOMMENDATIONS החלטה 2)
  var GROUPS = [
    ['עד הבית', ['express_home', 'regular_home']],
    ['איסוף עצמי', ['pickup_bari', 'pickup_tlv_airport']],
    ['בדואר', ['registered_mail', 'regular_mail']]
  ].map(function (g) {
    return { t: g[0], items: g[1].map(function (id) { return M.filter(function (x) { return x.id === id; })[0]; }).filter(Boolean) };
  }).filter(function (g) { return g.items.length; });

  var table = document.getElementById('dl-table');
  var cards = document.getElementById('dl-cards');
  table.insertAdjacentHTML('beforeend', GROUPS.map(function (g, gi) {
    return '<tbody><tr class="dl-group"><th scope="rowgroup" colspan="6" id="dl-g' + gi + '">' + esc(g.t) + '</th></tr>' +
      g.items.map(function (m) {
        return '<tr><th scope="row" headers="dl-g' + gi + '"><span class="dl-name">' + esc(m.name) + tags(m) + qBtn(m) + '</span>' + benefits(m) + '</th>' +
          '<td>' + fmt(m.eta_rule) + '</td>' +
          '<td>' + fmt(m.how || '') + '</td>' +
          '<td class="dl-price' + priceCls(m) + '">' + fmt(m.price_display) + '</td>' +
          '<td>' + (track(m) || '') + '</td>' +
          '<td>' + ORDER + '</td></tr>';
      }).join('') + '</tbody>';
  }).join(''));
  cards.innerHTML = GROUPS.map(function (g, gi) {
    return '<section class="dl-grp" aria-labelledby="dl-mg' + gi + '"><h2 class="dl-grp__t" id="dl-mg' + gi + '">' + esc(g.t) + '</h2><ul class="dl-cards">' +
      g.items.map(function (m) {
        var t = tags(m);
        return '<li class="card dl-card">' +
          '<div class="dl-card__head"><p class="dl-card__name">' + esc(m.name) + '</p>' + qBtn(m) + '</div>' +
          (t ? '<div class="dl-card__tags">' + t + '</div>' : '') +
          benefits(m) +
          // מובייל (F04/L-11): בלי "· מעקב: …" – התג ושורת התועלת כבר אומרים את זה; שורת המועד רק אם היא לא חוזרת על פריט בשורת התועלת
          ((m.benefits || []).some(function (b) { return norm(b) === norm(m.eta_rule); }) ? '' : '<p>' + fmt(m.eta_rule) + '</p>') +
          (m.how ? '<p class="muted">איך מקבלים: ' + fmt(m.how) + '</p>' : '') +
          '<div class="dl-card__foot"><span class="dl-card__price' + priceCls(m) + '">' + fmt(m.price_display) + '</span>' + ORDER + '</div></li>';
      }).join('') + '</ul></section>';
  }).join('');

  var title = document.getElementById('dl-drawer-t');
  var dl = document.getElementById('dl-drawer-dl');
  var pick = document.getElementById('dl-drawer-pickup');

  function open(id, btn) {
    var m = M.filter(function (x) { return x.id === id; })[0];
    if (!m) return;
    title.textContent = m.name;
    var list = [['זמן אספקה', fmt(m.eta_rule)], ['מחיר', fmt(m.price_display)]];
    if (track(m)) list.push(['מעקב', track(m)]);
    if (m.how) list.push(['איך מקבלים', fmt(m.how)]);
    var ben = benefits(m);
    if (ben) list.push([(m.benefits || []).length ? 'מה מקבלים' : 'שימו לב', ben]);
    if (m.fit) list.push(['למי זה מתאים', fmt(m.fit)]);
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
