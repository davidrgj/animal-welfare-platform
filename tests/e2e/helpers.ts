import { expect, Page } from '@playwright/test';
import path from 'node:path';

export const evidenceDir = path.resolve(__dirname, '../../docs/evidence');

export function credentials(): { email: string; password: string } {
  const email = process.env.E2E_EMAIL ?? '';
  const password = process.env.E2E_PASSWORD ?? '';
  if (!email || !password) {
    throw new Error('Set E2E_EMAIL and E2E_PASSWORD to run authenticated end-to-end cases');
  }
  return { email, password };
}

export async function fillIonInput(page: Page, name: string, value: string): Promise<void> {
  const host = page.locator(`ion-input[name="${name}"]`);
  await host.waitFor({ state: 'visible' });
  const inner = host.locator('input');
  if (await inner.count()) {
    await inner.fill(value);
    return;
  }
  await host.click();
  await page.keyboard.type(value, { delay: 20 });
}

export async function login(page: Page, email?: string, password?: string): Promise<void> {
  const creds = email && password ? { email, password } : credentials();
  await page.goto('/#/login');
  await page.locator('h1.auth-title').waitFor();
  await fillIonInput(page, 'email', creds.email);
  await fillIonInput(page, 'password', creds.password);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await page.waitForURL(/#\/app\/dashboard/, { timeout: 30_000 });
  await expect(page.locator('ion-title').first()).toContainText('Estado ICA');
}

export async function chooseIonSelect(page: Page, name: string, option: string): Promise<void> {
  await page.locator(`ion-select[name="${name}"]`).click();
  await page.getByRole('radio', { name: option }).click();
  const confirm = page.getByRole('button', { name: /^OK$/i });
  if (await confirm.count()) {
    await confirm.click();
  }
}

export async function shot(page: Page, name: string): Promise<void> {
  await page.screenshot({ path: path.join(evidenceDir, `${name}.png`), fullPage: true });
}
