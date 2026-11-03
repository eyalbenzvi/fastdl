/* home.js – עמודי הבית (index.html = B, home-a.html = A).
   אקורדיון "רוצים להבין עוד?", טופס הזדהות (B), מגירת "למה אנחנו מבקשים…", מצבי ?demo=. */
(function () {
  'use strict';

  var MSG_ID = 'מספר תעודת הזהות לא תקין. בדקו את כל הספרות, כולל הספרה האחרונה (ספרת הביקורת).';
  var MSG_PH = 'מספר הנייד צריך להתחיל ב-05 ולהכיל 10 ספרות.';
  var demo = UI.param('demo');

  // קישורי "התחלה" במסלולי הבדיקה (prototype-index): ?reset=1 מנקה את המסע, ?scenario=S7 מגדיר תרחיש מראש
  if (UI.param('reset') === '1') ['fd.session', 'fd.order', 'fd.reissue', 'fd.login', 'fd.phone', 'fd.scenario'].forEach(function (k) { UI.store.remove(k); });
  if (/^S[0-9]$/.test(UI.param('scenario') || '')) UI.store.set('fd.scenario', UI.param('scenario'));

  /* ---------- Accordion ---------- */
  var accRoot = document.getElementById('home-acc');
  if (accRoot) UI.accordion(accRoot, { openIndex: demo === 'acc3' ? 3 : -1 });

  /* ---------- ID form (B only) ---------- */
  var form = document.getElementById('id-form');
  if (!form) return;
  var idIn = document.getElementById('hb-id');
  var phIn = document.getElementById('hb-ph');
  var btn = document.getElementById('id-submit');
  var action = document.getElementById('id-form-action');
  var whyBtn = document.getElementById('why-btn');

  // סינון קלט: ת״ז – ספרות בלבד עד 9; נייד – ספרות ומקף עד 11. שגיאה מתנקה עם תחילת התיקון.
  function filter(input, re, max) {
    input.addEventListener('input', function () {
      var v = input.value.replace(re, '').slice(0, max);
      if (v !== input.value) input.value = v;
      if (input.getAttribute('aria-invalid') === 'true') UI.fieldError(input, null);
    });
  }
  filter(idIn, /\D/g, 9);
  filter(phIn, /[^\d-]/g, 11);

  function validate(focus) {
    var badId = !Validate.israeliId(idIn.value);
    var badPh = !Validate.mobile(phIn.value);
    UI.fieldError(idIn, badId ? MSG_ID : null);
    UI.fieldError(phIn, badPh ? MSG_PH : null);
    if (focus) UI.focus(badId ? idIn : (badPh ? phIn : null));
    return !badId && !badPh;
  }

  function masked() {
    var d = Validate.digits(phIn.value);
    return d.length === 10 ? Validate.maskMobile(d) : '054-•••-4567';
  }

  function otpHref(m) { return 'otp.html?ph=' + encodeURIComponent(m); }

  function showSent(m) {
    action.innerHTML = '<div class="callout callout--success" role="status">' + UI.icon('check-circle') +
      '<div><p class="callout__title">שלחנו קוד ב-SMS</p><p>הקוד נשלח לנייד <span class="num" dir="ltr">' + UI.esc(m) + '</span>. ' +
      '<a href="' + otpHref(m) + '">להזנת הקוד</a></p></div></div>';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (btn.disabled) return;
    if (!validate(true)) return;
    var m = masked();
    // כל ת״ז וכל נייד תקינים מתקבלים; נשמרים כדי ש-otp.html יציג את המספר שהוזן ויפתח session
    UI.store.set('fd.login', { id: Validate.digits(idIn.value), ph: phIn.value });
    UI.store.set('fd.phone', Validate.digits(phIn.value));
    UI.setBusy(btn, true, 'שולחים קוד…');
    setTimeout(function () { window.location.href = otpHref(m); }, 1200);
  });

  // חזרה מ-bfcache (כפתור Back) – משחררים את מצב הטעינה
  window.addEventListener('pageshow', function (e) { if (e.persisted) UI.setBusy(btn, false); });

  /* ---------- Demo states ---------- */
  if (demo === 'errors') {
    idIn.value = '123456';
    phIn.value = '0541';
    validate(false);
  } else if (demo === 'sent') {
    idIn.value = '000000018';
    phIn.value = '0541234567';
    var m = masked();
    UI.store.set('fd.phone', Validate.digits(phIn.value));
    showSent(m);
  } else if (demo === 'why') {
    UI.drawer.open('why-drawer', { returnFocus: whyBtn });
  }
})();
