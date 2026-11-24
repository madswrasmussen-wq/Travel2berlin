// Builds the download packages for the poster shop.
// For every poster in PRODUCTS: one vector PDF + one 300 dpi JPG per print ratio, a print guide,
// a shop preview image, all zipped to dist/<slug>.zip — ready to upload as the digital file in Wix Stores.
//
// Run from the posters folder:   node scripts/export.cjs            (all posters)
//                                node scripts/export.cjs berlin-typographic-index
// Needs Playwright (npm install) and an internet connection for the Google Fonts.

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

const PRODUCTS = [
  { slug: 'berlin-typographic-index', file: 'berlin-index.html', title: 'BERLIN — Typographic Index' }
];

// Each ratio is exported at the page size below (vector PDF scales to any size without loss).
// JPG is rendered at 300 dpi for that size, capped so files stay reasonable.
const RATIOS = [
  { key: 'iso', label: 'ISO_A-sizes', wMm: 297, hMm: 420, fits: 'A5, A4, A3, A2, A1, A0' },
  { key: '5x7', label: '5x7', wMm: 500, hMm: 700, fits: '50×70 cm, 5×7 in' },
  { key: '2x3', label: '2x3', wMm: 400, hMm: 600, fits: '20×30, 40×60, 60×90 cm, 24×36 in, 12×18 in' },
  { key: '3x4', label: '3x4', wMm: 300, hMm: 400, fits: '30×40, 45×60 cm, 18×24 in, 9×12 in' },
  { key: '4x5', label: '4x5', wMm: 400, hMm: 500, fits: '40×50 cm, 8×10, 16×20 in (also 11×14 in with a slight crop)' }
];

const CSS_PX_PER_MM = 96 / 25.4;
const MAX_JPG_WIDTH = 6000;

function guide(product) {
  const lines = RATIOS.map(r => `  ${product.slug}_${r.label}.pdf / .jpg\n      -> ${r.fits}`);
  return `${product.title}
Travel2Berlin — Urban Spec poster series
travel2berlin.com

Thank you for your purchase!

WHICH FILE SHOULD I USE?
Pick the file that matches the shape of your frame. Each file is laid out for its own
proportions, so nothing important gets cropped.

${lines.join('\n')}

PRINTING
- PDF files are vector: they stay sharp at any size. Use them whenever you can.
- JPG files are 300 dpi, for photo labs and online print services that only take images.
- At home: open the PDF, choose "Fit to page" and switch on "Background graphics".
- At a print shop: ask for the size you want and say "no borders".
- Matte or uncoated paper (200 g/m² or heavier) suits this design best.

LICENCE
For personal, non-commercial use. You may print the poster as many times as you like
for yourself. Please do not resell, share or redistribute the files.
`;
}

async function render(page, product, ratio, outDir) {
  const url = 'file://' + path.join(ROOT, product.file) + '?ratio=' + ratio.key;
  const pageWidthPx = ratio.wMm * CSS_PX_PER_MM;
  const zoom = pageWidthPx / 794;
  const base = path.join(outDir, `${product.slug}_${ratio.label}`);

  // PDF: zoom the 794 px poster up to the physical page width; text and shapes stay vector.
  await page.setViewportSize({ width: 1200, height: 1200 });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: `@page{size:${ratio.wMm}mm ${ratio.hMm}mm;margin:0} html{zoom:${zoom}} body{margin:0;padding:0;background:none;display:block;min-height:0}` });
  await page.pdf({ path: base + '.pdf', preferCSSPageSize: true, printBackground: true, pageRanges: '1' });

  // JPG: 300 dpi at the same physical size (capped), sRGB.
  const targetWidth = Math.min(Math.round(ratio.wMm / 25.4 * 300), MAX_JPG_WIDTH);
  const scale = targetWidth / 794;
  const ctx = await page.context().browser().newContext({ viewport: { width: 794, height: 1200 }, deviceScaleFactor: scale });
  const hi = await ctx.newPage();
  await hi.goto(url, { waitUntil: 'networkidle' });
  await hi.evaluate(() => document.fonts.ready);
  await hi.addStyleTag({ content: 'body{padding:0;display:block;background:none}' });
  await hi.locator('.poster').screenshot({ path: base + '.jpg', type: 'jpeg', quality: 92 });
  await ctx.close();
}

async function preview(browser, product, outDir) {
  // Shop image, 4:5 (1600×2000): the ISO poster on a light wall colour.
  const ctx = await browser.newContext({ viewport: { width: 800, height: 1000 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto('file://' + path.join(ROOT, product.file) + '?ratio=iso', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: `
    body{background:#E6E5E1;padding:0;min-height:0;height:1000px;align-items:center}
    .poster{zoom:0.75;box-shadow:0 2px 4px rgba(0,0,0,.12),0 18px 40px rgba(0,0,0,.18)}` });
  await page.screenshot({ path: path.join(outDir, `${product.slug}_preview.png`) });
  await ctx.close();
}

(async () => {
  const only = process.argv[2];
  const products = PRODUCTS.filter(p => !only || p.slug === only);
  if (!products.length) throw new Error('Unknown poster: ' + only);

  const browser = await chromium.launch();
  for (const product of products) {
    const outDir = path.join(DIST, product.slug);
    fs.rmSync(outDir, { recursive: true, force: true });
    fs.mkdirSync(outDir, { recursive: true });
    const page = await browser.newPage();
    for (const ratio of RATIOS) {
      process.stdout.write(`${product.slug} ${ratio.label} … `);
      await render(page, product, ratio, outDir);
      console.log('ok');
    }
    await page.close();
    fs.writeFileSync(path.join(outDir, 'HOW-TO-PRINT.txt'), guide(product));

    // The zip is what the customer downloads; the preview image is for the shop page, so keep it out.
    const zipPath = path.join(DIST, product.slug + '.zip');
    fs.rmSync(zipPath, { force: true });
    execFileSync('zip', ['-q', '-j', zipPath, ...fs.readdirSync(outDir).map(f => path.join(outDir, f))]);
    await preview(browser, product, outDir);
    const mb = (fs.statSync(zipPath).size / 1e6).toFixed(1);
    console.log(`→ dist/${product.slug}.zip (${mb} MB) + preview image`);
  }
  await browser.close();
})().catch(err => { console.error(err); process.exit(1); });
