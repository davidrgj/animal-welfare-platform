import { expect, test } from '@playwright/test';
import { login, roleAccount, shot } from '../helpers';

const roles = [
  { label: 'productor', account: roleAccount('PRODUCER'), shotName: '24-ep13-producer-users-blocked' },
  { label: 'veterinario', account: roleAccount('VETERINARIAN'), shotName: '25-ep13-vet-users-blocked' }
] as const;

for (const role of roles) {
  test(`EP-13 adminGuard blocks ${role.label} from /app/users`, async ({ page }) => {
    test.skip(!role.account, 'Set E2E_PRODUCER_* and E2E_VETERINARIAN_* to run the role cases');
    await login(page, role.account?.email, role.account?.password);
    await page.goto('/#/app/users');
    await page.waitForURL(/#\/app\/(profile|users)/, { timeout: 20_000 });
    await expect(page).toHaveURL(/#\/app\/profile/);
    await expect(page.locator('ion-title').first()).toContainText('Cuenta');
    await expect(page.getByRole('button', { name: 'Usuarios y roles' })).toHaveCount(0);
    await shot(page, role.shotName);
  });
}
