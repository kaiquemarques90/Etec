const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  try {
    const page = await browser.newPage(); await page.goto(process.env.TEST_URL || 'http://localhost:3000');
    await page.locator('[data-view=store]').click();
    const downloaded = page.waitForEvent('download'); await page.locator('#export-catalog').click();
    const download = await downloaded;
    const stream = await download.createReadStream(), chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    const content = Buffer.concat(chunks), catalog = JSON.parse(content.toString());
    assert.equal(catalog.products.length, 4); assert.equal('profile' in catalog, false);
    await page.locator('#import-catalog').setInputFiles({ name: 'invalid.json', mimeType: 'application/json', buffer: Buffer.from('{"version":1,"products":[]}') });
    await page.waitForFunction(() => document.querySelector('#store-status').textContent.includes('não realizada'));
    assert.equal(await page.locator('#product-count').innerText(), '4');
    catalog.products[0].name = 'Produto importado';
    await page.locator('#import-catalog').setInputFiles({ name: 'valid.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(catalog)) });
    await page.waitForFunction(() => document.querySelector('#store-status').textContent.includes('Catálogo importado'));
    assert.equal(await page.locator('.managed-product').filter({ hasText: 'Produto importado' }).count(), 1);
    await page.locator('[data-view=studio]').click(); assert.equal(await page.locator('.product b').first().innerText(), 'Produto importado');
    await page.goto((process.env.TEST_URL || 'http://localhost:3000') + '/?product=cargo#studio');
    assert.equal(await page.locator('[data-product=cargo]').getAttribute('aria-pressed'), 'true');
    await page.goto((process.env.TEST_URL || 'http://localhost:3000') + '/?product=missing#studio');
    assert.match(await page.locator('#profile-status').innerText(), /não está no catálogo/);
    await page.evaluate(() => { const container = document.createElement('div'); container.dataset.fitvisionProduct = 'cargo'; document.body.append(container); });
    await page.addScriptTag({ url: '/public/fitvision.js' });
    const widget = page.locator('.fitvision-widget-button');
    assert.match(await widget.getAttribute('href'), /\?product=cargo#studio$/);
    assert.equal(await widget.getAttribute('target'), '_blank');
    console.log('Catalog export/import, rejection of invalid imports and widget product links passed.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
