/* validation.js – ולידציות. גלובלי: window.Validate */
(function () {
  'use strict';
  function digits(s) { return String(s == null ? '' : s).replace(/\D/g, ''); }

  // ת״ז ישראלית: עד 9 ספרות, השלמת אפסים משמאל, ספרת ביקורת (משקלות 1,2,1,2…)
  function israeliId(input) {
    var v = digits(input);
    if (!v || v.length > 9) return false;
    v = ('000000000' + v).slice(-9);
    var sum = 0;
    for (var i = 0; i < 9; i++) {
      var d = Number(v[i]) * ((i % 2) + 1);
      sum += d > 9 ? d - 9 : d;
    }
    return sum % 10 === 0;
  }

  function mobile(input) { return /^05\d{8}$/.test(digits(input)); }

  function maskMobile(input) {
    var v = digits(input);
    if (v.length < 7) return v;
    return v.slice(0, 3) + '-•••-' + v.slice(-4);
  }

  function otp(input) { return /^\d{6}$/.test(digits(input)); }

  /* נרמול קלט (P1-1, P2-1): מסננים קודם ורק אז חותכים – כך פורמטים רגילים לא מאבדים ספרה בשקט.
     normalizeMobile: ספרות בלבד; קידומת בינלאומית ‎+972 / 972 / 00972 (גם ‎+972-0-52…) → 0; עד 10 ספרות.
       בזמן הקלדה של קידומת (פחות מ-11 ספרות שמתחילות ב-972) הערך נשאר כמו שהוא, עם ה-+ אם הוקלד.
     normalizeId: ספרות בלבד (רווחים, מקפים, נקודות יורדים), עד 9. */
  function normalizeMobile(input) {
    var raw = String(input == null ? '' : input);
    var v = digits(raw);
    if (/^00972/.test(v)) v = v.slice(2);
    if (/^972/.test(v)) {
      if (v.length < 11) return (/^\s*\+/.test(raw) ? '+' : '') + v; // עדיין מקלידים את הקידומת
      v = v.slice(3);
      if (v.charAt(0) !== '0') v = '0' + v;
    }
    return v.slice(0, 10);
  }
  function normalizeId(input) { return digits(input).slice(0, 9); }

  /* Validate.bindNormalize(input, 'mobile' | 'id', onChange?) – מאזין input שמנרמל ושומר על מיקום הסמן
     (לפי מספר הספרות שלפניו). מחזיר את פונקציית הנרמול. */
  function bindNormalize(input, kind, onChange) {
    if (!input) return null;
    var fn = kind === 'id' ? normalizeId : normalizeMobile;
    input.addEventListener('input', function () {
      var before = input.value;
      var v = fn(before);
      if (v !== before) {
        var caret = null;
        try { caret = input.selectionStart; } catch (e) { caret = null; }
        input.value = v;
        if (caret !== null && document.activeElement === input) {
          var n = digits(before.slice(0, caret)).length;
          var pos = v.length;
          if (caret < before.length) { // עריכה באמצע: הסמן אחרי אותה ספרה
            var c = 0; pos = 0;
            while (pos < v.length && c < n) { if (/\d/.test(v.charAt(pos))) c++; pos++; }
          }
          try { input.setSelectionRange(pos, pos); } catch (e) { /* type=tel/number */ }
        }
      }
      if (onChange) onChange(input.value);
    });
    return fn;
  }

  // כרטיס אשראי (בסיסי, לאב-טיפוס)
  function cardNumber(input) { var v = digits(input); return v.length >= 12 && v.length <= 19; }
  function cardExpiry(input) { return /^(0[1-9]|1[0-2])\/\d{2}$/.test(String(input || '').trim()); }
  function cvv(input) { return /^\d{3,4}$/.test(String(input || '').trim()); }

  window.Validate = {
    digits: digits, israeliId: israeliId, mobile: mobile, maskMobile: maskMobile, otp: otp,
    cardNumber: cardNumber, cardExpiry: cardExpiry, cvv: cvv,
    normalizeMobile: normalizeMobile, normalizeId: normalizeId, bindNormalize: bindNormalize
  };
})();
