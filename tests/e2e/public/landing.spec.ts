import { test, expect } from '../fixtures/keiro'
import type { Page } from '@playwright/test'

// ---------------------------------------------------------------------------
// Helpers (inlined — no external fixture changes allowed)
// ---------------------------------------------------------------------------

/** Scroll the page to a pixel offset so sticky/whileInView animations evaluate. */
async function scrollTo(page: Page, px: number) {
  await page.evaluate((y: number) => window.scrollTo({ top: y, behavior: 'instant' }), px)
}

// ---------------------------------------------------------------------------
// Landing page — initial load
// ---------------------------------------------------------------------------

test.describe('landing page — initial paint', () => {
  test('has the Keiro brand title', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await expect(page).toHaveTitle(/Keiro/i)
  })

  test('h1 contains the hero headline text', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    // The headline is split across an <Accent> span, so assert on textContent.
    const h1 = page.getByTestId('hero-headline')
    await expect(h1).toBeAttached()
    const text = await h1.textContent()
    expect(text).toMatch(/Speak in your language and help your doctor understand/i)
  })

  test('hero section is present in the DOM', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('#hero')).toBeAttached()
  })
})

// ---------------------------------------------------------------------------
// Nav
// ---------------------------------------------------------------------------

test.describe('navigation bar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
  })

  test('renders the "Keiro" brand link', async ({ page }) => {
    // The brand link text is "Keiro ●" — match by partial text
    const brand = page.locator('header').getByRole('link', { name: /Keiro/i }).first()
    await expect(brand).toBeVisible()
  })

  test('nav CTA link points to /onboarding', async ({ page }) => {
    // NB: the CTA is now labelled "Start with Kai" (was "Open Keiro") and href is
    // /onboarding?fresh=1. Anchored on data-testid so the label can change freely.
    const cta = page.getByTestId('nav-cta')
    await expect(cta).toBeVisible()
    const href = await cta.getAttribute('href')
    expect(href).toMatch(/\/onboarding/)
  })

  test('nav CTA navigates to /onboarding', async ({ page }) => {
    const cta = page.getByTestId('nav-cta')
    await cta.click()
    await expect(page).toHaveURL(/\/onboarding/)
  })

  test('keeps the patient steps on the homepage instead of a separate route', async ({ page }) => {
    await expect(page.locator('header a[href="/how-it-works"]')).toHaveCount(0)
    await expect(page.locator('a[href="#how-it-works"]')).toBeVisible()
    await expect(page.locator('#how-it-works')).toBeAttached()
  })
})

test('the removed /how-it-works route returns not found', async ({ page }) => {
  const response = await page.goto('/how-it-works')
  expect(response?.status()).toBe(404)
})

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------

test.describe('footer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    // Scroll to the bottom so the footer is rendered
    await scrollTo(page, 99999)
  })

  test('Privacy link is present and routes to /privacy', async ({ page }) => {
    // The footer carries BOTH "Privacy policy" (/privacy) and "Privacy & safety"
    // (/privacy-safety); a /Privacy/i name lookup matched both. Keyed on href instead.
    const link = page.locator('footer').getByTestId('footer-link-privacy')
    await expect(link).toBeAttached()
    const href = await link.getAttribute('href')
    expect(href).toMatch(/\/privacy/)
  })

  test('Terms link is present and routes to /terms', async ({ page }) => {
    const link = page.locator('footer').getByRole('link', { name: /Terms/i })
    await expect(link).toBeAttached()
    const href = await link.getAttribute('href')
    expect(href).toMatch(/\/terms/)
  })

  test('footer contains the Keiro tagline', async ({ page }) => {
    await expect(
      page.locator('footer').getByText(/Made for patients who need to be understood/i),
    ).toBeAttached()
  })

  test('footer Privacy link navigates to /privacy', async ({ page }) => {
    const link = page.locator('footer').getByTestId('footer-link-privacy')
    await link.click()
    await expect(page).toHaveURL(/\/privacy/)
  })

  test('footer Terms link navigates to /terms', async ({ page }) => {
    const link = page.locator('footer').getByRole('link', { name: /Terms/i })
    await link.click()
    await expect(page).toHaveURL(/\/terms/)
  })
})

// ---------------------------------------------------------------------------
// /privacy page
// ---------------------------------------------------------------------------

test.describe('/privacy page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/privacy', { waitUntil: 'domcontentloaded' })
  })

  test('renders h1 "Privacy Policy"', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Privacy Policy/i, level: 1 })).toBeVisible()
  })

  test('renders key section headings', async ({ page }) => {
    // Spot-check a stable set of section h2 titles from PrivacyPage
    for (const title of [
      'The short version',
      'Your conversations are never stored',
      'Keiro is not a medical service',
    ]) {
      await expect(page.getByRole('heading', { name: title })).toBeAttached()
    }
  })

  test('has a back-to-home link', async ({ page }) => {
    // Rendered as <Link href="/" aria-label="Back to home">
    const backLink = page.getByRole('link', { name: /Back to home/i })
    await expect(backLink).toBeVisible()
  })

  test('back-to-home link navigates to /', async ({ page }) => {
    await page.getByRole('link', { name: /Back to home/i }).click()
    await expect(page).toHaveURL('/')
  })

  test('contains a link to /terms', async ({ page }) => {
    const termsLink = page.getByRole('link', { name: /Terms of Use/i })
    await expect(termsLink).toBeAttached()
    const href = await termsLink.getAttribute('href')
    expect(href).toMatch(/\/terms/)
  })

  test('shows the "Last updated" date', async ({ page }) => {
    await expect(page.getByText(/Last updated/i)).toBeVisible()
  })

  test('mentions the privacy contact email', async ({ page }) => {
    // Use a text substring match — the email appears in link text and paragraph text
    await expect(page.getByText('keiro.contact@gmail.com').first()).toBeAttached()
  })
})

// ---------------------------------------------------------------------------
// /terms page
// ---------------------------------------------------------------------------

test.describe('/terms page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/terms', { waitUntil: 'domcontentloaded' })
  })

  test('renders h1 "Terms of Use"', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Terms of Use/i, level: 1 })).toBeVisible()
  })

  test('renders key section headings', async ({ page }) => {
    for (const title of [
      '1. What Keiro Is',
      '2. Not Medical Advice',
      '6. Emergency Situations',
    ]) {
      await expect(page.getByRole('heading', { name: title })).toBeAttached()
    }
  })

  test('contains a link to /privacy', async ({ page }) => {
    // Terms page has multiple links named "Privacy Policy" (inline + footer).
    // Assert at least one exists and points to /privacy.
    const privacyLinks = page.getByRole('link', { name: /Privacy Policy/i })
    await expect(privacyLinks.first()).toBeAttached()
    const href = await privacyLinks.first().getAttribute('href')
    expect(href).toMatch(/\/privacy/)
  })

  test('shows the "Last updated" date', async ({ page }) => {
    // Multiple elements may contain "Last updated"; first() avoids strict-mode error.
    await expect(page.getByText(/Last updated/i).first()).toBeVisible()
  })

  test('"Free forever" commitment text is present', async ({ page }) => {
    // Section 8: "Free Forever"
    await expect(page.getByText(/Free Forever/i).first()).toBeAttached()
  })

  test('emergency disclaimer tells the reader to call their local emergency number', async ({ page }) => {
    // Since 1851d1f the terms deliberately say "local emergency number", not a
    // hardcoded US 911 — most Keiro patients are not calling US services.
    await expect(page.getByText(/call your local emergency number/i).first()).toBeAttached()
  })

  test('back arrow link href points to /', async ({ page }) => {
    // Terms page: sticky header has <Link href="/"><ArrowLeft /></Link> then <h1>.
    // The skip-to-content link (#main-content) comes first in DOM; the back arrow
    // is the first link whose href is "/" exactly.
    const allLinks = page.getByRole('link')
    const count = await allLinks.count()
    let found = false
    for (let i = 0; i < count; i++) {
      const href = await allLinks.nth(i).getAttribute('href')
      if (href === '/') {
        found = true
        break
      }
    }
    expect(found, 'expected a link with href="/" on the /terms page').toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Primary CTA end-to-end navigation
// ---------------------------------------------------------------------------

test.describe('primary CTA navigation', () => {
  test('clicking the nav CTA routes to /onboarding', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await page.getByTestId('nav-cta').click()
    await expect(page).toHaveURL(/\/onboarding/)
    // Onboarding page should have an h1 or visible content
    await expect(page.locator('body')).not.toBeEmpty()
  })
})
