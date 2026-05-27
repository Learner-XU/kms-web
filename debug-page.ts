import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Collect console messages
  const consoleLogs: string[] = [];
  page.on('console', msg => {
    consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
  });

  // Collect errors
  const errors: string[] = [];
  page.on('pageerror', err => {
    errors.push(err.message);
  });

  // Collect failed requests
  const failedRequests: string[] = [];
  page.on('requestfailed', req => {
    failedRequests.push(`${req.method()} ${req.url()} - ${req.failure()?.errorText}`);
  });

  try {
    // Navigate
    await page.goto('http://localhost:3456', { waitUntil: 'networkidle', timeout: 15000 });
    console.log('=== Page loaded ===');

    // Wait for React to settle
    await page.waitForTimeout(2000);

    // Screenshot
    await page.screenshot({ path: '/Users/home/kms-web/debug-screenshot.png', fullPage: true });
    console.log('=== Screenshot saved ===');

    // Check debug info (bottom-right corner)
    const debugEl = await page.$('.fixed.bottom-4.right-4');
    if (debugEl) {
      const debugText = await debugEl.textContent();
      console.log('=== Debug Info ===');
      console.log(debugText);
    } else {
      console.log('=== No debug element found ===');
    }

    // Check error banner
    const errorEl = await page.$('.bg-red-500\\/20');
    if (errorEl) {
      const errorText = await errorEl.textContent();
      console.log('=== Error Banner ===');
      console.log(errorText);
    }

    // Check sidebar items
    const sidebarItems = await page.$$('[data-note-id], .cursor-pointer');
    console.log(`=== Clickable items found: ${sidebarItems.length} ===`);

    // Try to find and log all visible text elements
    const bodyText = await page.evaluate(() => {
      return document.body.innerText.substring(0, 2000);
    });
    console.log('=== Page Text (first 2000 chars) ===');
    console.log(bodyText);

    // Check for notes in the store
    const storeState = await page.evaluate(() => {
      // Try to access zustand store
      const root = document.getElementById('__next');
      return root?.innerHTML?.length;
    });
    console.log(`=== Root innerHTML length: ${storeState} ===`);

  } catch (e) {
    console.log('=== Error ===');
    console.log(e);
  }

  // Print collected logs
  console.log('\n=== Console Logs ===');
  consoleLogs.forEach(l => console.log(l));

  console.log('\n=== Page Errors ===');
  errors.forEach(e => console.log(e));

  console.log('\n=== Failed Requests ===');
  failedRequests.forEach(r => console.log(r));

  await browser.close();
})();
