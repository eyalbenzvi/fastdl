/* auth.js – P02 הזדהות (login.html) + P03 אימות קוד SMS (otp.html)
   אב-טיפוס: כל ת״ז תקינה וכל נייד תקין מתקבלים; כל קוד בן 6 ספרות מתקבל חוץ מ-111111 (= קוד שגוי).
   בסרגל ההדגמה בוחרים "תרחיש אחרי האימות" (S0–S9) – UI.store 'fd.scenario'. אחרי אימות: 'fd.session' {id, phoneMasked, scenario}.
   ?reset=1 מנקה את מסע הבדיקה; ?scenario=S7 מגדיר תרחיש מראש (קישורי "התחלה" באינדקס). */
(function () {
  'use strict';
  var page = document.body.getAttribute('data-page');
  var demo = UI.param('demo');
  var DEMO_CODE = '123456';   // מוצג במצב ?demo=verified בלבד
  var WRONG = '111111';       // הקוד היחיד שנחשב שגוי
  var ERR_ID = 'מספר תעודת הזהות לא תקין. בדקו את כל הספרות, כולל הספרה האחרונה (ספרת הביקורת).';
  var ERR_PH = 'מספר הנייד צריך להתחיל ב-05 ולהכיל 10 ספרות.';
  var EMPTY_ID = 'יש למלא מספר תעודת זהות.';   // כמו בשלב 4 ובצרו קשר (QA_INPUTS P3-1)
  var EMPTY_PH = 'יש למלא מספר נייד.';
  var SCENARIOS = [ // הכותרות = התגים במסך המצב (status.js STATE_UI)
    ['S0', 'לא נמצאה בקשה'], ['S1', 'אפשר להזמין'], ['S2', 'הזמנה בוצעה'], ['S3', 'בייצור'], ['S4', 'בדרך אליכם'],
    ['S5', 'מחכה לכם'], ['S6', 'נמסר'], ['S7', 'לא אושרה מסירה'], ['S8', 'המסירה נכשלה'], ['S9', '2 בקשות']
  ];
  function validScenario(s) { return SCENARIOS.some(function (x) { return x[0] === s; }); }

  if (UI.param('reset') === '1') ['fd.session', 'fd.order', 'fd.reissue', 'fd.login', 'fd.phone', 'fd.scenario'].forEach(function (k) { UI.store.remove(k); });
  if (validScenario(UI.param('scenario'))) UI.store.set('fd.scenario', UI.param('scenario'));
  // B-03: הפרמטרים נצרכו – מוסרים מה-URL (replace), כך ש-Back לעמוד הזה לא מאפס שוב את המסע
  if (UI.param('reset') !== null || UI.param('scenario') !== null) UI.setParams({ reset: null, scenario: null });

  /* ספרות ערביות-הודיות ופרסיות → 0–9 (QA_INPUTS P1-2). Validate.toLatinDigits כשקיים; אחרת מיפוי מקומי */
  function latin(s) {
    s = String(s == null ? '' : s);
    if (window.Validate && Validate.toLatinDigits) return Validate.toLatinDigits(s);
    return s.replace(/[\u0660-\u0669\u06F0-\u06F9]/g, function (c) { var n = c.charCodeAt(0); return String(n >= 0x06F0 ? n - 0x06F0 : n - 0x0660); });
  }
  // מאזין שנרשם לפני bindNormalize – ההמרה קודמת לסינון, והסמן נשאר במקומו (אותו אורך)
  function latinInput(el) {
    if (!el) return;
    el.addEventListener('input', function () {
      var v = el.value, l = latin(v);
      if (l === v) return;
      var a = null, b = null;
      try { a = el.selectionStart; b = el.selectionEnd; } catch (x) { /* */ }
      el.value = l;
      if (a !== null && document.activeElement === el) { try { el.setSelectionRange(a, b); } catch (x) { /* */ } }
    });
  }
  function scenario() { var s = UI.store.get('fd.scenario', 'S1'); return validScenario(s) ? s : 'S1'; }

  Layout.demoBar({
    items: [
      { label: 'P02 · הזדהות', href: 'login.html', pressed: page === 'login' },
      { label: 'P03 · קוד SMS', href: 'otp.html', pressed: page === 'otp' }
    ],
    note: 'כל ת״ז תקינה (למשל <span class="num" dir="ltr">000000018</span>) · כל קוד בן 6 ספרות · <span class="num" dir="ltr">111111</span> = קוד שגוי'
  });
  scenarioPicker();

  /* בורר תרחיש בסרגל ההדגמה */
  function scenarioPicker() {
    var inner = UI.qs('[data-slot="demo-bar"] .demo-bar__inner');
    if (!inner) return;
    var wrap = document.createElement('span');
    wrap.className = 'demo-scn';
    var cur = scenario();
    wrap.innerHTML = '<label class="demo-bar__muted" for="demo-scn">תרחיש אחרי האימות:</label>' +
      '<select id="demo-scn" class="demo-select">' + SCENARIOS.map(function (x) {
        return '<option value="' + x[0] + '"' + (x[0] === cur ? ' selected' : '') + '>' + x[0] + ' · ' + x[1] + '</option>';
      }).join('') + '</select>';
    var idx = UI.qs('.demo-bar__index', inner);
    inner.insertBefore(wrap, idx || null);
    UI.qs('#demo-scn', wrap).addEventListener('change', function (e) {
      UI.store.set('fd.scenario', e.target.value);
      var c = document.getElementById('otp-continue');
      if (c) c.setAttribute('href', 'status.html?s=' + e.target.value);
    });
  }

  if (page === 'login') initLogin();
  if (page === 'otp') initOtp();

  /* ---------- P02 ---------- */
  function initLogin() {
    var form = document.getElementById('login-form');
    var id = document.getElementById('au-id');
    var ph = document.getElementById('au-ph');
    var btn = document.getElementById('login-submit');

    var saved = UI.store.get('fd.login', null);
    if (saved) { id.value = saved.id || ''; ph.value = saved.ph || ''; }

    latinInput(id); latinInput(ph);
    // P1-1/P2-1: מסננים (רווחים, מקפים, ‎+972 → 0) ורק אז חותכים – בלי maxlength שחותך לפני הסינון
    Validate.bindNormalize(id, 'id', function () { if (id.getAttribute('aria-invalid') === 'true') UI.fieldError(id, null); });
    Validate.bindNormalize(ph, 'mobile', function () { if (ph.getAttribute('aria-invalid') === 'true') UI.fieldError(ph, null); });
    if (saved) { id.value = Validate.normalizeId(id.value); ph.value = Validate.normalizeMobile(ph.value); }

    function validate() {
      var badId = !Validate.israeliId(id.value);
      var badPh = !Validate.mobile(ph.value);
      UI.fieldError(id, badId ? (Validate.digits(id.value) ? ERR_ID : EMPTY_ID) : null);
      UI.fieldError(ph, badPh ? (Validate.digits(ph.value) ? ERR_PH : EMPTY_PH) : null);
      return badId ? id : (badPh ? ph : null);
    }
    // B-05: בזמן "שולחים קוד…" השדות נעולים (readOnly), כדי שמסך הקוד לא יציג מספר ישן
    function lock(on) { id.readOnly = on; ph.readOnly = on; }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (btn.getAttribute('aria-busy') === 'true') return;
      var bad = validate();
      if (bad) { bad.focus(); return; }
      UI.store.set('fd.login', { id: Validate.digits(id.value), ph: ph.value });
      var d = Validate.digits(ph.value);
      UI.store.set('fd.phone', d);
      UI.setBusy(btn, true, 'שולחים קוד…');
      lock(true);
      // push: Back ממסך הקוד חוזר לטופס (לתיקון המספר). מסך הקוד מוחלף במסך המצב (P1-5)
      // ?ph= – גם כשהאחסון חסום מסך הקוד מציג את המספר שהוזן (QA_INPUTS P3-14), כמו בבית B
      setTimeout(function () { window.location.href = 'otp.html?ph=' + encodeURIComponent(Validate.maskMobile(d)); }, 1200);
    });
    // חזרה מ-bfcache (Back) – משחררים את מצב הטעינה
    window.addEventListener('pageshow', function (e) { if (e.persisted && demo !== 'loading') { UI.setBusy(btn, false); lock(false); } });

    if (UI.param('check') === '1' && saved) {
      // הגעה מהבית בערבית עם ערכים חסרים/שגויים (F01): הערכים מולאו מראש, ומציגים את השגיאות מיד
      var firstBad = validate();
      if (firstBad) UI.focus(firstBad);
    } else if (demo === 'errors') {
      id.value = '12'; ph.value = '052';
      validate();
    } else if (demo === 'loading') {
      id.value = '000000018'; ph.value = '0541234567';
      UI.setBusy(btn, true, 'שולחים קוד…');
      lock(true);
    }
  }

  /* ---------- P03 ---------- */
  function initOtp() {
    // P1-5: חזרה (Back/Forward) למסך הקוד אחרי שהאימות כבר הצליח – ממשיכים למסך המצב, לא מבקשים קוד שוב
    function verifiedBefore() { var ss = UI.store.get('fd.session', null); return !!(ss && ss.verified && !demo); }
    function backForward() {
      try { var n = performance.getEntriesByType('navigation')[0]; return !!n && n.type === 'back_forward'; } catch (x) { return false; }
    }
    if (verifiedBefore() && backForward()) { window.location.replace('status.html?s=' + scenario()); return; }
    window.addEventListener('pageshow', function (e) { if (e.persisted && verifiedBefore()) window.location.replace('status.html?s=' + scenario()); });
    var form = document.getElementById('otp-form');
    var boxes = UI.qsa('#otp-boxes input');
    var err = document.getElementById('otp-err');
    var timerEl = document.getElementById('otp-timer');
    var resendEl = document.getElementById('otp-resend');
    var live = document.getElementById('otp-timer-live');
    var submit = document.getElementById('otp-submit');
    var cont = document.getElementById('otp-continue');
    var ok = document.getElementById('otp-ok');
    var blockedEl = document.getElementById('otp-blocked');
    var attempts = 3;
    var sec = 45;
    var iv = null;
    var verified = false;

    // מספר הנייד הממוסך: מה שהוזן ב-login, או ?ph=, או ברירת המחדל
    var phone = Validate.digits(UI.store.get('fd.phone', '') || UI.param('ph') || '');
    var masked = Validate.mobile(phone) ? Validate.maskMobile(phone) : ((UI.param('ph') || '').indexOf('•') > 0 ? UI.param('ph') : '');
    if (masked) {
      document.getElementById('otp-phone').textContent = masked;
      // קוראי מסך: "נייד שמסתיים ב-4567" במקום "תבליט תבליט תבליט" (QA_COPY 3.44)
      var srPh = document.getElementById('otp-phone-sr');
      if (srPh) srPh.textContent = 'שמסתיים ב-' + masked.slice(-4);
    }

    document.getElementById('otp-edit').addEventListener('click', function () { window.location.href = 'login.html'; });

    /* תיבות */
    function fill(from, digits) {
      for (var i = 0; i < digits.length && from + i < boxes.length; i++) boxes[from + i].value = digits[i];
      var next = Math.min(from + digits.length, boxes.length - 1);
      boxes[next].focus();
      boxes[next].select && boxes[next].select();
    }
    function onlyDigits(s) { return latin(s).replace(/\D/g, ''); }
    /* P2-7/P3-8: בלי maxlength בתיבות. ספרה שהוקלדה לתיבה מלאה (מגע/IME, שם e.key הוא "Unidentified")
       מחליפה את הקיימת; רצף של כמה ספרות (מילוי אוטומטי/הדבקת IME) מתפזר – 6 ספרות תמיד מהתיבה הראשונה */
    boxes.forEach(function (b, i) {
      b.addEventListener('input', function (e) {
        var d = onlyDigits(b.value);
        clearError();
        if (d.length > 1) {
          var typed = onlyDigits(e && e.data);
          if (typed.length === 1 && d.length === 2 && e.inputType !== 'insertFromPaste') {
            b.value = typed;
            if (i < boxes.length - 1) boxes[i + 1].focus();
            return;
          }
          b.value = ''; fill(d.length >= 6 ? 0 : i, d.slice(0, 6)); return;
        }
        b.value = d;
        if (d && i < boxes.length - 1) boxes[i + 1].focus();
      });
      b.addEventListener('paste', function (e) {
        var t = '';
        try { t = (e.clipboardData || window.clipboardData).getData('text'); } catch (x) { /* */ }
        var d = onlyDigits(t);
        if (!d) { e.preventDefault(); return; }
        e.preventDefault();
        clearError();
        fill(d.length >= 6 ? 0 : i, d.slice(0, 6));
      });
      b.addEventListener('keydown', function (e) {
        // ספרה בתיבה מלאה מחליפה את הקיימת (גם כשהסמן לא מסמן אותה, למשל אחרי קוד שגוי)
        if (/^\d$/.test(e.key) && b.value && !e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault();
          b.value = e.key;
          clearError();
          if (i < boxes.length - 1) boxes[i + 1].focus();
          return;
        }
        if (e.key === 'Backspace' && !b.value && i > 0) {
          e.preventDefault();
          boxes[i - 1].value = '';
          boxes[i - 1].focus();
          clearError();
        } else if (e.key === 'ArrowLeft' && i > 0) { e.preventDefault(); boxes[i - 1].focus(); }
        else if (e.key === 'ArrowRight' && i < boxes.length - 1) { e.preventDefault(); boxes[i + 1].focus(); }
      });
      b.addEventListener('focus', function () {
        // P3-8: אין מילוי מחוץ לסדר – הקשה על תיבה כשתיבה קודמת ריקה מעבירה לתיבה הריקה הראשונה
        for (var j = 0; j < i; j++) { if (!boxes[j].value) { boxes[j].focus(); return; } }
        try { b.select(); } catch (x) { /* */ }
      });
    });

    function code() { return boxes.map(function (b) { return b.value; }).join(''); }

    function showError(html) {
      err.innerHTML = UI.icon('alert-circle', { size: 18 }) + '<span>' + html + '</span>';
      err.hidden = false;
      boxes.forEach(function (b) { b.setAttribute('aria-invalid', 'true'); b.setAttribute('aria-describedby', 'otp-err'); });
    }
    function clearError() {
      if (attempts <= 0 || err.hidden) return;
      err.hidden = true;
      boxes.forEach(function (b) { b.setAttribute('aria-invalid', 'false'); b.removeAttribute('aria-describedby'); });
    }

    /* טיימר – מתעדכן כל שנייה, מוכרז רק כל 15 שניות ובסיום */
    function fmt(s) { return '0:' + (s < 10 ? '0' : '') + s; }
    function renderTimer(announce) {
      if (attempts <= 0 || verified) return; // חסום/אומת – אין מונה ואין "שלחו שוב"
      var waiting = sec > 0;
      timerEl.hidden = !waiting;
      resendEl.hidden = waiting;
      if (waiting) timerEl.innerHTML = 'לא קיבלתם? שליחה חוזרת בעוד <span class="num" dir="ltr">' + fmt(sec) + '</span>';
      if (announce) live.textContent = waiting ? 'לא קיבלתם? שליחה חוזרת בעוד ' + fmt(sec) : 'לא קיבלתם? שלחו שוב';
    }
    function startTimer(from) {
      sec = from;
      clearInterval(iv);
      renderTimer(false);
      if (sec <= 0) return;
      iv = setInterval(function () {
        sec -= 1;
        renderTimer(sec % 15 === 0);
        if (sec <= 0) clearInterval(iv);
      }, 1000);
    }
    document.getElementById('otp-resend-btn').addEventListener('click', function () {
      if (verified || attempts <= 0) return; // B-06: לא מוחקים קוד שכבר אומת
      startTimer(45);
      live.textContent = 'לא קיבלתם? שליחה חוזרת בעוד ' + fmt(45);
      boxes.forEach(function (b) { b.value = ''; });
      if (attempts > 0) clearError();
      boxes[0].focus();
    });

    /* אימות */
    function startSession() {
      var login = UI.store.get('fd.login', null) || {};
      var id = login.id || '000000018';
      var prev = UI.store.get('fd.session', null);
      // משתמש אחר = נתונים אחרים: הזמנה/הנפקה קודמת נשמרת רק לאותה ת״ז
      if (!prev || prev.id !== id) { UI.store.remove('fd.order'); UI.store.remove('fd.reissue'); }
      UI.store.set('fd.session', { id: id, phoneMasked: masked || document.getElementById('otp-phone').textContent, scenario: scenario(), verified: true });
    }
    // P1-5: replace – מסך הקוד לא נשאר בהיסטוריה, ו-Back ממסך המצב חוזר לטופס ההזדהות / לעמוד שלפניו
    function goStatus() { window.location.replace(cont.getAttribute('href')); }
    function setVerified(auto) {
      verified = true;
      // B-06: אחרי אימות אין מונה ואין "שלחו שוב"
      clearInterval(iv);
      timerEl.hidden = true;
      resendEl.hidden = true;
      live.textContent = '';
      boxes.forEach(function (b) { b.readOnly = true; });
      cont.setAttribute('href', 'status.html?s=' + scenario());
      if (auto) startSession();
      cont.addEventListener('click', function (e) {
        if (e.button > 0 || e.ctrlKey || e.metaKey || e.shiftKey) return;
        e.preventDefault();
        if (!auto) startSession();
        goStatus();
      });
      clearError();
      ok.hidden = false;
      var hadFocus = form.contains(document.activeElement);
      submit.hidden = true;
      cont.hidden = false;
      // P3-4: הכפתור המפוקס הוסתר – הפוקוס עובר להודעת האישור (לא נופל ל-BODY)
      if (hadFocus || document.activeElement === document.body) { try { ok.focus({ preventScroll: true }); } catch (x) { ok.focus(); } }
      if (auto) setTimeout(goStatus, 1500);
    }
    /* P2-10: בחסימה "שלחו שוב" לא משחרר אותה (בשירות האמיתי החסימה בצד השרת – 10 דקות [לאישור]), ולכן הוא לא מוצע:
       המונה ו"שלחו שוב" מוסתרים, ובמקומם קישור חיוג למוקד. הפוקוס עובר להודעה (tabindex=-1), לא נופל ל-BODY */
    function block() {
      clearInterval(iv);
      timerEl.hidden = true;
      resendEl.hidden = true;
      if (blockedEl) blockedEl.hidden = false;
      live.textContent = '';
      boxes.forEach(function (b) { b.disabled = true; });
      submit.disabled = true;
      showError('הגעתם למספר הניסיונות המרבי. אפשר לנסות שוב בעוד 10 דקות, או לחייג למוקד. <span class="tbc">[לאישור]</span>');
      try { err.focus({ preventScroll: true }); } catch (x) { err.focus(); }
      UI.ensureVisible(err);
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (verified || attempts <= 0) return;
      var c = code();
      if (c.length < 6) { showError('יש להזין את כל 6 הספרות של הקוד.'); boxes.filter(function (b) { return !b.value; })[0].focus(); return; }
      if (c !== WRONG) { setVerified(true); return; }
      attempts -= 1;
      if (attempts === 2) showError('הקוד לא נכון. נותרו 2 ניסיונות.');
      else if (attempts === 1) showError('הקוד לא נכון. נותר ניסיון אחד.');
      else { block(); return; }
      boxes[0].focus();
    });

    /* מצבי הדגמה */
    if (demo === 'error') {
      boxes.forEach(function (b) { b.value = '1'; });
      attempts = 2;
      showError('הקוד לא נכון. נותרו 2 ניסיונות.');
      startTimer(12);
    } else if (demo === 'resend') {
      startTimer(0);
    } else if (demo === 'verified') {
      DEMO_CODE.split('').forEach(function (d, i) { boxes[i].value = d; });
      startTimer(30);
      setVerified(false);
    } else {
      startTimer(45);
    }
  }
})();
