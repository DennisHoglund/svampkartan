const path = require('path');
const { test, expect, bild } = require('./hjalp');

const FOTO = path.join(__dirname, 'data', 'kantarell.jpg');

test.describe('Nytt fynd', () => {
  test('sparar ett fynd med art, mängd, anteckning och foto', async ({ kartan: page, api }) => {
    await page.locator('#btn-add').click();
    await expect(page.locator('#sheet')).toBeVisible();

    await page.locator('#art-grid [data-art="trattkantarell"]').click();
    await page.locator('#mangd [data-v="5"]').click();
    await page.locator('#fynd-not').fill('Testfynd vid bäcken');
    await page.locator('#fynd-foto').setInputFiles(FOTO);
    await expect(page.locator('#foto-preview')).toBeVisible();
    await expect(page.locator('#foto-text')).toContainText('kB');
    await bild(page, 'Formulär för nytt fynd');

    await page.locator('#btn-save').click();
    await expect(page.locator('#toast')).toHaveText('Trattkantarell sparad');
    await expect(page.locator('#sheet')).toBeHidden();
    await expect(page.locator('.fynd-pin')).toHaveCount(4);

    const nytt = api.fynd.find((f) => f.anteckning === 'Testfynd vid bäcken');
    expect(nytt).toBeTruthy();
    expect(nytt.art).toBe('trattkantarell');
    expect(nytt.mangd).toBe(5);
    expect(nytt.placerad).toBe(false);
    expect(nytt.lat).toBeCloseTo(60.3921, 3);
    expect(nytt.vader && nytt.vader.regn_10d).toBe(16.5);
    expect(nytt.foto_path).toMatch(/\/.+\.jpg$/);
    expect(api.uppladdade).toContain(nytt.foto_path);
  });

  test('fotot krymps innan uppladdning', async ({ kartan: page }) => {
    await page.locator('#btn-add').click();
    await page.locator('#fynd-foto').setInputFiles(FOTO);
    await expect(page.locator('#foto-text')).toContainText('kB');
    const kb = Number((await page.locator('#foto-text').textContent()).match(/(\d+) kB/)[1]);
    expect(kb).toBeGreaterThan(0);
    expect(kb).toBeLessThanOrEqual(250);
  });

  test('senast valda art är förvald nästa gång', async ({ kartan: page }) => {
    await page.locator('#btn-add').click();
    await page.locator('#art-grid [data-art="karljohan"]').click();
    await page.locator('#btn-save').click();
    await expect(page.locator('#toast')).toHaveText('Karljohan sparad');
    await page.locator('#btn-add').click();
    await expect(page.locator('#art-grid [data-art="karljohan"]')).toHaveClass(/on/);
  });

  test('fynd kan placeras för hand på kartan', async ({ kartan: page, api }) => {
    await page.locator('#btn-add').click();
    await page.locator('#btn-place').click();
    await expect(page.locator('#place-ui')).toBeVisible();
    await bild(page, 'Placera fynd på kartan');
    await page.locator('#btn-place-ok').click();
    await expect(page.locator('#place-text')).toHaveText('Placerad på kartan');
    await page.locator('#btn-save').click();
    await expect(page.locator('#toast')).toContainText('sparad');
    expect(api.fynd.at(-1).placerad).toBe(true);
  });

  test('ta bort fynd raderar både fynd och foto', async ({ kartan: page, api }) => {
    page.on('dialog', (d) => d.accept());
    await page.locator('#toast').waitFor({ state: 'hidden' });
    await page.locator('.fynd-pin').nth(2).click(); // f1 har foto
    await page.locator('.leaflet-popup .pop-delete').click();
    await expect(page.locator('#toast')).toHaveText('Fyndet borttaget');
    await expect(page.locator('.fynd-pin')).toHaveCount(2);
    expect(api.fynd.find((f) => f.id === 'f1')).toBeUndefined();
    expect(api.borttagnaFoton.some((p) => p.endsWith('/f1.jpg'))).toBe(true);
  });

  test('avbryta borttagning behåller fyndet', async ({ kartan: page, api }) => {
    page.on('dialog', (d) => d.dismiss());
    await page.locator('#toast').waitFor({ state: 'hidden' });
    await page.locator('.fynd-pin').first().click();
    await page.locator('.leaflet-popup .pop-delete').click();
    await expect(page.locator('.fynd-pin')).toHaveCount(3);
    expect(api.fynd).toHaveLength(3);
  });
});
