/* reissue.js – P10 הנפקה חוזרת ללא עלות (reissue.html). ?demo=error|done.
   אישור אמיתי (לא ?demo) נשמר ב-UI.store 'fd.reissue' {method, extras, number} – מסך המצב S3 מציג אותו. */
(function () {
  'use strict';
  var qs = UI.qs, qsa = UI.qsa;
  var D = window.FD_DATA || {};
  var IDS = ['express_home', 'regular_home', 'registered_mail']; // רק שיטות עם מעקב [לאישור]
  var all = D.delivery_methods || [];
  var OPTS = IDS.map(function (id) { for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i]; return null; }).filter(Boolean);
  var MSG = 'כדי להמשיך יש לאשר את ההצהרה.';
  var state = { m: 'express_home' };

  function esc(s) { return UI.esc(s); }
  function numify(s) { return s.replace(/\d+(?:[.:,\/]\d+)*/g, function (n) { return '<span class="num" dir="ltr">' + n + '</span>'; }); }
  function cur() { for (var i = 0; i < OPTS.length; i++) if (OPTS[i].id === state.m) return OPTS[i]; return OPTS[0]; }

  function renderOpts() {
    qs('#reissue-methods').innerHTML = OPTS.map(function (o) {
      var on = o.id === state.m;
      // במובייל "ללא עלות" עובר לשורה מתחת לשם (pages.css), כדי שהשם והמועד לא יישברו (F07)
      return '<label class="opt-card reissue-opt' + (on ? ' is-selected' : '') + '"><input type="radio" name="rm" value="' + o.id + '"' + (on ? ' checked' : '') + '>' +
        '<span class="reissue-opt__body"><strong class="reissue-opt__name">' + esc(o.name) + '</strong><span class="small muted">' + numify(esc(o.eta_rule)) + ' · עם מעקב</span></span>' +
        '<span class="price-free reissue-opt__price">ללא עלות</span></label>';
    }).join('');
  }

  // כותרת הלשונית (F05): "שגיאה: " כשההצהרה לא סומנה; בסיום – לפי ה-H1
  var BASE_TITLE = document.title;
  function setTitle(t) { if (document.title !== t) document.title = t; }
  function formTitle() { var e = qs('#decl-err'); setTitle((e && !e.hidden ? 'שגיאה: ' : '') + BASE_TITLE); }

  function showDone(focus) {
    var m = cur();
    qs('#rd-name').textContent = m.name;
    qs('#rd-eta').innerHTML = numify(esc(m.eta_rule));
    qs('#rd-track').hidden = !m.tracking; // כל השיטות בהנפקה חוזרת עם מעקב [לאישור]
    qs('#reissue-form').hidden = true;
    qs('#reissue-done').hidden = false;
    setTitle('ההזמנה החוזרת התקבלה – רישיון עד הבית');
    if (focus) {
      try { window.scrollTo(0, Math.max(0, qs('#main').getBoundingClientRect().top + window.pageYOffset)); } catch (e) { /* */ }
      var h = qs('#reissue-done-h');
      try { h.focus({ preventScroll: true }); } catch (e) { h.focus(); }
    }
  }

  function init() {
    var demo = UI.param('demo');
    if (D.citizen && D.citizen.moin_address) qs('#reissue-moin').textContent = D.citizen.moin_address.display;
    renderOpts();
    qs('#reissue-methods').addEventListener('change', function (e) {
      if (e.target.name !== 'rm') return;
      state.m = e.target.value;
      qsa('#reissue-methods .opt-card').forEach(function (l) { l.classList.toggle('is-selected', l.contains(e.target)); });
    });
    var decl = qs('#decl');
    decl.addEventListener('change', function () { if (decl.checked) UI.fieldError(decl, null); formTitle(); });
    qs('#reissue-submit').addEventListener('click', function () {
      if (!decl.checked) { UI.fieldError(decl, MSG); decl.focus(); formTitle(); return; }
      UI.store.set('fd.reissue', {
        method: cur().id, number: qs('#reissue-done .order-done__num .num').textContent,
        extras: { entrance: qs('#r-e').value.trim(), care_of: qs('#r-c').value.trim(), mailbox: qs('#r-mb').value.trim() }
      });
      showDone(true);
    });
    var cal = qs('#reissue-done .order-done__btns .btn--secondary');
    if (cal) cal.addEventListener('click', function () { UI.toast('ההוספה ליומן [לאישור]', { icon: 'info' }); });
    if (demo === 'error') { UI.fieldError(decl, MSG); formTitle(); }
    if (demo === 'done') showDone(false);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
