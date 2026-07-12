import type { Metadata } from 'next'
import { SiteShell } from '@/components/landing-v3/SiteShell'
import { PageHero, Section, P, CtaBand, A } from '@/components/landing-v3/PageBits'
import { ContactForm } from '@/components/landing-v3/ContactForm'
import { Reveal } from '@/components/landing-v3/Reveal'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Whether you are a patient, a clinic, a journalist, an investor or a judge — tell us who you are and we will write back. A real person reads these.',
  openGraph: {
    title: 'Contact Keiro',
    description: 'Tell us who you are and we will write back. A real person reads these.',
  },
}

/* Audience router. Each block says what this person probably wants and where it
   is, so the single form below is the last resort rather than the first thing
   you hit. (Serve Robotics' /contact does the same job with five inboxes; we
   have one, so the routing has to happen in the copy.) */
const AUDIENCES = [
  {
    who: 'If you are a patient',
    body: 'You do not need to contact anyone to use Keiro. It is free, there is no account, and you can start right now. If something broke, or Kai said something that worried you, we would genuinely like to hear it — use the form below.',
  },
  {
    who: 'If you are a clinic or hospital',
    body: 'Start with the for-clinics page — it explains what your clinicians would actually receive, and it is honest about the limits, including the fact that Keiro has not been clinically validated.',
    href: '/for-clinics',
    linkLabel: 'Read: for clinics',
  },
  {
    who: 'If you are a journalist',
    body: 'The fastest way to understand Keiro is to use it — it takes five minutes and needs no account. Our mission page has the background and the numbers behind why it exists.',
    href: '/about',
    linkLabel: 'Read: our mission',
  },
  {
    who: 'If you are an investor',
    body: 'Please read privacy & safety before anything else, particularly the section on what we have not done. We would rather you find the gaps on our own page than in diligence.',
    href: '/privacy-safety',
    linkLabel: 'Read: privacy & safety',
  },
  {
    who: 'If you are judging this project',
    body: 'The five-minute version: open Keiro, choose a language you do not speak, and talk to Kai. That is the whole product. How it works explains the technology in plain words, and privacy & safety is where we are candid about the limits.',
    href: '/how-it-works',
    linkLabel: 'Read: how it works',
  },
]

export default function ContactPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Contact"
        title="Tell us who you are, and we will write back."
        lede="A real person reads these — there is no ticketing system and no autoresponder. Start by finding yourself below; it will usually save you an email."
      />

      <Section title="Start here">
        <ul className="mt-2 grid gap-5 sm:grid-cols-2">
          {AUDIENCES.map((audience, i) => (
            <Reveal key={audience.who} delay={i * 0.06}>
              <li className="h-full rounded-[20px] border border-[var(--lx-line)] bg-white p-5 sm:p-6">
                <h3 className="lx-display text-lg font-semibold text-[var(--lx-ink)]">
                  {audience.who}
                </h3>
                <p className="mt-2 leading-[1.8] text-[var(--lx-muted)]">{audience.body}</p>
                {audience.href && (
                  <p className="mt-3">
                    <A href={audience.href}>{audience.linkLabel}</A>
                  </p>
                )}
              </li>
            </Reveal>
          ))}
        </ul>
      </Section>

      <Section title="Write to us" tinted id="form">
        <P>
          If none of that covered it, this reaches us directly. We usually reply within a few days.
        </P>
        <Reveal>
          <ContactForm />
        </Reveal>
      </Section>

      <Section title="If this is an emergency, do not use this form">
        <P>
          Nobody is watching this inbox around the clock, and we cannot help you quickly. If you are
          in danger right now, or the pain is severe, call your local emergency number.
        </P>
        <P>
          <A href="/emergency">Get emergency help</A>
        </P>
      </Section>

      <CtaBand />
    </SiteShell>
  )
}
