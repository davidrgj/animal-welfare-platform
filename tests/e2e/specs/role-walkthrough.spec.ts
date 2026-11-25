import { expect, test } from '@playwright/test';
import { login, roleAccount, RoleAccount, shot } from '../helpers';

type RoleCase = {
  key: 'producer' | 'vet';
  account: RoleAccount;
  roleLabel: string;
};

const roles: RoleCase[] = [
  { key: 'producer', account: roleAccount('PRODUCER'), roleLabel: 'Productor' },
  { key: 'vet', account: roleAccount('VETERINARIAN'), roleLabel: 'Veterinario' }
];

for (const role of roles) {
  test.describe(`Walkthrough ${role.roleLabel}`, () => {
    test.skip(!role.account, 'Set E2E_PRODUCER_* and E2E_VETERINARIAN_* to run the role walkthroughs');

    test.beforeEach(async ({ page }) => {
      await login(page, role.account?.email, role.account?.password);
    });

    test(`dashboard farms animals simulation reports profile and users block`, async ({ page }) => {
      const prefix = `role-${role.key}`;

      await expect(page.locator('ion-title').first()).toContainText('Estado ICA');
      await expect(page.locator('.account-meta small')).toContainText(role.roleLabel);
      await shot(page, `${prefix}-01-dashboard`);

      await page.goto('/#/app/farms');
      await expect(page.locator('ion-title').first()).toContainText('Predios');
      await expect(page.locator('a.farm-card, .empty-state-title').first()).toBeVisible({ timeout: 20_000 });
      await shot(page, `${prefix}-02-farms`);

      await page.goto('/#/app/animals');
      await expect(page.locator('ion-title').first()).toContainText('Animales');
      await expect(page.locator('a.animal-row, .empty-state-title').first()).toBeVisible({ timeout: 20_000 });
      await shot(page, `${prefix}-03-animals`);

      const animal = page.locator('a.animal-row').first();
      if (await animal.count()) {
        await animal.click();
        await expect(page).toHaveURL(/#\/app\/animals\/[^/]+$/);
        await expect(page.locator('h1.status-title')).toBeVisible({ timeout: 20_000 });
        await shot(page, `${prefix}-04-animal-detail`);
      }

      await page.goto('/#/app/simulation');
      await expect(page.locator('ion-title').first()).toContainText('Simulación');
      await expect(page.getByText('Nuevo escenario')).toBeVisible({ timeout: 20_000 });
      await shot(page, `${prefix}-05-simulation`);

      await page.goto('/#/app/reports');
      await expect(page.locator('ion-title').first()).toContainText('Reportes');
      await shot(page, `${prefix}-06-reports`);

      await page.goto('/#/app/profile');
      await expect(page.locator('ion-title').first()).toContainText('Cuenta');
      await expect(page.getByRole('button', { name: 'Usuarios y roles' })).toHaveCount(0);
      await expect(page.getByText(role.roleLabel).first()).toBeVisible();
      await shot(page, `${prefix}-07-profile`);

      await page.locator('ion-button.account-trigger').first().click();
      await expect(page.locator('ion-popover').getByText('Mi cuenta')).toBeVisible({ timeout: 10_000 });
      await expect(page.locator('ion-popover').getByText('Reportes de predio')).toBeVisible();
      await expect(page.locator('ion-popover').getByText('Usuarios y roles')).toHaveCount(0);
      await shot(page, `${prefix}-08-account-menu`);
      await page.keyboard.press('Escape');

      await page.goto('/#/app/users');
      await page.waitForURL(/#\/app\/profile/, { timeout: 20_000 });
      await expect(page.locator('ion-title').first()).toContainText('Cuenta');
      await expect(page.getByRole('button', { name: 'Usuarios y roles' })).toHaveCount(0);
      await shot(page, `${prefix}-09-users-blocked`);
    });
  });
}
