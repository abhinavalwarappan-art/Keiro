import 'server-only'

/**
 * Render a self-contained HTML document (see buildReportHtml) to a PDF using headless
 * Chromium. Chromium's text stack (HarfBuzz) shapes every script — CJK, Arabic (with
 * joining + RTL), Devanagari (with reordering/conjuncts), Cyrillic — which is why we
 * moved off jsPDF (no shaping, Latin-1 fonts → mojibake).
 *
 * Browser resolution:
 *  - Serverless (Vercel/Lambda): @sparticuz/chromium provides the executable + args.
 *    IMPORTANT — that build ships NO CJK/Arabic/Indic fonts, so those scripts render as
 *    tofu unless fonts are provisioned to the function at DEPLOY time (bundle Noto Sans
 *    + Noto Sans CJK/Arabic/Devanagari into the deployment and point fontconfig at them,
 *    or add a fonts layer). @sparticuz/chromium v149 removed the runtime `font()` loader,
 *    so this is an ops/deploy step, verified on a preview deploy — not something this
 *    module can guarantee. Latin/Cyrillic/Greek work with the bundled defaults.
 *  - Local dev / test: Playwright's downloaded Chromium (system fonts cover the scripts
 *    on a dev machine). Run `npx playwright install chromium` once.
 */

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME)

async function launchBrowser() {
  const { chromium } = await import('playwright-core')

  if (isServerless) {
    const sparticuz = (await import('@sparticuz/chromium')).default
    return chromium.launch({
      args: sparticuz.args,
      executablePath: await sparticuz.executablePath(),
      headless: true,
    })
  }

  // Dev/test: use the locally installed Playwright Chromium.
  return chromium.launch({ headless: true })
}

export async function renderReportPdf(html: string): Promise<Uint8Array> {
  const browser = await launchBrowser()
  try {
    const page = await browser.newPage()
    // The HTML is fully self-contained (inline CSS, no external requests), so 'load' is
    // enough — we never wait on the network.
    await page.setContent(html, { waitUntil: 'load' })
    const pdf = await page.pdf({ format: 'A4', printBackground: true, preferCSSPageSize: true })
    return pdf
  } finally {
    await browser.close()
  }
}
