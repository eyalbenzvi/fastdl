/* status.js – מסך המצב P04 (S0–S9 + טעינה). תבנית אחת, טבלת STATE_UI אחת.
   פרמטרים: s, ans (S0), docs=1 (S0), reveal=1 (S7), method=express (S3), demo=toast (S4),
   doc=license|tag|boat (סוג התעודה; נבחר ב-S9 – משנה גם את שם המסמך בכל הטקסטים).
   מסע בדיקה (J): אם יש session/הזמנה/הנפקה חוזרת שמורים (fd.session, fd.order, fd.reissue) וה-URL לא נושא פרמטרי
   הדגמה מעבר ל-s/step/doc ולפרמטרים שנכתבים מפעולת משתמש (ans/docs/reveal, P2-3) – S2/S3 מציגים את מה שנבחר בפועל, וברירת המחדל/S1 עוברת ל-S2 (ייצור בהמתנה) או S3.
   עם פרמטרי הדגמה מפורשים מוצגים תמיד נתוני ההדמיות.
   ציר: תאריך מתחת לכל שלב (בפועל או "צפוי"), מחושב מהשיטה שנבחרה (ETA) וממועד הייצור. במובייל – ציר קומפקטי
   עם כפתור "כל השלבים" (UX_RECOMMENDATIONS החלטה 4). */
(function () {
  'use strict';

  var D = window.FD_DATA || {};
  var REQ = D.request || {};
  var ADDR = (D.citizen && D.citizen.moin_address && D.citizen.moin_address.display) || 'רחוב העצמאות 10, באר שבע';
  var KEYS = ['S0', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'loading'];
  var DOC_TYPES = { license: 'רישיון נהיגה', tag: 'תג חניה לנכה', boat: 'רישיון משיט' };
  var NOUN = { license: 'הרישיון', tag: 'התג', boat: 'רישיון המשיט' }; // כולם בזכר – הפעלים בטקסט מתאימים לכולם
  var DAY = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];

  function I(n, o) { return UI.icon(n, o); }
  function n(s) { return '<span class="num" dir="ltr">' + s + '</span>'; }
  function tbc(s) { return '<span class="tbc">' + (s || '[לאישור]') + '</span>'; }
  function ext(text, cls, iconSize) {
    return '<a href="#" target="_blank" rel="noopener" class="' + (cls || 'ext-link') + '">' + text +
      I('external-link', { size: iconSize || 16 }) + '<span class="sr-only">(נפתח בלשונית חדשה)</span></a>';
  }
  function act(name, extra) { return ' data-action="' + name + '"' + (extra || ''); }
  function esc(s) { return UI.esc(String(s == null ? '' : s)); }
  function rich(s) { // escape + מספרים ב-LTR + [לאישור] מודגש
    return String(s == null ? '' : s).split(/(\[[^\]]*\])/).map(function (part) {
      if (/^\[.*\]$/.test(part)) return tbc(esc(part));
      return esc(part).replace(/\d+(?:[.:,\/-]\d+)*/g, function (x) { return n(x); });
    }).join('');
  }

  /* ---------- תאריכים: פורמט אחד "יום ד׳ 26.8 בשעה 05:12" (nowrap) ---------- */
  function pd(iso) { var p = iso.split('-'); return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2])); }
  function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function nextBiz(isoStr) { // ימי עסקים א׳–ה׳
    var d = pd(isoStr);
    do { d.setDate(d.getDate() + 1); } while (d.getDay() === 5 || d.getDay() === 6);
    return iso(d);
  }
  function dayName(isoStr) { return 'יום ' + DAY[pd(isoStr).getDay()]; }
  function dm(isoStr) { var d = pd(isoStr); return d.getDate() + '.' + (d.getMonth() + 1); }
  function fd(isoStr, time) { // "יום ד׳ 26.8" [+ " בשעה 05:12"], לא נשבר
    return '<span class="st-nw">' + dayName(isoStr) + ' ' + n(dm(isoStr)) + (time ? ' בשעה ' + n(time) : '') + '</span>';
  }

  var T = { // ציר הזמנים של הבקשה בהדמיה (FD_DATA.request)
    received: '2026-08-24', receivedTime: '05:12',
    close: '2026-08-26', closeTime: '05:12',
    prodNow: '2026-08-25', prodWait: '2026-08-26', prodTime: '07:00'
  };
  /* מועד הגעה לפי שיטה (ייצור מיידי). בהמתנה לסגירת החלון: מהיר ונתב״ג – יום עסקים אחד מאוחר יותר (07 §7.5) */
  var ETA = {
    pickup_bari: { pickup: true, from: '2026-08-26', time: '11:00' },
    pickup_tlv_airport: { pickup: true, from: '2026-08-26', shift: true },
    express_home: { by: '2026-08-26', shift: true },
    regular_home: { from: '2026-08-27', to: '2026-09-01' },
    registered_mail: { by: '2026-09-14' },
    regular_mail: { by: '2026-09-14' }
  };
  function eta(mid, prod) {
    var e = ETA[mid] || ETA.regular_mail, o = {};
    for (var k in e) o[k] = e[k];
    if (prod === 'wait' && e.shift) { if (o.by) o.by = nextBiz(o.by); if (o.from) o.from = nextBiz(o.from); }
    return o;
  }
  function etaText(mid, prod, mode) { // mode: 'will' (יגיע / יהיה מוכן) | 'exp' (צפוי…) | 'tl' (תווית קצרה לציר)
    var e = eta(mid, prod);
    if (e.pickup) {
      var at = fd(e.from) + (e.time ? ', מ-' + n(e.time) : '');
      return mode === 'will' ? 'יהיה מוכן לאיסוף מ' + at : mode === 'tl' ? 'צפוי: מ' + at : 'מוכן לאיסוף מ' + at;
    }
    var when = e.by ? 'עד ' + fd(e.by) : 'בין ' + fd(e.from) + ' ל' + fd(e.to);
    return mode === 'will' ? 'יגיע ' + when : mode === 'tl' ? 'צפוי ' + when : 'צפוי להגיע ' + when;
  }
  function shipDate(mid, prod) { // יום יציאת המשלוח / מוכן לאיסוף
    var e = eta(mid, prod);
    if (e.pickup) return e.from;
    return prod === 'wait' ? T.prodWait : T.prodNow; // יוצא לדרך ביום קובץ הייצור
  }

  /* ---------- מסע בדיקה: נתונים שמורים ---------- */
  var J = (function () {
    var demoParam = false;
    // ans/docs/reveal נכתבים ל-URL מפעולת משתמש (תשובה ב-S0, "לא קיבלתי" ב-S7) – לא מבטלים את נתוני המסע אחרי רענון (P2-3)
    UI.params().forEach(function (v, k) { if (['s', 'step', 'doc', 'ans', 'docs', 'reveal'].indexOf(k) < 0) demoParam = true; });
    if (demoParam) return null;
    var session = UI.store.get('fd.session', null);
    var order = committedView(UI.store.get('fd.order', null));
    var re = UI.store.get('fd.reissue', null);
    if (order && !(order.ordered && methodById(order.method))) order = null;
    if (re && !methodById(re.method)) re = null;
    if (!session && !order && !re) return null;
    return { session: session, order: order, re: re };
  })();
  // עריכה שלא הושלמה (P1-4): מסך המצב מציג את ההזמנה ששולמה (committed), לא את הטיוטה
  function committedView(o) {
    if (!o || !o.edit || !o.committed) return o;
    var v = {}, k;
    for (k in o) v[k] = o[k];
    for (k in o.committed) v[k] = o.committed[k];
    v.edit = false; v.committed = null; v.step = 5;
    return v;
  }
  function methodById(id) {
    var all = D.delivery_methods || [];
    for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
    return null;
  }
  function mName(id) { var m = methodById(id); return m ? m.name : ''; }
  var ORDER_NO = (D.order_example && D.order_example.order_number) || 'FD-2026-0841273';
  function moinWithExtras(x) {
    x = x || {};
    var parts = [rich(ADDR)];
    if (x.entrance) parts.push('כניסה ' + rich(x.entrance));
    if (x.care_of) parts.push('אצל ' + rich(x.care_of));
    if (x.mailbox) parts.push('על תיבת הדואר: ' + rich(x.mailbox));
    return parts.join(' · ');
  }
  function addrRow(o, m) { // מילון kv: "כתובת למשלוח" / "עמדת איסוף"
    if (!m.needs_address) return ['עמדת איסוף', rich(m.address || '')];
    if (o.auth && o.addr === 'other' && o.other && o.other.street) {
      var a = o.other;
      var line = 'רחוב ' + a.street + ' ' + (a.house || '') + (a.entrance ? ', כניסה ' + a.entrance : '') + (a.apt ? ', דירה ' + a.apt : '') +
        (a.city ? ', ' + a.city : '') + (a.zip ? ' ' + a.zip : '');
      return ['כתובת למשלוח', rich(line.replace(/\s+/g, ' ').trim()) + (a.care_of ? ' · אצל ' + rich(a.care_of) : '') + (a.mailbox ? ' · על תיבת הדואר: ' + rich(a.mailbox) : '')];
    }
    return ['כתובת למשלוח', moinWithExtras(o.extras)];
  }
  function amount(m, o) {
    // מה ששולם בפועל (אחרי עריכה – המחיר הקודם + ההפרש, order.js paidTotal)
    var x = o && typeof o.paidTotal === 'number' ? o.paidTotal : m.price;
    x = Math.round(x * 100) / 100;
    if (!x) return 'ללא עלות';
    return n((Number.isInteger(x) ? String(x) : x.toFixed(2)) + ' ₪');
  }

  /* ---------- State ---------- */
  var st = {
    s: 'S1', ans: -1, docs: false, reveal: false, method: '', doc: 'license',
    smsDone: false, notifyDone: false, gotIt: false, tlOpen: false
  };
  (function init() {
    var s = UI.param('s');
    st.s = KEYS.indexOf(s) >= 0 ? s : 'S1';
    var a = Number(UI.param('ans'));
    st.ans = UI.param('ans') !== null && a >= 0 && a <= 3 ? a : -1;
    st.docs = UI.param('docs') === '1' && st.s === 'S0' && st.ans === 1;
    st.reveal = UI.param('reveal') === '1';
    st.method = UI.param('method') === 'express' ? 'express' : '';
    st.doc = DOC_TYPES[UI.param('doc')] ? UI.param('doc') : 'license';
    if (J) {
      // הזמנה קיימת: S1/ברירת מחדל → S2 (ייצור בהמתנה, אפשר לערוך) או S3; בלי הזמנה – התרחיש שנבחר באימות
      if ((s === null || s === 'S1') && J.order) st.s = J.order.prod === 'wait' ? 'S2' : 'S3';
      else if (s === null && J.session && KEYS.indexOf(J.session.scenario) >= 0) st.s = J.session.scenario;
      if (st.s === 'S2' && J.order && J.order.prod !== 'wait') st.s = 'S3'; // הייצור כבר התחיל – אין יותר מה לערוך
      // P2-4: הנפקה חוזרת כבר הוזמנה – S7 (גם ?reveal=1 מ-Back) עובר ל-S3 שמציג אותה, ולא מציע להזמין שוב
      if (st.s === 'S7' && J.re) { st.s = 'S3'; st.reveal = false; if (UI.param('reveal')) UI.setParams({ reveal: null }); }
      if (st.s !== s) UI.setParams({ s: st.s });
      if (!UI.param('doc') && J.session && DOC_TYPES[J.session.doc]) st.doc = J.session.doc;
    }
  })();

  function docType() { return DOC_TYPES[st.doc] || REQ.document_type || DOC_TYPES.license; }
  function N() { return NOUN[st.doc] || NOUN.license; }
  function multi() { var d = UI.param('doc'); return d === 'license' || d === 'tag'; } // הגיעו מ-S9 (שתי בקשות)

  /* ---------- הקשר השיטה לכל מצב ---------- */
  function ctx(s) {
    s = s || st.s;
    if (s === 'S2') {
      if (J && J.order) return { mid: J.order.method, prod: J.order.prod === 'wait' ? 'wait' : 'now', ordered: true, order: J.order };
      return { mid: 'pickup_tlv_airport', prod: 'wait', ordered: true };
    }
    if (s === 'S3') {
      if (J && J.re) return { mid: J.re.method, prod: 'now', ordered: true, re: J.re };
      if (J && J.order) return { mid: J.order.method, prod: J.order.prod === 'wait' ? 'wait' : 'now', ordered: true, order: J.order };
      if (st.moved) return { mid: 'pickup_tlv_airport', prod: 'now', ordered: true, moved: true }; // הדגמה: S2 → "להתחיל עכשיו"
      if (st.method === 'express') return { mid: 'express_home', prod: 'now', ordered: true };
      return { mid: 'regular_mail', prod: 'wait', ordered: false }; // לא בוצעה הזמנה: ייצור אחרי סגירת החלון
    }
    var FIX = {
      S4: { mid: 'express_home', prod: 'now', ordered: true },
      S5: { mid: 'pickup_tlv_airport', prod: 'now', ordered: true },
      S6: { mid: 'express_home', prod: 'now', ordered: true },
      S7: { mid: 'regular_mail', prod: 'wait', ordered: false },
      S8: { mid: 'express_home', prod: 'now', ordered: true }
    };
    return FIX[s] || { mid: '', prod: 'wait', ordered: false };
  }
  function isPickup(c) { return !!(c.mid && ETA[c.mid] && ETA[c.mid].pickup); }

  /* ---------- "היום" בכל מצב (לשורת רעננות המידע) ---------- */
  function today() {
    if (st.s === 'S3') { var c = ctx('S3'); return c.re ? '2026-09-24' : c.prod === 'now' ? '2026-08-25' : '2026-08-26'; }
    return TODAY[st.s] || TODAY.S1;
  }
  var TODAY = { S0: '2026-08-25', S1: '2026-08-25', S2: '2026-08-25', S3: '2026-08-25', S4: '2026-08-26', S5: '2026-08-26',
    S6: '2026-08-27', S7: '2026-09-24', S8: '2026-08-26', S9: '2026-08-25' };
  function freshLine() {
    var t = today(), nx = nextBiz(t), tomorrow = iso(new Date(pd(t).getTime() + 864e5));
    var next = nx === tomorrow ? 'מחר בבוקר' : 'ב' + fd(nx) + ' בבוקר';
    return '<p class="small muted st-fresh">' + I('refresh', { size: 16 }) + '<span>המידע עודכן היום, ' + fd(t, '05:00') + ' · <span class="st-nw">העדכון הבא: ' + next + '</span></span></p>';
  }

  /* ---------- ציר: שלבים עם תאריכים ---------- */
  // cls: done | current | warn | fail | skip | future
  function steps(s) {
    var c = ctx(s), pick = isPickup(c);
    var prodDate = c.prod === 'wait' ? T.prodWait : T.prodNow;
    var r = [{ l: 'הבקשה התקבלה', cls: 'done', d: fd(T.received, T.receivedTime) }];
    // שלב 2
    if (s === 'S1') r.push({ l: 'בחירת משלוח', cls: 'current', d: 'עד ' + fd(T.close, T.closeTime) });
    else if (c.ordered) r.push({ l: 'הוזמן', cls: 'done', d: fd(c.re ? '2026-09-24' : '2026-08-25') });
    else r.push({ l: 'בחירת משלוח', cls: 'skip', d: 'לא נבחרה שיטה – דואר רגיל' });
    // שלב 3
    var p3 = { l: 'בייצור', cls: 'future', d: 'צפוי: ' + fd(prodDate, T.prodTime) };
    if (s === 'S1') p3.d = 'לכל המאוחר ב' + fd(T.prodWait);
    if (c.re) p3.d = 'בקובץ הייצור הקרוב';
    if (s === 'S3') { p3.cls = 'current'; p3.d = c.re ? 'בקובץ הייצור הקרוב' : 'מ' + fd(prodDate, T.prodTime); }
    if (['S4', 'S5', 'S6', 'S7', 'S8'].indexOf(s) >= 0) { p3.cls = 'done'; p3.d = fd(prodDate); }
    r.push(p3);
    // שלב 4 / 5 – לפי השיטה
    var l4 = pick ? 'מוכן לאיסוף' : 'נשלחה', l5 = pick ? 'נאסף' : 'נמסרה';
    var s4 = { l: l4, cls: 'future', d: '' }, s5 = { l: l5, cls: 'future', d: '' };
    if (c.re) { // הנפקה חוזרת: מועדים לפי כלל השיטה, מהייצור
      var rm = methodById(c.mid);
      if (isPickup(c)) s4.d = 'צפוי: ' + rich(rm.eta_rule); else s5.d = 'צפוי: ' + rich(rm.eta_rule);
    } else if (c.mid) {
      var sd = shipDate(c.mid, c.prod), e = eta(c.mid, c.prod);
      if (pick) s4.d = etaText(c.mid, c.prod, 'tl');
      else { s4.d = 'צפוי: ' + fd(sd); s5.d = etaText(c.mid, c.prod, 'tl'); }
      if (pick) s5.d = 'ניתן לאסוף עד ' + tbc('[לאישור]');
      if (s === 'S4' || s === 'S5' || s === 'S7' || s === 'S8') {
        s4.cls = s === 'S7' ? 'warn' : s === 'S8' ? 'fail' : 'current';
        s4.d = pick ? 'מ' + fd(e.from) : fd(sd);
        if (s === 'S7') s5.d = 'אין אישור מסירה';
        if (s === 'S8') { s4.d = 'מסירה נכשלה ב' + fd(sd); s5.d = ''; }
      }
      if (s === 'S6') { s4.cls = 'done'; s4.d = pick ? fd(e.from) : fd(sd); s5.cls = 'done'; s5.d = fd(e.by || e.from); }
    } else if (s === 'S1') {
      s5.d = 'לפי השיטה שתבחרו';
    }
    r.push(s4, s5);
    return r;
  }

  /* ---------- STATE_UI ---------- */
  var STATE_UI = {
    S0: {
      tone: 'neutral', icon: 'search', badge: 'לא נמצאה בקשה', h1: function () { return 'עדיין לא מצאנו אצלנו בקשה על שמכם'; }, tl: false,
      kv: function () { return []; },
      help: [['שאלות על אגרה ותשלום', 'faq.html'], ['המדריך: מה עושים מהתשלום ועד ' + 'הרישיון', 'guide.html']],
      now: nowS0
    },
    S1: {
      tone: 'success', icon: 'check', badge: 'אפשר להזמין', h1: function () { return 'הבקשה שלכם התקבלה\u00a0– אפשר לבחור משלוח'; }, tl: true,
      kv: function () { return [['סוג תעודה', docType()], ['כתובת למשלוח', rich(ADDR)]]; },
      help: [['השוואה בין שיטות המסירה', 'delivery.html'], ['מה קורה אם לא בוחרים?', 'faq.html']],
      now: nowS1
    },
    S2: {
      tone: 'info', icon: 'order-done', badge: 'הזמנה בוצעה', h1: function () { return 'ההזמנה שלכם התקבלה'; }, tl: true,
      kv: function () {
        var c = ctx('S2'), m = methodById(c.mid);
        if (c.order) return [['שיטת מסירה', esc(m.name)], addrRow(c.order, m), ['מספר הזמנה', n(ORDER_NO)], ['שולם', amount(m, c.order)]];
        return [['שיטת מסירה', 'איסוף מנתב״ג'], ['עמדת איסוף', 'נתב״ג, טרמינל 3, עמדת ״על הקו״'], ['מספר הזמנה', n(ORDER_NO)], ['שולם', n('118 ₪')]];
      },
      help: [['עמדות איסוף ושעות', 'pickup.html'], ['שאלות על הזמנה ומשלוח', 'faq.html']],
      now: nowS2
    },
    S3: {
      tone: 'navy', icon: 'gear-production', badge: 'בייצור', h1: function () { return N() + ' שלכם בייצור'; }, tl: true,
      kv: function () {
        var c = ctx('S3'), m = methodById(c.mid);
        if (c.re) return [['סוג הזמנה', 'הנפקה חוזרת – ללא עלות'], ['שיטת מסירה', esc(m.name)], ['כתובת למשלוח', moinWithExtras(c.re.extras)],
          ['מספר הזמנה', n(esc(c.re.number || 'FD-2026-0841274'))]];
        if (c.order) return [['שיטת מסירה', esc(m.name)], addrRow(c.order, m), ['מספר הזמנה', n(ORDER_NO)], ['שולם', amount(m, c.order)]];
        if (c.moved) return [['שיטת מסירה', 'איסוף מנתב״ג'], ['עמדת איסוף', 'נתב״ג, טרמינל 3, עמדת ״על הקו״'], ['מספר הזמנה', n(ORDER_NO)], ['שולם', n('118 ₪')]];
        return [['שיטת מסירה', c.ordered ? esc(m.name) : 'דואר רגיל (לא בוצעה הזמנה)'], ['כתובת למשלוח', rich(ADDR)]];
      },
      help: [['למה אי אפשר לשנות עכשיו?', 'faq.html']],
      now: nowS3
    },
    S4: {
      tone: 'ship', icon: 'truck', badge: 'בדרך אליכם', h1: function () { return N() + ' בדרך אליכם'; }, tl: true,
      kv: function () {
        return [['שיטת מסירה', 'משלוח מהיר עד הבית'], ['חברת משלוחים', tbc()],
          ['מספר מעקב', n('123456789'), { copy: '123456789' }], ['כתובת למשלוח', rich(ADDR)]];
      },
      help: [['מה קורה אם לא אהיה בבית?', 'faq.html'], ['שאלות על מסירה', 'faq.html']],
      now: nowS4
    },
    S5: {
      tone: 'success', icon: 'home-check', badge: 'מחכה לכם', h1: function () { return N() + ' מחכה לכם לאיסוף'; }, tl: true,
      kv: function () { return [['שיטת מסירה', 'איסוף מנתב״ג']]; },
      help: [['עמדות איסוף ושעות', 'pickup.html']],
      now: nowS5
    },
    S6: {
      tone: 'success', icon: 'check', badge: 'נמסרה', h1: function () { return N() + (isPickup(ctx('S6')) ? ' נאסף' : ' נמסר'); }, tl: true,
      kv: function () { return [['שיטת מסירה', 'משלוח מהיר עד הבית'], ['כתובת למשלוח', rich(ADDR)]]; },
      help: [['שאלות ותשובות', 'faq.html']],
      now: nowS6
    },
    S7: {
      tone: 'warning', icon: 'alert-triangle', badge: 'לא אושרה מסירה', h1: function () { return 'לא מצאנו אישור ש' + N() + ' נמסר'; }, tl: true,
      // "שיטת מסירה" כבר מופיעה ב"מה עכשיו?" ("נשלח בדואר רגיל" + בדיקת הזכאות) – לא חוזרת כאן (F20)
      kv: function () { return [['כתובת למשלוח', rich(ADDR)]]; },
      help: [['מתי מגיעה הנפקה חוזרת?', 'faq.html']],
      now: nowS7
    },
    S8: {
      tone: 'danger', icon: 'x-circle', badge: 'המסירה נכשלה', h1: function () { return 'השליח לא הצליח למסור את ' + N(); }, tl: true,
      kv: function () { return [['שיטת מסירה', 'משלוח מהיר עד הבית'], ['כתובת למשלוח', rich(ADDR)]]; },
      help: [['שאלות על מסירה', 'faq.html']],
      now: nowS8
    },
    S9: {
      tone: 'neutral', icon: 'files', badge: '2 בקשות', h1: function () { return 'מצאנו אצלנו שתי בקשות על שמכם'; }, tl: false,
      sub: 'באחת מהן צריך לבחור משלוח.',
      kv: function () { return []; },
      help: [['שאלות ותשובות', 'faq.html']],
      now: nowS9
    }
  };

  /* ---------- Shared blocks ---------- */
  function badge(tone, icon, text) {
    return '<span class="badge badge--' + tone + '">' + I(icon, { size: 18 }) + text + '</span>';
  }

  var SR = { done: ' (הושלם)', current: ' (שלב נוכחי)', warn: ' (שלב נוכחי – דורש תשומת לב)', fail: ' (שלב נוכחי – נכשל)', skip: ' (דולג)', future: '' };

  function timeline() {
    var list = steps(st.s);
    var last = 0; list.forEach(function (x, i) { if (x.cls !== 'future') last = i; });
    var cur = last, curStep = list[cur];
    var html = '<div class="card status-tl' + (st.tlOpen ? ' is-open' : '') + '">' +
      // מובייל: שורה קומפקטית + 5 נקודות + "כל השלבים"
      '<div class="st-tlsum"><div class="st-tlsum__main"><p class="st-tlsum__t">שלב ' + n(String(cur + 1)) + ' מתוך ' + n('5') + ': <strong>' + curStep.l + '</strong>' +
      (curStep.cls === 'done' ? ' ' + I('check', { size: 16, cls: 'st-tlsum__ok' }) : '') + '</p>' +
      '<span class="st-dots" aria-hidden="true">' + list.map(function (x) { return '<span class="st-dot st-dot--' + x.cls + '"></span>'; }).join('') + '</span></div>' +
      '<button type="button" class="link-btn st-tlsum__btn" aria-expanded="' + st.tlOpen + '" aria-controls="status-tl-list"' + act('tl') + '>' +
      (st.tlOpen ? 'הסתרת השלבים' : 'כל השלבים') + I('chevron-down', { size: 18, cls: 'st-tlsum__chev' }) + '</button></div>' +
      '<ol class="timeline st-tl" id="status-tl-list" aria-label="שלבי הטיפול בבקשה">' +
      '<span class="timeline__track" aria-hidden="true"></span>' +
      '<span class="timeline__fill" aria-hidden="true" style="width:' + (last * 20) + '%"></span>';
    list.forEach(function (x, i) {
      var isCur = ['current', 'warn', 'fail'].indexOf(x.cls) >= 0;
      var dot = x.cls === 'done' ? I('check', { size: 18, style: 'stroke-width:3' })
        : (x.cls === 'warn' || x.cls === 'fail') ? '<span aria-hidden="true" class="timeline__bang">!</span>'
        : x.cls === 'skip' ? '<span aria-hidden="true" class="timeline__bang">–</span>' : '';
      html += '<li class="timeline__step timeline__step--' + x.cls + '"' + (isCur ? ' aria-current="step"' : '') + '>' +
        '<span class="timeline__dot">' + dot + '</span><span class="st-tl__txt"><span class="st-tl__l">' + x.l + '<span class="sr-only">' + SR[x.cls] + '</span></span>' +
        (x.d ? '<span class="st-tl__d">' + x.d + '</span>' : '') + '</span></li>';
      void i;
    });
    return html + '</ol></div>';
  }

  function kvSection(rows) {
    rows = rows.filter(function (r) { return r && r[1] !== null && r[1] !== undefined && String(r[1]).replace(/<[^>]*>/g, '').trim() !== ''; });
    if (!rows.length) return '';
    return '<section class="card status-det" aria-labelledby="det-h"><h2 id="det-h" class="h2">פרטי הבקשה</h2><dl class="kv">' +
      rows.map(function (r) {
        var o = r[2] || {};
        var v = o.copy
          ? '<span class="copy-row">' + r[1] + '<button type="button" class="icon-btn icon-btn--ghost" aria-label="העתקת מספר המעקב"' + act('copy', ' data-copy="' + o.copy + '"') + '>' + I('copy', { size: 20 }) + '</button></span>'
          : r[1];
        return '<div><dt>' + r[0] + '</dt><dd>' + v + '</dd></div>';
      }).join('') + '</dl></section>';
  }

  function helpSection(list) {
    var seen = {};
    var items = list.filter(function (h) { return h[0] !== 'צרו קשר'; }).concat([['צרו קשר', 'contact.html']])
      .filter(function (h) { if (seen[h[0]]) return false; seen[h[0]] = 1; return true; });
    return '<section class="status-help" aria-labelledby="help-h"><h2 id="help-h" class="status-help__h">משהו לא ברור?</h2>' +
      '<ul class="status-help__list st-help">' + items.map(function (h) {
        return '<li><a href="' + h[1] + '"><span>' + h[0] + '</span>' + I('chevron-forward-rtl', { size: 20 }) + '</a></li>';
      }).join('') + '</ul>' +
      '<div class="st-help__call"><a class="btn btn--secondary btn--m-block" href="' + Layout.TEL + '">' + I('phone', { size: 20 }) + 'חייגו למוקד ' + n(Layout.PHONE) + '</a>' +
      '<p class="small muted">' + Layout.hoursLine() + '</p></div></section>';
  }

  function doneNote(text) {
    return '<p class="status-done" role="status" tabindex="-1">' + I('check-circle', { size: 20 }) + '<span>' + text + ' ' + tbc('[נוסח לאישור]') + '</span></p>';
  }
  function timeCard(icon, html, cls) {
    return '<div class="time-card' + (cls ? ' ' + cls : '') + '"><span class="ibox ibox--52 ibox--white">' + I(icon, { size: 28 }) + '</span><div>' + html + '</div></div>';
  }

  /* ---------- "מה עכשיו?" per state ---------- */
  var ANS = ['היום או אתמול', 'לפני 2–7 ימים', 'לפני 1–8 שבועות', 'לפני יותר מחודשיים, או ש' + 'הרישיון לא הגיע'];

  function smsBlock(withConsent) {
    if (st.smsDone) return doneNote('נרשמתם לעדכון ב-SMS.');
    var h = '';
    if (withConsent) {
      h += '<div class="field"><label class="check" for="sms-consent"><input type="checkbox" id="sms-consent">' +
        '<span>אני מסכים/ה לקבל עדכון ב-SMS על הבקשה שלי לנייד ' + n(J && J.session && J.session.phoneMasked ? esc(J.session.phoneMasked) : ((D.citizen && D.citizen.mobile_masked) || '054-•••-4567')) + '</span></label></div>';
    }
    return h + '<button type="button" class="btn btn--primary btn--m-block status-self-start"' + act('sms') + '>עדכנו אותי ב-SMS</button>';
  }

  function s0Answer() {
    switch (st.ans) {
      case 0:
        return '<p>הבקשה צפויה להגיע אלינו מחר בבוקר. נשלח לכם SMS ברגע שהיא תגיע, ואז תוכלו להזמין.</p>' + smsBlock(true);
      case 1:
        return '<p class="status-strong">יש שני מקרים אפשריים:</p>' +
          '<div class="s0-ans__part"><p><strong>ייתכן שאתם צריכים להצטלם.</strong> בטופס האגרה יש ריבוע אדום שאומר אם צריך.</p>' +
          '<button type="button" class="btn btn--secondary status-self-start" id="docs-btn"' + act('docs') + '>איך יודעים אם צריך להצטלם?</button></div>' +
          '<div class="s0-ans__part s0-ans__part--sep"><p><strong>שילמתם בסניף דואר?</strong> הנתונים מגיעים אלינו מאוחר יותר.</p>' + smsBlock(true) + '</div>';
      case 2:
        return '<p>אם עדיין לא הצטלמתם – גשו לתחנת צילום מורשית. אם הצטלמתם ועבר יותר משבוע, פנו למוקד משרד התחבורה ' + n('‎*5678') + '.</p>' +
          '<div class="status-links">' + ext('לרשימת תחנות הצילום') + '<a href="tel:*5678">למוקד משרד התחבורה</a></div>';
      case 3:
        return '<p>ייתכן שהבקשה כבר טופלה ונשלחה, והנתונים נמחקו אצלנו (אנחנו שומרים רשומות 45 ימי עסקים). כדי לקבל רישיון חדש יש להזמין כפל רישיון במשרד התחבורה.</p>' +
          '<a class="btn btn--secondary status-self-start" href="fastest.html">איך מזמינים כפל רישיון</a>';
    }
    return '';
  }

  function nowS0() {
    return '<p>זה לא אומר שמשהו השתבש. בקשות מגיעות אלינו פעם ביום, לפנות בוקר. כדי שנכוון אתכם נכון:</p>' +
      '<fieldset class="s0-q"><legend class="s0-q__legend">מתי השלמתם את התשלום (והצילום, אם נדרש)?</legend><div class="g2 s0-q__grid">' +
      ANS.map(function (t, i) { return '<button type="button" class="ans-btn" aria-pressed="' + (st.ans === i) + '"' + act('ans', ' data-i="' + i + '"') + '>' + I('check', { size: 20, cls: 'ans-btn__ico' }) + '<span>' + t + '</span></button>'; }).join('') +
      '</div></fieldset>' +
      '<div id="s0-ans" class="s0-ans" role="region" aria-label="מה לעשות"' + (st.ans < 0 ? ' hidden' : '') + '>' + s0Answer() + '</div>' +
      '<p class="small s0-foot">לא שילמתם עדיין את האגרה? ' + ext('לתשלום באתר משרד התחבורה') + '</p>';
  }

  function nowS1() {
    var countdown = REQ.countdown_reliable === true ? '<p class="muted">' + rich(REQ.remaining_display || 'נותרו כ-27 שעות') + '</p>' : '';
    return timeCard('clock', '<p class="time-card__t">אפשר להזמין עד <strong>' + fd(T.close, T.closeTime) + '</strong></p>' + countdown) +
      '<a class="btn btn--primary btn--m-block status-self-start" href="order.html">לבחירת משלוח או איסוף' + I('chevron-forward-rtl', { size: 20 }) + '</a>' +
      '<div class="callout callout--warning" role="note">' + I('alert-triangle') + '<p>אם לא תבחרו עד המועד הזה, ' + N() + ' יישלח בדואר רגיל: <strong>עד ' + n('14') + ' ימי עסקים, ללא מעקב</strong>, ויימסר לתיבת הדואר רק אם יש עליה שם מזהה.</p></div>' +
      '<div class="st-choices"><p class="status-strong">מה אפשר לבחור:</p><ul class="st-list">' +
      '<li>' + I('truck', { size: 20 }) + '<span>משלוח מהיר עד הבית – מחר, ' + fd('2026-08-26') + ' · ' + n('177 ₪') + '</span></li>' +
      '<li>' + I('home-check', { size: 20 }) + '<span>עד הבית עם שליח ומעקב – מ-' + n('41 ₪') + '</span></li>' +
      '<li>' + I('store', { size: 20 }) + '<span>איסוף עצמי – גם ללא עלות</span></li></ul></div>' +
      '<p class="st-note">' + I('message', { size: 20 }) + '<span>נשלח לכם תזכורת ב-SMS לפני שהמועד נגמר ' + tbc() + '</span></p>' +
      '<button type="button" class="link-btn status-self-start"' + act('cal') + '>' + I('calendar', { size: 18 }) + 'עוד לא מחליטים? הוסיפו תזכורת ליומן</button>';
  }

  function nowS2() {
    var c = ctx('S2'), m = methodById(c.mid), e = ETA[c.mid] || {};
    var paid = m && amount(m, c.order) !== 'ללא עלות' ? ' (' + amount(m, c.order) + ')' : '';
    return timeCard('clock', '<p class="time-card__t">אפשר לשנות את ההזמנה עד <strong>' + fd(T.close, T.closeTime) + '</strong></p>') +
      '<p>אחרי המועד הזה הייצור מתחיל, ו' + N() + ' ' + etaText(c.mid, c.prod, 'will') + '.</p>' +
      '<div class="st-block"><p class="status-strong">רוצים לקבל מהר יותר?</p>' +
      '<p>אפשר לשנות לשיטה אחרת עד אותו מועד. ' + (paid ? 'בשיטה יקרה יותר משלמים את המחיר המלא בניכוי מה ששילמתם' + paid + '. ' + tbc() : 'אם תבחרו שיטה בתשלום, תשלמו עליה בזמן השינוי.') + '</p>' +
      '<a class="btn btn--primary btn--m-block status-self-start" href="order.html?edit=1">עריכת ההזמנה</a></div>' +
      '<div class="st-block st-block--sep"><button type="button" class="btn btn--secondary btn--m-block status-self-start" id="prod-btn"' + act('prod') + '>אין לי מה לשנות – להתחיל עכשיו</button>' +
      '<p class="small muted">' + (e.shift ? 'כך ' + N() + ' יגיע יום מוקדם יותר. ' : '') + 'אחרי זה לא יהיה אפשר לשנות.</p></div>';
  }

  function nowS3() {
    var c = ctx('S3'), m = methodById(c.mid);
    var how = c.ordered ? esc(m.name) + (isPickup(c) ? '' : m.tracking ? ', עם מעקב' : ', ללא מעקב') : 'דואר רגיל, ללא מעקב';
    var when = c.re ? 'זמן אספקה: ' + rich(m.eta_rule) + ' מהייצור' : etaText(c.mid, c.prod, 'exp');
    var upd = isPickup(c) ? 'מוכן לאיסוף' : 'יוצא';
    return timeCard(isPickup(c) ? 'store' : 'truck', '<p class="time-card__big">' + when + '</p><p class="muted">' + how + '</p>') +
      '<p>בשלב הזה כבר אי אפשר לשנות כתובת או שיטת משלוח – זה סימן שהתהליך מתקדם, לא תקלה.</p>' +
      (st.notifyDone ? doneNote('נשלח לכם עדכון כש' + N() + ' ' + upd + '.')
        : '<button type="button" class="btn btn--secondary btn--m-block status-self-start"' + act('notify') + '>' + I('message', { size: 20 }) + 'שלחו לי עדכון כש' + N() + ' ' + upd + '</button>') +
      (c.mid !== 'regular_mail' ? '' : '<p class="small muted">דואר רגיל נמסר לתיבת הדואר רק אם מופיע עליה שם מזהה, כמו שם משפחה.</p>');
  }

  function nowS4() {
    return timeCard('truck', '<p class="time-card__big">' + etaText('express_home', 'now', 'exp') + '</p>', 'time-card--ship') +
      '<div class="status-actions status-actions--wide">' +
      '<a class="btn btn--primary btn--m-block" href="#" target="_blank" rel="noopener">למעקב אחר המשלוח' + I('external-link', { size: 18 }) + '<span class="sr-only">(נפתח בלשונית חדשה)</span></a>' +
      '<a href="contact.html?topic=lost">המשלוח לא הגיע?</a></div>';
  }

  function nowS5() {
    return '<div class="place-card"><p class="place-card__t">' + I('plane') + 'איסוף מנתב״ג – טרמינל 3</p>' +
      '<p>אולם מקבלי הפנים, ליד שער יציאה 1, עמדת ״על הקו״</p>' +
      '<p class="muted">א׳–ה׳ ' + n('07:00–22:00') + ' · שישי וערבי חג עד ' + n('15:00') + '</p>' +
      '<p><strong>מחכה לכם מ' + fd(eta('pickup_tlv_airport', 'now').from) + ' · ניתן לאסוף עד ' + tbc('[תאריך לאישור]') + '</strong></p>' +
      '<p>מה להביא: תעודה מזהה ומספר הזמנה ' + n(ORDER_NO) + ' (שמור גם ב-SMS)</p></div>' +
      '<div class="status-actions">' +
      '<a class="btn btn--primary btn--m-block" href="#" target="_blank" rel="noopener">ניווט לעמדה' + I('external-link', { size: 18 }) + '<span class="sr-only">(נפתח בלשונית חדשה)</span></a>' +
      '<button type="button" class="btn btn--secondary btn--m-block"' + act('cal') + '>הוסיפו ליומן</button></div>' +
      '<p class="st-note">' + I('message', { size: 20 }) + '<span>נעדכן אתכם ב-SMS לפני שמועד האיסוף מסתיים. ' + tbc() + '</span></p>';
  }

  function nowS6() {
    var c = ctx('S6'), e = eta(c.mid, c.prod);
    return '<p class="status-lead">' + N() + (isPickup(c) ? ' נאסף ב' : ' נמסר ב') + fd(e.by || e.from) + '. אין צורך לעשות שום דבר נוסף.</p>' +
      '<a href="contact.html?topic=lost" class="status-self-start">לא קיבלתם בפועל? ספרו לנו</a>';
  }

  function gotItBtn() { return '<button type="button" class="link-btn"' + act('gotit') + '>קיבלתי את ' + N() + '</button>'; }

  function nowS7() {
    var sent = shipDate('regular_mail', 'wait');
    var h = '<p class="status-lead">' + N() + ' נשלח בדואר רגיל ב' + fd(sent) + ', ועברו מאז ' + n('21') + ' ימי עסקים.</p>' +
      '<p>בדואר רגיל אין מעקב, ולכן אין לנו אישור שהוא הגיע. זה לא בהכרח אומר שהוא אבד.</p>';
    if (st.gotIt) return h + doneNote('תודה, סגרנו את הפנייה.');
    if (!st.reveal) {
      return h + '<div class="status-actions status-actions--wide"><button type="button" class="btn btn--primary btn--m-block" aria-expanded="false" aria-controls="s7-reveal"' + act('reveal') + '>לא קיבלתי את ' + N() + '</button>' + gotItBtn() + '</div>' +
        '<div id="s7-reveal" aria-live="polite"></div>';
    }
    return h + '<div id="s7-reveal" class="s7-reveal" aria-live="polite">' +
      '<div class="place-card"><p class="status-strong s7-reveal__t" tabindex="-1">בדיקת זכאות</p><dl class="kv">' +
      '<div><dt>נשלח בתאריך</dt><dd>' + fd(sent) + '</dd></div><div><dt>שיטת מסירה</dt><dd>דואר רגיל</dd></div>' +
      '<div><dt>ימי עסקים שעברו</dt><dd>' + n('21') + '</dd></div><div><dt>סטטוס מסירה</dt><dd>אין תיעוד מסירה</dd></div></dl></div>' +
      '<div class="callout callout--success" role="status">' + I('check-circle') + '<p class="callout__title">אתם זכאים להנפקה חוזרת ללא עלות, עד ' + tbc('[תאריך לאישור]') + '</p></div>' +
      '<p class="st-note">' + I('info', { size: 20 }) + '<span>הפעם אפשר לבחור משלוח עם מעקב.</span></p>' +
      '<div class="status-actions status-actions--wide"><a class="btn btn--primary btn--m-block" href="reissue.html">להזמנת הנפקה חוזרת' + I('chevron-forward-rtl', { size: 20 }) + '</a>' + gotItBtn() + '</div></div>';
  }

  function nowS8() {
    var c = ctx('S8');
    return '<p>השליח הגיע ב' + fd(shipDate(c.mid, c.prod)) + ' ולא הצליח למסור את ' + N() + '. ' + N() + ' חזר אלינו ושמור אצלנו עד ' + tbc('[תאריך לאישור]') + '. מה אפשר לעשות:</p>' +
      '<ul class="st-list"><li>' + I('truck', { size: 20 }) + '<span>לתאם מסירה חוזרת לאותה כתובת</span></li>' +
      '<li>' + I('store', { size: 20 }) + '<span>לאסוף בעצמכם מדפוס בארי – ללא עלות</span></li></ul>' +
      '<button type="button" class="btn btn--primary btn--m-block status-self-start"' + act('redeliver') + '>לבחירת מסירה חוזרת</button>' +
      '<p class="small muted">' + tbc('[לאישור: אפשרויות המסירה החוזרת ותהליך הבחירה]') + '</p>';
  }

  function nowS9() {
    function card(title, b, btn) { return '<li class="pick-card"><p class="pick-card__t">' + title + '</p>' + b + btn + '</li>'; }
    return '<p>בחרו את הבקשה שתרצו לראות.</p><ul class="g2 pick-grid">' +
      card('רישיון נהיגה', badge('success', 'check', 'אפשר להזמין'),
        '<a class="btn btn--primary btn--m-block" href="order.html"' + act('pickorder', ' data-doc="license"') + '>לבחירת משלוח לרישיון' + I('chevron-forward-rtl', { size: 20 }) + '</a>' +
        '<button type="button" class="link-btn"' + act('pick', ' data-s="S1" data-doc="license"') + '>לפרטי הבקשה</button>') +
      card('תג חניה לנכה', badge('navy', 'gear-production', 'בייצור'),
        '<button type="button" class="btn btn--secondary btn--m-block"' + act('pick', ' data-s="S3" data-doc="tag"') + '>לפרטי התג</button>') + '</ul>';
  }

  /* ---------- Render ---------- */
  var root = document.getElementById('status-root');

  function skeleton() { // L-05: טקסט גלוי שמוכרז (role=status); aria-busy על <main> (ב-render)
    return '<h1 class="sr-only">מצב הבקשה</h1>' +
      '<div class="status-skel"><p class="muted small status-skel__msg" role="status">מאתרים את הבקשה שלכם…</p>' +
      '<div aria-hidden="true" class="status-skel__boxes"><div class="skel status-skel__id"></div><div class="skel status-skel__h"></div>' +
      '<div class="skel status-skel__tl"></div><div class="skel status-skel__c1"></div><div class="skel status-skel__c2"></div></div></div>';
  }

  var SITE = ' – רישיון עד הבית';
  var mainEl = document.getElementById('main');

  function render() {
    if (st.s === 'loading') {
      root.innerHTML = skeleton();
      if (mainEl) mainEl.setAttribute('aria-busy', 'true');
      document.title = 'מצב הבקשה' + SITE;
      return;
    }
    if (mainEl) mainEl.removeAttribute('aria-busy');
    var d = STATE_UI[st.s];
    document.title = d.h1().replace(/\u00a0/g, ' ') + SITE; // F05: כותרת הלשונית = H1 של המצב
    root.innerHTML =
      '<div class="st-idwrap"><div class="status-id"><p class="muted">שלום, ישראלה' + (st.s === 'S9' ? '' : ' · ' + docType()) +
      (multi() && st.s !== 'S9' ? ' · <a href="status.html?s=S9"' + act('switch') + '>החלפת בקשה (' + n('2') + ')</a>' : '') +
      '</p><a href="index.html" class="st-logout"' + act('logout') + '>יציאה</a></div>' + freshLine() + '</div>' +
      '<div class="status-head">' + badge(d.tone, d.icon, d.badge) + '<h1 class="h1" id="status-h1" tabindex="-1">' + d.h1() + '</h1>' +
      (d.sub ? '<p class="status-lead">' + d.sub + '</p>' : '') + '</div>' +
      (d.tl ? timeline() : '') +
      '<section class="card status-now" aria-labelledby="now-h"><h2 id="now-h" class="h2">מה עכשיו?</h2>' + d.now() + '</section>' +
      kvSection(d.kv()) +
      helpSection(d.help);
  }

  function renderDemoBar() {
    var focused = document.activeElement && document.activeElement.getAttribute('data-demo-i');
    Layout.demoBar({
      prefix: 'הצג מצב:',
      items: KEYS.map(function (k) {
        return {
          label: k === 'loading' ? 'טעינה' : k,
          title: k === 'loading' ? 'טעינה' : STATE_UI[k].badge,
          pressed: k === st.s,
          onClick: function () { go(k, { keepFocus: true }); }
        };
      })
    });
    if (focused !== null && focused !== undefined) {
      var b = document.querySelector('[data-demo-i="' + focused + '"]');
      if (b) b.focus();
    }
  }

  // P1-3: אחרי מעבר מצב מפעולת משתמש – הקשה שנייה באותה נקודה לא מפעילה כפתור במצב החדש (שכבת .fd-lock, 450ms)
  var lockT = null;
  function lockRoot() {
    clearTimeout(lockT);
    root.classList.add('fd-lock');
    lockT = setTimeout(function () { lockT = null; root.classList.remove('fd-lock'); }, 450);
  }
  function locked(e) { return !!lockT && !(e && e.detail === 0); } // מקלדת (detail=0) לא נחסמת

  function go(k, opt) {
    opt = opt || {};
    st.moved = !!opt.moved;
    st.s = k; st.ans = -1; st.reveal = false; st.docs = false; st.smsDone = false; st.notifyDone = false; st.gotIt = false;
    if (opt.method !== undefined) st.method = opt.method; else st.method = '';
    var docP = UI.param('doc');
    if (opt.doc) { st.doc = opt.doc; docP = opt.doc; } // נבחר ב-S9: נשמר ב-URL (גם license) כדי להציג "החלפת בקשה"
    // opt.push: ניווט בתוך המסך (S9 → פרטי בקשה, "החלפת בקשה") נכנס להיסטוריה – Back חוזר לרשימה (P1-5)
    UI.setParams({ s: k, ans: null, docs: null, reveal: null, demo: null, method: st.method || null, doc: docP || null }, !!opt.push);
    render();
    renderDemoBar();
    if (!opt.keepFocus) focusH1();
    if (opt.lock) lockRoot();
  }
  function focusH1() {
    window.scrollTo(0, 0);
    var h = document.getElementById('status-h1');
    if (h) { try { h.focus({ preventScroll: true }); } catch (e) { h.focus(); } }
  }

  /* Back/Forward בין מצבים שנכנסו להיסטוריה: מרנדרים את המצב מה-URL (בלי לכתוב היסטוריה) */
  try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) { /* */ }
  window.addEventListener('popstate', function () {
    UI.setParams({}); // מאפס את המטמון של UI.params() לפי ה-URL הנוכחי (replace לאותה כתובת)
    var s = UI.param('s');
    if (KEYS.indexOf(s) < 0) return;
    if (UI.modal.isOpen()) UI.modal.close();
    st.moved = false;
    st.s = s;
    var a = Number(UI.param('ans'));
    st.ans = UI.param('ans') !== null && a >= 0 && a <= 3 ? a : -1;
    st.docs = false; st.reveal = UI.param('reveal') === '1';
    st.smsDone = false; st.notifyDone = false; st.gotIt = false;
    st.method = UI.param('method') === 'express' ? 'express' : '';
    if (DOC_TYPES[UI.param('doc')]) st.doc = UI.param('doc');
    render();
    renderDemoBar();
    focusH1();
    requestAnimationFrame(function () { if (window.pageYOffset > 0) window.scrollTo(0, 0); });
  });

  function openDocs(btn) {
    st.docs = true;
    UI.setParams({ docs: 1 });
    UI.modal.open('docs-modal', {
      returnFocus: btn || document.getElementById('docs-btn'),
      onClose: function () { st.docs = false; UI.setParams({ docs: null }); }
    });
  }

  function placeholderToast(text) { UI.toast(text + ' [לאישור]', { icon: 'info' }); }

  /* ---------- Events ---------- */
  root.addEventListener('click', function (e) {
    var b = e.target.closest('[data-action]');
    if (!b || !root.contains(b)) return;
    if (locked(e)) { e.preventDefault(); return; }
    var a = b.getAttribute('data-action');
    if (a === 'logout') { // ממשיכים ל-index.html; מנקים את מסע הבדיקה
      ['fd.session', 'fd.order', 'fd.reissue', 'fd.scenario', 'fd.login', 'fd.phone'].forEach(function (k) { UI.store.remove(k); });
      return;
    }
    if (a === 'pickorder') { // ממשיכים ל-order.html; זוכרים את סוג התעודה במסע
      if (J && J.session) { J.session.doc = b.getAttribute('data-doc'); UI.store.set('fd.session', J.session); }
      return;
    }
    if (a === 'switch') { e.preventDefault(); go('S9', { push: true, lock: true }); return; }
    if (a === 'tl') {
      st.tlOpen = !st.tlOpen;
      var card = b.closest('.status-tl');
      var list = document.getElementById('status-tl-list');
      b.setAttribute('aria-expanded', String(st.tlOpen));
      b.firstChild.nodeValue = st.tlOpen ? 'הסתרת השלבים' : 'כל השלבים';
      // ≤640 הציר המלא מוסתר ב-CSS עד שפותחים; פתיחה/סגירה בגובה אמיתי. בסגירה ה-class יורד רק בסוף התנועה
      if (st.tlOpen) { card.classList.add('is-open'); if (UI.motion.compact()) UI.motion.expand(list, { fromZero: true }); }
      else if (UI.motion.compact() && UI.motion.on()) UI.motion.collapse(list, { done: function () { if (!st.tlOpen) card.classList.remove('is-open'); } });
      else card.classList.remove('is-open');
      return;
    }
    if (a === 'ans') {
      st.ans = Number(b.getAttribute('data-i')); st.smsDone = false;
      UI.setParams({ ans: st.ans, docs: null });
      UI.qsa('.ans-btn', root).forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      var box = document.getElementById('s0-ans');
      UI.motion.swap(box, function () { box.innerHTML = s0Answer(); });
      UI.focusInto(box, { target: box }); // התשובה מתחת לארבעת הכפתורים – פוקוס וגלילה אליה
    } else if (a === 'sms') {
      var c = document.getElementById('sms-consent');
      if (c && !c.checked) { UI.fieldError(c, 'כדי לקבל עדכון יש לסמן את תיבת ההסכמה.'); c.focus(); return; }
      st.smsDone = true;
      var bx = document.getElementById('s0-ans');
      bx.innerHTML = s0Answer();
      var note = UI.qs('.status-done', bx); if (note) UI.focusInto(note, { target: note });
    } else if (a === 'docs') {
      openDocs(b);
    } else if (a === 'cal') {
      placeholderToast('ההוספה ליומן');
    } else if (a === 'prod') {
      UI.modal.open('prod-modal', { returnFocus: b });
    } else if (a === 'notify') {
      st.notifyDone = true; render();
      var nn = UI.qs('.status-done', root); if (nn) UI.focusInto(nn, { target: nn });
    } else if (a === 'reveal') {
      st.reveal = true; UI.setParams({ reveal: 1 }); render();
      UI.motion.expand(document.getElementById('s7-reveal'), { fromZero: true });
      var t = UI.qs('.s7-reveal__t', root); if (t) UI.focusInto(document.getElementById('s7-reveal') || t, { target: t });
    } else if (a === 'gotit') {
      st.gotIt = true; render();
      var g = UI.qs('.status-done', root); if (g) UI.focusInto(g, { target: g });
    } else if (a === 'redeliver') {
      placeholderToast('בחירת מסירה חוזרת');
    } else if (a === 'copy') {
      UI.copy(b.getAttribute('data-copy'));
    } else if (a === 'pick') {
      if (J && J.session) { J.session.doc = b.getAttribute('data-doc'); UI.store.set('fd.session', J.session); }
      go(b.getAttribute('data-s'), { doc: b.getAttribute('data-doc'), push: true, lock: true });
    }
  });
  root.addEventListener('change', function (e) {
    if (e.target.id === 'sms-consent' && e.target.checked) UI.fieldError(e.target, null);
  });

  // "כן, להתחיל עכשיו" – פעולה בלתי הפיכה: replace ולא push (Back לא מחזיר למצב S2 שכבר לא נכון); נעילה נגד הקשה כפולה
  var prodBusy = false;
  document.getElementById('prod-confirm').addEventListener('click', function () {
    if (prodBusy) return;
    prodBusy = true; setTimeout(function () { prodBusy = false; }, 450);
    UI.modal.close();
    if (J && J.order) { J.order.prod = 'now'; J.order.edit = false; J.order.committed = null; UI.store.set('fd.order', J.order); } // S3 ממשיך להציג את אותה הזמנה
    go('S3', { method: '', moved: !(J && J.order), lock: true });
    UI.toast('ההזמנה הועברה לייצור');
  });

  /* ---------- Boot ---------- */
  render();
  renderDemoBar();
  if (st.docs) openDocs(document.getElementById('docs-btn'));
  if (st.s === 'S4' && UI.param('demo') === 'toast') UI.toast('הועתק', 0);
})();
