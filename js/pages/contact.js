/* contact.js – P17 צור קשר (contact.html?topic=lost | ?demo=error|sent) */
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

  function count() { cnt.textContent = String(txt.value.length); }
  txt.addEventListener('input', count);
  count();

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
