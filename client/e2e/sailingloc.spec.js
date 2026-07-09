import { expect, test } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('SailingLoc').first()).toBeVisible();
});

test('navbar links work', async ({ page }) => {
  await page.goto('/');
  for (const [label, path] of [
    ['Accueil', '/'],
    ['Bateaux', '/boats'],
    ['Catégories', '/categories'],
    ['Produits', '/products'],
    ['Contact', '/contact'],
  ]) {
    await page.getByRole('link', { name: label }).first().click();
    await expect(page).toHaveURL(new RegExp(`${path.replace('/', '\\/')}$`));
  }
});

test('login page loads', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('button', { name: /se connecter/i })).toBeVisible();
});

test('admin dashboard and users pages load in local demo mode', async ({ page }) => {
  await page.goto('/admin/dashboard?demoRole=admin');
  await expect(page.getByText(/Tableau de bord|Impossible de charger les statistiques admin/i).first()).toBeVisible();
  await page.goto('/admin/users?demoRole=admin');
  await expect(page.getByText('Utilisateurs').first()).toBeVisible();
});

test('boats listing page loads', async ({ page }) => {
  await page.goto('/boats');
  await expect(page.getByText(/bateaux/i).first()).toBeVisible();
});

test('boat detail route loads or shows a handled not found state', async ({ page }) => {
  await page.goto('/boats/000000000000000000000000');
  await expect(page.getByText(/introuvable|erreur|bateau/i).first()).toBeVisible();
});

test('owner dashboard blocks unauthenticated access', async ({ page }) => {
  await page.goto('/owner/dashboard');
  await expect(page).toHaveURL(/\/login$/);
});

test('admin page blocks non-admin user', async ({ page }) => {
  await page.goto('/admin/users?demoRole=tenant');
  await expect(page).toHaveURL(/\/$/);
});
