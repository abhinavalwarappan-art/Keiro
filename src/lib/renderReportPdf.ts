import 'server-only'
import { buildReportFontStyle } from './reportFonts'

/**
 * Render a self-contained HTML document (see buildReportHtml) to a PDF using headless
 * Chromium. Chromium's text stack (HarfBuzz) shapes every script — CJK, Arabic (with
 * joining + RTL), Devanagari (with reordering/conjuncts), Cyrillic — which is why we
 * moved off jsPDF (no shaping, Latin-1 fonts → mojibake).
 *
 * Fonts are EMBEDDED into the HTML as base64 @font-face data-URIs (see reportFonts.ts),
 * so the glyphs travel with the document. That is what makes this correct on serverless
 * Chromium (@sparticuz/chromium), which ships almost no fonts: we never depend on system
 * fonts, so dev (macOS, has the fonts) and prod (Vercel, does not) render identically.
 *
 * Browser resolution:
 *  - Serverless (Vercel/Lambda): @sparticuz/chromium provides the executable + args.
 *  - Local dev / test: Playwright's downloaded Chromium. Run `npx playwright install
 *    chromium` once.
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
    // Inject the embedded fonts into <head> so glyphs travel with the document (see
    // reportFonts.ts). Falls back to appending if there's no </head> for any reason.
    const fontStyle = buildReportFontStyle()
    const htmlWithFonts = html.includes('</head>')
      ? html.replace('</head>', `${fontStyle}</head>`)
      : fontStyle + html
    // Self-contained (inline CSS + inlined fonts, no external requests). Wait for the
    // embedded @font-face faces to finish loading before printing, so the first paint
    // isn't a fallback font.
    await page.setContent(htmlWithFonts, { waitUntil: 'load' })
    await page.evaluate(() => document.fonts.ready)
    const pdf = await page.pdf({ format: 'A4', printBackground: true, preferCSSPageSize: true })
    return pdf
  } finally {
    await browser.close()
  }
}
