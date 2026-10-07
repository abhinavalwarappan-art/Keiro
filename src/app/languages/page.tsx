import type { Metadata } from 'next'
import { LANGUAGES } from '@/lib/languages'
import { SiteShell } from '@/components/landing-v3/SiteShell'
import { PageHero } from '@/components/landing-v3/PageBits'
import { LanguagePicker } from '@/components/landing-v3/LanguagePicker'
import { LanguageDirectory } from '@/components/landing-v3/LanguageExplorer'
import { getServerTranslations } from '@/i18n/server'

export const metadata: Metadata = {
  title: 'Languages',
  description: `Keiro helps patients communicate in ${LANGUAGES.length} languages. Choose a language to learn how it works before starting Kai.`,
}

export default async function LanguagesPage() {
  const { t } = await getServerTranslations()
  return (
    <SiteShell flow="languages">
      <PageHero flow variant="centered" eyebrow={t('site.nav.languages')} title={t('site.languages.hero')} lede={t('site.languages.intro')} />
      <section className="lx-band lx-band-cream lx-section px-5 sm:px-8 lg:px-16">
        <div className="mx-auto max-w-6xl"><LanguagePicker /></div>
      </section>
      <section className="lx-band lx-band-mint lx-section px-5 sm:px-8 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="lx-heading text-balance text-[clamp(1.75rem,3.5vw,2.5rem)] text-[var(--band-ink)]">{t('site.languages.title')}</h2>
          <LanguageDirectory />
        </div>
      </section>
    </SiteShell>
  )
}
