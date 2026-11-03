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
  var ERR_ID = 'מספר תעודת הזהות לא תקין. בדקו שהזנתם 9 ספרות.';
  var ERR_PH = 'מספר הנייד צריך להתחיל ב-05 ולהכיל 10 ספרות.';
  var SCENARIOS = [ // הכותרות = התגים במסך המצב (status.js STATE_UI)
    ['S0', 'לא נמצאה בקשה'], ['S1', 'אפשר להזמין'], ['S2', 'הזמנה בוצעה'], ['S3', 'בייצור'], ['S4', 'בדרך אליכם'],
    ['S5', 'מחכה לכם'], ['S6', 'נמסרה'], ['S7', 'לא אושרה מסירה'], ['S8', 'המסירה נכשלה'], ['S9', '2 בקשות']
  ];
  function validScenario(s) { return SCENARIOS.some(function (x) { return x[0] === s; }); }

  if (UI.param('reset') === '1') ['fd.session', 'fd.order', 'fd.reissue', 'fd.login', 'fd.phone', 'fd.scenario'].forEach(function (k) { UI.store.remove(k); });
  if (validScenario(UI.param('scenario'))) UI.store.set('fd.scenario', UI.param('scenario'));
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

    id.addEventListener('input', function () {
      var v = id.value.replace(/\D/g, '').slice(0, 9);
      if (v !== id.value) id.value = v;
      if (id.getAttribute('aria-invalid') === 'true') UI.fieldError(id, null);
    });
    ph.addEventListener('input', function () {
      var v = ph.value.replace(/[^\d-]/g, '').slice(0, 11);
      if (v !== ph.value) ph.value = v;
      if (ph.getAttribute('aria-invalid') === 'true') UI.fieldError(ph, null);
    });

    function validate() {
      var badId = !Validate.israeliId(id.value);
      var badPh = !Validate.mobile(ph.value);
      UI.fieldError(id, badId ? ERR_ID : null);
      UI.fieldError(ph, badPh ? ERR_PH : null);
      return badId ? id : (badPh ? ph : null);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (btn.disabled) return;
      var bad = validate();
      if (bad) { bad.focus(); return; }
      UI.store.set('fd.login', { id: Validate.digits(id.value), ph: ph.value });
      UI.store.set('fd.phone', Validate.digits(ph.value));
      UI.setBusy(btn, true, 'שולחים קוד…');
      setTimeout(function () { window.location.href = 'otp.html'; }, 1200);
    });

    if (demo === 'errors') {
      id.value = '12'; ph.value = '052';
      validate();
    } else if (demo === 'loading') {
      id.value = '000000018'; ph.value = '0541234567';
      UI.setBusy(btn, true, 'שולחים קוד…');
    }
  }

  /* ---------- P03 ---------- */
  function initOtp() {
    var form = document.getElementById('otp-form');
    var boxes = UI.qsa('#otp-boxes input');
    var err = document.getElementById('otp-err');
    var timerEl = document.getElementById('otp-timer');
    var resendEl = document.getElementById('otp-resend');
    var live = document.getElementById('otp-timer-live');
    var submit = document.getElementById('otp-submit');
    var cont = document.getElementById('otp-continue');
    var ok = document.getElementById('otp-ok');
    var attempts = 3;
    var sec = 45;
    var iv = null;
    var verified = false;

    // מספר הנייד הממוסך: מה שהוזן ב-login, או ?ph=, או ברירת המחדל
    var phone = Validate.digits(UI.store.get('fd.phone', '') || UI.param('ph') || '');
    var masked = Validate.mobile(phone) ? Validate.maskMobile(phone) : ((UI.param('ph') || '').indexOf('•') > 0 ? UI.param('ph') : '');
    if (masked) document.getElementById('otp-phone').textContent = masked;

    document.getElementById('otp-edit').addEventListener('click', function () { window.location.href = 'login.html'; });

    /* תיבות */
    function fill(from, digits) {
      for (var i = 0; i < digits.length && from + i < boxes.length; i++) boxes[from + i].value = digits[i];
      var next = Math.min(from + digits.length, boxes.length - 1);
      boxes[next].focus();
      boxes[next].select && boxes[next].select();
    }
    boxes.forEach(function (b, i) {
      b.addEventListener('input', function () {
        var d = b.value.replace(/\D/g, '');
        clearError();
        if (d.length > 1) { b.value = ''; fill(d.length >= 6 ? 0 : i, d.slice(0, 6)); return; }
        b.value = d;
        if (d && i < boxes.length - 1) boxes[i + 1].focus();
      });
      b.addEventListener('paste', function (e) {
        var t = '';
        try { t = (e.clipboardData || window.clipboardData).getData('text'); } catch (x) { /* */ }
        var d = String(t || '').replace(/\D/g, '');
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
      b.addEventListener('focus', function () { try { b.select(); } catch (x) { /* */ } });
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
      UI.store.set('fd.session', { id: id, phoneMasked: masked || document.getElementById('otp-phone').textContent, scenario: scenario() });
    }
    function setVerified(auto) {
      verified = true;
      cont.setAttribute('href', 'status.html?s=' + scenario());
      if (auto) startSession(); else cont.addEventListener('click', startSession);
      clearError();
      ok.hidden = false;
      submit.hidden = true;
      cont.hidden = false;
      if (auto) setTimeout(function () { window.location.href = cont.getAttribute('href'); }, 1500);
    }
    function block() {
      boxes.forEach(function (b) { b.disabled = true; });
      submit.disabled = true;
      showError('חסמנו זמנית את הניסיונות. נסו שוב בעוד 10 דקות או פנו למוקד. <span class="tbc">[לאישור]</span>');
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
