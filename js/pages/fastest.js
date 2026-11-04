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

  // פורמט המועד האחיד באתר: "יום ג׳ 25.8" (F23)
  var DAY = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];
  function label(d) { return 'יום ' + DAY[d.getDay()] + ' <span class="num" dir="ltr">' + d.getDate() + '.' + (d.getMonth() + 1) + '</span>'; }

  /* P3-8: טווח סביר – "היום" של אב-הטיפוס (25.8.2026, mock-data) ועד 60 יום אחורה [לאישור] (min/max ב-HTML).
     תאריך עתידי או רחוק מדי – הודעה ליד השדה במקום מועד שנראה אמין (למשל 1999 → "יום ב׳ 4.1") */
  // התאריך האמיתי של היום, אם הוא אחרי "היום" של אב-הטיפוס – בודקים שמזינים את תאריך התשלום האמיתי שלהם לא נחסמים
  try { var today = Dates.toISO(new Date()); if (today > input.max) input.max = today; } catch (e) { /* */ }
  // QA_INPUTS P3-16: min נשאר 60 יום לפני "היום" של אב-הטיפוס, כדי שמצב ברירת המחדל (23.8 → 25.8, כמו בהדמיה) יישאר תקין.
  // כש-max זז להיום האמיתי החלון רחב יותר – בכוונה (שני "היום": של ההדגמה ושל הבודק). ראו DECISIONS.md
  var ERR_FUTURE = 'תאריך התשלום לא יכול להיות אחרי היום.';
  var ERR_OLD = 'התאריך רחוק מדי לחישוב. בדקו את מצב הבקשה או פנו למוקד.';
  function rangeError(v) {
    var d = Dates.parse(v), min = Dates.parse(input.min), max = Dates.parse(input.max);
    if (!d) return null;
    if (max && d > max) return ERR_FUTURE;
    if (min && d < min) return ERR_OLD;
    return null;
  }
  var ERR_BAD = 'התאריך לא שלם. בדקו את היום, החודש והשנה.';
  /* QA_INPUTS P3-15: בזמן הקלדה (השנה מוקלדת ספרה-ספרה: 0002, 0020, 0202…) רק התוצאה מתעדכנת;
     הודעת שגיאה מוצגת ביציאה מהשדה (blur), ומתנקה מיד כשהערך תקין */
  function update(showErr) {
    var bad = rangeError(input.value) || (input.validity && input.validity.badInput ? ERR_BAD : null);
    if (!bad) UI.fieldError(input, null);
    else if (showErr || input.getAttribute('aria-invalid') === 'true') UI.fieldError(input, bad);
    var d = bad ? null : Dates.fastestPickup(input.value);
    if (!d) { pick.textContent = 'בחרו תאריך תשלום'; home.textContent = 'בחרו תאריך תשלום'; return; }
    pick.innerHTML = label(d);
    home.innerHTML = 'עד ' + label(d);
  }
  // document.activeElement לא אמין בשדה תאריך באמצע עריכת מקטע – מעקב פוקוס עצמאי
  var focused = false;
  input.addEventListener('focus', function () { focused = true; });
  input.addEventListener('input', function () { update(false); });
  input.addEventListener('change', function () { update(!focused); });
  input.addEventListener('blur', function () { focused = false; update(true); });
  update(true);
})();
