/* layout.js – מזריק באנר תחזוקה, Header, פס אמון, תפריט, Footer, סרגל הדגמה ו-demo-pill.
   גלובלי: window.Layout. תלוי ב-UI (ui.js) וב-FD_DATA (mock-data.js). */
(function () {
  'use strict';
  var I = function (n, o) { return UI.icon(n, o); };
  var D = window.FD_DATA || {};
  var PHONE = '077-998-5095';
  var TEL = 'tel:0779985095';
  var page = document.body.getAttribute('data-page') || '';
  // מצב תהליך (החלטה 12 במסמך ההמלצות): <body data-flow="order"> – כותרת ופוטר מינימליים, בלי ניווט ותפריט
  var FLOW = document.body.getAttribute('data-flow') === 'order';

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
    { t: 'צרו קשר', href: 'contact.html', page: 'contact' }
  ];
  var MENU = [
    { t: 'בדיקת מצב והזמנת משלוח', d: 'איפה הרישיון שלי ואיך הוא יגיע אליי', href: 'login.html', pages: ['login', 'otp', 'status', 'order', 'reissue'] },
    { t: 'מה עלי לעשות עכשיו?', d: 'מסלול לפי המצב: אגרה, צילום, הרשמה', href: 'guide.html', pages: ['guide'] },
    { t: 'רישיון הכי מהיר', d: 'המסלול המהיר ביותר לקבלת הרישיון', href: 'fastest.html', pages: ['fastest'] },
    { t: 'שיטות מסירה ומחירון', d: 'השוואה בין כל אפשרויות המסירה והעלות שלהן', href: 'delivery.html', pages: ['delivery'] },
    { t: 'עמדות איסוף עצמי', d: 'כתובות, שעות פעילות והנחיות הגעה', href: 'pickup.html', pages: ['pickup'] },
    { t: 'שאלות ותשובות', d: 'המענה לשאלות הנפוצות ביותר', href: 'faq.html', pages: ['faq'] },
    { t: 'על השירות', d: 'מי אנחנו, וההרשאה מטעם משרד התחבורה', href: 'about.html', pages: ['about'] },
    { t: 'צרו קשר', d: 'טלפון, טופס פנייה ושעות מענה', href: 'contact.html', pages: ['contact'] },
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

  /* ---------- Order-flow mode: וורדמרק + טלפון המוקד + פס אמון; פוטר בשורה אחת ---------- */
  function flowHeaderHTML() {
    return '<a class="skip-link" href="#main">דלג לתוכן הראשי</a>' +
      '<header class="site-header site-header--flow"><div class="wrap site-header__bar">' +
      '<a class="wordmark" href="index.html" aria-label="רישיון עד הבית – מבית דפוס בארי, לעמוד הבית">' + wordmark() + '</a>' +
      '<a class="header-phone header-phone--flow" href="' + TEL + '" aria-label="חיוג למוקד שירות ' + PHONE + '">' + I('phone', { size: 20 }) +
      '<span class="header-phone__lbl hide-m">מוקד שירות</span><span class="num" dir="ltr">' + PHONE + '</span></a>' +
      '</div></header>' +
      '<div class="trust"><div class="wrap trust__bar">' +
      '<div class="trust__items">' +
      '<span class="trust__item">' + I('shield-check', { size: 18 }) + '<span class="hide-m">השירות מופעל בהרשאת משרד התחבורה ולפי הנחיותיו</span><span class="only-m">בהרשאת משרד התחבורה</span></span>' +
      '<span class="trust__item">' + I('lock', { size: 18 }) + '<span class="hide-m">המידע שלכם מאובטח</span><span class="only-m">מאובטח</span></span>' +
      '</div></div></div>';
  }
  function flowFooterHTML() {
    var ext = I('external-link', { size: 16 }) + '<span class="sr-only">(נפתח בלשונית חדשה)</span>';
    return '<footer class="site-footer site-footer--flow"><div class="wrap site-footer__line">' +
      '<span>צריכים עזרה? <a href="' + TEL + '"><span class="num" dir="ltr">' + PHONE + '</span></a></span>' +
      '<span class="site-footer__sep" aria-hidden="true">·</span>' +
      '<a href="accessibility.html" target="_blank" rel="noopener">הצהרת נגישות' + ext + '</a>' +
      '<span class="site-footer__sep" aria-hidden="true">·</span>' +
      '<a href="#" target="_blank" rel="noopener">מדיניות פרטיות' + ext + '</a>' +
      '</div></footer>';
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
      '<li><a href="faq.html">שאלות ותשובות</a></li><li><a href="contact.html">צרו קשר</a></li><li><a href="pickup.html">עמדות איסוף</a></li><li><a href="delivery.html">שיטות מסירה</a></li></ul></nav>' +
      '<nav aria-label="מידע משפטי"><p class="site-footer__h">מידע</p><ul class="site-footer__list">' +
      '<li><a href="accessibility.html">הצהרת נגישות</a></li><li><a href="#">מדיניות פרטיות</a></li><li><a href="#">תנאי שימוש</a></li><li><a href="about.html">איך תדעו שזה אנחנו</a></li></ul></nav>' +
      '</div>' +
      '<div class="site-footer__bottom"><span>© דפוס בארי</span><span>מוקד שירות: <a href="' + TEL + '"><span class="num" dir="ltr">' + PHONE + '</span></a> · א׳–ה׳ <span class="num" dir="ltr">08:00–17:00</span></span></div>' +
      '</div></footer>';
  }

  /* רכיבי ההדגמה (P2-8): במובייל (≤640) מקופלים כברירת מחדל, והבחירה נשמרת לכל הסשן (UI.store 'fd.demoOpen').
     ?clean=1 מסתיר את סרגל ההדגמה ואת ה-pill לגמרי עד ?clean=0 (מבחני משתמשים) */
  var mqM = null;
  try { mqM = window.matchMedia('(max-width:640px)'); } catch (e) { /* */ }
  function demoOpen() {
    var v = UI.store.get('fd.demoOpen', null);
    if (v === true || v === false) return v;
    return !(mqM && mqM.matches);
  }
  function cleanMode() {
    var c = UI.param('clean');
    if (c === '1') UI.store.set('fd.clean', true);
    else if (c === '0') UI.store.remove('fd.clean');
    return UI.store.get('fd.clean', false) === true;
  }
  var CLEAN = cleanMode();
  if (CLEAN) document.documentElement.classList.add('demo-clean');

  function pillHTML() {
    var open = demoOpen();
    return '<div class="demo-pill" role="region" aria-label="סרגל הדגמה">' +
      '<span class="demo-pill__body" id="demo-pill-body"' + (open ? '' : ' hidden') + '><span class="demo-bar__label">מצב הדגמה – לא חלק מהאתר</span>' +
      '<a href="prototype-index.html">לאינדקס המסכים</a></span>' +
      '<button type="button" class="demo-pill__toggle" aria-expanded="' + open + '" aria-controls="demo-pill-body" aria-label="' + (open ? 'קיפול סרגל ההדגמה' : 'פתיחת סרגל ההדגמה') + '">' +
      '<svg class="ico ico--18" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3h18v18H3zM9 3v18"></path></svg></button></div>';
  }

  /* ---------- Demo bar (API לעמודים) ----------
     Layout.demoBar({ items:[{label, pressed, title, href, onClick}], toggles:[...], note:'html', index:true }) */
  function demoBar(cfg) {
    var slot = UI.qs('[data-slot="demo-bar"]');
    if (!slot) return;
    cfg = cfg || {};
    var open = demoOpen();
    // במובייל הסרגל מקופל לשורה אחת: הכפתור "מצב הדגמה" פותח אותו (P2-8); בדסקטופ התווית הרגילה, והכול גלוי
    var html = '<div class="demo-bar' + (open ? '' : ' is-collapsed') + '" role="region" aria-label="סרגל הדגמה"><div class="wrap demo-bar__inner" id="demo-bar-inner">' +
      '<span class="demo-bar__label hide-m">מצב הדגמה – לא חלק מהאתר</span>' +
      '<button type="button" class="demo-bar__toggle only-m" aria-expanded="' + open + '" aria-controls="demo-bar-inner">' +
      '<span class="demo-bar__label">מצב הדגמה</span><span class="demo-bar__muted">– לא חלק מהאתר</span>' + I('chevron-down', { size: 18, cls: 'demo-bar__chev' }) + '</button>';
    if (cfg.prefix) html += '<span class="demo-bar__muted">' + cfg.prefix + '</span>';
    (cfg.items || []).forEach(function (it, i) {
      if (it.href) html += '<a class="demo-chip" href="' + it.href + '" aria-current="' + (it.pressed ? 'page' : 'false') + '"' + (it.title ? ' title="' + UI.esc(it.title) + '"' : '') + '>' + it.label + '</a>';
      else html += '<button type="button" class="demo-chip" data-demo-i="' + i + '" aria-pressed="' + (it.pressed ? 'true' : 'false') + '"' + (it.title ? ' title="' + UI.esc(it.title) + '"' : '') + '>' + it.label + '</button>';
    });
    if (cfg.note) html += '<span class="demo-bar__muted">' + cfg.note + '</span>';
    if (cfg.index !== false) html += '<a class="demo-bar__index" href="prototype-index.html">לאינדקס</a>';
    html += '</div></div>';
    slot.innerHTML = html;
    var tg = UI.qs('.demo-bar__toggle', slot);
    tg.addEventListener('click', function () {
      var now = tg.getAttribute('aria-expanded') !== 'true';
      tg.setAttribute('aria-expanded', now ? 'true' : 'false');
      UI.qs('.demo-bar', slot).classList.toggle('is-collapsed', !now);
      UI.store.set('fd.demoOpen', now);
    });
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
    // P3-10: חיצים בין הפריטים (לא גלילת העמוד); Home/End לראשון/לאחרון. ArrowDown על הכפתור פותח ומתמקד בראשון
    function links() { return UI.qsa('a', list); }
    function move(e, idx) { e.preventDefault(); var l = links(); if (!l.length) return; l[(idx + l.length) % l.length].focus(); }
    btn.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        if (!isOpen) set(true);
        move(e, e.key === 'ArrowDown' ? 0 : -1);
      }
    });
    list.addEventListener('keydown', function (e) {
      var l = links(), i = l.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') move(e, i + 1);
      else if (e.key === 'ArrowUp') { if (i <= 0) { e.preventDefault(); btn.focus(); } else move(e, i - 1); }
      else if (e.key === 'Home') move(e, 0);
      else if (e.key === 'End') move(e, -1);
    });
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
      UI.store.set('fd.demoOpen', !open);
    });
  }

  // אחרי סגירת באנר התחזוקה (P3-5): הפוקוס עובר לתוכן הראשי ולא לקישור הדילוג (שהיה צץ מעל הוורדמרק)
  function focusMain() {
    var mn = document.getElementById('main');
    if (!mn) return;
    if (!mn.hasAttribute('tabindex')) mn.setAttribute('tabindex', '-1');
    try { mn.focus({ preventScroll: true }); } catch (e) { mn.focus(); }
  }

  /* כותרת דביקה במובייל (P3-6, ≤640, לא בתהליך ההזמנה): נעלמת בגלילה למטה וחוזרת בגלילה למעלה,
     כך שהתפריט והטלפון זמינים מכל מקום בעמוד בלי לתפוס מקום בזמן קריאה. חוזרת גם כשפוקוס נכנס אליה.
     scroll-padding-top ב-CSS שומר שפוקוס מקלדת לא ייפול מתחתיה (UI.ensureVisible מתחשב בו) */
  function setupStickyHeader() {
    var hd = UI.qs('.site-header');
    if (!hd || !mqM) return;
    document.documentElement.classList.add('has-sticky-header');
    var lastY = window.pageYOffset, tucked = false, ticking = false;
    function set(t) { if (t !== tucked) { tucked = t; hd.classList.toggle('is-tucked', t); } }
    function onScroll() {
      ticking = false;
      if (!mqM.matches) { set(false); return; }
      if (document.body.style.overflow === 'hidden') return; // דיאלוג פתוח – הרקע לא באמת זז
      var y = window.pageYOffset, dy = y - lastY;
      if (y < hd.offsetHeight + 80) set(false);
      else if (dy > 6) set(true);
      else if (dy < -6) set(false);
      if (Math.abs(dy) > 6 || y < 80) lastY = y;
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); } }, { passive: true });
    hd.addEventListener('focusin', function () { set(false); });
  }

  function init() {
    var maintOn = (D.maintenance && D.maintenance.active) || UI.param('maint') === '1';
    var h = UI.qs('[data-slot="header"]');
    if (h) {
      h.innerHTML = (maintOn ? maintenanceHTML() : '') + (FLOW ? flowHeaderHTML() : headerHTML());
      var mc = UI.qs('.maint__close', h);
      if (mc) mc.addEventListener('click', function () {
        var m = UI.qs('.maint', h); if (m) m.remove();
        focusMain();
        if (window.Layout.onMaintClose) window.Layout.onMaintClose();
      });
      if (!FLOW) document.body.insertAdjacentHTML('beforeend', menuHTML());
      // רכיב הנגישות עצמו טרם נבחר – באב-הטיפוס הכפתור מודיע על כך (לא מבוי סתום)
      var ab = UI.qs('.a11y-btn', h);
      if (ab) ab.addEventListener('click', function () { UI.toast('תפריט הנגישות [לאישור]', { icon: 'info' }); });
    }
    var f = UI.qs('[data-slot="footer"]');
    if (f) {
      f.innerHTML = FLOW ? flowFooterHTML() : footerHTML();
      if (!CLEAN && !UI.qs('[data-slot="demo-bar"]') && !document.body.hasAttribute('data-no-pill')) {
        document.body.insertAdjacentHTML('beforeend', pillHTML());
        document.documentElement.classList.add('has-pill'); // מרווח בתחתית הפוטר, כדי שה-pill לא יסתיר את שורת המוקד
      }
    }
    var setMore = setupMore();
    setupMenu();
    if (!FLOW) setupStickyHeader();
    setupPill();
    var demo = UI.param('demo');
    if (demo === 'menu' && !FLOW) openMenu();
    if (demo === 'more' && setMore) setMore(true);
  }

  window.Layout = { focusMain: focusMain, demoBar: demoBar, openMenu: openMenu, hoursLine: hoursLine, PHONE: PHONE, TEL: TEL, maintenanceHTML: maintenanceHTML };
  init();
})();
