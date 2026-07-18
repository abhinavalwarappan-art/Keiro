import type { Metadata } from 'next'
import { SiteShell } from '@/components/landing-v3/SiteShell'
import { Band, BandHeading, Accent, ExpandableSteps, ArrowLink } from '@/components/landing-v3/Sections'
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

/* THE INTAKE FORM, LITERALLY (DESIGN.md §7.7). The page is a split plane: a
   deep plate stating who answers and how, and the form itself set as one of
   Keiro's own documents. Below it, the audience router as a ruled disclosure
   register, and the emergency notice marked the way a real notice is. */
export default function ContactPage() {
  return (
    <SiteShell flow="contact">
      <section className="relative px-5 pt-10 sm:px-8 sm:pt-14 lg:px-10 lg:pt-16">
        <div className="lx-daylight" aria-hidden="true" />
        <div className="lx-above mx-auto grid max-w-6xl items-stretch gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
          {/* The deep plate — the page's one dark plane, carrying who answers. */}
          <Reveal className="lx-band-deep flex flex-col justify-between rounded-[14px] p-8 sm:p-10">
            <div>
              <p className="lx-label text-[0.65rem] text-[var(--lx-deep-mint)]">Contact</p>
              <h1 className="lx-display mt-6 text-balance text-[clamp(1.9rem,4vw,2.8rem)] text-[var(--band-ink)]">
                Tell us who you are, and we will <Accent>write back.</Accent>
              </h1>
              <p className="mt-6 max-w-md text-lg leading-[1.8] text-[var(--band-body)]">
                A real person reads these. There is no ticketing system and no autoresponder. Find
                yourself below first; it will usually save you an email.
              </p>
            </div>

            <dl className="mt-10 border-t border-[var(--band-line)]">
              {[
                ['Reads these', 'A person, not a queue'],
                ['Turnaround', 'Usually a few days'],
                ['Autoresponder', 'None'],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="flex items-baseline justify-between gap-4 border-b border-[var(--band-line)] py-3"
                >
                  <dt className="lx-label text-[0.6rem] text-[var(--band-muted)]">{k}</dt>
                  <dd className="lx-mono text-sm text-[var(--lx-deep-mint)]">{v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          {/* The form, on paper. */}
          <div>
            <p className="lx-label text-[0.65rem] text-[var(--lx-green-ink)]">Write to us</p>
            <p className="mt-3 max-w-xl leading-[1.8] text-[var(--lx-muted)]">
              If none of the routes below covered it, this reaches us directly.
            </p>
            <ContactForm />
          </div>
        </div>
      </section>

      {/* The audience router — the page's signature, answering you before you
          write. A ruled disclosure register: you are scanning for yourself, so
          the other four fold away. */}
      <Band palette="cream" rails className="mt-16 sm:mt-20">
        <BandHeading folio="01 · Before you write" lede="Open the one that sounds like you.">
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
                      that worried you, we do want to hear that. Use the form above and be blunt.
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

      {/* Safety copy, marked the way a real notice is: a signal rule down the
          side, the exit prominent — not typeset like a line of poetry. */}
      <Band palette="mint">
        <Reveal className="max-w-3xl border-s-4 border-[var(--lx-signal-fill)] ps-6 sm:ps-8">
          <p className="lx-label text-[0.65rem] text-[var(--lx-signal-ink)]">
            If this is an emergency
          </p>
          <h2 className="mt-5 text-balance text-[clamp(1.5rem,3.4vw,2.1rem)] font-semibold leading-[1.25] tracking-[-0.01em] text-[var(--band-ink)]">
            Do not use this form.
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-[1.8] text-[var(--band-body)]">
            Nobody is watching this inbox around the clock, and we cannot help you quickly. If you
            are in danger right now, or the pain is severe, call your local emergency number.
          </p>
          <a
            href="/emergency"
            className="lx-focus lx-btn lx-btn-primary mt-7 inline-flex min-h-12 items-center justify-center px-6 font-semibold"
          >
            Get emergency help
          </a>
        </Reveal>
      </Band>
    </SiteShell>
  )
}
