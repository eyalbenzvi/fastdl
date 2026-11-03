/* fastest.js – P12 מחשבון לו״ז: תאריך תשלום → Dates.fastestPickup (יום עסקים הבא + עוד יום עסקים). */
(function () {
  'use strict';
  var input = document.getElementById('paid');
  var out = document.getElementById('calc-date');
  if (!input || !out) return;

  function update() {
    var d = Dates.fastestPickup(input.value);
    if (!d) { out.textContent = 'בחרו תאריך תשלום'; return; }
    out.innerHTML = 'יום ' + Dates.DAYS[d.getDay()] + ', <span class="num" dir="ltr">' + Dates.formatShort(d) + '</span>';
  }
  input.addEventListener('input', update);
  input.addEventListener('change', update);
  update();
})();
