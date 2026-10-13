import { expect, test } from '../fixtures/keiro'

test.describe('founder page', () => {
  test('renders the founder story and working CTAs', async ({ page }) => {
    const response = await page.goto('/founder', { waitUntil: 'domcontentloaded' })

    expect(response?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1, name: 'Meet the founder' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'The experience that started Keiro' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Try Keiro' })).toHaveAttribute(
      'href',
      '/onboarding?fresh=1',
    )
    await expect(page.getByRole('link', { name: 'Get in touch' })).toHaveAttribute(
      'href',
      '/contact',
    )
  })

  test('is linked from the desktop About dropdown', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/', { waitUntil: 'networkidle' })

    await page.getByRole('button', { name: 'About' }).click()
    const founderLink = page.getByRole('link', { name: 'Founder', exact: true })
    await expect(founderLink).toBeVisible()
    await founderLink.click()
    await expect(page).toHaveURL(/\/founder$/)
  })

  test('is linked from the mobile menu at narrow phone width', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 })
    await page.goto('/', { waitUntil: 'networkidle' })

    await page.getByRole('button', { name: 'Open menu' }).click()
    const founderLink = page.getByRole('link', { name: 'Founder', exact: true })
    await expect(founderLink).toBeVisible()
    await founderLink.click()
    await expect(page).toHaveURL(/\/founder$/)
  })
})
