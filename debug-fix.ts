import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('http://localhost:3456', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);

  // Check if tree is auto-expanded
  const fileBrowser = await page.$('.w-65');
  const items = await fileBrowser!.$$('[class*="cursor-pointer"]');
  console.log(`=== FileBrowser items after auto-expand: ${items.length} ===`);
  for (let i = 0; i < items.length; i++) {
    const t = await items[i].textContent();
    console.log(`  ${i}: "${t?.trim()}"`);
  }

  // Click on a note directly (should be visible now)
  const noteItem = items.find(async (el) => {
    const t = await el.textContent();
    return t?.trim() === '验证笔记';
  });

  // Find and click "验证笔记"
  for (let i = 0; i < items.length; i++) {
    const t = await items[i].textContent();
    if (t?.trim() === '验证笔记') {
      console.log(`\n=== Clicking "验证笔记" ===`);
      await items[i].click();
      await page.waitForTimeout(1500);
      break;
    }
  }

  // Check if note loaded in editor
  const noteTitle = await page.$('h1');
  if (noteTitle) {
    const title = await noteTitle.textContent();
    console.log(`Note title in editor: "${title}"`);
  }

  // Test "新建笔记" button
  console.log('\n=== Testing "新建笔记" button ===');
  const newBtn = await page.$('button:has-text("新建笔记")');
  if (newBtn) {
    await newBtn.click();
    await page.waitForTimeout(500);
    const dialog = await page.$('[role="dialog"], .fixed.inset-0');
    console.log(`Dialog visible: ${!!dialog}`);
    if (dialog) {
      const dialogText = await dialog.textContent();
      console.log(`Dialog content: ${dialogText?.substring(0, 100)}`);
    }
  }

  await page.screenshot({ path: '/Users/home/kms-web/debug-fixed.png', fullPage: true });
  console.log('\n=== Screenshot saved ===');

  await browser.close();
})();
