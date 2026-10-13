'use client'

/* Why Keiro and not a translation app — shown, not argued.
   Same tray as the hero demo: the plain translation sits flat on the warm
   ground, Keiro's version is the raised white page. The patient's side speaks
   the visitor's language; what the provider reads stays in English (Literata,
   the written-record face). The underlined details in the summary are tied to
   the answers they came from, so nothing looks invented. */

import type { ReactNode } from 'react'
import { useSiteTranslations } from '@/i18n/useSiteTranslations'

const SECTION = 'px-5 sm:px-8 lg:px-16'
const PANEL = 'flex flex-col gap-7 lg:row-span-3 lg:grid lg:grid-rows-subgrid lg:gap-y-7'

// Provider-facing English: deliberately not localized.
const APP_ENGLISH = 'My stomach hurts.'
const SUMMARY_PARTS = [
  'Patient reports stomach pain that started ',
  'this morning',
  ', located in the ',
  'upper abdomen',
  '.',
] as const

function Trace({ children }: { children: ReactNode }) {
  return <mark className="hm-trace">{children}</mark>
}

function Line({ who, children, tone = 'you' }: { who: string; children: ReactNode; tone?: 'you' | 'kai' }) {
  return (
    <div className="grid grid-cols-[4.75rem_1fr] items-baseline gap-3 sm:grid-cols-[5.5rem_1fr]">
      <dt className="text-[0.875rem] font-medium text-[var(--hm-faint)]">{who}</dt>
      <dd className={`text-[1.0625rem] leading-[1.45] ${tone === 'kai' ? 'text-[var(--hm-pine)]' : 'font-medium text-[var(--hm-ink)]'}`}>
        {children}
      </dd>
    </div>
  )
}

function Record({ children }: { children: ReactNode }) {
  return (
    <p lang="en" dir="ltr" className="hm-record text-start text-[clamp(1.375rem,1.1rem+1vw,1.875rem)] leading-[1.3] text-[var(--hm-ink)]">
      {children}
    </p>
  )
}

export function WhyKeiro() {
  const { t } = useSiteTranslations()
  const you = t('site.why.you')
  const kai = t('site.why.kai')

  return (
    <section
      id="why-keiro"
      aria-labelledby="why-keiro-title"
      className={`${SECTION} scroll-mt-16 border-t border-[var(--hm-line)] py-24 md:py-32`}
    >
      <div className="mx-auto max-w-[68rem]">
        <h2 id="why-keiro-title" className="hm-h2 max-w-[44rem]">{t('site.why.title')}</h2>
        <p className="hm-lede mt-5 max-w-[40rem]">{t('site.why.body')}</p>

        <div className="mt-14 grid gap-2.5 rounded-[2rem] bg-[var(--hm-warm)] p-2.5 lg:mt-16 lg:grid-cols-[0.85fr_1.15fr] lg:grid-rows-[auto_auto_auto] lg:gap-x-3 lg:p-3">
          {/* A translation app: your sentence, in English. That's the whole job.
              On desktop both panels share three subgrid rows (label, conversation,
              what the provider reads), so the gap on this side sits exactly where
              Kai's questions are on the other. */}
          <article aria-labelledby="why-app" className={`${PANEL} p-6 sm:p-8 lg:p-10`}>
            <h3 id="why-app" className="text-[0.9375rem] font-medium text-[var(--hm-faint)]">
              {t('site.why.appLabel')}
            </h3>
            <dl>
              <Line who={you}>{t('site.why.said')}</Line>
            </dl>
            <div className="border-t border-[var(--hm-line)] pt-6">
              <p className="mb-3 text-[0.875rem] font-medium text-[var(--hm-faint)]">{t('site.why.appResult')}</p>
              <Record>{APP_ENGLISH}</Record>
              <p className="hm-body mt-4 text-[0.9375rem]">{t('site.why.appNote')}</p>
            </div>
          </article>

          {/* Keiro: Kai asks, the patient answers, the answers become one summary. */}
          <article
            aria-labelledby="why-keiro-name"
            className={`${PANEL} rounded-[1.5rem] bg-white p-6 shadow-[0_1px_0_rgba(12,34,23,0.04),0_18px_44px_-20px_rgba(12,34,23,0.22)] sm:p-8 lg:p-10`}
          >
            <h3 id="why-keiro-name" className="flex items-center gap-2.5 text-[0.9375rem] font-medium text-[var(--hm-ink)]">
              <span className="size-2 rounded-full bg-[var(--hm-leaf)]" aria-hidden />
              Keiro
            </h3>
            <dl className="grid gap-3">
              <Line who={you}>{t('site.why.said')}</Line>
              <Line who={kai} tone="kai">{t('site.why.q1')}</Line>
              <Line who={you}><Trace>{t('site.why.a1')}</Trace></Line>
              <Line who={kai} tone="kai">{t('site.why.q2')}</Line>
              <Line who={you}><Trace>{t('site.why.a2')}</Trace></Line>
            </dl>
            <div className="border-t border-[var(--hm-line)] pt-6">
              <p className="mb-3 text-[0.875rem] font-medium text-[var(--hm-faint)]">{t('site.why.summaryLabel')}</p>
              <Record>
                {SUMMARY_PARTS[0]}
                <Trace>{SUMMARY_PARTS[1]}</Trace>
                {SUMMARY_PARTS[2]}
                <Trace>{SUMMARY_PARTS[3]}</Trace>
                {SUMMARY_PARTS[4]}
              </Record>
              <p className="hm-body mt-4 text-[0.9375rem]">{t('site.why.sourceNote')}</p>
            </div>
          </article>
        </div>

        <ul className="mt-16 grid gap-x-10 gap-y-10 md:grid-cols-3 lg:mt-20">
          {([1, 2, 3] as const).map((n) => (
            <li key={n} className="border-t border-[var(--hm-ink)] pt-5">
              <h3 className="hm-h3">{t(`site.why.${n}.title`)}</h3>
              <p className="hm-body mt-2">{t(`site.why.${n}.body`)}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
