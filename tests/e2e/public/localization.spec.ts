import { test, expect } from '@playwright/test'

test('Spanish patient can choose a language and reach Kai without English instructions', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('hero-language-es-ES').click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'es-ES')
  await expect(page.getByTestId('hero-headline')).toContainText('Habla en tu idioma')
  await page.reload()
  await expect(page.getByTestId('hero-headline')).toContainText('Habla en tu idioma')
  await page.getByTestId('nav-cta').click()
  await expect(page).toHaveURL(/\/onboarding\/confirm\?lang=es-ES/)
  await expect(page.getByTestId('confirm-continue')).toContainText('Español')
  await page.getByTestId('confirm-continue').click()
  await expect(page.getByTestId('guest-start')).toContainText('Empezar')
})

test('direct Tamil and Arabic links render in the chosen direction without overflow', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  for (const [locale, direction] of [['ta-IN', 'ltr'], ['ar-SA', 'rtl']] as const) {
    await page.goto(`/?lang=${locale}`)
    await expect(page.locator('html')).toHaveAttribute('lang', locale)
    await expect(page.locator('html')).toHaveAttribute('dir', direction)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
    expect(overflow).toBeLessThanOrEqual(0)
    await page.getByTestId('nav-cta').click()
    await expect(page).toHaveURL(new RegExp(`lang=${locale}`))
    await expect(page.getByTestId('confirm-continue')).toBeVisible()
  }
})
