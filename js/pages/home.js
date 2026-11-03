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

  /* ---------- ID form, Arabic home (home-ar.html, F01) ----------
     אין נוסחי שגיאה בערבית (ואסור להמציא), ולכן: ערכים תקינים → כמו בבית B (נשמרים, ממשיכים ל-otp.html);
     ערכים חסרים/שגויים → נשמרים ו-login.html?check=1 מציג אותם מולאים עם הודעות השגיאה בעברית. */
  var arForm = document.getElementById('ar-form');
  if (arForm) {
    var arId = document.getElementById('ar-id');
    var arPh = document.getElementById('ar-ph');
    var arBtn = document.getElementById('ar-submit');
    // P1-1/P2-1: נרמול (רווחים, מקפים, ‎+972) ורק אז חיתוך – בלי maxlength שחותך לפני הסינון
    Validate.bindNormalize(arId, 'id');
    Validate.bindNormalize(arPh, 'mobile');
    arForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (arBtn.getAttribute('aria-busy') === 'true') return;
      UI.store.set('fd.login', { id: Validate.digits(arId.value), ph: arPh.value });
      if (!Validate.israeliId(arId.value) || !Validate.mobile(arPh.value)) {
        window.location.href = 'login.html?check=1';
        return;
      }
      var d = Validate.digits(arPh.value);
      UI.store.set('fd.phone', d);
      UI.setBusy(arBtn, true, arBtn.textContent);
      setTimeout(function () { window.location.href = 'otp.html?ph=' + encodeURIComponent(Validate.maskMobile(d)); }, 1200);
    });
    window.addEventListener('pageshow', function (e) { if (e.persisted) UI.setBusy(arBtn, false); });
    return;
  }

  /* ---------- ID form (B only) ---------- */
  var form = document.getElementById('id-form');
  if (!form) return;
  var idIn = document.getElementById('hb-id');
  var phIn = document.getElementById('hb-ph');
  var btn = document.getElementById('id-submit');
  var action = document.getElementById('id-form-action');
  var whyBtn = document.getElementById('why-btn');

  // נרמול קלט (P1-1, P2-1): ת״ז – ספרות בלבד עד 9 (רווחים/מקפים יורדים); נייד – ספרות בלבד, ‎+972 → 0, עד 10.
  // מסננים לפני שחותכים, כך ש-"052-123-4567" או מילוי אוטומטי ‎+972 לא מאבדים ספרה. שגיאה מתנקה עם תחילת התיקון.
  function clearOnFix(input) { return function () { if (input.getAttribute('aria-invalid') === 'true') UI.fieldError(input, null); }; }
  Validate.bindNormalize(idIn, 'id', clearOnFix(idIn));
  Validate.bindNormalize(phIn, 'mobile', clearOnFix(phIn));

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
    if (btn.getAttribute('aria-busy') === 'true') return;
    if (!validate(true)) return;
    var m = masked();
    // כל ת״ז וכל נייד תקינים מתקבלים; נשמרים כדי ש-otp.html יציג את המספר שהוזן ויפתח session
    UI.store.set('fd.login', { id: Validate.digits(idIn.value), ph: phIn.value });
    UI.store.set('fd.phone', Validate.digits(phIn.value));
    UI.setBusy(btn, true, 'שולחים קוד…');
    // push (לא replace): Back ממסך הקוד חוזר לטופס לתיקון המספר. מסך הקוד עצמו מוחלף במסך המצב (auth.js, P1-5)
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
