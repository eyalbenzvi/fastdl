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

  var ord = document.getElementById('c-ord');
  var cut = document.getElementById('c-cnt-cut');
  var demo = UI.param('demo');

  // QA_INPUTS P3-18: מציבים את הערך המנוקה (‎?topic=lo%20st לא משאיר את הבחירה ריקה)
  var topic = (UI.param('topic') || '').replace(/[^a-z]/g, '');
  if (topic && sub.querySelector('option[value="' + topic + '"]')) sub.value = topic;

  /* QA_INPUTS P3-13: טיוטת הפנייה נשמרת ב-sessionStorage של הלשונית ('fd.contactDraft') – רענון לא מוחק עד 1000 תווים.
     נמחקת בשליחה. חריג מתועד לכלל 13 (DECISIONS.md); בלי אחסון – הטופס עובד כרגיל */
  var DRAFT = 'fd.contactDraft';
  var FIELDS = [['sub', sub], ['ord', ord], ['name', name], ['ph', ph], ['txt', txt]];
  function saveDraft() {
    var d = {}, any = false;
    FIELDS.forEach(function (f) { d[f[0]] = f[1].value; if (f[1].value && f[0] !== 'sub') any = true; });
    if (any || d.sub) UI.store.set(DRAFT, d); else UI.store.remove(DRAFT);
  }
  if (!demo) {
    var dr = UI.store.get(DRAFT, null);
    if (dr && typeof dr === 'object') FIELDS.forEach(function (f) {
      var v = dr[f[0]];
      if (typeof v !== 'string' || !v) return;
      if (f[0] === 'sub' && (topic || !sub.querySelector('option[value="' + v.replace(/[^a-z]/g, '') + '"]'))) return;
      f[1].value = v;
    });
  }
  form.addEventListener('input', saveDraft);
  form.addEventListener('change', saveDraft);

  // המספר הגלוי מתעדכן בכל הקשה; קורא המסך מקבל הכרזה רק בספים – כל 100 תווים, ובכל הקשה ב-100 האחרונים (F09)
  var live = document.getElementById('c-cnt-live');
  var MAX = Number(txt.getAttribute('data-max')) || 1000;
  var lastBucket = 0;
  /* QA_INPUTS P3-18: סופרים תווים נראים (אימוג'י משפחה = 1), והמגבלה נאכפת לפי אותה ספירה – לא maxlength (יחידות UTF-16).
     טקסט ארוך מדי (בעיקר בהדבקה) נחתך, ומוצגת הודעה שהטקסט קוצר */
  var seg = null;
  try { if (window.Intl && Intl.Segmenter) seg = new Intl.Segmenter('he', { granularity: 'grapheme' }); } catch (e) { seg = null; }
  function chars(v) {
    if (seg) { var a = []; var it = seg.segment(v)[Symbol.iterator](); for (var r = it.next(); !r.done; r = it.next()) a.push(r.value.segment); return a; }
    return Array.from ? Array.from(v) : v.split('');
  }
  function enforce() {
    var c = chars(txt.value);
    if (c.length <= MAX) return false;
    txt.value = c.slice(0, MAX).join('');
    return true;
  }
  function count(announce, wasCut) {
    var n = chars(txt.value).length;
    cnt.textContent = String(n);
    if (cut) cut.hidden = !wasCut;
    if (!live || !announce) return;
    var bucket = Math.floor(n / 100);
    if (wasCut) live.textContent = 'הטקסט קוצר ל-' + MAX + ' תווים';
    else if (n >= MAX - 100 || bucket !== lastBucket) live.textContent = n + ' מתוך ' + MAX + ' תווים';
    lastBucket = bucket;
  }
  txt.addEventListener('input', function () { var c = enforce(); count(true, c); });
  enforce();
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
    UI.store.remove(DRAFT);
    showSent(true);
  });

  if (demo === 'error') UI.fieldError(sub, ERR_SUB);
  else if (demo === 'sent') showSent(false);
})();
