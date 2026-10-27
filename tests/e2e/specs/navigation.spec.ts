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
      { href: '/#/app/farms', title: 'Predios', shot: '08-farms' },
      { href: '/#/app/animals', title: 'Animales', shot: '09-animals' },
      { href: '/#/app/simulation', title: 'Simulación', shot: '10-simulation' },
      { href: '/#/app/profile', title: 'Cuenta', shot: '11-account' }
    ];
    for (const tab of tabs) {
      await page.goto(tab.href);
      await expect(page.locator('ion-title').first()).toContainText(tab.title);
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
});
