'use client'

/* ============================= MEET KAI ====================================
   An introduction to a companion, not a feature list. Every promise is written
   in Kai's own first-person voice (the Cleo/Duolingo lesson: a mascot only works
   if it changes the copy voice — otherwise it's a sticker).

   The "What I'm not" panel is deliberately on the marketing page rather than
   buried in the ToS, following Headspace/Ebb. For a frightened patient it is the
   single highest-trust block on the site.
   ========================================================================== */

import { Kai } from '@/components/kai/Kai'
import { Reveal } from './Reveal'

const promises = [
  {
    title: 'I will wait.',
    body: 'Take as long as you need. Say it twice, change your mind, start over. I will not rush you and I will not sigh.',
  },
  {
    title: 'I will listen however you like.',
    body: 'Speak out loud, or type it if that is easier. Either way I am listening — and you can switch whenever you want.',
  },
  {
    title: 'I will not make you repeat yourself.',
    body: 'Tell me once. Your doctor gets it in writing, so you do not have to explain it all again at the front desk.',
  },
  {
    title: 'I will not judge you.',
    body: 'Nothing you tell me goes anywhere except the summary your doctor reads. Not to your family. Not to anyone else.',
  },
]

export function MeetKai() {
  return (
    <section
      id="meet-kai"
      className="relative scroll-mt-28 border-y border-[var(--lx-line)] bg-[var(--lx-mint)] px-5 py-20 sm:px-8 md:py-28 lg:px-16"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-12 lg:grid-cols-[0.8fr_1fr] lg:gap-16">
          <Reveal className="flex justify-center lg:justify-start">
            <div className="lx-breathe">
              <Kai size="xl" state="waving" interactive />
            </div>
          </Reveal>

          <div>
            <Reveal>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--lx-ink)]">
                Meet Kai
              </p>
              <h2 className="lx-display mt-4 text-[clamp(1.9rem,4.6vw,3rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-[var(--lx-ink)]">
                Kai will wait as long as you need.
              </h2>
              <p className="mt-5 max-w-xl text-lg leading-[1.8] text-[var(--lx-muted)]">
                Kai is the one who sits with you before the doctor comes in. Not a form. Not a
                phone tree. Someone who speaks the way you do.
              </p>
            </Reveal>

            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {promises.map((promise, i) => (
                <Reveal key={promise.title} delay={i * 0.07}>
                  <h3 className="lx-display text-lg font-semibold text-[var(--lx-ink)]">
                    {promise.title}
                  </h3>
                  <p className="mt-2 leading-[1.75] text-[var(--lx-muted)]">{promise.body}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>

        {/* What Kai is NOT — say the limits out loud, on the page. */}
        <Reveal className="mt-16">
          <div className="rounded-[24px] border border-[var(--lx-line)] bg-white p-6 sm:p-9">
            <h3 className="lx-display text-xl font-semibold text-[var(--lx-ink)] sm:text-2xl">
              And here is what Kai is not.
            </h3>
            <p className="mt-4 max-w-3xl text-lg leading-[1.8] text-[var(--lx-body)]">
              Kai is not a doctor. Kai will not diagnose you, will not prescribe anything, and
              will not decide a single thing about your care — your doctor does all of that. Kai
              only helps you say what you came to say.
            </p>
            <p className="mt-4 max-w-3xl leading-[1.8] text-[var(--lx-muted)]">
              If you are in danger right now, or the pain is severe, do not wait for an
              appointment.{' '}
              <a
                href="/emergency"
                className="lx-focus font-semibold text-[var(--lx-ink)] underline underline-offset-4"
              >
                Get emergency help
              </a>{' '}
              or call your local emergency number.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
