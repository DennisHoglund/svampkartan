const { test, expect, bild } = require('./hjalp');

test.describe('Utan täckning', () => {
  test('fynd sparas i telefonen och laddas upp när täckningen kommer tillbaka', async ({ kartan: page, context, api }) => {
    await context.setOffline(true);
    api.nere = true;

    await page.locator('#btn-add').click();
    await page.locator('#art-grid [data-art="kantarell"]').click();
    await page.locator('#fynd-not').fill('Offlinefynd');
    await page.locator('#fynd-foto').setInputFiles(require('path').join(__dirname, 'data', 'kantarell.jpg'));
    await expect(page.locator('#foto-text')).toContainText('kB');
    await page.locator('#btn-save').click();

    await expect(page.locator('#toast')).toContainText('sparad i telefonen');
    await expect(page.locator('#queue-badge')).toHaveText('1 väntar');
    await expect(page.locator('.fynd-pin.pending')).toHaveCount(1);
    expect(api.fynd.find((f) => f.anteckning === 'Offlinefynd')).toBeUndefined();
    await bild(page, 'Fynd som väntar på uppladdning');

    api.nere = false;
    await context.setOffline(false);

    await expect(page.locator('#toast')).toHaveText('1 fynd uppladdat', { timeout: 15000 });
    await expect(page.locator('#queue-badge')).toBeHidden();
    await expect(page.locator('.fynd-pin.pending')).toHaveCount(0);
    const uppladdat = api.fynd.find((f) => f.anteckning === 'Offlinefynd');
    expect(uppladdat).toBeTruthy();
    expect(uppladdat.vader).toBeTruthy();
    expect(api.uppladdade).toContain(uppladdat.foto_path);
  });

  test('köade fynd finns kvar efter omstart av appen', async ({ kartan: page, context, api }) => {
    api.nere = true;
    await context.setOffline(true);
    await page.locator('#btn-add').click();
    await page.locator('#btn-save').click();
    await expect(page.locator('#queue-badge')).toHaveText('1 väntar');

    // Starta om appen fortfarande utan täckning mot Supabase
    await context.setOffline(false);
    await page.reload();
    await expect(page.locator('#queue-badge')).toHaveText('1 väntar');
    await expect(page.locator('.fynd-pin.pending')).toHaveCount(1);
  });

  test('visar senast hämtade fynd när servern inte nås', async ({ kartan: page, api }) => {
    api.nere = true;
    await page.reload();
    await expect(page.locator('#toast')).toContainText('Ingen täckning');
    await expect(page.locator('.fynd-pin')).toHaveCount(3);
  });
});
