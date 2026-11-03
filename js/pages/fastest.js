/* fastest.js – P12 מחשבון לו״ז: תאריך תשלום → שתי תוצאות.
   איסוף מבארי: Dates.fastestPickup (הבקשה מגיעה ביום העסקים הבא, האיסוף ביום העסקים שאחריו, מ-11:00).
   משלוח מהיר עד הבית: "עד" יום העסקים שאחרי הגעת הבקשה – אותו תאריך (ראו DECISIONS.md). */
(function () {
  'use strict';
  var input = document.getElementById('paid');
  var res = document.getElementById('calc-res');
  var pick = document.getElementById('calc-date');
  var home = document.getElementById('calc-date-home');
  if (!input || !res || !pick || !home) return;

  function label(d) { return 'יום ' + Dates.DAYS[d.getDay()] + ', <span class="num" dir="ltr">' + Dates.formatShort(d) + '</span>'; }

  function update() {
    var d = Dates.fastestPickup(input.value);
    if (!d) { pick.textContent = 'בחרו תאריך תשלום'; home.textContent = 'בחרו תאריך תשלום'; return; }
    pick.innerHTML = label(d);
    home.innerHTML = 'עד ' + label(d);
  }
  input.addEventListener('input', update);
  input.addEventListener('change', update);
  update();
})();
