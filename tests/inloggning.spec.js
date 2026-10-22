const { test, expect, bild } = require('./hjalp');
const { ANVANDARE, LOSENORD } = require('./mock');

test.describe('Inloggning', () => {
  test('visar inloggningen när man inte är inloggad', { annotation: { type: 'testfall', description: 'TC-INL-01' } }, async ({ page, api }) => {
    await page.goto('./');
    await expect(page.locator('#view-login')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Svampkartan' })).toBeVisible();
    await expect(page.locator('#view-app')).toBeHidden();
    await bild(page, 'Inloggningssidan');
  });

  test('fel lösenord ger ett tydligt felmeddelande', { annotation: { type: 'testfall', description: 'TC-INL-02' } }, async ({ page, api }) => {
    await page.goto('./');
    await page.locator('#email').fill(ANVANDARE.email);
    await page.locator('#password').fill('fel-losenord');
    await page.getByRole('button', { name: 'Logga in' }).click();
    await expect(page.locator('#login-msg')).toHaveText('Fel e-post eller lösenord.');
    await expect(page.locator('#login-msg')).toHaveClass(/error/);
    await bild(page, 'Fel lösenord');
  });

  test('ogiltig e-post stoppas innan något skickas', { annotation: { type: 'testfall', description: 'TC-INL-03' } }, async ({ page, api }) => {
    await page.goto('./');
    await page.locator('#email').fill('inte-en-adress');
    await page.locator('#password').fill(LOSENORD);
    await page.getByRole('button', { name: 'Logga in' }).click();
    await expect(page.locator('#login-msg')).toHaveText('Ange en giltig e-postadress.');
    expect(api.anrop.filter((a) => a.sokvag.startsWith('/auth/v1/token'))).toHaveLength(0);
  });

  test('rätt uppgifter loggar in och visar kartan med fynd', { annotation: { type: 'testfall', description: 'TC-INL-04' } }, async ({ page, api }) => {
    await page.goto('./');
    await page.locator('#email').fill(ANVANDARE.email);
    await page.locator('#password').fill(LOSENORD);
    await page.getByRole('button', { name: 'Logga in' }).click();
    await expect(page.locator('#view-app')).toBeVisible();
    await expect(page.locator('.fynd-pin')).toHaveCount(3);
    await expect(page.locator('#toast')).toContainText('3 fynd på kartan');
  });

  test('inloggningen finns kvar efter omladdning', { annotation: { type: 'testfall', description: 'TC-INL-05' } }, async ({ kartan: page }) => {
    await page.reload();
    await expect(page.locator('#view-app')).toBeVisible();
    await expect(page.locator('#view-login')).toBeHidden();
  });

  test('logga ut tar en tillbaka till inloggningen', { annotation: { type: 'testfall', description: 'TC-INL-06' } }, async ({ kartan: page }) => {
    await page.locator('#btn-logout').click();
    await expect(page.locator('#view-login')).toBeVisible();
  });
});
