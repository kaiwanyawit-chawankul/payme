import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:4173/';

test.beforeEach(async ({ page }) => {
  await page.goto(baseUrl);
});

test('home page loads successfully', async ({ page }) => {
  await expect(page).toHaveTitle(/Payme/);
  await expect(page.locator('h1')).toHaveText('Payme');
  await expect(page.locator('button', { hasText: 'Pay with Stripe' })).toBeVisible();
});

test('selecting a donation amount updates the UI', async ({ page }) => {
  await page.locator('button', { hasText: '$50' }).click();
  await expect(page.locator('.pill.selected')).toHaveText('$50');
});

test('stripe pay button shows the Stripe card form', async ({ page }) => {
  await page.locator('button', { hasText: 'Pay with Stripe' }).click();
  await expect(page.locator('#stripeForm')).toBeVisible();
  await expect(page.locator('.toast')).toHaveText(/Stripe payment form ready for/);
});

test('paypal button is disabled in this simple demo', async ({ page }) => {
  await expect(page.locator('button', { hasText: 'Pay with PayPal' })).toBeDisabled();
});
