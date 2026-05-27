import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('http://localhost:3456', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);

  // Find the FileBrowser panel (second column, w-65)
  console.log('=== FileBrowser content ===');
  const fileBrowser = await page.$('.w-65');
  if (fileBrowser) {
    const text = await fileBrowser.textContent();
    console.log('FileBrowser text:', text);
    
    // Find all items in FileBrowser
    const items = await fileBrowser.$$('[class*="cursor-pointer"]');
    console.log(`FileBrowser clickable items: ${items.length}`);
    for (let i = 0; i < items.length; i++) {
      const t = await items[i].textContent();
      console.log(`  ${i}: "${t?.trim()}"`);
    }
    
    // Click on the first item (should be "notes" folder)
    if (items.length > 0) {
      console.log('\n=== Clicking first item ===');
      await items[0].click();
      await page.waitForTimeout(1000);
      
      // Check if expanded
      const afterText = await fileBrowser.textContent();
      console.log('After click:', afterText);
      
      // Take screenshot
      await page.screenshot({ path: '/Users/home/kms-web/debug-expanded.png', fullPage: true });
    }
  }

  await browser.close();
})();
