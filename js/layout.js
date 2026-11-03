/* layout.js – מזריק באנר תחזוקה, Header, פס אמון, תפריט, Footer, סרגל הדגמה ו-demo-pill.
   גלובלי: window.Layout. תלוי ב-UI (ui.js) וב-FD_DATA (mock-data.js). */
(function () {
  'use strict';
  var I = function (n, o) { return UI.icon(n, o); };
  var D = window.FD_DATA || {};
  var PHONE = '077-998-5095';
  var TEL = 'tel:0779985095';
  var page = document.body.getAttribute('data-page') || '';

  var NAV = [
    { t: 'בדיקת מצב והזמנה', href: 'login.html', pages: ['login', 'otp', 'status', 'order', 'reissue'] },
    { t: 'מה עלי לעשות?', href: 'guide.html', pages: ['guide'] },
    { t: 'רישיון הכי מהיר', href: 'fastest.html', pages: ['fastest'] },
    { t: 'שיטות מסירה ומחירון', href: 'delivery.html', pages: ['delivery'] }
  ];
  var MORE = [
    { t: 'עמדות איסוף', href: 'pickup.html', page: 'pickup' },
    { t: 'שאלות ותשובות', href: 'faq.html', page: 'faq' },
    { t: 'על השירות', href: 'about.html', page: 'about' },
    { t: 'צור קשר', href: 'contact.html', page: 'contact' }
  ];
  var MENU = [
    { t: 'בדיקת מצב והזמנת משלוח', d: 'איפה הרישיון שלי ואיך הוא יגיע אליי', href: 'login.html', pages: ['login', 'otp', 'status', 'order', 'reissue'] },
    { t: 'מה עלי לעשות עכשיו?', d: 'מסלול לפי המצב: אגרה, צילום, הרשמה', href: 'guide.html', pages: ['guide'] },
    { t: 'רישיון הכי מהיר', d: 'המסלול המהיר ביותר לקבלת הרישיון', href: 'fastest.html', pages: ['fastest'] },
    { t: 'שיטות מסירה ומחירון', d: 'השוואה בין כל אפשרויות המסירה והעלות שלהן', href: 'delivery.html', pages: ['delivery'] },
    { t: 'עמדות איסוף עצמי', d: 'כתובות, שעות פעילות והנחיות הגעה', href: 'pickup.html', pages: ['pickup'] },
    { t: 'שאלות ותשובות', d: 'המענה לשאלות הנפוצות ביותר', href: 'faq.html', pages: ['faq'] },
    { t: 'על השירות', d: 'מי אנחנו, וההרשאה מטעם משרד התחבורה', href: 'about.html', pages: ['about'] },
    { t: 'צור קשר', d: 'טלפון, טופס פנייה ושעות מענה', href: 'contact.html', pages: ['contact'] },
    { t: 'הצהרת נגישות', d: 'התאמות הנגישות באתר ובמוקד', href: 'accessibility.html', pages: ['accessibility'] }
  ];

  function cur(pages) { return pages.indexOf(page) >= 0 ? ' aria-current="page"' : ''; }

  function wordmark(dark) {
    return '<span class="wordmark__text"><span class="wordmark__name">רישיון עד הבית</span><span class="wordmark__sub">מבית דפוס בארי</span></span>' +
      '<span class="wordmark__bars" aria-hidden="true"><span></span><span></span><span></span></span>';
  }

  function hoursLine() {
    return 'א׳–ה׳ <span class="num" dir="ltr">08:00–17:00</span> · שישי וערבי חג <span class="num" dir="ltr">08:00–13:00</span>';
  }

  /* ---------- Maintenance banner ---------- */
  function maintenanceHTML() {
    var m = D.maintenance || {};
    return '<div class="maint" role="region" aria-label="הודעת תחזוקה"><div class="wrap maint__bar">' +
      I('wrench', { cls: 'maint__ico' }) + '<p class="maint__text">' + (m.html || '') + '</p>' +
      '<button type="button" class="maint__close" aria-label="סגירת ההודעה">' + I('x') + '</button></div></div>';
  }

  /* ---------- Header ---------- */
  function headerHTML() {
    var moreCurrent = MORE.some(function (m) { return m.page === page; });
    return '<a class="skip-link" href="#main">דלג לתוכן הראשי</a>' +
      '<header class="site-header"><div class="wrap site-header__bar">' +
      '<a class="wordmark" href="index.html" aria-label="רישיון עד הבית – מבית דפוס בארי, לעמוד הבית">' + wordmark() + '</a>' +
      '<nav class="nav hide-t" aria-label="ניווט ראשי">' +
      NAV.map(function (n) { return '<a class="nav__link" href="' + n.href + '"' + cur(n.pages) + '>' + n.t + '</a>'; }).join('') +
      '<button type="button" class="nav__more' + (moreCurrent ? ' is-current' : '') + '" aria-expanded="false" aria-controls="more-list" id="more-btn">עוד' + I('chevron-down', { size: 18 }) + '</button>' +
      '<ul class="card more-list" id="more-list" hidden>' +
      MORE.map(function (m) { return '<li><a href="' + m.href + '"' + (m.page === page ? ' aria-current="page"' : '') + '>' + m.t + '</a></li>'; }).join('') +
      '</ul></nav>' +
      '<div class="header-tools hide-t">' +
      '<a class="header-phone" href="' + TEL + '">' + I('phone', { size: 20 }) + '<span class="num" dir="ltr">' + PHONE + '</span></a>' +
      '<a class="lang-btn" href="home-ar.html" lang="ar">' + I('globe', { size: 18 }) + 'العربية</a>' +
      '<button type="button" class="a11y-btn" aria-label="אפשרויות נגישות">' + I('accessibility') + '</button>' +
      '</div>' +
      '<div class="header-tools-m only-t">' +
      '<a class="header-phone-m" href="' + TEL + '" aria-label="חיוג למוקד ' + PHONE + '">' + I('phone') + '</a>' +
      '<button type="button" class="menu-btn" id="menu-btn" aria-expanded="false" aria-controls="menu-drawer">' + I('menu', { size: 20 }) + '<span class="menu-btn__t">תפריט</span></button>' +
      '</div>' +
      '</div></header>' +
      '<div class="trust"><div class="wrap trust__bar">' +
      '<div class="trust__items">' +
      '<span class="trust__item">' + I('shield-check', { size: 18 }) + '<span class="hide-m">השירות מופעל בהרשאת משרד התחבורה ולפי הנחיותיו</span><span class="only-m">בהרשאת משרד התחבורה</span></span>' +
      '<span class="trust__item hide-m">' + I('lock', { size: 18 }) + 'המידע שלכם מאובטח</span>' +
      '</div>' +
      '<span class="mot-placeholder hide-t">לוגו משרד התחבורה – בכפוף לאישור</span>' +
      '</div></div>';
  }

  function menuHTML() {
    return '<aside class="drawer drawer--menu" id="menu-drawer" role="dialog" aria-modal="true" aria-labelledby="menu-title" hidden>' +
      '<div class="dialog__head"><p class="drawer__title" id="menu-title" data-dialog-title tabindex="-1">תפריט</p>' +
      '<button type="button" class="icon-btn" aria-label="סגירת התפריט" data-close-dialog>' + I('x') + '</button></div>' +
      '<nav aria-label="תפריט ראשי"><ul class="menu-list">' +
      MENU.map(function (m) {
        return '<li><a href="' + m.href + '"' + cur(m.pages) + '><span class="menu-list__text"><span class="menu-list__t">' + m.t + '</span><span class="menu-list__d">' + m.d + '</span></span>' + I('chevron-forward-rtl', { size: 20 }) + '</a></li>';
      }).join('') +
      '</ul></nav>' +
      '<div class="menu-call">' +
      '<p class="menu-call__t">' + I('headset', { size: 20 }) + 'מוקד שירות</p>' +
      '<a class="menu-call__phone" href="' + TEL + '"><span class="num" dir="ltr">' + PHONE + '</span></a>' +
      '<p class="small muted">' + hoursLine() + '</p>' +
      '</div>' +
      '<div class="menu-lang"><span class="chip chip--static" aria-current="true">עברית</span><a class="chip chip--static" href="home-ar.html" lang="ar">العربية</a></div>' +
      '</aside>';
  }

  /* ---------- Footer ---------- */
  function footerHTML() {
    return '<footer class="site-footer"><div class="wrap site-footer__inner">' +
      '<div class="g3 site-footer__cols">' +
      '<div class="site-footer__brand"><span class="wordmark wordmark--dark">' + wordmark(true) + '</span>' +
      '<p class="site-footer__auth">' + I('shield-check', { size: 18 }) + 'השירות מופעל בהרשאת משרד התחבורה ולפי הנחיותיו</p></div>' +
      '<nav aria-label="קישורי שירות"><p class="site-footer__h">שירות</p><ul class="site-footer__list">' +
      '<li><a href="faq.html">שאלות ותשובות</a></li><li><a href="contact.html">צור קשר</a></li><li><a href="pickup.html">עמדות איסוף</a></li><li><a href="delivery.html">שיטות מסירה</a></li></ul></nav>' +
      '<nav aria-label="מידע משפטי"><p class="site-footer__h">מידע</p><ul class="site-footer__list">' +
      '<li><a href="accessibility.html">הצהרת נגישות</a></li><li><a href="#">מדיניות פרטיות</a></li><li><a href="#">תנאי שימוש</a></li><li><a href="about.html">איך תדעו שזה אנחנו</a></li></ul></nav>' +
      '</div>' +
      '<div class="site-footer__bottom"><span>© דפוס בארי</span><span>מוקד שירות: <a href="' + TEL + '"><span class="num" dir="ltr">' + PHONE + '</span></a> · א׳–ה׳ <span class="num" dir="ltr">08:00–17:00</span></span></div>' +
      '</div></footer>';
  }

  function pillHTML() {
    return '<div class="demo-pill" role="region" aria-label="סרגל הדגמה">' +
      '<span class="demo-pill__body" id="demo-pill-body"><span class="demo-bar__label">מצב הדגמה – לא חלק מהאתר</span>' +
      '<a href="prototype-index.html">לאינדקס המסכים</a></span>' +
      '<button type="button" class="demo-pill__toggle" aria-expanded="true" aria-controls="demo-pill-body" aria-label="קיפול סרגל ההדגמה">' +
      '<svg class="ico ico--18" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3h18v18H3zM9 3v18"></path></svg></button></div>';
  }

  /* ---------- Demo bar (API לעמודים) ----------
     Layout.demoBar({ items:[{label, pressed, title, href, onClick}], toggles:[...], note:'html', index:true }) */
  function demoBar(cfg) {
    var slot = UI.qs('[data-slot="demo-bar"]');
    if (!slot) return;
    cfg = cfg || {};
    var html = '<div class="demo-bar" role="region" aria-label="סרגל הדגמה"><div class="wrap demo-bar__inner">' +
      '<span class="demo-bar__label">מצב הדגמה – לא חלק מהאתר</span>';
    if (cfg.prefix) html += '<span class="demo-bar__muted">' + cfg.prefix + '</span>';
    (cfg.items || []).forEach(function (it, i) {
      if (it.href) html += '<a class="demo-chip" href="' + it.href + '" aria-current="' + (it.pressed ? 'page' : 'false') + '"' + (it.title ? ' title="' + UI.esc(it.title) + '"' : '') + '>' + it.label + '</a>';
      else html += '<button type="button" class="demo-chip" data-demo-i="' + i + '" aria-pressed="' + (it.pressed ? 'true' : 'false') + '"' + (it.title ? ' title="' + UI.esc(it.title) + '"' : '') + '>' + it.label + '</button>';
    });
    if (cfg.note) html += '<span class="demo-bar__muted">' + cfg.note + '</span>';
    if (cfg.index !== false) html += '<a class="demo-bar__index" href="prototype-index.html">לאינדקס</a>';
    html += '</div></div>';
    slot.innerHTML = html;
    UI.qsa('[data-demo-i]', slot).forEach(function (b) {
      b.addEventListener('click', function () {
        var it = cfg.items[Number(b.getAttribute('data-demo-i'))];
        if (it && it.onClick) it.onClick(b);
      });
    });
  }

  /* ---------- Behaviour ---------- */
  function setupMore() {
    var btn = document.getElementById('more-btn');
    var list = document.getElementById('more-list');
    if (!btn || !list) return;
    // מצב לוגי נפרד מ-hidden: בזמן אנימציית היציאה הרשימה עדיין גלויה אבל כבר "סגורה"
    var isOpen = false;
    function set(open) {
      isOpen = !!open;
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      if (isOpen) UI.show(list); else UI.hide(list);
    }
    btn.addEventListener('click', function (e) { e.stopPropagation(); set(!isOpen); });
    document.addEventListener('click', function (e) { if (isOpen && !list.contains(e.target) && e.target !== btn) set(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && isOpen) { set(false); btn.focus(); } });
    list.addEventListener('focusout', function (e) {
      if (e.relatedTarget && !list.contains(e.relatedTarget) && e.relatedTarget !== btn) set(false);
    });
    btn.addEventListener('focusout', function (e) {
      if (e.relatedTarget && !list.contains(e.relatedTarget)) set(false);
    });
    return set;
  }

  function setupMenu() {
    var btn = document.getElementById('menu-btn');
    if (!btn) return;
    btn.addEventListener('click', openMenu);
  }
  function openMenu() {
    var btn = document.getElementById('menu-btn');
    if (btn) btn.setAttribute('aria-expanded', 'true');
    UI.drawer.open('menu-drawer', { returnFocus: btn, onClose: function () { if (btn) btn.setAttribute('aria-expanded', 'false'); } });
  }

  function setupPill() {
    var t = UI.qs('.demo-pill__toggle');
    if (!t) return;
    t.addEventListener('click', function () {
      var open = t.getAttribute('aria-expanded') === 'true';
      t.setAttribute('aria-expanded', open ? 'false' : 'true');
      t.setAttribute('aria-label', open ? 'פתיחת סרגל ההדגמה' : 'קיפול סרגל ההדגמה');
      document.getElementById('demo-pill-body').hidden = open;
    });
  }

  function init() {
    var maintOn = (D.maintenance && D.maintenance.active) || UI.param('maint') === '1';
    var h = UI.qs('[data-slot="header"]');
    if (h) {
      h.innerHTML = (maintOn ? maintenanceHTML() : '') + headerHTML();
      var mc = UI.qs('.maint__close', h);
      if (mc) mc.addEventListener('click', function () {
        var m = UI.qs('.maint', h); if (m) m.remove();
        var skip = UI.qs('.skip-link'); if (skip) skip.focus();
        if (window.Layout.onMaintClose) window.Layout.onMaintClose();
      });
      document.body.insertAdjacentHTML('beforeend', menuHTML());
      // רכיב הנגישות עצמו טרם נבחר – באב-הטיפוס הכפתור מודיע על כך (לא מבוי סתום)
      var ab = UI.qs('.a11y-btn', h);
      if (ab) ab.addEventListener('click', function () { UI.toast('תפריט הנגישות [לאישור]'); });
    }
    var f = UI.qs('[data-slot="footer"]');
    if (f) {
      f.innerHTML = footerHTML();
      if (!UI.qs('[data-slot="demo-bar"]') && !document.body.hasAttribute('data-no-pill')) document.body.insertAdjacentHTML('beforeend', pillHTML());
    }
    var setMore = setupMore();
    setupMenu();
    setupPill();
    var demo = UI.param('demo');
    if (demo === 'menu') openMenu();
    if (demo === 'more' && setMore) setMore(true);
  }

  window.Layout = { demoBar: demoBar, openMenu: openMenu, hoursLine: hoursLine, PHONE: PHONE, TEL: TEL, maintenanceHTML: maintenanceHTML };
  init();
})();
