import { test, expect, silenceSpeech, guestLogin } from '../fixtures/keiro'

// ─── helpers ───────────────────────────────────────────────────────────────

/** Navigate to /auth with standard English params. */
async function gotoAuth(page: Parameters<typeof silenceSpeech>[0]) {
  await silenceSpeech(page)
  await page.goto('/auth?lang=en-US&langName=English&langNative=English&roman=0')
}

/**
 * Locate a visible role="alert" element that is NOT the Next.js route announcer.
 * Next.js injects a hidden `<div role="alert" id="__next-route-announcer__">` on
 * every page, which causes strict-mode violations when querying getByRole('alert').
 */
function appAlert(page: Parameters<typeof silenceSpeech>[0]) {
  return page.locator('[role="alert"]:not([id="__next-route-announcer__"])')
}

// ─── method screen ──────────────────────────────────────────────────────────

test.describe('method screen', () => {
  test('renders all sign-in options', async ({ page }) => {
    await gotoAuth(page)
    await expect(page.getByRole('button', { name: /continue to chat/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /continue with phone/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /continue with google/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /continue with email/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /start without an account/i })).toBeVisible()
  })

  test('language badge shows the native language name', async ({ page }) => {
    await silenceSpeech(page)
    await page.goto('/auth?lang=es-MX&langName=Spanish&langNative=Español&roman=0')
    // The badge renders {langNative} from the search param (auth/page.tsx line 156)
    await expect(page.locator('span').filter({ hasText: 'Español' }).first()).toBeVisible()
  })

  test('back button has accessible label', async ({ page }) => {
    await gotoAuth(page)
    await expect(page.getByRole('button', { name: 'Go back' })).toBeVisible()
  })

  test('"Continue to chat →" navigates to /chat without signing in', async ({ page }) => {
    await gotoAuth(page)
    await page.getByRole('button', { name: /continue to chat/i }).click()
    await page.waitForURL('**/chat**')
    await expect(page).toHaveURL(/\/chat/)
  })

  test('"Start without an account" completes real anon auth and lands on /chat', async ({ page }) => {
    // guestLogin is the shared fixture that drives this exact flow
    await guestLogin(page)
    await expect(page).toHaveURL(/\/chat/)
    // Verify a Supabase auth cookie was set
    const cookies = await page.context().cookies()
    const authCookie = cookies.find((c) => c.name.startsWith('sb-') && c.name.includes('auth-token'))
    expect(authCookie, 'expected a Supabase auth-token cookie').toBeTruthy()
  })
})

// ─── phone step ─────────────────────────────────────────────────────────────

test.describe('phone step', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAuth(page)
    await page.getByRole('button', { name: /continue with phone/i }).click()
  })

  test('phone input and Send code button are visible', async ({ page }) => {
    await expect(page.getByLabel('Phone number')).toBeVisible()
    await expect(page.getByRole('button', { name: /send code/i })).toBeVisible()
  })

  test('Send code disabled with fewer than 10 digits', async ({ page }) => {
    const btn = page.getByRole('button', { name: /send code/i })
    // Initially disabled (empty)
    await expect(btn).toBeDisabled()
    // 9 digits — still disabled
    await page.getByLabel('Phone number').fill('555000000')
    await expect(btn).toBeDisabled()
  })

  test('Send code enabled at exactly 10 digits', async ({ page }) => {
    await page.getByLabel('Phone number').fill('5550000000')
    await expect(page.getByRole('button', { name: /send code/i })).toBeEnabled()
  })

  test('back button returns to method screen', async ({ page }) => {
    await page.getByRole('button', { name: 'Go back' }).click()
    await expect(page.getByRole('button', { name: /continue to chat/i })).toBeVisible()
  })
})

// ─── email step ─────────────────────────────────────────────────────────────

test.describe('email step', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAuth(page)
    await page.getByRole('button', { name: /continue with email/i }).click()
  })

  test('renders email and password inputs with signin submit', async ({ page }) => {
    await expect(page.locator('#auth-email')).toBeVisible()
    await expect(page.locator('#auth-password')).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
  })

  test('switching to signup mode shows name input and changes submit text', async ({ page }) => {
    await page.getByRole('button', { name: /create an account/i }).click()
    await expect(page.locator('#auth-name')).toBeVisible()
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible()
  })

  test('switching back to signin hides name input', async ({ page }) => {
    // go to signup then back to signin
    await page.getByRole('button', { name: /create an account/i }).click()
    await expect(page.locator('#auth-name')).toBeVisible()
    await page.getByRole('button', { name: /sign in/i, exact: false }).filter({ hasText: /sign in/i }).first().click()
    await expect(page.locator('#auth-name')).not.toBeVisible()
  })

  test('"Forgot password?" appears in signin mode and switches to forgot mode', async ({ page }) => {
    const forgotBtn = page.getByRole('button', { name: /forgot password/i })
    await expect(forgotBtn).toBeVisible()
    await forgotBtn.click()
    // In forgot mode: no password field, submit says "Send reset link →"
    await expect(page.locator('#auth-password')).not.toBeVisible()
    await expect(page.getByRole('button', { name: /send reset link/i })).toBeVisible()
  })

  test('"Forgot password?" not visible in signup mode', async ({ page }) => {
    await page.getByRole('button', { name: /create an account/i }).click()
    await expect(page.getByRole('button', { name: /forgot password/i })).not.toBeVisible()
  })

  test.describe('signin validation', () => {
    test('invalid email keeps submit disabled', async ({ page }) => {
      await page.locator('#auth-email').fill('not-an-email')
      await page.locator('#auth-password').fill('password123')
      // canSubmit = false because email regex fails; button stays disabled
      await expect(page.getByRole('button', { name: /sign in/i })).toBeDisabled()
    })

    test('password shorter than 8 chars keeps submit disabled', async ({ page }) => {
      await page.locator('#auth-email').fill('test@example.com')
      await page.locator('#auth-password').fill('short')
      await expect(page.getByRole('button', { name: /sign in/i })).toBeDisabled()
    })

    test('valid email + 8-char password enables submit', async ({ page }) => {
      await page.locator('#auth-email').fill('test@example.com')
      await page.locator('#auth-password').fill('password123')
      await expect(page.getByRole('button', { name: /sign in/i })).toBeEnabled()
    })

    /**
     * Trigger the alert by submitting with valid-looking credentials that will be
     * rejected by Supabase. The client guard passes (email valid, pw >= 8) so the
     * form fires, Supabase returns "invalid login credentials", and the form maps
     * it to a friendly message shown as role="alert".
     *
     * This does NOT create any user — it only exercises the error branch.
     */
    test('submitting bad credentials shows role="alert" error', async ({ page }) => {
      await page.locator('#auth-email').fill('nonexistent-keiro-test@example.invalid')
      await page.locator('#auth-password').fill('wrongpassword999')
      await page.getByRole('button', { name: /sign in/i }).click()
      // Wait for the async auth call to return and the alert to appear
      await expect(appAlert(page)).toBeVisible()
      // The friendly message for "invalid login credentials"
      await expect(appAlert(page)).toContainText(/incorrect|wrong|invalid|try again/i)
    })
  })

  test.describe('signup validation', () => {
    test.beforeEach(async ({ page }) => {
      await page.getByRole('button', { name: /create an account/i }).click()
    })

    test('submit disabled when name is empty (even with valid email + password)', async ({ page }) => {
      // name stays empty
      await page.locator('#auth-email').fill('test@example.com')
      await page.locator('#auth-password').fill('password123')
      await expect(page.getByRole('button', { name: /create account/i })).toBeDisabled()
    })

    test('submit disabled when email is invalid', async ({ page }) => {
      await page.locator('#auth-name').fill('Test User')
      await page.locator('#auth-email').fill('bad@')
      await page.locator('#auth-password').fill('password123')
      await expect(page.getByRole('button', { name: /create account/i })).toBeDisabled()
    })

    test('submit disabled when password is too short', async ({ page }) => {
      await page.locator('#auth-name').fill('Test User')
      await page.locator('#auth-email').fill('test@example.com')
      await page.locator('#auth-password').fill('short1')
      await expect(page.getByRole('button', { name: /create account/i })).toBeDisabled()
    })

    test('all fields valid enables submit (does not fire — gate only)', async ({ page }) => {
      await page.locator('#auth-name').fill('Test User')
      await page.locator('#auth-email').fill('test@example.com')
      await page.locator('#auth-password').fill('password123')
      await expect(page.getByRole('button', { name: /create account/i })).toBeEnabled()
    })
  })

  test.describe('forgot mode', () => {
    test.beforeEach(async ({ page }) => {
      await page.getByRole('button', { name: /forgot password/i }).click()
    })

    test('renders only email input and Send reset link button', async ({ page }) => {
      await expect(page.locator('#auth-email')).toBeVisible()
      await expect(page.locator('#auth-password')).not.toBeVisible()
      await expect(page.getByRole('button', { name: /send reset link/i })).toBeVisible()
    })

    test('send reset link disabled with invalid email', async ({ page }) => {
      await page.locator('#auth-email').fill('notanemail')
      await expect(page.getByRole('button', { name: /send reset link/i })).toBeDisabled()
    })

    test('send reset link enabled with valid email', async ({ page }) => {
      await page.locator('#auth-email').fill('test@example.com')
      await expect(page.getByRole('button', { name: /send reset link/i })).toBeEnabled()
    })
  })
})

// ─── reset-password page ─────────────────────────────────────────────────────

test.describe('reset-password page', () => {
  test.beforeEach(async ({ page }) => {
    await silenceSpeech(page)
    // Navigate directly — no recovery token present, so we only test UI gates
    await page.goto('/auth/reset-password')
  })

  test('renders new-password and confirm-password inputs and Update button', async ({ page }) => {
    await expect(page.locator('#new-password')).toBeVisible()
    await expect(page.locator('#confirm-password')).toBeVisible()
    await expect(page.getByRole('button', { name: /update password/i })).toBeVisible()
  })

  test('Update password is disabled when fields are empty', async ({ page }) => {
    await expect(page.getByRole('button', { name: /update password/i })).toBeDisabled()
  })

  test('Update password is disabled when password < 8 chars', async ({ page }) => {
    await page.locator('#new-password').fill('short')
    await page.locator('#confirm-password').fill('short')
    await expect(page.getByRole('button', { name: /update password/i })).toBeDisabled()
  })

  test('mismatch alert visible when confirm differs from new password', async ({ page }) => {
    await page.locator('#new-password').fill('mypassword123')
    await page.locator('#confirm-password').fill('different123')
    await expect(appAlert(page)).toBeVisible()
    await expect(appAlert(page)).toContainText(/don't match/i)
  })

  test('mismatch alert absent when fields match', async ({ page }) => {
    await page.locator('#new-password').fill('mypassword123')
    await page.locator('#confirm-password').fill('mypassword123')
    await expect(appAlert(page)).not.toBeVisible()
  })

  test('Update password enabled only when pw >= 8 and both fields match', async ({ page }) => {
    await page.locator('#new-password').fill('securepass1')
    await page.locator('#confirm-password').fill('securepass1')
    // canSubmit = true; button is enabled. Clicking it will fail (no recovery token)
    // but we only assert the gated state here.
    await expect(page.getByRole('button', { name: /update password/i })).toBeEnabled()
  })

  /**
   * BUG NOTE: When the submit fires without a valid recovery token (no ?code= in URL),
   * Supabase updateUser returns an error. The page currently shows the error via
   * role="alert" — verify that path renders gracefully without crashing.
   *
   * This test intentionally clicks a gated-but-enabled button to exercise the error branch.
   */
  test('submitting without recovery token shows role="alert" error gracefully', async ({ page }) => {
    await page.locator('#new-password').fill('securepass1')
    await page.locator('#confirm-password').fill('securepass1')
    await page.getByRole('button', { name: /update password/i }).click()
    // updateUser rejects with no recovery session; handleSubmit maps it to the
    // friendly "reset link may have expired" message rendered as role="alert"
    // (reset-password/page.tsx lines 36-42). The page must not crash.
    await expect(appAlert(page)).toBeVisible()
    await expect(appAlert(page)).toContainText(/could not update|expired|request a new/i)
  })
})