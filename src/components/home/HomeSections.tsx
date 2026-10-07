'use client'

import Link from 'next/link'
import { LANGUAGES } from '@/lib/languages'
import { useSiteTranslations } from '@/i18n/useSiteTranslations'
import { HomeButton } from './HomeButton'
import { HeroLanguagePicker } from './HeroLanguagePicker'
import { TranslationStage } from './TranslationStage'

const SECTION = 'px-5 sm:px-8 lg:px-16'
const INNER = 'mx-auto max-w-[68rem]'

export function HomeHero() {
  const { locale, t } = useSiteTranslations()
  return (
    <section id="hero" className={`${SECTION} pb-20 pt-14 sm:pt-20 md:pb-28`}>
      <div className="mx-auto max-w-[70rem] text-center">
        <h1 data-testid="hero-headline" className="hm-h1 mx-auto max-w-[62rem]">{t('site.hero.title')}</h1>
        <p className="hm-lede mx-auto mt-7 max-w-[42rem]">{t('site.hero.body')}</p>
        <HeroLanguagePicker />
        <div className="mt-10 flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-8">
          <HomeButton href={`/onboarding/confirm?lang=${locale}`}>{t('site.start')}</HomeButton>
          <Link href="/how-it-works" className="lx-focus hm-link">
            {t('site.howLink')}
          </Link>
        </div>
      </div>

      <div className="mt-14 md:mt-16">
        <TranslationStage />
      </div>
    </section>
  )
}

export function Steps() {
  const { t } = useSiteTranslations()
  return (
    <section className={`${SECTION} border-t border-[var(--hm-line)] py-24 md:py-32`}>
      <div className={INNER}>
        <h2 className="hm-h2 max-w-[44rem]">
          {t('site.steps.title')}
        </h2>
        <ol className="mt-14 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4">
          {([1, 2, 3, 4] as const).map((n) => (
            <li key={n} className="border-t border-[var(--hm-ink)] pt-5">
              <span className="text-[0.9375rem] font-medium tabular-nums text-[var(--hm-faint)]">0{n}</span>
              <h3 className="hm-h3 mt-3">{t(`site.steps.${n}.title`)}</h3>
              <p className="hm-body mt-2">{t(`site.steps.${n}.body`)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export function LanguageWall() {
  const { t } = useSiteTranslations()
  return (
    <section className={`${SECTION} bg-[var(--hm-warm)] py-24 md:py-32`}>
      <div className={INNER}>
        <h2 className="hm-h2 max-w-[44rem]">
          {t('site.languages.title')}
        </h2>
        <p className="hm-lede mt-5 max-w-[34rem]">{t('site.languages.body')}</p>
        <Link href="/languages" className="lx-focus hm-link mt-6">{t('site.languages.link')}</Link>
        <ul className="mt-12 flex flex-wrap gap-x-5 gap-y-1 md:gap-x-7">
          {LANGUAGES.slice(0, 12).map((lang) => (
            <li key={lang.code}>
              <a
                href={`/?lang=${encodeURIComponent(lang.code)}`}
                lang={lang.googleCode}
                dir={lang.rtl ? 'rtl' : 'ltr'}
                className="lx-focus lx-native hm-lang"
              >
                {lang.native}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export function Trust() {
  const { t } = useSiteTranslations()
  return (
    <section className={`${SECTION} py-24 md:py-32`}>
      <div className={`${INNER} grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20`}>
        <div>
          <h2 className="hm-h2">
            {t('site.trust.title')}
          </h2>
        </div>
        <div>
          <ul className="divide-y divide-[var(--hm-line)] border-y border-[var(--hm-line)]">
            {([1, 2, 3] as const).map((n) => (
              <li key={n} className="py-6">
                <h3 className="hm-h3">{t(`site.trust.${n}.title`)}</h3>
                <p className="hm-body mt-1.5">{t(`site.trust.${n}.body`)}</p>
              </li>
            ))}
          </ul>
          <p className="hm-body mt-8">
            {t('site.trust.emergency')}{' '}
            <Link href="/emergency" className="lx-focus font-medium text-[var(--hm-pine)] underline underline-offset-4">
              {t('site.trust.emergencyLink')}
            </Link>
          </p>
          <Link href="/privacy-safety" className="lx-focus hm-link mt-2">
            {t('site.trust.privacyLink')}
          </Link>
        </div>
      </div>
    </section>
  )
}

export function FinalCta() {
  const { locale, t } = useSiteTranslations()
  return (
    <section className={`${SECTION} border-t border-[var(--hm-line)] py-28 text-center md:py-36`}>
      <h2 className="hm-h2 mx-auto max-w-[40rem]">{t('site.final.title')}</h2>
      <div className="mt-10 flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-8">
        <HomeButton href={`/onboarding/confirm?lang=${locale}`}>{t('site.start')}</HomeButton>
        <Link href="/for-clinics" className="lx-focus hm-link">
          {t('site.final.clinics')}
        </Link>
      </div>
    </section>
  )
}
