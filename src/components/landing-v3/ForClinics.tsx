'use client'

/* ============================ FOR CLINICS ==================================
   Deliberately small, late, and visually quarantined from the patient narrative
   above it. B2B language ("throughput", "deployment") is exactly what makes a
   care product feel like a vendor, so it is kept to three sentences and one link.
   ========================================================================== */

import { Reveal } from './Reveal'

export function ForClinics() {
  return (
    <section id="for-clinics" className="relative scroll-mt-28 px-5 py-20 sm:px-8 md:py-24 lg:px-16">
      <Reveal className="mx-auto max-w-4xl">
        <div className="flex flex-col gap-6 rounded-[24px] border border-[var(--lx-line)] bg-white p-6 sm:p-9 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--lx-muted)]">
              For clinics
            </p>
            <h2 className="lx-display mt-3 text-xl font-semibold text-[var(--lx-ink)] sm:text-2xl">
              Your patient arrives already understood.
            </h2>
            <p className="mt-3 leading-[1.8] text-[var(--lx-muted)]">
              Keiro hands your clinicians a clear English summary before the visit starts — no
              interpreter scheduling, no lost history. Kai never diagnoses or triages.
            </p>
          </div>
          <a
            href="mailto:clinics@keiro.app?subject=Keiro%20for%20clinics"
            className="lx-focus inline-flex min-h-12 shrink-0 items-center justify-center rounded-full border border-[var(--lx-ink)] px-6 font-semibold text-[var(--lx-ink)] transition-colors duration-200 hover:bg-[var(--lx-mint)]"
          >
            Talk to us
          </a>
        </div>
      </Reveal>
    </section>
  )
}
