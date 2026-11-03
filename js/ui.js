/* ui.js – כלים משותפים לכל העמודים. גלובלי: window.UI
   תלוי ב-js/icons.js (window.FD_ICONS). נטען כ-<script defer>. */
(function () {
  'use strict';

  var ICONS = window.FD_ICONS || {};

  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------- Icons ---------- */
  // UI.icon('truck', {size:20, cls:'x', style:'color:#fff'}) → מחרוזת <svg>
  function icon(name, opt) {
    opt = opt || {};
    var size = opt.size || 24;
    var cls = 'ico' + (size !== 24 ? ' ico--' + size : '') + (opt.cls ? ' ' + opt.cls : '');
    var label = opt.label ? ' role="img" aria-label="' + esc(opt.label) + '"' : ' aria-hidden="true"';
    var style = opt.style ? ' style="' + esc(opt.style) + '"' : '';
    return '<svg class="' + cls + '" viewBox="0 0 24 24"' + label + style + ' focusable="false">' + (ICONS[name] || '') + '</svg>';
  }

  // הידרציה: <svg class="ico" data-icon="truck" aria-hidden="true"></svg> בתוך ה-HTML הסטטי.
  function hydrateIcons(root) {
    var list = [];
    if (root && root.nodeType === 1 && root.matches && root.matches('svg[data-icon]')) list.push(root);
    list = list.concat(qsa('svg[data-icon]', root && root.nodeType === 1 ? root : document));
    list.forEach(function (el) {
      var n = el.getAttribute('data-icon');
      if (el.getAttribute('data-hydrated') === n) return;
      el.setAttribute('viewBox', '0 0 24 24');
      el.setAttribute('focusable', 'false');
      if (!el.hasAttribute('aria-label') && !el.hasAttribute('aria-hidden')) el.setAttribute('aria-hidden', 'true');
      if (!el.classList.contains('ico')) el.classList.add('ico');
      el.innerHTML = ICONS[n] || '';
      el.setAttribute('data-hydrated', n);
    });
  }

  /* ---------- URL params ---------- */
  var _params = null;
  function params() {
    if (!_params) { try { _params = new URLSearchParams(window.location.search); } catch (e) { _params = new URLSearchParams(''); } }
    return _params;
  }
  // Back/Forward משנה את ה-URL בלי טעינה – הקאש מתאפס
  window.addEventListener('popstate', function () { _params = null; });
  function param(name) { return params().get(name); }
  function setParams(obj, push) {
    try {
      var p = new URLSearchParams(window.location.search);
      Object.keys(obj).forEach(function (k) {
        if (obj[k] === null || obj[k] === undefined || obj[k] === '') p.delete(k); else p.set(k, obj[k]);
      });
      var q = p.toString();
      var url = window.location.pathname + (q ? '?' + q : '') + window.location.hash;
      if (push) history.pushState(null, '', url); else history.replaceState(null, '', url);
      _params = null;
    } catch (e) { /* file:// בדפדפנים מסוימים – מתעלמים */ }
  }

  /* ---------- Storage (sessionStorage עם try/catch, נפילה לזיכרון) ---------- */
  var mem = {};
  var store = {
    get: function (key, fallback) {
      try {
        var v = window.sessionStorage.getItem(key);
        if (v !== null) return JSON.parse(v);
      } catch (e) { if (key in mem) return mem[key]; }
      return key in mem ? mem[key] : fallback;
    },
    set: function (key, val) {
      mem[key] = val;
      try { window.sessionStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* storage חסום */ }
    },
    remove: function (key) {
      delete mem[key];
      try { window.sessionStorage.removeItem(key); } catch (e) { /* */ }
    }
  };

  /* ---------- Motion (כניסה/יציאה) ----------
     show(el): מוריד hidden ומנגן את מעבר הכניסה מ-.is-off (מוגדר ב-CSS לכל רכיב).
     hide(el): מוסיף .is-off.is-closing, הרכיב inert בזמן היציאה, ו-hidden רק בסוף המעבר.
     מעבר CSS ולא keyframes – פתיחה בזמן יציאה מתהפכת מהמקום הנוכחי. prefers-reduced-motion: מיידי. */
  var reduceMQ = null;
  try { reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)'); } catch (e) { /* */ }
  function reducedMotion() { return !!(reduceMQ && reduceMQ.matches); }
  function toMs(v) { v = String(v || '').trim(); var n = parseFloat(v) || 0; return /ms$/.test(v) ? n : n * 1000; }
  function transitionMs(el) {
    try {
      var cs = window.getComputedStyle(el);
      var d = cs.transitionDuration.split(','), l = cs.transitionDelay.split(','), m = 0;
      for (var i = 0; i < d.length; i++) m = Math.max(m, toMs(d[i]) + toMs(l[i] || l[0]));
      return m;
    } catch (e) { return 0; }
  }
  function releaseClosingInert(el) {
    if (!el.hasAttribute('data-closing-inert')) return;
    el.removeAttribute('data-closing-inert');
    if (!el.hasAttribute('data-inerted')) el.removeAttribute('inert');
  }
  function show(el) {
    if (!el) return;
    clearTimeout(el._fdHide); el._fdHide = null;
    el.classList.remove('is-closing');
    releaseClosingInert(el);
    if (el.hidden) {
      el.classList.add('is-off');
      el.hidden = false;
      void el.offsetWidth; // מצב ההתחלה נקלט לפני שמסירים is-off
    }
    el.classList.remove('is-off');
  }
  function hide(el, instant) {
    if (!el || el.hidden) return;
    clearTimeout(el._fdHide); el._fdHide = null;
    function done() {
      el._fdHide = null;
      el.hidden = true;
      el.classList.remove('is-off', 'is-closing');
      releaseClosingInert(el);
    }
    if (instant || reducedMotion()) { done(); return; }
    el.classList.add('is-closing', 'is-off');
    if (!el.hasAttribute('inert')) { el.setAttribute('inert', ''); el.setAttribute('data-closing-inert', ''); }
    var ms = transitionMs(el);
    if (!ms) { done(); return; }
    el._fdHide = setTimeout(done, ms + 30);
  }
  /* ---------- GSAP – שכבת שיפור לתוכן שנפתח במקום ----------
     js/vendor/gsap.min.js (ו-Flip.min.js ב-FAQ) נטען לפני ui.js רק בעמודים שמשתמשים בו. בלי GSAP (חסום / לא נטען)
     הכול עובד: מצב ה-DOM (hidden, aria-expanded, פוקוס) נקבע קודם ובלי תלות באנימציה, והחשיפה חוזרת ל-fade של WAAPI.
     גובה אמיתי (0 ↔ auto) נמדד פעם אחת לפני הכתיבה (קריאה ואז כתיבה, בלי layout thrash), ובסוף clearProps כדי שה-CSS ישלוט.
     prefers-reduced-motion (gsap.matchMedia): אין תנועה בכלל – המצב הסופי מיידי, ותנועה שרצה ברגע המעבר קופצת לסוף. */
  var G = null, motionOn = false, compact = false;
  var PANEL_PROPS = 'height,paddingTop,paddingBottom,marginTop,opacity,overflow';
  try {
    if (window.gsap && window.gsap.matchMedia) {
      G = window.gsap;
      if (window.Flip) G.registerPlugin(window.Flip);
      G.defaults({ duration: 0.2, ease: 'power2.out', overwrite: 'auto' }); // 200ms; power2.out ≈ --ease cubic-bezier(.2,.7,.2,1)
      G.matchMedia().add({
        ok: '(prefers-reduced-motion: no-preference)',
        reduce: '(prefers-reduced-motion: reduce)',
        compact: '(max-width:640px)'
      }, function (ctx) {
        motionOn = !!ctx.conditions.ok;
        compact = !!ctx.conditions.compact;
        if (!motionOn) G.globalTimeline.getChildren(false).forEach(function (a) { a.progress(1); });
      });
    }
  } catch (e) { G = null; motionOn = false; }
  function anim() { return !!G && motionOn; }
  function freeze(el) { // מצב סופי מיידי: עוצרים תנועה קודמת ומנקים את הסגנון שהשאירה
    if (!G || !el) return;
    G.killTweensOf(el);
    G.set(el, { clearProps: PANEL_PROPS });
    releaseClosingInert(el);
  }
  function boxOf(el, cs) {
    return { height: parseFloat(cs.height) || 0, paddingTop: cs.paddingTop, paddingBottom: cs.paddingBottom, marginTop: cs.marginTop, opacity: +cs.opacity };
  }
  // פתיחה עם גובה אמיתי. fromZero: האלמנט כבר גלוי (הוחלף ב-innerHTML / class) ומתחיל מגובה 0
  function expand(el, opt) {
    if (!el) return;
    opt = opt || {};
    var wasHidden = el.hidden;
    var running = !!(G && G.isTweening(el));
    var cur = running ? boxOf(el, window.getComputedStyle(el)) : null; // סגירה באמצע: ממשיכים מהגובה הנוכחי
    el.hidden = false;
    if (!anim()) { freeze(el); return; }
    if (!wasHidden && !running && !opt.fromZero) return;
    freeze(el);
    var to = boxOf(el, window.getComputedStyle(el));
    if (!to.height) return; // display:none מה-CSS – אין מה להנפיש
    var from = cur || { height: 0, paddingTop: 0, paddingBottom: 0, marginTop: 0, opacity: 0 };
    from.overflow = 'hidden';
    to.opacity = 1;
    to.clearProps = PANEL_PROPS;
    G.fromTo(el, from, to);
  }
  // סגירה: aria כבר עודכן אצל הקורא; כאן רק התנועה, inert בזמן היציאה, ו-hidden (או done) בסוף. יציאה 150ms
  function collapse(el, opt) {
    if (!el || el.hidden) return;
    opt = opt || {};
    var finish = function () {
      if (opt.done) opt.done(); else el.hidden = true;
      freeze(el);
    };
    if (!anim() || !el.offsetHeight) { finish(); return; }
    G.killTweensOf(el);
    if (!el.hasAttribute('inert')) { el.setAttribute('inert', ''); el.setAttribute('data-closing-inert', ''); }
    G.fromTo(el, { height: el.offsetHeight, overflow: 'hidden' },
      { height: 0, paddingTop: 0, paddingBottom: 0, marginTop: 0, opacity: 0, duration: 0.15, onComplete: finish });
  }
  // תוכן שמתחלף בתוך תיבה גלויה: הגובה זז מהישן לחדש, והתוכן החדש נכנס ב-fade קצר
  function swap(box, mutate) {
    if (!box) return;
    if (!anim() || box.hidden || !box.offsetHeight) { var was = box.hidden; mutate(); if (was || !G) reveal(box, true); return; } // תיבה סגורה נפתחת; בלי GSAP – fade
    var h0 = box.offsetHeight;          // קריאה
    G.killTweensOf(box);
    G.set(box, { clearProps: 'height,overflow' });
    mutate();                            // כתיבה (DOM)
    var h1 = box.offsetHeight;          // קריאה אחת אחרי השינוי
    var kids = G.utils.toArray(box.children).filter(function (k) { return !k.hidden; });
    var tl = G.timeline();
    tl.fromTo(box, { height: h0, overflow: 'hidden' }, { height: h1, clearProps: 'height,overflow' }, 0)
      .fromTo(kids, { opacity: 0, y: 6 }, { opacity: 1, y: 0, clearProps: 'opacity,transform' }, 0);
  }
  // כניסת מקטע שהוחלף (שלב בתהליך): opacity + הזזה קטנה בכיוון ההתקדמות. לא autoAlpha – הפוקוס עובר מיד ל-H1 שבתוכו
  function enter(el, forward) {
    if (!anim() || !el) return null;
    var rtl = (document.documentElement.getAttribute('dir') || 'rtl') === 'rtl';
    var x = 12 * (forward ? 1 : -1) * (rtl ? -1 : 1); // RTL: "קדימה" נכנס משמאל
    return G.fromTo(el, { opacity: 0, x: x }, { opacity: 1, x: 0, clearProps: 'opacity,transform' });
  }
  // מסך הצלחה (תשלום/בקשה התקבלה): המקטע נכנס, העיגול מופיע, וה-✓ "נכתב" (stroke-dashoffset). ~0.35s בסך הכול
  function success(section, circle) {
    if (!anim() || !section) return null;
    var path = circle && circle.querySelector('path');
    var len = 0;
    try { len = path ? path.getTotalLength() : 0; } catch (e) { len = 0; }
    var tl = G.timeline({ defaults: { duration: 0.2 } });
    tl.addLabel('in', 0)
      .fromTo(section, { opacity: 0, y: 8 }, { opacity: 1, y: 0, clearProps: 'opacity,transform' }, 'in');
    if (circle) tl.fromTo(circle, { scale: 0.85, opacity: 0 }, { scale: 1, opacity: 1, clearProps: 'opacity,transform' }, 'in+=0.04');
    if (len) tl.fromTo(path, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 0.22, ease: 'power1.inOut', clearProps: 'strokeDasharray,strokeDashoffset' }, '<0.08');
    return tl;
  }
  // ערך שהתעדכן מחוץ למוקד העין (שורת "בחרתם" בסרגל הדביק): fade קצר, בלי ספירה של מספרים
  function refresh(el) {
    if (!anim() || !el) return;
    G.fromTo(el, { opacity: 0.35, y: 3 }, { opacity: 1, y: 0, duration: 0.15, clearProps: 'opacity,transform' });
  }
  // Flip: אלמנטים שנשארים זזים למקומם החדש, אלמנטים שנכנסים עושים fade. mutate משנה את ה-DOM
  function flip(targets, mutate) {
    var F = window.Flip;
    if (!anim() || !F) { mutate(); return; }
    var els = G.utils.toArray(targets);
    var state = F.getState(els);
    mutate();
    F.from(state, {
      targets: els, duration: 0.2, ease: 'power2.out', prune: true,
      onEnter: function (inEls) { return G.fromTo(inEls, { opacity: 0 }, { opacity: 1, duration: 0.2, clearProps: 'opacity' }); }
    });
  }
  // חשיפת תוכן שנפתח במקום (אקורדיון, תשובה) – רק בפעולת משתמש. עם GSAP: גובה אמיתי + fade.
  // בלי GSAP: opacity בלבד ב-WAAPI (150ms). force: גם אם כבר גלוי והתוכן הוחלף
  function reveal(el, force) {
    if (!el) return;
    if (G) { expand(el, { fromZero: !!force && !el.hidden }); return; }
    var wasHidden = el.hidden;
    el.hidden = false;
    if (!wasHidden && !force) return;
    if (reducedMotion() || !el.animate) return;
    try {
      var root = window.getComputedStyle(document.documentElement);
      var ms = toMs(root.getPropertyValue('--dur-fast'));
      if (ms) el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: ms, easing: root.getPropertyValue('--ease').trim() || 'ease-out' });
    } catch (e) { /* */ }
  }
  function conceal(el) { if (G) collapse(el); else if (el) el.hidden = true; }
  // iOS Safari מפעיל :active במגע רק כשיש מאזין touchstart
  try { document.addEventListener('touchstart', function () {}, { passive: true }); } catch (e) { /* */ }

  /* ---------- Accordion ---------- */
  // מבנה: root מכיל .acc > button.acc__btn[aria-controls] + .acc__panel#id
  function accordion(root, opt) {
    opt = opt || {};
    var single = opt.single !== false;
    var btns = qsa('.acc__btn', root);
    function set(btn, open, animate) {
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      var p = document.getElementById(btn.getAttribute('aria-controls'));
      if (!p) return;
      if (animate) { if (open) reveal(p); else conceal(p); } else { freeze(p); p.hidden = !open; }
    }
    btns.forEach(function (b, i) {
      set(b, i === opt.openIndex);
      b.addEventListener('click', function () {
        var open = b.getAttribute('aria-expanded') !== 'true';
        if (single && open) btns.forEach(function (o) { if (o !== b && o.getAttribute('aria-expanded') === 'true') set(o, false, true); });
        set(b, open, true);
        // הפאנל נפתח מתחת לכפתור – אם הוא מחוץ למסך, גוללים כך שהכפתור והתחלת התשובה נראים (הפוקוס נשאר על הכפתור, לפי דפוס האקורדיון)
        if (open) { var pp = document.getElementById(b.getAttribute('aria-controls')); setTimeout(function () { ensureVisible(pp, { anchor: b, minVisible: 80 }); }, reducedMotion() ? 0 : 230); }
        if (opt.onToggle) opt.onToggle(i, open);
      });
    });
    return {
      open: function (i) { btns.forEach(function (b, j) { set(b, j === i ? true : (single ? false : b.getAttribute('aria-expanded') === 'true')); }); },
      closeAll: function () { btns.forEach(function (b) { set(b, false); }); }
    };
  }

  /* ---------- Dialogs (drawer + modal) ---------- */
  var FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]):not([type=hidden]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
  var current = null;   // {el, returnFocus, onClose}
  var scrim = null;

  function backgroundEls() {
    return qsa('body > *').filter(function (el) {
      return el !== scrim && (!current || el !== current.el) && !el.classList.contains('toast') && el.tagName !== 'SCRIPT';
    });
  }

  function trap(e) {
    if (!current) return;
    if (e.key === 'Escape') { e.preventDefault(); closeDialog(); return; }
    if (e.key !== 'Tab') return;
    var f = qsa(FOCUSABLE, current.el).filter(function (x) { return x.offsetParent !== null || x === document.activeElement; });
    if (!f.length) { e.preventDefault(); return; }
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && (document.activeElement === first || !current.el.contains(document.activeElement))) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function openDialog(id, opt) {
    opt = opt || {};
    var el = typeof id === 'string' ? document.getElementById(id) : id;
    if (!el) return;
    if (current) closeDialog(true);
    if (!scrim) {
      scrim = document.createElement('div');
      scrim.className = 'scrim';
      scrim.hidden = true;
      scrim.addEventListener('click', function () { closeDialog(); });
    }
    // הפאנל וה-scrim ילדים ישירים של body כדי ש-inert יעבוד על השאר. מזיזים רק כשצריך:
    // הזזה ב-DOM מאפסת מעבר שרץ (למשל פתיחה מחדש באמצע יציאה)
    if (scrim.parentNode !== document.body) document.body.appendChild(scrim);
    if (el.parentNode !== document.body) document.body.appendChild(el);
    show(scrim);
    show(el);
    bindSwipe(el);
    current = { el: el, returnFocus: opt.returnFocus || document.activeElement, onClose: opt.onClose };
    backgroundEls().forEach(function (b) { b.setAttribute('inert', ''); b.setAttribute('data-inerted', ''); });
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', trap, true);
    var target = qs('[data-dialog-title]', el) || qs('h2,h3', el) || qs(FOCUSABLE, el);
    if (target) {
      if (!target.hasAttribute('tabindex') && !target.matches(FOCUSABLE)) target.setAttribute('tabindex', '-1');
      try { target.focus({ preventScroll: true }); } catch (e) { target.focus(); }
    }
    if (opt.onOpen) opt.onOpen(el);
  }

  function closeDialog(silent) {
    if (!current) return;
    var c = current;
    current = null;
    // silent = מעבר ישיר לדיאלוג אחר: הישן נעלם מיד, בלי שתי מגירות זזות יחד.
    // אחרת יציאה של 150ms; הפאנל inert מיד, כך שהפוקוס, inert והגלילה מטופלים כרגיל כבר עכשיו
    hide(c.el, silent);
    if (scrim && !silent) hide(scrim);
    qsa('[data-inerted]').forEach(function (b) { b.removeAttribute('inert'); b.removeAttribute('data-inerted'); });
    document.body.style.overflow = '';
    document.removeEventListener('keydown', trap, true);
    if (c.onClose) c.onClose();
    if (!silent && c.returnFocus && c.returnFocus.focus && document.contains(c.returnFocus)) {
      try { c.returnFocus.focus({ preventScroll: true }); } catch (e) { c.returnFocus.focus(); }
    }
  }

  // סגירה דקלרטיבית: כל [data-close-dialog] בתוך פאנל
  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target.closest('[data-close-dialog]') : null;
    if (t && current && current.el.contains(t)) { e.preventDefault(); closeDialog(); }
    var o = e.target.closest ? e.target.closest('[data-open-dialog]') : null;
    if (o) { e.preventDefault(); openDialog(o.getAttribute('data-open-dialog'), { returnFocus: o }); }
  });

  /* ---------- Bottom sheet: גרירה כלפי מטה לסגירה (≤640, L-07) ----------
     רק מראש ה-sheet (.dialog__head), לא מכפתורים. סוגר אם עבר 25% מהגובה או מהירות >0.5px/ms; אחרת חוזר.
     המעבר ב-CSS ממשיך מהמיקום הנוכחי. כפתור ✕, Esc וה-scrim נשארים (חלופה למחווה) */
  var sheetMQ = null;
  try { sheetMQ = window.matchMedia('(max-width:640px)'); } catch (e) { /* */ }
  function bindSwipe(el) {
    var head = qs('.dialog__head', el);
    if (!head || head._fdSwipe || !window.PointerEvent) return;
    head._fdSwipe = true;
    var pid = null, y0 = 0, dy = 0, lastY = 0, lastT = 0, v = 0;
    head.addEventListener('pointerdown', function (e) {
      if (!sheetMQ || !sheetMQ.matches || !current || current.el !== el || e.button > 0) return;
      if (e.target.closest && e.target.closest('button,a,input,select,textarea')) return;
      pid = e.pointerId; y0 = lastY = e.clientY; lastT = e.timeStamp; dy = 0; v = 0;
      try { head.setPointerCapture(pid); } catch (err) { /* */ }
      el.classList.add('is-dragging');
    });
    head.addEventListener('pointermove', function (e) {
      if (e.pointerId !== pid) return;
      dy = Math.max(0, e.clientY - y0);
      var dt = e.timeStamp - lastT;
      if (dt > 0) v = (e.clientY - lastY) / dt;
      lastY = e.clientY; lastT = e.timeStamp;
      el.style.transform = 'translateY(' + dy + 'px)';
    });
    function end(e) {
      if (e.pointerId !== pid) return;
      pid = null;
      el.classList.remove('is-dragging');
      el.style.transform = '';
      if (dy > 8 && (dy > (el.offsetHeight || 1) * 0.25 || v > 0.5)) closeDialog();
    }
    head.addEventListener('pointerup', end);
    head.addEventListener('pointercancel', end);
  }

  var drawer = { open: openDialog, close: function () { closeDialog(); }, isOpen: function () { return !!current; } };
  var modal = drawer;

  /* ---------- Toast ----------
     UI.toast(text)                    – משך לפי האורך, אייקון ✓ (או ℹ כשבטקסט יש "[לאישור]")
     UI.toast(text, ms)                – משך מפורש; 0 = נשאר עד הטוסט הבא (תאימות לאחור)
     UI.toast(text, {ms, icon})        – icon: 'check' | 'info' | כל שם אייקון | false (בלי אייקון)
     UI.toast(text, ms, {icon})
     ברירת המחדל למשך (M-03): "הועתק" 1.6 שניות (08 §8.4); כל הודעה אחרת max(4 שניות, 70ms לתו).
     הטוסט לא נעלם בזמן שהעכבר מעליו. */
  var toastEl = null, toastT = null, toastMs = 0;
  function toastDuration(text) { return text === 'הועתק' ? 1600 : Math.max(4000, String(text).length * 70); }
  function armToast() {
    clearTimeout(toastT); toastT = null;
    if (toastMs) toastT = setTimeout(function () { hide(toastEl); }, toastMs);
  }
  function toast(text, ms, opt) {
    if (ms && typeof ms === 'object') { opt = ms; ms = opt.ms; }
    opt = opt || {};
    text = String(text == null ? '' : text);
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      toastEl.setAttribute('role', 'status');
      toastEl.setAttribute('aria-live', 'polite');
      toastEl.hidden = true;
      document.body.appendChild(toastEl);
      toastEl.addEventListener('mouseenter', function () { clearTimeout(toastT); toastT = null; });
      toastEl.addEventListener('mouseleave', function () { if (!toastEl.hidden) armToast(); });
    }
    var ic = opt.icon === undefined ? (/\[לאישור/.test(text) ? 'info' : 'check') : opt.icon;
    show(toastEl);
    toastEl.textContent = '';
    // תזמון קצר כדי שקוראי מסך יכריזו גם על אותו טקסט פעמיים
    setTimeout(function () { toastEl.innerHTML = (ic ? icon(ic, { size: 18 }) : '') + '<span>' + esc(text) + '</span>'; }, 30);
    toastMs = ms === 0 ? 0 : (ms || toastDuration(text));
    armToast();
  }

  function copy(text) {
    var done = function () { toast('הועתק'); };
    try {
      if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(text).then(done, fallback); return; }
    } catch (e) { /* */ }
    fallback();
    function fallback() {
      try {
        var ta = document.createElement('textarea');
        ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
      } catch (e) { /* */ }
      done();
    }
  }

  /* ---------- Busy button ----------
     P3-4: לא disabled – כפתור מושבת שמחזיק את הפוקוס מפיל אותו ל-BODY (קורא המסך שותק). במקום זה
     aria-disabled + aria-busy, והחסימה ב-JS: לחיצה על כפתור עסוק לא עוברת, ו-submit של טופס
     שכפתור השליחה שלו עסוק נבלע (גם Enter בשדה). המראה זהה ל-disabled (components.css). */
  function isBusy(el) { return !!el && el.getAttribute && el.getAttribute('aria-busy') === 'true'; }
  function setBusy(btn, busy, busyText) {
    if (!btn) return;
    if (busy) {
      if (!btn.hasAttribute('data-label')) btn.setAttribute('data-label', btn.innerHTML);
      btn.style.minWidth = btn.offsetWidth + 'px';
      btn.setAttribute('aria-disabled', 'true');
      btn.setAttribute('aria-busy', 'true');
      btn.innerHTML = icon('spinner', { cls: 'spin' }) + '<span>' + esc(busyText || '') + '</span>';
    } else {
      btn.disabled = false;
      btn.removeAttribute('aria-disabled');
      btn.setAttribute('aria-busy', 'false');
      if (btn.hasAttribute('data-label')) { btn.innerHTML = btn.getAttribute('data-label'); btn.removeAttribute('data-label'); }
      btn.style.minWidth = '';
    }
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('button[aria-busy="true"],a[aria-busy="true"]') : null;
    if (b) { e.preventDefault(); e.stopImmediatePropagation(); }
  }, true);
  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (f && f.querySelector && (isBusy(f.querySelector('[type="submit"][aria-busy="true"]')) || (e.submitter && isBusy(e.submitter)))) { e.preventDefault(); e.stopImmediatePropagation(); }
  }, true);

  /* ---------- קישורי placeholder (P2-9) ----------
     href="#" = יעד שטרם נקבע (קישור חיצוני או עמוד משפטי). בלי ניווט (לא לשונית כפולה, לא קפיצה לראש העמוד):
     טוסט מידע עם [לאישור]. ה-HTML והסימון החיצוני נשארים כמו שהם. */
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button > 0) return;
    var a = e.target.closest ? e.target.closest('a[href]') : null;
    if (!a || a.getAttribute('href') !== '#') return;
    e.preventDefault();
    var clone = a.cloneNode(true);
    qsa('.sr-only,svg', clone).forEach(function (x) { x.remove(); });
    var label = (clone.textContent || '').replace(/\s+/g, ' ').trim();
    var ext = a.getAttribute('target') === '_blank';
    toast((ext ? 'קישור חיצוני' : 'קישור') + (label ? ' "' + label + '"' : '') + ' – היעד [לאישור]', { icon: 'info' });
  });

  /* ---------- Field errors ---------- */
  // UI.fieldError(input, 'טקסט') / UI.fieldError(input, null) לניקוי
  function fieldError(input, msg) {
    if (!input) return;
    var errId = input.id + '-err';
    var err = document.getElementById(errId);
    if (!msg) {
      input.setAttribute('aria-invalid', 'false');
      if (err) err.hidden = true;
      return;
    }
    if (!err) {
      err = document.createElement('p');
      err.id = errId; err.className = 'error'; err.setAttribute('role', 'alert');
      var anchor = input.closest('.field') || input.parentNode;
      anchor.appendChild(err);
    }
    err.innerHTML = icon('alert-circle', { size: 18 }) + '<span>' + esc(msg) + '</span>';
    err.hidden = false;
    input.setAttribute('aria-invalid', 'true');
    var d = (input.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
    if (d.indexOf(errId) < 0) { d.push(errId); input.setAttribute('aria-describedby', d.join(' ')); }
  }

  function focusEl(el) {
    if (!el) return;
    if (!el.hasAttribute('tabindex') && !el.matches(FOCUSABLE)) el.setAttribute('tabindex', '-1');
    try { el.focus({ preventScroll: false }); } catch (e) { el.focus(); }
  }

  /* ---------- Bring revealed content into view ----------
     UI.ensureVisible(el, {block}) – גולל רק אם תחילת האלמנט לא נראית (מעל המסך, או מתחת לחלק התחתון
       שמוסתר בסרגל דביק). חלק בלי reduced-motion, מיידי עם reduced-motion.
     UI.focusInto(el) – תוכן שנחשף אחרי לחיצה: פוקוס (tabindex=-1, בלי קפיצת דפדפן) + ensureVisible.
       el יכול להיות מכל שמכיל כותרת – הפוקוס עובר לכותרת הראשונה (h2/h3/[data-focus]) אם יש. */
  function bottomInset() {
    var pad = 0;
    try { pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingBottom) || 0; } catch (e) { /* */ }
    return pad;
  }
  // כותרת דביקה במובייל (P3-6): scroll-padding-top על html = הגובה שהיא עלולה לכסות
  function topInset() {
    var pad = 0;
    try { pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0; } catch (e) { /* */ }
    return pad;
  }
  function ensureVisible(el, opt) {
    if (!el || !el.getBoundingClientRect) return;
    opt = opt || {};
    var r = el.getBoundingClientRect();
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var bottom = vh - bottomInset();
    var tin = topInset();
    var need = opt.minVisible || Math.min(r.height || 0, 120) || 60; // כמה מהאלמנט חייב להיראות
    if (r.top >= 8 + tin && r.top + need <= bottom) return;
    var a = opt.anchor ? opt.anchor.getBoundingClientRect() : r; // גוללים לעוגן (למשל כפתור האקורדיון) כדי שההקשר יישאר
    var top = window.pageYOffset + a.top - (opt.offset == null ? 16 : opt.offset) - tin;
    try { window.scrollTo({ top: Math.max(0, top), behavior: reducedMotion() ? 'auto' : 'smooth' }); }
    catch (e) { window.scrollTo(0, Math.max(0, top)); }
  }
  function focusInto(el, opt) {
    if (!el) return;
    var t = (opt && opt.target) || el.querySelector('[data-focus]') || el.querySelector('h2,h3,h4') || el;
    if (!t.hasAttribute('tabindex') && !t.matches(FOCUSABLE)) t.setAttribute('tabindex', '-1');
    try { t.focus({ preventScroll: true }); } catch (e) { t.focus(); }
    // תוכן שנחשף צריך להיראות ברובו, לא רק הכותרת בתחתית המסך
    var o = {}; for (var k in (opt || {})) o[k] = opt[k];
    if (o.minVisible == null) o.minVisible = Math.min(Math.max(el.getBoundingClientRect().height || 0, el.scrollHeight || 0), (window.innerHeight || 800) * 0.6) || 60;
    ensureVisible(el, o);
  }

  /* ---------- Auto-hydrate icons ---------- */
  function boot() {
    hydrateIcons(document);
    try {
      new MutationObserver(function (muts) {
        muts.forEach(function (m) {
          for (var i = 0; i < m.addedNodes.length; i++) {
            var n = m.addedNodes[i];
            if (n.nodeType === 1) hydrateIcons(n);
          }
        });
      }).observe(document.documentElement, { childList: true, subtree: true });
    } catch (e) { /* */ }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();

  window.UI = {
    qs: qs, qsa: qsa, esc: esc, icon: icon, hydrateIcons: hydrateIcons,
    accordion: accordion, drawer: drawer, modal: modal, show: show, hide: hide, reveal: reveal, conceal: conceal,
    motion: { on: anim, compact: function () { return compact; }, expand: expand, collapse: collapse, swap: swap, enter: enter, success: success, refresh: refresh, flip: flip },
    toast: toast, copy: copy, param: param, params: params, setParams: setParams,
    store: store, setBusy: setBusy, fieldError: fieldError, focus: focusEl, focusInto: focusInto, ensureVisible: ensureVisible
  };
})();
