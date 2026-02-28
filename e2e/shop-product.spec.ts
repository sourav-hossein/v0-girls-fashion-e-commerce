import { test, expect } from '@playwright/test'

test('shop to product detail flow', async ({ page }) => {
  await page.goto('/shop')
  await expect(page.getByText('Rose Garden Party Dress')).toBeVisible()

  await page.getByText('Rose Garden Party Dress').click()
  await expect(page).toHaveURL(/\/product\/rose-garden-party-dress/)
  await expect(page.getByRole('heading', { name: 'Rose Garden Party Dress' })).toBeVisible()
  await expect(page.getByText('2800')).toBeVisible()
})
