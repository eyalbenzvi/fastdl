/* error.js – P19 תקלה זמנית / 404 / באנר תחזוקה (error.html?v=temp|404&maint=1, 404.html) */
(function () {
  'use strict';
  var TITLES = { temp: 'תקלה זמנית – רישיון עד הבית', '404': 'העמוד לא נמצא – רישיון עד הבית' };
  var v = UI.param('v');
  var view = (v === '404' || v === 'temp') ? v : (document.body.getAttribute('data-view') || 'temp');
  var header = UI.qs('[data-slot="header"]');

  function maintOn() { return !!UI.qs('.maint', header); }

  function setView(next) {
    view = next;
    document.body.setAttribute('data-view', view);
    UI.qsa('[data-err-view]').forEach(function (el) { el.hidden = el.getAttribute('data-err-view') !== view; });
    document.title = TITLES[view];
  }

  function bindMaintClose(m) {
    var c = UI.qs('.maint__close', m);
    if (c) c.addEventListener('click', function () {
      m.remove();
      Layout.focusMain(); // P3-5: לא לקישור הדילוג
      afterMaintChange();
    });
  }
  function setMaint(on) {
    if (on && !maintOn()) {
      var skip = UI.qs('.skip-link', header);
      if (skip) skip.insertAdjacentHTML('beforebegin', Layout.maintenanceHTML());
      else header.insertAdjacentHTML('afterbegin', Layout.maintenanceHTML());
      bindMaintClose(UI.qs('.maint', header));
    } else if (!on && maintOn()) {
      UI.qs('.maint', header).remove();
    }
  }
  function afterMaintChange() {
    UI.setParams({ maint: maintOn() ? '1' : null });
    renderBar();
  }
  // סגירה מהכפתור של layout.js (כשהבאנר הגיע מ-?maint=1)
  Layout.onMaintClose = afterMaintChange;

  function renderBar(focusIndex) {
    Layout.demoBar({
      items: [
        { label: 'תקלה זמנית', pressed: view === 'temp', onClick: function () { setView('temp'); UI.setParams({ v: 'temp' }); renderBar(0); } },
        { label: '404', pressed: view === '404', onClick: function () { setView('404'); UI.setParams({ v: '404' }); renderBar(1); } },
        { label: 'באנר תחזוקה', pressed: maintOn(), onClick: function () { setMaint(!maintOn()); UI.setParams({ maint: maintOn() ? '1' : null }); renderBar(2); } }
      ]
    });
    if (typeof focusIndex === 'number') {
      var b = UI.qs('[data-slot="demo-bar"] [data-demo-i="' + focusIndex + '"]');
      if (b) b.focus();
    }
  }

  // P3-9: אחרי הניסיון – הודעה גלויה ב-role="status" (באב-הטיפוס השירות "עדיין לא זמין"), לא חזרה שקטה למצב הקודם
  var retry = document.getElementById('err-retry');
  var retryMsg = document.getElementById('err-retry-msg');
  var tries = 0;
  retry.addEventListener('click', function () {
    UI.setBusy(retry, true, 'מנסים שוב…');
    if (retryMsg) retryMsg.innerHTML = '';
    setTimeout(function () {
      UI.setBusy(retry, false);
      tries += 1;
      if (retryMsg) {
        retryMsg.innerHTML = '<div class="callout callout--warning">' + UI.icon('alert-circle') +
          '<p>השירות עדיין לא זמין' + (tries > 1 ? ' (ניסיון <span class="num" dir="ltr">' + tries + '</span>)' : '') + '. נסו שוב בעוד כמה דקות, או חייגו למוקד <a href="' + Layout.TEL + '"><span class="num" dir="ltr">' + Layout.PHONE + '</span></a>.</p></div>';
      }
    }, 1500);
  });

  setView(view);
  renderBar();
})();
