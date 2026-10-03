// Optional smoke test: set PLAYWRIGHT_MODULE to a local Playwright package path.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL || 'msedge'});
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:3000');
 await page.locator('#preference').selectOption('oversized');
 await page.locator('#recommendation .size-badge').filter({hasText:'G'}).waitFor();
 assert.equal(await page.locator('#recommendation .size-badge').innerText(),'G');
 await page.locator('#add-look').click();
 assert.equal(await page.locator('.look-row').count(),1);
 await page.locator('#cart').click();
 assert.match(await page.locator('#look-status').innerText(),/149,90/);
 await page.locator('#reset').click();
 assert.equal(await page.locator('#look-count').innerText(),'0');
 await page.locator('[name=chest]').fill('160');
 await page.locator('#profile-form button').click();
 assert.equal(await page.locator('#recommendation .size-badge').innerText(),'—');
 await page.locator('#demo-profile').click();
 await page.screenshot({path:'preview-desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await page.screenshot({path:'preview-mobile.png',fullPage:true});
 assert.deepEqual(errors,[]);
 await browser.close();console.log('Browser smoke checks passed: recommendation, look, cart, reset, unavailable size, mobile layout.');
})().catch(error=>{console.error(error);process.exit(1);});
