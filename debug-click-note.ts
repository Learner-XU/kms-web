import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('http://localhost:3456', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);

  // Expand notes folder
  const fileBrowser = await page.$('.w-65');
  if (!fileBrowser) { console.log('No FileBrowser found'); return; }
  
  const items = await fileBrowser.$$('[class*="cursor-pointer"]');
  if (items.length > 0) {
    await items[0].click(); // Click "notes"
    await page.waitForTimeout(500);
  }

  // Now list items again
  const items2 = await fileBrowser.$$('[class*="cursor-pointer"]');
  console.log(`After expand: ${items2.length} items`);
  for (let i = 0; i < items2.length; i++) {
    const t = await items2[i].textContent();
    console.log(`  ${i}: "${t?.trim()}"`);
  }

  // Click on "test" folder to expand
  const testFolder = items2.find(async (el) => {
    const t = await el.textContent();
    return t?.trim() === 'test';
  });
  
  // Click second item (test folder)
  if (items2.length > 1) {
    console.log('\n=== Clicking "test" folder ===');
    await items2[1].click();
    await page.waitForTimeout(500);
    
    const items3 = await fileBrowser.$$('[class*="cursor-pointer"]');
    console.log(`After test expand: ${items3.length} items`);
    for (let i = 0; i < items3.length; i++) {
      const t = await items3[i].textContent();
      console.log(`  ${i}: "${t?.trim()}"`);
    }
    
    // Click on a note file
    if (items3.length > 2) {
      console.log('\n=== Clicking note file ===');
      await items3[2].click(); // Click third item (should be a note)
      await page.waitForTimeout(2000);
      
      // Check if editor shows content
      const mainContent = await page.evaluate(() => {
        const editor = document.querySelector('.flex-1');
        return editor?.textContent?.substring(0, 500);
      });
      console.log('Main editor content:', mainContent);
      
      await page.screenshot({ path: '/Users/home/kms-web/debug-note-open.png', fullPage: true });
    }
  }

  await browser.close();
})();
