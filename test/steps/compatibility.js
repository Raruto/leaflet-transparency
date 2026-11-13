const assert = require('node:assert/strict');
const path = require('node:path');
const { chromium } = require('playwright');
const { After, AfterAll, BeforeAll, Then, setDefaultTimeout } = require('@cucumber/cucumber');

setDefaultTimeout(30000);
let browser;
BeforeAll(async () => { browser = await chromium.launch(); });
After(async function () { if (this.page) await this.page.close(); });
AfterAll(async () => { if (browser) await browser.close(); });

Then('the {string} opacity control works with Leaflet {string}', async function (bundle, version) {
  const page = this.page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('https://tiles.invalid/**', route => route.fulfill({ status: 204 }));
  await page.setContent('<div id="map" style="width:400px;height:300px"></div>');
  const dist = `https://unpkg.com/leaflet@${version}/dist`;
  await page.addStyleTag({ url: `${dist}/leaflet.css` });
  await page.addScriptTag({ url: `${dist}/${version === '1.9.4' ? 'leaflet.js' : 'leaflet-global.js'}` });
  await page.addScriptTag({ path: path.join(__dirname, '..', '..', `leaflet-transparency${bundle === 'minified' ? '.min' : ''}.js`) });
  assert.equal(await page.evaluate(() => typeof opacitySliderMethods), 'undefined');
  assert.equal(await page.evaluate(() => typeof DraggableObject), 'undefined');
  const result = await page.evaluate(() => {
    const map = new (L.LeafletMap || L.Map)('map', { center: [0, 0], zoom: 2 });
    const layer = new L.TileLayer('https://tiles.invalid/{z}/{x}/{y}.png').addTo(map);
    const control = new L.Control.OpacitySlider(layer).addTo(map);
    let hidden = 0, visible = 0;
    control.on('hidden', () => hidden++);
    control.on('visible', () => visible++);
    control.setOpacity(0);
    const removed = !map.hasLayer(layer);
    control.setOpacity(35);
    const actual = { version: L.version, opacity: layer.options.opacity, removed, restored: map.hasLayer(layer), hidden, visible };
    control.remove();
    map.remove();
    return actual;
  });
  assert.deepEqual(result, { version, opacity: 35 / 69, removed: true, restored: true, hidden: 1, visible: 1 });
  assert.deepEqual(errors, []);
});
