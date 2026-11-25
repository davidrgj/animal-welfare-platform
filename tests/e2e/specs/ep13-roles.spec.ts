import { expect, test } from '@playwright/test';
import { login, shot } from '../helpers';

const roles = [
  { label: 'productor', email: 'producer@farm.local', password: 'Producer123!', shotName: '24-ep13-producer-users-blocked' },
  { label: 'veterinario', email: 'vet@farm.local', password: 'Vet123!', shotName: '25-ep13-vet-users-blocked' }
] as const;

for (const role of roles) {
  test(`EP-13 adminGuard blocks ${role.label} from /app/users`, async ({ page }) => {
    await login(page, role.email, role.password);
    await page.goto('/#/app/users');
    await page.waitForURL(/#\/app\/(profile|users)/, { timeout: 20_000 });
    await expect(page).toHaveURL(/#\/app\/profile/);
    await expect(page.locator('ion-title').first()).toContainText('Cuenta');
    await expect(page.getByRole('button', { name: 'Usuarios y roles' })).toHaveCount(0);
    await shot(page, role.shotName);
  });
}
