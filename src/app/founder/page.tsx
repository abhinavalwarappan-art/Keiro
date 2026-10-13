import type { Metadata } from 'next'
import Link from 'next/link'

import { SiteShell } from '@/components/landing-v3/SiteShell'
import { PageHero } from '@/components/landing-v3/PageBits'
import { Band } from '@/components/landing-v3/Sections'

export const metadata: Metadata = {
  title: 'Meet the founder',
  description:
    'Meet Abhinav Alwarappan, the student and developer who built Keiro after seeing how a language barrier could make a simple healthcare conversation difficult.',
  openGraph: {
    title: 'Meet Abhinav Alwarappan, founder of Keiro',
    description:
      'The personal story behind Keiro and its focus on helping patients communicate across language barriers.',
  },
}

function SectionHeading({ number, children }: { number: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-4 border-t border-[var(--band-line)] pt-6 sm:grid-cols-[5rem_1fr] sm:gap-8">
      <p className="lx-mono text-xs font-semibold tracking-[0.12em] text-[var(--lx-green-accent)]">
        {number}
      </p>
      <h2 className="lx-heading max-w-xl text-balance text-[clamp(1.65rem,3.4vw,2.35rem)] text-[var(--band-ink)]">
        {children}
      </h2>
    </div>
  )
}

function LetterCopy({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-7 space-y-6 text-[1.0625rem] leading-[1.9] text-[var(--band-muted)] sm:ml-[7rem] sm:text-lg">
      {children}
    </div>
  )
}

export default function FounderPage() {
  return (
    <SiteShell flow="mission">
      <PageHero
        flow
        eyebrow="A note from Abhinav"
        title="Meet the founder"
        lede="I’m Abhinav Alwarappan, an 18-year-old student and developer from Adelaide, Australia, now living in Flower Mound, Texas. I built Keiro because I saw how quickly a language barrier can make a simple, important conversation difficult."
        footer={
          <p className="lx-mono text-xs font-semibold uppercase tracking-[0.1em] text-[var(--lx-muted)]">
            Abhinav Alwarappan · Flower Mound, Texas
          </p>
        }
      />

      <Band palette="cream" className="border-t-0">
        <article className="mx-auto max-w-[48rem]">
          <SectionHeading number="01">Finding room to build</SectionHeading>
          <LetterCopy>
            <p>
              I grew up in Adelaide and attended Pembroke School. After visiting the United States,
              I became interested in what life there might be like and encouraged my parents to
              consider moving. In December 2024, my family relocated to the Dallas area.
            </p>
            <p>
              Starting at a large American public high school halfway through sophomore year took
              some adjustment. I had to learn a different school system, make new friends, and find
              my place. Over time, that change also gave me more confidence to follow the things I
              was curious about: computer science, products, and entrepreneurship. I now attend
              Flower Mound High School, and Keiro has become one of my main independent projects.
            </p>
          </LetterCopy>
        </article>
      </Band>

      <Band palette="mint" rails>
        <article className="mx-auto max-w-[48rem]">
          <SectionHeading number="02">The experience that started Keiro</SectionHeading>
          <LetterCopy>
            <p>
              My grandmother primarily speaks Tamil and has limited English. During a family trip
              through a New York airport, she needed wheelchair assistance. My younger brother and
              I tried to translate while she spoke with the person helping her.
            </p>
            <p>
              Nothing dramatic happened. It was simply harder than it should have been for her to
              explain what she needed. I kept thinking about that afterward: a person can know
              exactly what they need and still struggle to communicate it because the person in
              front of them does not speak their language.
            </p>
            <p className="lx-serif text-[clamp(1.4rem,3vw,1.9rem)] leading-[1.55] text-[var(--band-ink)]">
              In healthcare, where the details of what someone feels matter, that gap becomes even
              more important.
            </p>
            <p>
              That experience stayed with me and eventually became the starting point for Keiro.
              The idea was not to make decisions for a patient or a doctor. It was to help someone
              say what they already know about their own experience, in the language that comes
              naturally to them.
            </p>
          </LetterCopy>
        </article>
      </Band>

      <Band palette="cream">
        <article className="mx-auto max-w-[48rem]">
          <SectionHeading number="03">From an idea to a working product</SectionHeading>
          <LetterCopy>
            <p>
              I began developing Keiro as an independent software project. A lot of the learning
              happened through the work itself: building an early version, finding what did not
              work, and going back to improve it.
            </p>
            <p>
              Today, Keiro supports 45 languages. A patient can speak or type in the language they
              prefer. Kai, the assistant inside Keiro, can ask a few simple follow-up questions and
              organize the answers into a clear English summary for a healthcare provider. Keiro
              does not diagnose or recommend treatment. Its job is communication.
            </p>
            <p>
              Turning the idea into something usable has meant working across the whole product:
              the interface, speech and language support, the systems behind it, accessibility,
              privacy, mobile behavior, and the less visible work of testing and reliability. The
              interesting part for me is not the length of that list. It is learning how all of
              those pieces have to come together before software can be genuinely useful to
              someone.
            </p>
          </LetterCopy>
        </article>
      </Band>

      <Band palette="deep" flow="glow">
        <article className="mx-auto max-w-[48rem]">
          <SectionHeading number="04">Why it matters</SectionHeading>
          <LetterCopy>
            <p>
              Useful technology should make difficult things easier for ordinary people. For
              patients who face a language barrier, even describing when a symptom started or how
              it has changed can become stressful.
            </p>
            <p>
              Keiro is not a replacement for a doctor or a professional medical interpreter. It is
              a way to help patients gather and communicate information they might otherwise have
              trouble explaining. I want it to feel accessible and understandable, especially for
              someone who is already nervous or uncomfortable with technology.
            </p>
          </LetterCopy>
        </article>
      </Band>

      <Band palette="cream">
        <article className="mx-auto max-w-[48rem]">
          <SectionHeading number="05">What comes next</SectionHeading>
          <LetterCopy>
            <p>
              The next step is to work with clinics, listen carefully to patients and healthcare
              staff, and improve Keiro through real feedback. I expect that process to uncover
              things I have not considered yet. That is the point of doing it.
            </p>
            <p>
              My hope is straightforward: that Keiro can help more people walk into a healthcare
              conversation with a clearer way to explain what they are feeling. There is still a
              lot to learn and build, and I am looking forward to the work.
            </p>
            <p className="pt-2 font-semibold text-[var(--band-ink)]">Abhinav</p>
          </LetterCopy>
        </article>
      </Band>

      <section className="lx-band lx-band-mint border-t border-[var(--band-line)] px-5 py-12 sm:px-8 sm:py-16 lg:px-16">
        <div className="mx-auto flex max-w-[48rem] flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="lx-heading text-2xl text-[var(--band-ink)]">See what Keiro can do.</h2>
            <p className="mt-2 leading-[1.7] text-[var(--band-muted)]">
              Start a conversation with Kai, or get in touch with a question.
            </p>
          </div>
          <div className="flex flex-col gap-3 min-[360px]:flex-row sm:shrink-0">
            <Link
              href="/onboarding?fresh=1"
              className="lx-focus lx-btn lx-btn-primary inline-flex min-h-[52px] items-center justify-center rounded-[14px] px-6 font-semibold"
            >
              Try Keiro
            </Link>
            <Link
              href="/contact"
              className="lx-focus lx-btn lx-btn-ghost inline-flex min-h-[52px] items-center justify-center rounded-[14px] px-6 font-semibold"
            >
              Get in touch
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  )
}
