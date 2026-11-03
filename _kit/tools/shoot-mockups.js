// usage: node shoot.js <baseUrl> <outDir> <htmlOutDir> [filterId]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const [, , BASE, OUT, HOUT, FILTER] = process.argv;

const S = (id, file, title, st, extra = {}) => ({ id, file, title, st, ...extra });
const SHOTS = [
  S('00_design-system', 'Main', 'מערכת עיצוב', null, { mobile: false }),
  S('01_index', 'Index', 'P00 אינדקס'),
  S('02_home-B', 'HomeB', 'P01B עמוד בית – כניסה מאוחדת (מומלצת)'),
  S('02b_home-B_validation-errors', 'HomeB', 'P01B שגיאות ולידציה', { id: '123456', ph: '0541', errId: true, errPh: true }),
  S('02c_home-B_code-sent', 'HomeB', 'P01B קוד נשלח', { id: '000000018', ph: '0541234567', sent: true }),
  S('02d_home-B_why-drawer', 'HomeB', 'P01B מגירת "למה אנחנו מבקשים"', { why: true }),
  S('02e_home-B_accordion-open', 'HomeB', 'P01B אקורדיון פתוח', { open: 3 }),
  S('03_home-A', 'HomeA', 'P01A עמוד בית – שלושה שערים'),
  S('04_home-B-arabic', 'HomeB-ar', 'P01B ערבית (טיוטה)'),
  S('05_menu-drawer', 'HomeB', 'תפריט מובייל פתוח', null, { hs: { menu: true }, desktop: false }),
  S('05b_more-dropdown', 'HomeB', 'תפריט "עוד" בדסקטופ', null, { hs: { more: true }, mobile: false }),
  S('10_P02_login', 'Auth', 'P02 הזדהות'),
  S('10b_P02_login_errors', 'Auth', 'P02 שגיאות', { id: '12', ph: '052', errId: true, errPh: true }),
  S('10c_P02_login_loading', 'Auth', 'P02 טעינה', { id: '000000018', ph: '0541234567', sending: true }),
  S('11_P03_otp', 'Auth', 'P03 אימות קוד', { step: 'otp', ph: '0541234567', sec: 45 }),
  S('11b_P03_otp_error', 'Auth', 'P03 קוד שגוי', { step: 'otp', ph: '0541234567', code: ['1', '1', '1', '1', '1', '1'], errOtp: true, sec: 12 }),
  S('11c_P03_otp_resend', 'Auth', 'P03 שליחה חוזרת זמינה', { step: 'otp', ph: '0541234567', sec: 0 }),
  S('11d_P03_otp_verified', 'Auth', 'P03 קוד אומת', { step: 'otp', ph: '0541234567', code: ['1', '2', '3', '4', '5', '6'], verified: true, sec: 30 }),
  ...['S0', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9'].map((k, i) => S('2' + i + '_P04_status_' + k, 'Status', 'P04 מסך מצב ' + k, { s: k })),
  S('20b_P04_status_S0_answer-1-3days', 'Status', 'P04 S0 – תשובה "לפני 1–3 ימים"', { s: 'S0', ans: 1 }),
  S('20c_P04_status_S0_answer-today', 'Status', 'P04 S0 – תשובה "היום"', { s: 'S0', ans: 0 }),
  S('20d_P04_status_S0_docs-modal', 'Status', 'P04 מודאל "איך יודעים אם צריך להצטלם"', { s: 'S0', ans: 1, docs: true }),
  S('27b_P04_status_S7_revealed', 'Status', 'P04 S7 – אחרי "לא קיבלתי"', { s: 'S7', reveal: true }),
  S('24b_P04_status_S4_copied-toast', 'Status', 'P04 S4 – טוסט "הועתק"', { s: 'S4', toast: true }),
  S('29b_P04_status_loading', 'Status', 'P04 שלד טעינה', { s: 'loading' }),
  S('30_P05_order-step1_empty', 'Order', 'P05 משלוח – לפני בחירה', {}),
  S('30b_P05_order-step1_selected', 'Order', 'P05 משלוח – נבחר משלוח מהיר', { method: 'express_home' }),
  S('30c_P05_order-step1_filter-pickup', 'Order', 'P05 סינון "איסוף עצמי"', { method: 'pickup_bari', group: 'pickup' }),
  S('30d_P05_order-step1_method-drawer', 'Order', 'P05 מגירת פרטי שיטה', { method: 'pickup_tlv_airport', drawer: 'method', info: 'pickup_tlv_airport' }),
  S('30e_P05_order-step1_compare-drawer', 'Order', 'P05 מגירת השוואה', { method: 'express_home', drawer: 'compare' }),
  S('31_P06_order-step2_locked', 'Order', 'P06 כתובת – גרסה B (לא מורשה)', { step: 2, method: 'express_home', why: true }),
  S('31b_P06_order-step2_authorized-other', 'Order', 'P06 כתובת – גרסה A (מורשה, כתובת אחרת)', { step: 2, method: 'express_home', auth: true, addr: 'other' }),
  S('31c_P06_order-step2_authorized-moin', 'Order', 'P06 כתובת – גרסה A (מורשה, כתובת משרד הפנים)', { step: 2, method: 'express_home', auth: true, addr: 'moin' }),
  S('32_P07_order-step3', 'Order', 'P07 מועד ייצור', { step: 3, method: 'express_home', terms: true }),
  S('32b_P07_order-step3_terms-error', 'Order', 'P07 שגיאת תנאי שימוש', { step: 3, method: 'express_home', termsErr: true }),
  S('32c_P07_order-step3_free-method', 'Order', 'P07 שיטה ללא עלות (מדלג על תשלום)', { step: 3, method: 'pickup_bari', terms: true }),
  S('33_P08_order-step4_payment', 'Order', 'P08 תשלום', { step: 4, method: 'express_home', terms: true }),
  S('33b_P08_order-step4_paying', 'Order', 'P08 מעבדים תשלום', { step: 4, method: 'express_home', terms: true, paying: true }),
  S('34_P09_order-done', 'Order', 'P09 אישור הזמנה', { step: 5, method: 'express_home', terms: true }),
  S('35_P10_reissue', 'Reissue', 'P10 הנפקה חוזרת'),
  S('35b_P10_reissue_error', 'Reissue', 'P10 שגיאת הצהרה', { declErr: true }),
  S('35c_P10_reissue_done', 'Reissue', 'P10 אישור', { done: true, decl: true }),
  S('40_P11_guide', 'Guide', 'P11 מה עלי לעשות'),
  S('40b_P11_guide_sms', 'Guide', 'P11 תשובה "קיבלתי SMS"', { a: 3 }),
  S('41_P12_fastest', 'Fastest', 'P12 רישיון הכי מהיר'),
  S('42_P13_delivery', 'Delivery', 'P13 שיטות מסירה ומחירון'),
  S('42b_P13_delivery_drawer', 'Delivery', 'P13 מגירת פרטים', { i: 1 }),
  S('43_P14_pickup', 'Pickup', 'P14 עמדות איסוף'),
  S('44_P15_faq', 'Faq', 'P15 שאלות ותשובות'),
  S('44b_P15_faq_filtered', 'Faq', 'P15 סינון "צילום"', { cat: 'צילום', open: 1 }),
  S('44c_P15_faq_no-results', 'Faq', 'P15 אין תוצאות', { q: 'xyz' }),
  S('45_P16_about', 'About', 'P16 על השירות'),
  S('46_P17_contact', 'Contact', 'P17 צור קשר'),
  S('46b_P17_contact_error', 'Contact', 'P17 שגיאה – לא נבחר נושא', { subErr: true }),
  S('46c_P17_contact_sent', 'Contact', 'P17 הפנייה נשלחה', { sent: true }),
  S('47_P18_accessibility', 'Accessibility', 'P18 הצהרת נגישות'),
  S('48_P19_error-temporary', 'Error', 'P19 תקלה זמנית + באנר תחזוקה'),
  S('48b_P19_error-404', 'Error', 'P19 404', { v: '404', maint: false })
];

(async () => {
  const browser = await chromium.launch();
  const manifest = [];
  for (const s of SHOTS) {
    if (FILTER && !s.id.includes(FILTER)) continue;
    const q = new URLSearchParams();
    if (s.st) q.set('st', JSON.stringify(s.st));
    if (s.hs) q.set('hs', JSON.stringify(s.hs));
    const url = `${BASE}/${s.file}.dc.html?${q}`;
    const vps = [];
    if (s.desktop !== false) vps.push(['desktop', { width: 1280, height: 900 }]);
    if (s.mobile !== false) vps.push(['mobile', { width: 390, height: 844 }]);
    const entry = { id: s.id, title: s.title, source: s.file + '.dc.html', state: s.st || null, files: {} };
    for (const [name, vp] of vps) {
      const page = await browser.newPage({ viewport: vp, deviceScaleFactor: name === 'mobile' ? 2 : 1.5 });
      const errs = [];
      page.on('pageerror', (e) => errs.push(e.message));
      await page.goto(url);
      await page.waitForFunction(() => window.__dcDone === true, null, { timeout: 15000 }).catch(() => errs.push('timeout'));
      await page.waitForTimeout(250);
      const overlay = /drawer|menu|modal|toast|more-dropdown/.test(s.id);
      const f = `${name}/${s.id}.png`;
      await page.screenshot({ path: path.join(OUT, f), fullPage: !overlay });
      entry.files[name] = f;
      if (name === 'desktop' && HOUT) {
        const html = await page.evaluate(() => {
          document.querySelectorAll('script').forEach((x) => x.remove());
          return '<!doctype html>\n' + document.documentElement.outerHTML;
        });
        fs.writeFileSync(path.join(HOUT, s.id + '.html'), html);
      }
      if (errs.length) console.log('ERR', s.id, name, errs.join(' | '));
      await page.close();
    }
    manifest.push(entry);
    console.log('ok', s.id);
  }
  fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
  await browser.close();
})();
