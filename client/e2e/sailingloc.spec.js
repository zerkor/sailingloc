import { expect, test } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('SailingLoc').first()).toBeVisible();
});

test('navbar links work', async ({ page }) => {
  await page.goto('/');
  for (const [label, path] of [['Accueil', '/'], ['Bateaux', '/boats'], ['Catégories', '/categories'], ['Produits', '/products'], ['Contact', '/contact']]) {
    await page.getByRole('link', { name: label }).first().click();
    await expect(page).toHaveURL(new RegExp(`${path.replace('/', '\\/')}$`));
  }
});

test('login page loads', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('button', { name: /connexion/i })).toBeVisible();
});

test('admin login and pages load', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill('admin@sailingloc.fr');
  await page.getByLabel(/mot de passe/i).fill('Admin123!');
  await page.getByRole('button', { name: /connexion/i }).click();
  await expect(page).toHaveURL(/\/admin\/dashboard/);
  await expect(page.getByText('Tableau de bord').first()).toBeVisible();
  await page.goto('/admin/users');
  await expect(page.getByText('Utilisateurs').first()).toBeVisible();
});

test('boats listing and detail load', async ({ page }) => {
  await page.goto('/boats');
  await expect(page.getByText(/bateau/i).first()).toBeVisible();
  const firstBoat = page.locator('a[href*="/bateaux/"], a[href*="/boats/"]').first();
  await firstBoat.click();
  await expect(page).toHaveURL(/\/(boats|bateaux)\//);
});
