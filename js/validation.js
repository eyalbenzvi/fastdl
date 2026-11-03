/* validation.js – ולידציות. גלובלי: window.Validate */
(function () {
  'use strict';

  /* ספרות ערביות-הודיות (٠–٩, U+0660) ופרסיות (۰–۹, U+06F0) → 0–9 (QA_INPUTS P1-2).
     מקלדת ערבית/פרסית ב-inputmode=numeric/tel מפיקה אותן; בלי המיפוי \D מוחק אותן בשקט. */
  function toLatinDigits(s) {
    return String(s == null ? '' : s).replace(/[٠-٩۰-۹]/g, function (c) {
      var n = c.charCodeAt(0);
      return String(n >= 0x06F0 ? n - 0x06F0 : n - 0x0660);
    });
  }
  function digits(s) { return toLatinDigits(s).replace(/\D/g, ''); }

  // ת״ז ישראלית: עד 9 ספרות, השלמת אפסים משמאל, ספרת ביקורת (משקלות 1,2,1,2…). מספר שכולו אפסים נדחה (QA_INPUTS P2-2)
  function israeliId(input) {
    var v = digits(input);
    if (!v || v.length > 9 || /^0+$/.test(v)) return false;
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

  /* נרמול קלט (P1-1, P2-1): מסננים קודם ורק אז חותכים – כך פורמטים רגילים לא מאבדים ספרה בשקט.
     normalizeMobile: ספרות בלבד (גם ערביות/פרסיות); קידומת בינלאומית ‎+972 / 972 / 00972 (גם ‎+972-0-52…) → 0; עד 10 ספרות.
       בזמן הקלדה של קידומת ("+", "+97", "00", "0097", ‎+972 עם פחות מ-9 ספרות) הערך נשאר כמו שהוא (QA_INPUTS P3-7).
     noTrunc (הדבקה): לא חותכים – 11 ספרות שהודבקו נשארות ונכשלות בוולידציה, במקום להפוך בשקט למספר אחר (P3-6).
     normalizeId: ספרות בלבד (רווחים, מקפים, נקודות יורדים), עד 9 (בהדבקה – בלי חיתוך). */
  function normalizeMobile(input, noTrunc) {
    var raw = toLatinDigits(input);
    var v = digits(raw);
    var plus = /^\s*\+/.test(raw);
    if (plus && '972'.indexOf(v) === 0) return '+' + v;          // "+", "+9", "+97"
    if (!plus && v.length < 5 && '00972'.indexOf(v) === 0 && v.length > 1) return v; // "00", "009", "0097"
    if (/^00972/.test(v)) {
      if (v.length < 13) return v;                                 // עדיין מקלידים 00972…
      v = v.slice(2);
    }
    if (/^972/.test(v)) {
      if (v.length < 11) return (plus ? '+' : '') + v;             // עדיין מקלידים את הקידומת
      v = v.slice(3);
      if (v.charAt(0) !== '0') v = '0' + v;
    }
    return noTrunc ? v : v.slice(0, 10);
  }
  function normalizeId(input, noTrunc) { var v = digits(input); return noTrunc ? v : v.slice(0, 9); }

  /* Validate.bindNormalize(input, 'mobile' | 'id' | 'digits', onChange?) – מאזין input שמנרמל ושומר על מיקום הסמן
     (לפי מספר הספרות שלפניו). הדבקה/גרירה לא נחתכת (ראו normalizeMobile). מחזיר את פונקציית הנרמול. */
  function bindNormalize(input, kind, onChange) {
    if (!input) return null;
    var fn = kind === 'id' ? normalizeId : kind === 'digits' ? function (s) { return digits(s); } : normalizeMobile;
    input.addEventListener('input', function (e) {
      var before = input.value;
      var pasted = !!(e && /^insertFrom(Paste|Drop)$/.test(e.inputType || ''));
      var v = fn(before, pasted);
      if (v !== before) {
        var caret = null;
        try { caret = input.selectionStart; } catch (err) { caret = null; }
        input.value = v;
        if (caret !== null && document.activeElement === input) {
          var n = digits(before.slice(0, caret)).length;
          var pos = v.length;
          if (caret < before.length) { // עריכה באמצע: הסמן אחרי אותה ספרה
            var c = 0; pos = 0;
            while (pos < v.length && c < n) { if (/\d/.test(v.charAt(pos))) c++; pos++; }
          }
          try { input.setSelectionRange(pos, pos); } catch (err) { /* type=tel/number */ }
        }
      }
      if (onChange) onChange(input.value);
    });
    return fn;
  }

  /* ---------- כרטיס אשראי (לאב-טיפוס) ---------- */
  function cardNumber(input) { var v = digits(input); return v.length >= 12 && v.length <= 19; }
  // Luhn (QA_INPUTS P2-5). מספר שכולו אפסים עובר Luhn מתמטית – נדחה במפורש
  function luhn(input) {
    var v = digits(input);
    if (v.length < 2 || /^0+$/.test(v)) return false;
    var sum = 0, dbl = false;
    for (var i = v.length - 1; i >= 0; i--) {
      var d = Number(v.charAt(i));
      if (dbl) { d *= 2; if (d > 9) d -= 9; }
      sum += d; dbl = !dbl;
    }
    return sum % 10 === 0;
  }
  /* "עכשיו" של האב-טיפוס: FD_DATA.now (2026-08-25T02:12), לא השעון האמיתי – כך המצבים קבועים */
  function protoNow() {
    var s = window.FD_DATA && window.FD_DATA.now;
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(s || ''));
    return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(2026, 7, 25);
  }
  /* Validate.normalizeExpiry('12/2028' | '1228' | '1/28' | '12 / 28' | '122028' | '528') → 'MM/YY' (QA_INPUTS P2-4, P3-4).
     מה שאי אפשר לפרש בביטחון חוזר כמו שהוא (אחרי trim), והוולידציה תיכשל ב-'format'. */
  function normalizeExpiry(input) {
    var s = toLatinDigits(input).trim();
    var pad = function (m) { return (m.length === 1 ? '0' : '') + m; };
    var m = /^(\d{1,2})\s*[\/\-.\s]\s*(\d{2}|\d{4})$/.exec(s);
    if (m) return pad(m[1]) + '/' + m[2].slice(-2);
    var d = s.replace(/\D/g, '');
    if (/[^\d\s\/\-.]/.test(s)) return s;
    if (d.length === 4) return d.slice(0, 2) + '/' + d.slice(2);
    if (d.length === 6 && /^20/.test(d.slice(2))) return d.slice(0, 2) + '/' + d.slice(4);  // MMYYYY
    if (d.length === 3 && d.charAt(0) >= '2') return '0' + d.charAt(0) + '/' + d.slice(1);  // 528 → 05/28
    return s;
  }
  /* Validate.cardExpiry(s, now?) → {ok, reason:'format'|'past'}. MM/YY (גם קלט שעובר normalizeExpiry),
     וכרטיס בתוקף עד סוף החודש הרשום – לכן החודש הנוכחי תקין. now: ברירת מחדל = "עכשיו" של האב-טיפוס */
  function cardExpiry(input, now) {
    var v = normalizeExpiry(input);
    var m = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(v);
    if (!m) return { ok: false, reason: 'format' };
    var n = now instanceof Date ? now : protoNow();
    var y = 2000 + Number(m[2]), mo = Number(m[1]);
    if (y < n.getFullYear() || (y === n.getFullYear() && mo < n.getMonth() + 1)) return { ok: false, reason: 'past' };
    return { ok: true, reason: null };
  }
  // CVV: 3–4 ספרות; כשידוע מספר הכרטיס – אמריקן אקספרס (34/37) 4 ספרות, אחרים 3 (QA_INPUTS P3-5)
  function cvv(input, card) {
    var v = toLatinDigits(input).trim();
    if (card != null && digits(card)) return (/^3[47]/.test(digits(card)) ? /^\d{4}$/ : /^\d{3}$/).test(v);
    return /^\d{3,4}$/.test(v);
  }
  /* מייל פרגמטי (QA_INPUTS P2-6): local@domain.tld, בלי רווחים, סיומת של 2 תווים לפחות. Unicode/IDN מותר */
  function email(input) {
    var v = String(input == null ? '' : input).trim();
    // בלי רווחים ובלי תווים שאינם חוקיים בכתובת רגילה (<>()[]\,;:")
    return v.length <= 254 && /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:".]+(\.[^\s@<>()[\]\\,;:".]+)*\.[^\s@<>()[\]\\,;:".]{2,}$/.test(v);
  }

  window.Validate = {
    toLatinDigits: toLatinDigits, digits: digits, israeliId: israeliId, mobile: mobile, maskMobile: maskMobile,
    cardNumber: cardNumber, luhn: luhn, cardExpiry: cardExpiry, normalizeExpiry: normalizeExpiry, cvv: cvv, email: email,
    normalizeMobile: normalizeMobile, normalizeId: normalizeId, bindNormalize: bindNormalize
  };
})();
