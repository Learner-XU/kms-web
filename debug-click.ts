import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const consoleLogs: string[] = [];
  page.on('console', msg => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => consoleLogs.push(`[ERROR] ${err.message}`));

  await page.goto('http://localhost:3456', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);

  // List all clickable items
  console.log('=== Clickable Items ===');
  const items = await page.evaluate(() => {
    const els = document.querySelectorAll('[class*="cursor-pointer"]');
    return Array.from(els).slice(0, 30).map(el => ({
      tag: el.tagName,
      text: (el.textContent || '').substring(0, 60).trim(),
      cls: String(el.className || '').substring(0, 80)
    }));
  });
  items.forEach((item, i) => console.log(`${i}: [${item.tag}] "${item.text}" | ${item.cls}`));

  // Test 1: Click on a sidebar note
  console.log('\n=== Test 1: Click sidebar note ===');
  // Try finding note items in the sidebar
  const noteTexts = items.filter(i => i.text && !i.text.includes('\n'));
  if (noteTexts.length > 5) {
    console.log(`Clicking on: "${noteTexts[5].text}"`);
    const allEls = await page.$$('[class*="cursor-pointer"]');
    if (allEls[5]) {
      await allEls[5].click();
      await page.waitForTimeout(2000);
      const afterClick = await page.evaluate(() => document.body.innerText.substring(0, 2000));
      console.log('After click:', afterClick);
    }
  }

  // Test 2: Click 图谱
  console.log('\n=== Test 2: Click 图谱 ===');
  const graphLink = await page.locator('nav >> text=图谱').first();
  if (await graphLink.count() > 0) {
    await graphLink.click();
    await page.waitForTimeout(2000);
    const afterClick = await page.evaluate(() => document.body.innerText.substring(0, 1000));
    console.log('After click 图谱:', afterClick);
  }

  // Screenshot
  await page.screenshot({ path: '/Users/home/kms-web/debug-after-click.png', fullPage: true });

  console.log('\n=== Console Logs ===');
  consoleLogs.forEach(l => console.log(l));

  await browser.close();
})();
