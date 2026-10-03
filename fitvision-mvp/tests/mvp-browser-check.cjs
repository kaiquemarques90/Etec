const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const base = process.env.TEST_URL || 'http://localhost:3000';
(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge', args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, permissions: ['camera'] });
    const page = await context.newPage(), errors = [], blocked = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (/Content Security Policy|Refused to/i.test(message.text())) blocked.push(message.text()); });
    await page.goto(base);
    await page.locator('#camera-start').click();
    await page.waitForFunction(() => !document.querySelector('#camera-capture').disabled);
    assert.equal(await page.evaluate(() => document.querySelector('#camera-video').srcObject.getTracks()[0].readyState), 'live');
    await page.locator('#camera-capture').click();
    assert.equal(await page.evaluate(() => document.querySelector('#camera-video').srcObject), null);
    await page.locator('#clear-photo').click();

    // A full outfit, save, change and restore.
    await page.locator('#add-look').click();
    await page.locator('#continue-look').click(); await page.locator('[data-product=cargo]').click(); await page.locator('#add-look').click();
    await page.locator('#continue-look').click(); await page.locator('[data-product=vision]').click(); await page.locator('#add-look').click();
    assert.equal(await page.locator('.look-row').count(), 3);
    await page.locator('#look-name').fill('Look da banca'); await page.locator('#save-look').click();
    assert.equal(await page.locator('.saved-look').count(), 1);
    await page.locator('[data-remove]').first().click(); assert.equal(await page.locator('.look-row').count(), 2);
    await page.locator('[data-open-look]').click(); assert.equal(await page.locator('.look-row').count(), 3);
    await page.locator('#try-look').click(); assert.equal(await page.locator('#preview-mode').inputValue(), 'look');

    // Create a product with flat widths: normalization must preserve lengths.
    await page.locator('[data-view=store]').click(); await page.locator('#new-product').click();
    await page.locator('#product-form [name=name]').fill('Camiseta Teste Urban');
    await page.locator('#product-form [name=price]').fill('99.90');
    await page.locator('#product-form [name=description]').fill('Produto cadastrado no teste do MVP.');
    await page.locator('#product-form [name=measurementMode]').selectOption('flat');
    const rows = page.locator('#variant-body tr');
    for (let i = 0; i < 4; i++) {
      await rows.nth(i).locator('[data-key=chest]').fill(String(50 + i * 3));
      await rows.nth(i).locator('[data-key=length]').fill(String(68 + i * 3));
    }
    await page.locator('#garment-file').setInputFiles('public/garments/tech.png');
    await page.locator('#product-form [type=submit]').click();
    await page.waitForFunction(() => !document.querySelector('#product-dialog').open);
    assert.equal(await page.locator('#product-count').innerText(), '5');
    const productRow = page.locator('#size-table tr').filter({ hasText: 'Camiseta Teste Urban' }).first();
    assert.equal(await productRow.locator('td').nth(2).innerText(), '100');
    assert.equal(await productRow.locator('td').nth(5).innerText(), '68');
    const managed = page.locator('.managed-product').filter({ hasText: 'Camiseta Teste Urban' });
    await managed.locator('[data-edit]').click();
    await page.locator('#product-form [name=name]').fill('<b>Urban editada</b>');
    await page.locator('#product-form [type=submit]').click();
    await page.waitForFunction(() => !document.querySelector('#product-dialog').open);
    assert.equal(await page.locator('#managed-products b').filter({ hasText: '<b>Urban editada</b>' }).count(), 1);

    // The storefront must use the deployed handler, including ephemeral products.
    await page.locator('[data-view=shop]').click();
    await page.locator('#shop-select').selectOption({ label: '<b>Urban editada</b>' });
    await page.locator('#shop-recommend').click();
    await page.waitForFunction(() => document.querySelector('#shop-status').textContent.includes('API demonstrativa'));
    assert.match(await page.locator('#shop-status').innerText(), /FitVision sugere P/);
    await page.locator('#shop-cart').click();
    await page.locator('[data-view=store]').click();
    await page.locator('.managed-product').filter({ hasText: '<b>Urban editada</b>' }).locator('[data-delete]').click();
    assert.equal(await page.locator('#product-count').innerText(), '4');

    // Cache only static assets; verify the application and real model work offline.
    await page.locator('#prepare-offline').click();
    await page.waitForFunction(() => document.querySelector('#offline-status').textContent.includes('preparados'), {}, { timeout: 60000 });
    const cachedUrls = await page.evaluate(async () => { const urls = []; for (const name of await caches.keys()) for (const request of await (await caches.open(name)).keys()) urls.push(request.url); return urls; });
    assert.equal(cachedUrls.some(url => url.includes('/api/')), false);
    await context.setOffline(true); await page.reload();
    assert.equal(await page.locator('#recommendation .size-badge').innerText(), 'P');
    await page.locator('#photo').setInputFiles('tests/fixtures/pose.jpg');
    await page.waitForFunction(() => document.querySelector('#profile-status').textContent.includes('Foto carregada'));
    await page.locator('#pose-analyze').click();
    await page.waitForFunction(() => !document.querySelector('#pose-analyze').disabled, {}, { timeout: 60000 });
    assert.equal(await page.locator('#pose-canvas').isVisible(), true);
    assert.equal(await page.locator('#mask-control').isVisible(), true);
    await page.locator('#show-mask').check();
    await page.locator('[data-view=shop]').click(); await page.locator('#shop-recommend').click();
    await page.waitForFunction(() => document.querySelector('#shop-status').textContent.includes('motor local'));
    await context.setOffline(false);

    for (const width of [390, 360, 768]) {
      await page.setViewportSize({ width, height: 844 });
      for (const view of ['studio', 'looks', 'shop', 'store']) {
        await page.locator(`[data-view=${view}]`).click();
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `Overflow: ${view}/${width}`);
      }
    }
    await page.locator('#reset').click();
    assert.equal(await page.locator('#look-count').innerText(), '0');
    assert.equal(await page.locator('#product-count').innerText(), '4');
    assert.equal(await page.locator('#pose-canvas').isVisible(), false);
    assert.deepEqual(errors, []); assert.deepEqual(blocked, []);
    console.log('MVP verified: camera capture/stop, layered/saved looks, product CRUD/flat tables/PNG, injection escaping, API storefront, offline model/segmentation/fallback, reset and mobile layouts.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
