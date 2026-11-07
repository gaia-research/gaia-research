// Reproducible interaction check for PR #322 (Field Manual map, guide hero ladder,
// stacked tables, playbook continuity). Needs a running server and Playwright:
//   npx next build && npx next start -p 3011 &
//   node docs/design/agent-playbook-2026-11/interaction-check.cjs http://localhost:3011
// Prints PASS/FAIL per check; screenshots go to ./shots/ (create it first).
const { chromium, devices } = require('playwright');
const base = process.argv[2];
const results = []; const ok = (name, cond, extra='') => { results.push(`${cond ? 'PASS' : 'FAIL'}  ${name} ${extra}`); };
(async () => {
  const b = await chromium.launch();
  // 1. Homepage map autoplay + toggles + keyboard (touch device)
  {
    const ctx = await b.newContext({ ...devices['iPhone 13'] });
    const p = await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
    await p.goto(base + '/', { waitUntil: 'networkidle' });
    await p.waitForTimeout(800);
    const pre = await p.getAttribute('#field-manual', 'data-state');
    ok('map rewinds before view (client)', pre === 'none', pre);
    await p.locator('.fm-map').scrollIntoViewIfNeeded(); await p.evaluate(()=>document.querySelector('.fm-map').scrollIntoView({block:'center'}));
    await p.waitForTimeout(1300); const mid = await p.getAttribute('#field-manual', 'data-state');
    await p.screenshot({ path: 'shots/ev-fm-mid.png' });
    await p.waitForTimeout(2200); const end = await p.getAttribute('#field-manual', 'data-state');
    ok('autoplay passes through method', mid === 'method', mid); ok('autoplay ends at both', end === 'both', end);
    await p.locator('.fm-switch[data-tone="method"]').tap(); await p.waitForTimeout(1000);
    ok('tap Method off -> memory', await p.getAttribute('#field-manual','data-state') === 'memory');
    ok('readout follows', (await p.textContent('.fm-readout strong')).includes('over-delegates'));
    await p.screenshot({ path: 'shots/ev-fm-memory.png' });
    await p.locator('.fm-switch[data-tone="memory"]').tap(); await p.waitForTimeout(300);
    ok('tap Memory off -> none', await p.getAttribute('#field-manual','data-state') === 'none');
    await p.locator('.fm-rung[data-level="C"]').tap();
    ok('tap rung C selects', await p.getAttribute('.fm-rung[data-level="C"]','aria-selected') === 'true');
    ok('rung panel shows C', (await p.textContent('#fm-rung-panel')).includes('Level C'));
    await p.locator('#fm-door-skills').tap();
    ok('tap door Install', (await p.textContent('#fm-door-panel')).includes('copy plan'));
    ok('no console errors (home, touch)', errs.length === 0, errs.join(' | ').slice(0,200));
    await ctx.close();
  }
  // 2. Keyboard + focus visibility on desktop
  {
    const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
    await p.goto(base + '/', { waitUntil: 'networkidle' });
    await p.focus('.fm-rung[data-level="A"]'); await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowRight');
    const f = await p.evaluate(()=>document.activeElement?.dataset.level);
    ok('ArrowRight moves focus+selection on ladder', f === 'C' && await p.getAttribute('.fm-rung[data-level="C"]','aria-selected')==='true', f);
    const outline = await p.evaluate(()=>getComputedStyle(document.activeElement).outlineStyle);
    ok('focus ring visible on rung', outline !== 'none', outline);
    await p.evaluate(()=>document.querySelector('.fm-rung[data-level="C"]').scrollIntoView({block:'center'}));
    await p.screenshot({ path: 'shots/ev-fm-focus-desktop.png' });
    await p.focus('.fm-switch[data-tone="method"]'); await p.keyboard.press('Space'); await p.waitForTimeout(200);
    ok('Space toggles Method switch', await p.getAttribute('.fm-switch[data-tone="method"]','aria-pressed') !== null);
    await p.close();
  }
  // 3. Reduced motion
  {
    const ctx = await b.newContext({ viewport: { width: 375, height: 812 }, reducedMotion: 'reduce' });
    const p = await ctx.newPage(); await p.goto(base + '/', { waitUntil: 'networkidle' }); await p.waitForTimeout(600);
    ok('reduced motion: map starts resolved (both)', await p.getAttribute('#field-manual','data-state') === 'both');
    const tr = await p.evaluate(()=>getComputedStyle(document.querySelector('.fm-token')).transitionDuration);
    ok('reduced motion: token transition off', tr === '0s', tr);
    await p.goto(base + '/research/agent-playbook', { waitUntil: 'networkidle' }); await p.waitForTimeout(600);
    ok('reduced motion: continuity starts resolved', await p.getAttribute('.apc','data-with') === 'true');
    await p.goto(base + '/research/orchestration-guide', { waitUntil: 'networkidle' });
    const an = await p.evaluate(()=>getComputedStyle(document.querySelector('.ghl-bar')).animationName);
    ok('reduced motion: ladder bars static', an === 'none', an);
    await ctx.close();
  }
  // 4. Playbook continuity + guide stack rows on touch
  {
    const ctx = await b.newContext({ ...devices['iPhone 13'] });
    const p = await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
    await p.goto(base + '/research/agent-playbook', { waitUntil: 'networkidle' }); await p.waitForTimeout(500);
    ok('continuity starts fresh', await p.getAttribute('.apc','data-with') === 'false');
    await p.screenshot({ path: 'shots/ev-apb-fresh.png' });
    await p.waitForTimeout(2600);
    ok('continuity flips to playbook', await p.getAttribute('.apc','data-with') === 'true');
    await p.screenshot({ path: 'shots/ev-apb-with.png' });
    await p.locator('.apc-toggle button', { hasText: 'Fresh agent' }).tap();
    ok('tap Fresh agent', (await p.textContent('.apc-list')).includes('Asks you again'));
    // disclosure table as cards
    await p.locator('.apb-disclosure summary').first().tap(); await p.waitForTimeout(300);
    const disp = await p.evaluate(()=>getComputedStyle(document.querySelector('.apb-disclosure table[data-stack] tr')).display);
    ok('playbook comparison table stacks on phone', disp === 'block', disp);
    await p.evaluate(()=>document.querySelector('.apb-disclosure table').scrollIntoView({block:'start'})); await p.waitForTimeout(200);
    await p.screenshot({ path: 'shots/ev-apb-table-cards.png' });
    ok('no console errors (playbook)', errs.length === 0, errs.join(' | ').slice(0,200));
    errs.length = 0;
    await p.goto(base + '/research/orchestration-guide', { waitUntil: 'networkidle' }); await p.waitForTimeout(500);
    const row = p.locator('table[data-cols="8"] tbody tr').first();
    ok('8-col provider row folded', await row.getAttribute('data-fold') === 'true');
    const hiddenBefore = await row.evaluate(r => getComputedStyle(r.children[4]).display);
    await row.locator('.stack-row-toggle').scrollIntoViewIfNeeded();
    await p.evaluate(()=>document.querySelector('table[data-cols="8"]').scrollIntoView({block:'start'})); await p.waitForTimeout(200);
    await p.screenshot({ path: 'shots/ev-og-provider-folded.png' });
    await row.locator('.stack-row-toggle').tap(); await p.waitForTimeout(200);
    const hiddenAfter = await row.evaluate(r => getComputedStyle(r.children[4]).display);
    ok('tap expands row (cell 5 hidden->shown)', hiddenBefore === 'none' && hiddenAfter !== 'none', `${hiddenBefore}->${hiddenAfter}`);
    await p.screenshot({ path: 'shots/ev-og-provider-open.png' });
    ok('no console errors (guide)', errs.length === 0, errs.join(' | ').slice(0,200));
    await ctx.close();
  }
  // 5. Desktop tables stay tables
  {
    const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
    await p.goto(base + '/research/orchestration-guide', { waitUntil: 'networkidle' });
    const d = await p.evaluate(()=>getComputedStyle(document.querySelector('table[data-stack] tbody tr')).display);
    ok('desktop table rows remain table-row', d === 'table-row', d);
    const btn = await p.evaluate(()=>{const e=document.querySelector('.stack-row-toggle'); return e?getComputedStyle(e).display:'absent'});
    ok('desktop hides row toggle', btn === 'none', btn);
    await p.close();
  }
  console.log(results.join('\n'));
  await b.close();
})();
