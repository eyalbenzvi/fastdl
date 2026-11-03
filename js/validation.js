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

  // כרטיס אשראי (בסיסי, לאב-טיפוס)
  function cardNumber(input) { var v = digits(input); return v.length >= 12 && v.length <= 19; }
  function cardExpiry(input) { return /^(0[1-9]|1[0-2])\/\d{2}$/.test(String(input || '').trim()); }
  function cvv(input) { return /^\d{3,4}$/.test(String(input || '').trim()); }

  window.Validate = {
    digits: digits, israeliId: israeliId, mobile: mobile, maskMobile: maskMobile, otp: otp,
    cardNumber: cardNumber, cardExpiry: cardExpiry, cvv: cvv
  };
})();
