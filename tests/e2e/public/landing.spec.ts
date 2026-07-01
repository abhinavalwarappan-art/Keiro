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
    await page.goto('/', { waitUntil: 'networkidle' })
    // Hero renders a sr-only span with the full headline inside h1.
    // We check textContent (which includes sr-only text) rather than visible text.
    const h1 = page.locator('h1').first()
    await expect(h1).toBeAttached()
    const text = await h1.textContent()
    expect(text).toMatch(/Healthcare.*speaks.*language/i)
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

  test('section nav items are present', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: /landing page sections/i })
    await expect(nav).toBeVisible()
    // Check a stable subset of nav labels from Nav.tsx navItems array
    for (const label of ['Steps', 'Languages', 'How it works']) {
      await expect(nav.getByText(label)).toBeVisible()
    }
  })

  test('"Open Keiro" CTA link points to /onboarding', async ({ page }) => {
    // The CTA is an <a href="/onboarding?fresh=1"> with aria-label "Open Keiro"
    const cta = page.getByRole('link', { name: /Open Keiro/i })
    await expect(cta).toBeVisible()
    const href = await cta.getAttribute('href')
    expect(href).toMatch(/\/onboarding/)
  })

  test('"Open Keiro" CTA navigates to /onboarding', async ({ page }) => {
    const cta = page.getByRole('link', { name: /Open Keiro/i })
    await cta.click()
    await expect(page).toHaveURL(/\/onboarding/)
  })
})

// ---------------------------------------------------------------------------
// KaiJourney section (#kai)
// ---------------------------------------------------------------------------

test.describe('KaiJourney section', () => {
  test('section mounts in the DOM and contains scene copy', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    const section = page.locator('#kai')
    await expect(section).toBeAttached()

    // KaiJourney renders three scenes; the first scene title should exist in DOM.
    // On mobile (stacked reveal) all scenes render; check at least one.
    await expect(
      page.getByText('We build Kai to help humans.').first(),
    ).toBeAttached()
  })

  test('contains the "Built to be understood" eyebrow text', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    await expect(page.getByText('Built to be understood').first()).toBeAttached()
  })
})

// ---------------------------------------------------------------------------
// Flow section (#flow) — Three simple steps
// ---------------------------------------------------------------------------

test.describe('Flow section — three steps', () => {
  test('section heading "Three simple steps." is present', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    const heading = page.getByRole('heading', { name: /Three simple steps/i })
    await expect(heading).toBeAttached()
  })

  test('all three step titles exist in the DOM', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    // Flow section only renders the active step copy via AnimatePresence — scroll
    // through each slice so each step enters the DOM at least once before asserting.
    // On mobile (stacked layout) all three render immediately.
    // We check each title is attached at some point by scrolling and waiting.
    await expect(page.getByText('You speak').first()).toBeAttached()

    // Step 2 & 3 require scrolling into the Flow section.
    // Find the #flow section offset and scroll to each step's slice.
    const flowTop = await page.locator('#flow').evaluate((el) => el.getBoundingClientRect().top + window.scrollY)
    // Each step occupies 1/3 of the section height; use mid-slice offsets.
    // Scroll to step 2 slice (33-66% of section scroll range).
    const sectionHeight = await page.locator('#flow').evaluate((el) => (el as HTMLElement).offsetHeight)
    await scrollTo(page, flowTop + sectionHeight * 0.45)
    await expect(page.getByText('Kai interprets').first()).toBeAttached({ timeout: 8000 })

    await scrollTo(page, flowTop + sectionHeight * 0.78)
    await expect(page.getByText('Doctor reads').first()).toBeAttached({ timeout: 8000 })
  })

  test('step nav buttons are accessible via aria-label', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    // Flow renders buttons with aria-label "Go to step N: <title>"
    await expect(
      page.getByRole('button', { name: /Go to step 1/i }).first(),
    ).toBeAttached()
  })
})

// ---------------------------------------------------------------------------
// HowKaiWorks section (#how-kai-works)
// ---------------------------------------------------------------------------

test.describe('HowKaiWorks section', () => {
  test('section renders with its heading', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    const section = page.locator('#how-kai-works')
    await expect(section).toBeAttached()

    const heading = page.getByRole('heading', {
      name: /Kai listens like a person/i,
    })
    await expect(heading).toBeAttached()
  })

  test('feature labels are present in the DOM', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    // From HowKaiWorks.tsx features array
    for (const label of ['Speak naturally', 'Real-time interpretation', 'Instant report']) {
      await expect(page.getByText(label).first()).toBeAttached()
    }
  })

  test('"Open app" link inside HowKaiWorks points to /onboarding', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    // MotionLink renders <a href="/onboarding?fresh=1">Open app →</a>
    const link = page.getByRole('link', { name: /Open app/i })
    await expect(link).toBeAttached()
    const href = await link.getAttribute('href')
    expect(href).toMatch(/\/onboarding/)
  })
})

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------

test.describe('footer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    // Scroll to the bottom so the footer is rendered
    await scrollTo(page, 99999)
  })

  test('Privacy link is present and routes to /privacy', async ({ page }) => {
    // Footer renders <Link href="/privacy">Privacy</Link>
    const link = page.locator('footer').getByRole('link', { name: /Privacy/i })
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
      page.locator('footer').getByText(/Built for patients who need to be understood/i),
    ).toBeAttached()
  })

  test('footer Privacy link navigates to /privacy', async ({ page }) => {
    const link = page.locator('footer').getByRole('link', { name: /Privacy/i })
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
    await expect(page.getByText('privacy@keiro.app').first()).toBeAttached()
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

  test('emergency disclaimer mentions 911', async ({ page }) => {
    await expect(page.getByText(/call 911/i)).toBeAttached()
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
  test('clicking "Open Keiro" in nav routes to /onboarding', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await page.getByRole('link', { name: /Open Keiro/i }).click()
    await expect(page).toHaveURL(/\/onboarding/)
    // Onboarding page should have an h1 or visible content
    await expect(page.locator('body')).not.toBeEmpty()
  })
})