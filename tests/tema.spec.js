const { test, expect, bild } = require('./hjalp');

test.describe('Tema', () => {
  test('temaknappen växlar Auto → Ljust → Mörkt och sparar valet', async ({ kartan: page }) => {
    const knapp = page.locator('#btn-theme');
    await expect(page.locator('#theme-label')).toHaveText('Auto');
    await knapp.click();
    await expect(page.locator('#theme-label')).toHaveText('Ljust');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await knapp.click();
    await expect(page.locator('#theme-label')).toHaveText('Mörkt');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('mörkt läge följer telefonens inställning', async ({ page, api }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await require('./mock').inloggad(page);
    await page.goto('./');
    await expect(page.locator('.fynd-pin')).toHaveCount(3);
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bg).toBe('rgb(30, 25, 18)');
    await bild(page, 'Kartan i mörkt läge');
  });

  test('ljust läge har Kantarell-färgerna', async ({ page, api }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('./');
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bg).toBe('rgb(251, 244, 230)');
  });
});
