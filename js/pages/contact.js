/* contact.js – P17 צרו קשר (contact.html?topic=lost | ?demo=error|sent) */
(function () {
  'use strict';
  var form = document.getElementById('contact-form');
  var sent = document.getElementById('contact-sent');
  var sub = document.getElementById('c-sub');
  var ph = document.getElementById('c-ph');
  var txt = document.getElementById('c-txt');
  var cnt = document.getElementById('c-cnt-n');
  var name = document.getElementById('c-name');
  var ERR_SUB = 'בחרו נושא לפנייה.';
  // P2-11: פנייה בלי פירוט או בלי דרך לחזור אליכם לא נשלחת (שם, נייד ופירוט חובה; מספר הזמנה "לא חובה")
  var ERR_NAME = 'יש למלא שם.';
  var ERR_PH_EMPTY = 'יש למלא מספר נייד.';
  var ERR_PH = 'מספר הנייד צריך להתחיל ב-05 ולהכיל 10 ספרות.';
  var ERR_TXT = 'יש לכתוב את הפנייה.';

  var topic = UI.param('topic');
  if (topic && sub.querySelector('option[value="' + topic.replace(/[^a-z]/g, '') + '"]')) sub.value = topic;

  // המספר הגלוי מתעדכן בכל הקשה; קורא המסך מקבל הכרזה רק בספים – כל 100 תווים, ובכל הקשה ב-100 האחרונים (F09)
  var live = document.getElementById('c-cnt-live');
  var MAX = Number(txt.getAttribute('maxlength')) || 1000;
  var lastBucket = 0;
  function count(announce) {
    var n = txt.value.length;
    cnt.textContent = String(n);
    if (!live || !announce) return;
    var bucket = Math.floor(n / 100);
    if (n >= MAX - 100 || bucket !== lastBucket) live.textContent = n + ' / ' + MAX + ' תווים';
    lastBucket = bucket;
  }
  txt.addEventListener('input', function () { count(true); });
  count(false);
  lastBucket = Math.floor(txt.value.length / 100);

  sub.addEventListener('change', function () { if (sub.value) UI.fieldError(sub, null); });
  function clearOnFix(el) { return function () { if (el.getAttribute('aria-invalid') === 'true') UI.fieldError(el, null); }; }
  // P1-1: נרמול לפני חיתוך (‎+972, רווחים, מקפים) – בלי maxlength שמוחק ספרה בשקט
  Validate.bindNormalize(ph, 'mobile', clearOnFix(ph));
  name.addEventListener('input', clearOnFix(name));
  txt.addEventListener('input', clearOnFix(txt));

  function validate() {
    var p = Validate.digits(ph.value);
    var errs = [
      [sub, sub.value ? null : ERR_SUB],
      [name, name.value.trim() ? null : ERR_NAME],
      [ph, !p ? ERR_PH_EMPTY : (Validate.mobile(p) ? null : ERR_PH)],
      [txt, txt.value.trim() ? null : ERR_TXT]
    ];
    var first = null;
    errs.forEach(function (x) { UI.fieldError(x[0], x[1]); if (x[1] && !first) first = x[0]; });
    return first;
  }

  function showSent(focus) {
    form.hidden = true;
    sent.hidden = false;
    if (focus) UI.focus(sent);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var bad = validate();
    if (bad) { UI.focus(bad); return; }
    showSent(true);
  });

  var demo = UI.param('demo');
  if (demo === 'error') UI.fieldError(sub, ERR_SUB);
  else if (demo === 'sent') showSent(false);
})();
