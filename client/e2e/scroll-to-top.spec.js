import { expect, test } from '@playwright/test';

const scrollToBottom = async (page) => {
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(100);
};

const expectAtTop = async (page) => {
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(20);
};

test('footer legal navigation scrolls to top', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await scrollToBottom(page);

  await page.locator('footer a[href="/legal/mentions-legales"]').click();
  await expect(page).toHaveURL(/\/legal\/mentions-legales$/);
  await expectAtTop(page);
});

test('boat detail navigation scrolls to top', async ({ page }) => {
  await page.route('**/api/boats**', async (route) => {
    if (route.request().url().includes('/reviews')) return route.fallback();
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        boats: [
          {
            _id: '64b000000000000000000001',
            slug: 'test-boat-marseille',
            title: 'Test Boat',
            type: 'sailboat',
            location: 'Marseille',
            port: 'Vieux-Port',
            pricePerDay: 250,
            capacity: 6,
            length: 10,
            images: ['/images/boats/sailboat/first-36.jpg'],
            status: 'approved',
          },
        ],
        total: 1,
      }),
    });
  });

  await page.goto('/boats', { waitUntil: 'domcontentloaded' });
  await scrollToBottom(page);

  const firstBoatLink = page.locator('a[href^="/boats/"]').first();
  await expect(firstBoatLink).toBeVisible();
  await firstBoatLink.click();
  await expect(page).toHaveURL(/\/boats\/[^/]+$/);
  await expectAtTop(page);
});
