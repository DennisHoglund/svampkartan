const { test, expect, bild } = require('./hjalp');

test.describe('Kartan', () => {
  test('visar mina fynd som nålar och antal i toppen', { annotation: { type: 'testfall', description: 'TC-KAR-01' } }, async ({ kartan: page }) => {
    await expect(page.locator('#toast')).toContainText('3 fynd på kartan');
    await bild(page, 'Kartan med fynd');
  });

  test('lagerväljaren har fyra kartor och vandringsleder', { annotation: { type: 'testfall', description: 'TC-KAR-02' } }, async ({ kartan: page }) => {
    const valjare = page.locator('.leaflet-control-layers');
    await valjare.hover();
    await valjare.locator('.leaflet-control-layers-toggle').click({ force: true }).catch(() => {});
    await expect(valjare).toHaveClass(/leaflet-control-layers-expanded/);
    for (const namn of ['Terräng', 'Karta', 'Stigar', 'Satellit', 'Vandringsleder']) {
      await expect(valjare.getByText(namn, { exact: true })).toBeVisible();
    }
    await bild(page, 'Lagerväljaren');
  });

  test('valt kartlager sparas till nästa gång', { annotation: { type: 'testfall', description: 'TC-KAR-03' } }, async ({ kartan: page }) => {
    const valjare = page.locator('.leaflet-control-layers');
    await valjare.hover();
    await valjare.locator('.leaflet-control-layers-toggle').click({ force: true }).catch(() => {});
    await valjare.getByText('Satellit', { exact: true }).click();
    await expect(page.locator('#map')).toHaveClass(/sat/);
    await page.reload();
    await expect(page.locator('#map')).toHaveClass(/sat/);
  });

  test('popup visar art, väder, anteckning och foto', { annotation: { type: 'testfall', description: 'TC-KAR-04' } }, async ({ kartan: page }) => {
    await page.locator('#toast').waitFor({ state: 'hidden' });
    await page.locator('.fynd-pin').nth(2).click(); // nyast först: f3, f2, f1 – f1 har foto
    const pop = page.locator('.leaflet-popup .pop');
    await expect(pop).toContainText('Kantarell');
    await expect(pop).toContainText('mängd 4');
    await expect(pop).toContainText('Regn 10 d: 21,4 mm');
    await expect(pop).toContainText('Vid mossiga stenen');
    await expect(pop.locator('.pop-foto img')).toBeVisible();
    await bild(page, 'Popup med foto');
  });

  test('positionsknappen visar var jag är', { annotation: { type: 'testfall', description: 'TC-KAR-05' } }, async ({ kartan: page }) => {
    await expect(page.locator('path.pos-dot')).toHaveCount(1);
    await page.locator('#map').dragTo(page.locator('#map'), { sourcePosition: { x: 150, y: 300 }, targetPosition: { x: 50, y: 150 } });
    await page.locator('#btn-locate').click();
    await expect(page.locator('#btn-locate')).toHaveClass(/active/);
  });
});
