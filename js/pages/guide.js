/* guide.js – P11 "מה עלי לעשות עכשיו?": 4 כפתורי מצב, התשובה נפתחת במקום (aria-live).
   ?open=1..4 פותח פריט; ברירת מחדל: פריט 2. */
(function () {
  'use strict';
  var btns = UI.qsa('[data-sit]');
  var panels = UI.qsa('[data-ans]');
  var cur = 1;
  var p = Number(UI.param('open'));
  if (UI.param('open') !== null && p >= 1 && p <= btns.length) cur = p - 1;
  else if (UI.param('open') === '0') cur = -1;

  function render() {
    btns.forEach(function (b, i) { b.setAttribute('aria-expanded', i === cur ? 'true' : 'false'); });
    panels.forEach(function (el) { el.hidden = Number(el.getAttribute('data-ans')) !== cur; });
  }

  btns.forEach(function (b, i) {
    b.addEventListener('click', function () {
      cur = cur === i ? -1 : i;
      render();
    });
  });
  render();
})();
