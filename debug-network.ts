import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const requests: string[] = [];
  const responses: string[] = [];
  const errors: string[] = [];

  page.on('request', req => {
    if (req.url().includes('/api/')) {
      requests.push(`${req.method()} ${req.url()}`);
    }
  });
  page.on('response', res => {
    if (res.url().includes('/api/')) {
      responses.push(`${res.status()} ${res.url()}`);
    }
  });
  page.on('pageerror', err => errors.push(err.message));

  await page.goto('http://localhost:3456', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1000);

  console.log('=== Initial requests ===');
  requests.forEach(r => console.log('  REQ:', r));
  responses.forEach(r => console.log('  RES:', r));
  requests.length = 0;
  responses.length = 0;

  // Expand notes folder
  const fileBrowser = await page.$('.w-65');
  const items = await fileBrowser!.$$('[class*="cursor-pointer"]');
  await items[0].click(); // Click "notes"
  await page.waitForTimeout(500);

  // Click "test" folder
  const items2 = await fileBrowser!.$$('[class*="cursor-pointer"]');
  await items2[1].click(); // Click "test"
  await page.waitForTimeout(500);

  // Click on a note
  const items3 = await fileBrowser!.$$('[class*="cursor-pointer"]');
  console.log(`\n=== Clicking note: ${await items3[2].textContent()} ===`);
  await items3[2].click();
  await page.waitForTimeout(2000);

  console.log('\n=== Network after click ===');
  requests.forEach(r => console.log('  REQ:', r));
  responses.forEach(r => console.log('  RES:', r));

  console.log('\n=== Errors ===');
  errors.forEach(e => console.log('  ERR:', e));

  // Check if currentNote is set
  const storeState = await page.evaluate(() => {
    // Try to find the note title in the page
    const titleEl = document.querySelector('h1');
    return titleEl?.textContent;
  });
  console.log('\n=== Note title in page ===');
  console.log(storeState);

  // Take screenshot
  await page.screenshot({ path: '/Users/home/kms-web/debug-network.png', fullPage: true });

  await browser.close();
})();
