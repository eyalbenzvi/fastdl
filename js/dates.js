/* dates.js – חישובי תאריכים (למחשבון P12). גלובלי: window.Dates
   ימי עסקים: א׳–ה׳ (מדלגים על שישי=5 ושבת=6). */
(function () {
  'use strict';
  var DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

  function parse(s) {
    if (s instanceof Date) return new Date(s.getFullYear(), s.getMonth(), s.getDate());
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(s || ''));
    return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
  }
  function isBusinessDay(d) { var w = d.getDay(); return w !== 5 && w !== 6; }
  function nextBusinessDay(date) {
    var d = parse(date); if (!d) return null;
    do { d.setDate(d.getDate() + 1); } while (!isBusinessDay(d));
    return d;
  }
  // P12: הבקשה מגיעה ביום העסקים הבא, והאיסוף מבארי ביום העסקים שאחריו
  function fastestPickup(paidDate) { var a = nextBusinessDay(paidDate); return a ? nextBusinessDay(a) : null; }
  function toISO(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }

  window.Dates = { parse: parse, isBusinessDay: isBusinessDay, nextBusinessDay: nextBusinessDay, fastestPickup: fastestPickup, toISO: toISO, DAYS: DAYS };
})();
