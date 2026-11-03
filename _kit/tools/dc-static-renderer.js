// Minimal static renderer for .dc.html artboards (snapshot only, no live events).
// URL params: st = JSON merged into root component state; props = JSON root props; hs = JSON header state.
(function () {
  if (window.__dcRendered) return; window.__dcRendered = true;
  const qp = new URLSearchParams(location.search);
  const ST = qp.get('st') ? JSON.parse(qp.get('st')) : null;
  const PROPS = qp.get('props') ? JSON.parse(qp.get('props')) : {};
  const HS = qp.get('hs') ? JSON.parse(qp.get('hs')) : null;
  class DCLogic { constructor(p) { this.props = p || {}; this.state = {}; } setState(o) { Object.assign(this.state, typeof o === 'function' ? o(this.state) : o); } forceUpdate() {} }
  window.DCLogic = DCLogic;
  const cache = {};
  async function load(name) {
    if (cache[name]) return cache[name];
    let txt = await (await fetch(name + '?raw=1')).text();
    txt = txt.replace(/<sc-(for|if)\b/g, '<template data-k="$1"').replace(/<\/sc-(for|if)>/g, '</template>');
    const doc = new DOMParser().parseFromString(txt, 'text/html');
    const xdc = doc.querySelector('x-dc');
    const helmet = xdc.querySelector('helmet');
    const script = doc.querySelector('script[data-dc-script]');
    const Comp = new Function('DCLogic', script.textContent + '\nreturn Component;')(DCLogic);
    if (helmet) helmet.remove();
    cache[name] = { doc, xdc, helmet, Comp };
    return cache[name];
  }
  function lookup(scope, path) {
    path = path.trim();
    if (path === 'true') return true; if (path === 'false') return false;
    if (/^-?\d+(\.\d+)?$/.test(path)) return Number(path);
    let v = scope; for (const k of path.split('.')) { if (v == null) return undefined; v = v[k]; } return v;
  }
  const HOLE = /\{\{\s*([^}]+?)\s*\}\}/g;
  const whole = (s) => { const m = /^\s*\{\{\s*([^}]+?)\s*\}\}\s*$/.exec(s); return m ? m[1] : null; };
  const interp = (s, scope) => s.replace(HOLE, (_, p) => { const v = lookup(scope, p); return v == null ? '' : String(v); });
  async function renderNodes(nodes, scope, out) { for (const n of Array.from(nodes)) await renderNode(n, scope, out); }
  async function renderNode(n, scope, out) {
    if (n.nodeType === 3) { out.appendChild(document.createTextNode(interp(n.textContent, scope))); return; }
    if (n.nodeType !== 1) return;
    const tag = n.tagName.toLowerCase();
    if (tag === 'template' && n.dataset.k === 'if') { if (lookup(scope, whole(n.getAttribute('value')) || 'false')) await renderNodes(n.content.childNodes, scope, out); return; }
    if (tag === 'template' && n.dataset.k === 'for') {
      const list = lookup(scope, whole(n.getAttribute('list'))) || []; const as = n.getAttribute('as') || 'item';
      for (let i = 0; i < list.length; i++) await renderNodes(n.content.childNodes, Object.assign(Object.create(scope), { [as]: list[i], $index: i }), out);
      return;
    }
    if (tag === 'dc-import') {
      const props = {};
      for (const a of Array.from(n.attributes)) {
        if (a.name === 'name' || a.name.startsWith('hint-')) continue;
        const key = a.name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        const w = whole(a.value); props[key] = w ? lookup(scope, w) : a.value;
      }
      const name = n.getAttribute('name');
      await renderComponent(name + '.dc.html', props, out, name === 'Header' ? HS : null);
      return;
    }
    const el = document.importNode(n, false);
    for (const a of Array.from(n.attributes)) {
      if (/^on[A-Z]/.test(a.name) || /^on[a-z]+$/.test(a.name)) { el.removeAttribute(a.name); continue; }
      const w = whole(a.value);
      if (w) {
        const v = lookup(scope, w);
        if (typeof v === 'function') { el.removeAttribute(a.name); continue; }
        if (v === false || v == null) { el.removeAttribute(a.name); continue; }
        if (v === true) { el.setAttribute(a.name, ''); continue; }
        el.setAttribute(a.name, String(v));
      } else if (a.value.indexOf('{{') >= 0) el.setAttribute(a.name, interp(a.value, scope));
    }
    if (tag === 'input' && el.hasAttribute('value')) el.value = el.getAttribute('value');
    if (tag === 'input' && el.hasAttribute('checked')) el.checked = true;
    if (tag === 'textarea' && el.hasAttribute('value')) el.textContent = el.getAttribute('value');
    if (tag === 'select' && el.hasAttribute('value')) { const v = el.getAttribute('value'); setTimeout(() => { el.value = v; }); }
    if (tag === 'template') { /* plain template */ }
    else await renderNodes(n.childNodes, scope, el);
    out.appendChild(el);
  }
  const helmetsDone = new Set();
  async function renderComponent(file, props, out, stOverride) {
    const c = await load(file);
    if (c.helmet && !helmetsDone.has(file)) {
      helmetsDone.add(file);
      for (const h of Array.from(c.helmet.children)) if (!/googleapis/.test(h.getAttribute('href') || '')) document.head.appendChild(document.importNode(h, true));
    }
    const inst = new c.Comp(props);
    if (stOverride) Object.assign(inst.state, stOverride);
    const vals = inst.renderVals();
    await renderNodes(c.xdc.childNodes, vals, out);
  }
  async function main() {
    const file = location.pathname.split('/').pop();
    document.body.innerHTML = '';
    const c = await load(file);
    document.documentElement.lang = c.doc.documentElement.lang || 'he';
    document.documentElement.dir = 'rtl';
    const inst0 = c.Comp; // eslint
    const frag = document.createDocumentFragment();
    // root
    const ff = document.createElement('style');
    let css = '';
    for (const w of [400, 500, 600, 700, 800]) for (const sub of ['hebrew', 'latin']) css += `@font-face{font-family:"Heebo";font-weight:${w};font-display:block;src:url(fonts/heebo-${sub}-${w}-normal.woff2) format("woff2");unicode-range:${sub==='hebrew'?'U+0590-05FF,U+200C-2010,U+20AA,U+25CC,U+FB1D-FB4F':'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD'}}`;
    for (const w of [400, 600, 700, 800]) css += `@font-face{font-family:"Noto Sans Arabic";font-weight:${w};font-display:block;src:url(fonts/noto-sans-arabic-arabic-${w}-normal.woff2) format("woff2")}`;
    for (const w of [500]) css += `@font-face{font-family:"Noto Sans Arabic";font-weight:${w};font-display:block;src:url(fonts/noto-sans-arabic-arabic-600-normal.woff2) format("woff2")}`;
    ff.textContent = css; document.head.appendChild(ff);
    if (c.helmet) { helmetsDone.add(file); for (const h of Array.from(c.helmet.children)) if (!/googleapis/.test(h.getAttribute('href') || '')) document.head.appendChild(document.importNode(h, true)); }
    const inst = new c.Comp(PROPS);
    if (ST) Object.assign(inst.state, ST);
    await renderNodes(c.xdc.childNodes, inst.renderVals(), frag);
    document.body.appendChild(frag);
    const st = document.createElement('style');
    st.textContent = 'body>*{} [style*="position: fixed"][aria-label="סרגל הדגמה"]{display:none!important} *{animation:none!important;transition:none!important}';
    document.head.appendChild(st);
    try { await document.fonts.ready; } catch (e) {}
    window.__dcDone = true;
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', main); else main();
})();
