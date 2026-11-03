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
  // חשיפת תוכן שנפתח במקום (אקורדיון, תשובה): opacity בלבד, 150ms, רק בפעולת משתמש.
  // force: גם אם כבר גלוי והתוכן הוחלף (למשל תשובה אחרת באותה תיבה)
  function reveal(el, force) {
    if (!el) return;
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
      if (open && animate) reveal(p); else p.hidden = !open;
    }
    btns.forEach(function (b, i) {
      set(b, i === opt.openIndex);
      b.addEventListener('click', function () {
        var open = b.getAttribute('aria-expanded') !== 'true';
        if (single && open) btns.forEach(function (o) { if (o !== b) set(o, false); });
        set(b, open, true);
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

  var drawer = { open: openDialog, close: function () { closeDialog(); }, isOpen: function () { return !!current; } };
  var modal = drawer;

  /* ---------- Toast ---------- */
  var toastEl = null, toastT = null;
  function toast(text, ms) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      toastEl.setAttribute('role', 'status');
      toastEl.setAttribute('aria-live', 'polite');
      toastEl.hidden = true;
      document.body.appendChild(toastEl);
    }
    show(toastEl);
    toastEl.textContent = '';
    // תזמון קצר כדי שקוראי מסך יכריזו גם על אותו טקסט פעמיים
    setTimeout(function () { toastEl.innerHTML = icon('check', { size: 18 }) + '<span>' + esc(text) + '</span>'; }, 30);
    clearTimeout(toastT);
    if (ms !== 0) toastT = setTimeout(function () { hide(toastEl); }, ms || 1600);
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

  /* ---------- Busy button ---------- */
  function setBusy(btn, busy, busyText) {
    if (!btn) return;
    if (busy) {
      if (!btn.hasAttribute('data-label')) btn.setAttribute('data-label', btn.innerHTML);
      btn.style.minWidth = btn.offsetWidth + 'px';
      btn.disabled = true;
      btn.setAttribute('aria-busy', 'true');
      btn.innerHTML = icon('spinner', { cls: 'spin' }) + '<span>' + esc(busyText || '') + '</span>';
    } else {
      btn.disabled = false;
      btn.setAttribute('aria-busy', 'false');
      if (btn.hasAttribute('data-label')) { btn.innerHTML = btn.getAttribute('data-label'); btn.removeAttribute('data-label'); }
      btn.style.minWidth = '';
    }
  }

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
    accordion: accordion, drawer: drawer, modal: modal, show: show, hide: hide, reveal: reveal,
    toast: toast, copy: copy, param: param, params: params, setParams: setParams,
    store: store, setBusy: setBusy, fieldError: fieldError, focus: focusEl
  };
})();
