import { expect, test } from '@playwright/test';
import { credentials, fillIonInput, login, shot } from '../helpers';

test.describe('Authentication', () => {
  test('login page shows ICA branding and sentence-case labels', async ({ page }) => {
    await page.goto('/#/login');
    await expect(page.locator('h1.auth-title')).toHaveText('Bienestar ICA');
    await expect(page.getByText('Correo electrónico')).toBeVisible();
    await expect(page.getByText('Contraseña')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Crear cuenta' })).toBeVisible();
    await expect(page.getByText(/Demo:/i)).toHaveCount(0);
    await expect(page.getByText('Producer123!')).toHaveCount(0);
    await shot(page, '01-login');
  });

  test('invalid password shows a Spanish error and stays on login', async ({ page }) => {
    await page.goto('/#/login');
    await fillIonInput(page, 'email', 'nobody@farm.local');
    await fillIonInput(page, 'password', 'wrong-password');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page.locator('.error-text')).toContainText('Correo o contraseña no válidos');
    await expect(page).toHaveURL(/#\/login/);
    await shot(page, '02-login-error');
  });

  test('valid credentials open the dashboard', async ({ page }) => {
    await login(page);
    await expect(page.locator('.status-title, .display').first()).toBeVisible();
    await shot(page, '03-dashboard');
  });

  test('protected dashboard redirects guests to login', async ({ page }) => {
    await page.goto('/#/app/dashboard');
    await page.waitForURL(/#\/login/, { timeout: 20_000 });
    await expect(page.locator('h1.auth-title')).toHaveText('Bienestar ICA');
    await shot(page, '04-guard-redirect');
  });

  test('logout returns to login', async ({ page }) => {
    await login(page);
    await page.goto('/#/app/profile');
    await expect(page.getByRole('button', { name: 'Cerrar sesión' })).toBeVisible();
    await shot(page, '05-profile');
    await page.getByRole('button', { name: 'Cerrar sesión' }).click();
    await page.waitForURL(/#\/login/, { timeout: 25_000 });
    await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();
    await shot(page, '06-logout');
  });

  test('register page lists producer and veterinarian but not administrator', async ({ page }) => {
    await page.goto('/#/register');
    await expect(page.locator('h1.auth-title')).toHaveText('Crear cuenta');
    await expect(page.getByText('Nombre completo')).toBeVisible();
    await page.locator('ion-select[name="role"]').click();
    await expect(page.getByRole('radio', { name: 'Productor' })).toBeVisible();
    await expect(page.getByRole('radio', { name: 'Veterinario' })).toBeVisible();
    await expect(page.getByRole('radio', { name: 'Administrador' })).toHaveCount(0);
    await shot(page, '07-register');
  });

  test('guest with a session is sent away from login', async ({ page }) => {
    await login(page);
    await page.goto('/#/login');
    await page.waitForURL(/#\/app\/dashboard/, { timeout: 20_000 });
    const { email } = credentials();
    expect(email).toBeTruthy();
  });
});
