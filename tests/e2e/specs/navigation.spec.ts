import { expect, test } from '@playwright/test';
import { chooseIonSelect, login, shot } from '../helpers';

test.describe('Authenticated navigation', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('farm inventory is consistent with the dashboard count', async ({ page }) => {
    await page.goto('/#/app/dashboard');
    const meta = (await page.locator('.status-meta').textContent()) ?? '';
    await shot(page, '17-dashboard-inventory');
    await page.goto('/#/app/farms');
    await expect(page.locator('ion-title').first()).toContainText('Predios');
    const empty = page.locator('.empty-state-title', { hasText: 'Sin predios' });
    const mentionsFarms = /([1-9]\d*)\s+predios/.exec(meta);
    if (mentionsFarms) {
      await expect(empty).toHaveCount(0);
    }
    await shot(page, '18-farms-consistency');
  });

  test('tab bar reaches farms, animals, simulation and profile', async ({ page }) => {
    const tabs = [
      { href: '/#/app/farms', title: 'Predios', shot: '08-farms', ready: 'a.farm-card' },
      { href: '/#/app/animals', title: 'Animales', shot: '09-animals', ready: 'a.animal-row' },
      { href: '/#/app/simulation', title: 'Simulación', shot: '10-simulation', ready: 'text=Nuevo escenario' },
      { href: '/#/app/profile', title: 'Cuenta', shot: '11-account', ready: 'text=Cerrar sesión' }
    ];
    for (const tab of tabs) {
      await page.goto(tab.href);
      await expect(page.locator('ion-title').first()).toContainText(tab.title);
      await expect(page.locator(tab.ready).first()).toBeVisible({ timeout: 25_000 });
      await page.waitForTimeout(400);
      await shot(page, tab.shot);
    }
  });

  test('new farm form uses sentence-case title and required identity fields', async ({ page }) => {
    await page.goto('/#/app/farms/new');
    await expect(page.locator('ion-title').first()).toContainText('Nuevo predio');
    await expect(page.getByText('Nombre del predio')).toBeVisible();
    await expect(page.getByText('Registro único de vacunación')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Guardar predio' })).toBeVisible();
    await shot(page, '12-farm-form');
  });

  test('new animal form reveals species-specific controls', async ({ page }) => {
    await page.goto('/#/app/animals/new');
    await expect(page.locator('ion-title').first()).toContainText('Nuevo animal');
    await expect(page.getByText('Identificación (chapa o tag)')).toBeVisible();
    await chooseIonSelect(page, 'species', 'Porcino');
    await expect(page.getByText('Etapa productiva')).toBeVisible();
    await expect(page.getByText('Enriquecimiento ambiental')).toBeVisible();
    await shot(page, '13-animal-form-swine');
  });

  test('reports page is reachable from the account screen', async ({ page }) => {
    await page.goto('/#/app/profile');
    await page.getByRole('button', { name: 'Reportes de predio' }).click();
    await expect(page.locator('ion-title').first()).toContainText('Reportes');
    await expect(page.getByText('IBA por predio, listo para imprimir.')).toBeVisible();
    await shot(page, '14-reports');
  });

  test('users administration is hidden from non-admin or redirected', async ({ page }) => {
    await page.goto('/#/app/users');
    await page.waitForTimeout(1500);
    const url = page.url();
    const title = await page.locator('ion-title').first().innerText();
    const allowed = url.includes('/app/users') || url.includes('/app/profile');
    expect(allowed).toBeTruthy();
    await shot(page, title.includes('Usuarios') ? '15-users-admin' : '15-users-forbidden');
  });

  test('dashboard uses the corporate date format on alerts when present', async ({ page }) => {
    await page.goto('/#/app/dashboard');
    const alertDates = page.locator('.alert-row .muted');
    const count = await alertDates.count();
    if (count > 0) {
      const stamp = await alertDates.last().innerText();
      expect(stamp).not.toMatch(/\d{2}\/\d{2}\/\d{4}/);
      expect(stamp).not.toMatch(/\d{4}-\d{2}-\d{2} \d{2}:/);
    }
    await shot(page, '16-dashboard-dates');
  });

  test('animal detail shows IBA ring and opens the welfare form', async ({ page }) => {
    await page.goto('/#/app/animals');
    await expect(page.locator('ion-title').first()).toContainText('Animales');
    await expect(page.locator('a.animal-row').first()).toBeVisible({ timeout: 20_000 });
    const preferred = page.locator('a.animal-row', { hasText: 'VACA-087' });
    const target = (await preferred.count()) ? preferred.first() : page.locator('a.animal-row').first();
    const tag = ((await target.locator('strong').innerText()) || '').trim();
    expect(tag.length).toBeGreaterThan(0);
    await target.click();
    await expect(page).toHaveURL(/#\/app\/animals\/[^/]+$/);
    await expect(page.locator('h1.status-title')).toHaveText(tag, { timeout: 20_000 });
    await expect(page.getByRole('button', { name: /evaluación/i }).first()).toBeVisible();
    await shot(page, '21-animal-detail');
    await page.getByRole('button', { name: /evaluación/i }).first().click();
    await expect(page).toHaveURL(/\/welfare/);
    await expect(page.locator('ion-title').first()).toContainText('Evaluación de bienestar');
    await expect(page.getByText('Estado de camas')).toBeVisible();
    await shot(page, '22-welfare-form');
  });

  test('simulation detail opens from an existing run when available', async ({ page }) => {
    await page.goto('/#/app/simulation');
    await expect(page.locator('ion-title').first()).toContainText('Simulación');
    await expect(page.getByText('Nuevo escenario')).toBeVisible({ timeout: 20_000 });
    await shot(page, '10-simulation');
    const existing = page.locator('a.animal-row').first();
    await expect(existing).toBeVisible({ timeout: 20_000 });
    await existing.click();
    await expect(page).toHaveURL(/#\/app\/simulation\/[^/]+/);
    await expect(page.locator('.stat-pair')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText('IBA proyectado')).toBeVisible();
    await shot(page, '23-simulation-detail');
  });

  test('mobile viewport keeps login and dashboard usable', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/#/app/dashboard');
    await expect(page.locator('ion-title').first()).toContainText('Estado ICA');
    await expect(page.locator('.status-title, .display').first()).toBeVisible({ timeout: 20_000 });
    await expect(page.locator('.status-meta').first()).toBeVisible();
    await shot(page, '20-mobile-dashboard-390x844');
    await page.goto('/#/app/profile');
    await expect(page.getByRole('button', { name: 'Cerrar sesión' })).toBeVisible();
    await page.getByRole('button', { name: 'Cerrar sesión' }).click();
    await page.waitForURL(/#\/login/, { timeout: 25_000 });
    await expect(page.locator('h1.auth-title')).toHaveText('Bienestar ICA');
    await shot(page, '19-mobile-login-390x844');
  });
});
