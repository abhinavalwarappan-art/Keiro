import type { Metadata } from 'next'
import { SiteShell } from '@/components/landing-v3/SiteShell'
import { PageHero } from '@/components/landing-v3/PageBits'
import {
  Band,
  BandHeading,
  Accent,
  ExpandableSteps,
  ArrowLink,
} from '@/components/landing-v3/Sections'
import { ContactForm } from '@/components/landing-v3/ContactForm'
import { Reveal } from '@/components/landing-v3/Reveal'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Whether you are a patient, a clinic, a journalist, an investor or a judge, tell us who you are and we will write back. A real person reads these.',
  openGraph: {
    title: 'Contact Keiro',
    description: 'Tell us who you are and we will write back. A real person reads these.',
  },
}

/* Spine: hero -> audience router as expandables(cream) -> form(mint)
   -> emergency thesis(DEEP). An audience router rather than a form-first page. */
export default function ContactPage() {
  return (
    <SiteShell flow="contact">
      <PageHero
        flow
        variant="centered"
        eyebrow="Contact"
        title="Tell us who you are, and we will write back."
        lede="A real person reads these. There is no ticketing system and no autoresponder. Find yourself below first; it will usually save you an email."
      />

      {/* The audience router is this page's signature — it is the only page that
          answers you before you write anything, and for most people it removes the
          need to write at all. It stays an accordion for the same reason /privacy
          keeps one: you are scanning for yourself, and you want the other four out
          of the way. */}
      <Band palette="cream" rails>
        <BandHeading lede="Open the one that sounds like you.">
          Start <Accent>here.</Accent>
        </BandHeading>

        <div className="mt-10">
          <ExpandableSteps
            items={[
              {
                n: '01',
                title: 'I am a patient',
                summary: 'You almost certainly do not need to contact anyone.',
                detail: (
                  <div className="max-w-2xl">
                    <p className="leading-[1.85] text-[var(--band-muted)]">
                      Keiro is free, there is no account, and you can start right now. There is
                      nothing to request and nobody to ask. If something broke, or Kai said something
                      that worried you, we do want to hear that. Use the form below and be blunt.
                    </p>
                    <div className="mt-4">
                      <ArrowLink href="/onboarding?fresh=1">Just start talking to Kai</ArrowLink>
                    </div>
                  </div>
                ),
              },
              {
                n: '02',
                title: 'I am a clinic or hospital',
                summary: 'Read the honest version before you write to us.',
                detail: (
                  <div className="max-w-2xl">
                    <p className="leading-[1.85] text-[var(--band-muted)]">
                      The for-clinics page explains what your clinicians would actually receive, and
                      it is candid about the limits, including that Keiro has not been clinically
                      validated. Read that first; it will make the conversation shorter.
                    </p>
                    <div className="mt-4">
                      <ArrowLink href="/for-clinics">Read: for clinics</ArrowLink>
                    </div>
                  </div>
                ),
              },
              {
                n: '03',
                title: 'I am a journalist',
                summary: 'The fastest way to understand Keiro is to use it.',
                detail: (
                  <div className="max-w-2xl">
                    <p className="leading-[1.85] text-[var(--band-muted)]">
                      It takes five minutes and needs no account. Choose a language you do not speak
                      and talk to Kai. That is the entire product. The mission page has the
                      background and the numbers behind why it exists.
                    </p>
                    <div className="mt-4">
                      <ArrowLink href="/about">Read: our mission</ArrowLink>
                    </div>
                  </div>
                ),
              },
              {
                n: '04',
                title: 'I am an investor',
                summary: 'Start with what we have not done.',
                detail: (
                  <div className="max-w-2xl">
                    <p className="leading-[1.85] text-[var(--band-muted)]">
                      Please read privacy &amp; safety before anything else, particularly the section
                      on what we have not done and the part about where messages are processed. We
                      would rather you find the gaps on our own page than in diligence.
                    </p>
                    <div className="mt-4">
                      <ArrowLink href="/privacy-safety">Read: privacy &amp; safety</ArrowLink>
                    </div>
                  </div>
                ),
              },
              {
                n: '05',
                title: 'I am judging this project',
                summary: 'The five-minute version.',
                detail: (
                  <div className="max-w-2xl">
                    <p className="leading-[1.85] text-[var(--band-muted)]">
                      Open Keiro, choose a language you do not speak, and talk to Kai. That is the
                      whole product, and it needs no account. How it works explains the technology in
                      plain words; privacy &amp; safety is where we are candid about the limits,
                      including the ones that are not flattering.
                    </p>
                    <div className="mt-4">
                      <ArrowLink href="/how-it-works">Read: how it works</ArrowLink>
                    </div>
                  </div>
                ),
              },
            ]}
          />
        </div>
      </Band>

      <Band palette="mint" id="form">
        <BandHeading lede="If none of that covered it, this reaches us directly. We usually reply within a few days.">
          Write to <Accent>us.</Accent>
        </BandHeading>
        <Reveal>
          <div className="max-w-2xl">
            <ContactForm />
          </div>
        </Reveal>
      </Band>

      {/* Safety copy, set like safety copy.

          This was a <Thesis>: an oversized italic serif statement, the same block
          /about opens its manifesto with. That is the wrong register entirely —
          a warning that someone might be dying should not be typeset like a line
          of poetry. Sans, not serif. No decorative accent. A rule down the side,
          the way a real notice is marked, and the exit is the first thing your eye
          lands on rather than a link underneath a paragraph. */}
      <Band palette="deep" flow="glow">
        <Reveal className="max-w-3xl border-l-4 border-[var(--lx-sage)] pl-6 sm:pl-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--lx-sage)]">
            If this is an emergency
          </p>
          <h2 className="mt-5 text-balance font-sans text-[clamp(1.5rem,3.4vw,2.1rem)] font-semibold leading-[1.25] tracking-[-0.01em] text-[var(--band-ink)]">
            Do not use this form.
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-[1.8] text-[var(--band-body)]">
            Nobody is watching this inbox around the clock, and we cannot help you quickly. If you
            are in danger right now, or the pain is severe, call your local emergency number.
          </p>
          <a
            href="/emergency"
            className="lx-focus mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--lx-sage)] px-6 font-semibold text-[var(--lx-ink)] transition-colors duration-200 hover:bg-white"
          >
            Get emergency help
          </a>
        </Reveal>
      </Band>

    </SiteShell>
  )
}
