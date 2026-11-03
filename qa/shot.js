// node qa/shot.js <url-path> <out-prefix> [w]  – צילום מהיר לבדיקה
const { chromium } = require('playwright');
(async () => {
  const [,, u, out, only] = process.argv;
  const b = await chromium.launch();
  for (const [vp, w, h] of [['d', 1280, 900], ['m', 390, 844]]) {
    if (only && only !== vp) continue;
    const p = await b.newPage({ viewport: { width: w, height: h } });
    const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', c => c.type() === 'error' && errs.push(c.text()));
    await p.goto((process.env.BASE||'http://localhost:8080')+'/' + u); await p.waitForTimeout(400);
    const overlay = /demo=(menu|more|why)|drawer|info=|docs=1|toast/.test(u);
    await p.screenshot({ path: `${out}-${vp}.png`, fullPage: !overlay });
    if (errs.length) console.log(vp, 'ERRORS', errs);
    await p.close();
  }
  await b.close();
})();
