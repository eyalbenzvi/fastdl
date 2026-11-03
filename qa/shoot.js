// node qa/shoot.js [base]  – מצלם כל מזהה מ-_kit/mockups/manifest.json ומייצר qa/compare.html
const { chromium } = require('playwright');
const fs = require('fs'); const path = require('path');
const BASE = process.argv[2] || 'http://localhost:8080';
const ROOT = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, '_kit/mockups/manifest.json'), 'utf8'));
const URLS = require('./urls.json');
(async () => {
  const b = await chromium.launch(); const rows = []; let errCount = 0;
  for (const m of manifest) {
    const url = URLS[m.id]; if (!url) { console.warn('missing url for', m.id); continue; }
    for (const [vp, size] of [['desktop', { width: 1280, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
      if (!m.files[vp]) continue;
      const ctx = await b.newContext({ viewport: size });
      const p = await ctx.newPage();
      const errors = []; p.on('pageerror', e => errors.push(e.message)); p.on('console', c => c.type() === 'error' && errors.push(c.text()));
      await p.goto(`${BASE}/${url}`); await p.waitForLoadState('networkidle'); await p.waitForTimeout(300);
      const overlay = /drawer|menu|modal|toast|dropdown/.test(m.id);
      const out = `screens/${vp}/${m.id}.png`; fs.mkdirSync(path.dirname(path.join(__dirname, out)), { recursive: true });
      await p.screenshot({ path: path.join(__dirname, out), fullPage: !overlay });
      if (errors.length) { errCount++; console.log('ERR', m.id, vp, errors); }
      rows.push(`<tr><td>${m.id}<br>${vp}${errors.length ? '<br><b style=color:red>' + errors.join('<br>') + '</b>' : ''}</td><td><img src="../_kit/mockups/${m.files[vp]}" width=420></td><td><img src="${out}" width=420></td></tr>`);
      await ctx.close();
    }
  }
  fs.writeFileSync(path.join(__dirname, 'compare.html'), `<meta charset=utf-8><table border=1><tr><th>id</th><th>הדמיה</th><th>בפועל</th></tr>${rows.join('')}</table>`);
  console.log('pages with errors:', errCount);
  await b.close();
})();
