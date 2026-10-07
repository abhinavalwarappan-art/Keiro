import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteShell } from '@/components/landing-v3/SiteShell'
import { PageHero } from '@/components/landing-v3/PageBits'
import { getServerTranslations } from '@/i18n/server'

export const metadata: Metadata = {
  title: 'How Keiro works',
  description: 'Choose your language, tell Kai how you feel, answer a few questions, and show your healthcare provider the English summary.',
}

export default async function HowItWorksPage() {
  const { locale, t } = await getServerTranslations()
  return (
    <SiteShell flow="how">
      <PageHero flow eyebrow={t('site.howLink')} title={t('site.how.hero')} lede={t('site.how.intro')} />
      <section className="lx-band lx-band-cream lx-section px-5 sm:px-8 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {([1, 2, 3, 4] as const).map(n => (
              <li key={n} className="border-t border-[var(--band-ink)] pt-5">
                <span className="lx-mono text-base text-[var(--band-muted)]">0{n}</span>
                <h2 className="lx-title mt-3 text-xl text-[var(--band-ink)]">{t(`site.steps.${n}.title`)}</h2>
                <p className="mt-3 leading-[1.8] text-[var(--band-muted)]">{t(`site.steps.${n}.body`)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className="lx-band lx-band-mint lx-section px-5 sm:px-8 lg:px-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-pretty text-lg leading-[1.8] text-[var(--band-muted)]">{t('site.how.note')}</p>
          <Link href={`/onboarding/confirm?lang=${locale}`} className="lx-focus mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--lx-ink)] px-7 py-3 font-semibold text-white hover:bg-[var(--lx-ink-deep)]">{t('site.start')}</Link>
        </div>
      </section>
    </SiteShell>
  )
}
