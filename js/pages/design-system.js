/* design-system.js – התנהגות הדוגמאות בעמוד מערכת העיצוב */
(function () {
  'use strict';
  function init() {
    var acc = document.getElementById('ds-acc');
    if (acc) UI.accordion(acc, { openIndex: 0 });
    UI.qsa('[data-copy]').forEach(function (b) {
      b.addEventListener('click', function () { UI.copy(b.getAttribute('data-copy')); });
    });
    UI.qsa('[data-ds-menu]').forEach(function (b) {
      b.addEventListener('click', function () { if (window.Layout) Layout.openMenu(); });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
