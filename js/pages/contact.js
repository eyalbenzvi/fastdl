/* contact.js – P17 צרו קשר (contact.html?topic=lost | ?demo=error|sent) */
(function () {
  'use strict';
  var form = document.getElementById('contact-form');
  var sent = document.getElementById('contact-sent');
  var sub = document.getElementById('c-sub');
  var ph = document.getElementById('c-ph');
  var txt = document.getElementById('c-txt');
  var cnt = document.getElementById('c-cnt-n');
  var ERR_SUB = 'בחרו נושא לפנייה.';

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
  ph.addEventListener('input', function () {
    var v = ph.value.replace(/[^\d-]/g, '').slice(0, 11);
    if (v !== ph.value) ph.value = v;
  });

  function showSent(focus) {
    form.hidden = true;
    sent.hidden = false;
    if (focus) UI.focus(sent);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!sub.value) { UI.fieldError(sub, ERR_SUB); sub.focus(); return; }
    UI.fieldError(sub, null);
    showSent(true);
  });

  var demo = UI.param('demo');
  if (demo === 'error') UI.fieldError(sub, ERR_SUB);
  else if (demo === 'sent') showSent(false);
})();
