/* Phone mockups for the flow section: language picker, Kai chat, doctor report,
   plus the device frame (rounded-3xl, border, shadow-2xl, top notch bar). The
   per-step rotate/scale transition is owned by Flow.tsx (keyed motion wrapper),
   so this frame is purely presentational. */

import { KaiMiniIcon } from './KaiRobot'

const ACCENT = '#00c896'

const LANGUAGES: [string, string][] = [
  ['🇪🇸', 'Spanish'],
  ['🇨🇳', 'Mandarin'],
  ['🇮🇳', 'Hindi'],
  ['🇸🇦', 'Arabic'],
  ['🇻🇳', 'Vietnamese'],
  ['🇵🇭', 'Tagalog'],
]

const REPORT_FIELDS: [string, string][] = [
  ['Chief complaint', 'Chest tightness, exertional'],
  ['Duration', 'Onset this morning'],
  ['Severity', 'Moderate (patient reported)'],
  ["Patient's words", '"It feels heavy when I move."'],
  ['Flagged symptoms', 'Exertional component — cardiac rule-out recommended'],
  ['Follow-up questions', 'Shortness of breath, radiation to arm/jaw, prior cardiac history'],
  ['Language', 'Mandarin (中文) → English'],
]

const SELECTED_LANGUAGE = 'Mandarin'

function LanguageSelectionMockup() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--kx-accent)]">Choose your language</p>
        <h4 className="mt-2 font-display text-2xl text-white">What feels easiest?</h4>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {LANGUAGES.map(([flag, name]) => {
          const selected = name === SELECTED_LANGUAGE
          return (
            <div
              key={name}
              className="rounded-[12px] border p-3 text-sm"
              style={{
                borderColor: selected ? ACCENT : 'rgba(255,255,255,0.08)',
                background: selected ? 'rgba(0,200,150,0.12)' : 'rgba(255,255,255,0.04)',
                color: selected ? 'white' : 'rgba(255,255,255,0.7)',
              }}
            >
              <span className="mr-2">{flag}</span>
              {name}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ChatMockup() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[22px] bg-[var(--kx-surface)]">
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
        <KaiMiniIcon />
        <div>
          <div className="text-sm font-semibold text-white">Kai</div>
          <div className="flex items-center gap-1.5 text-[11px] text-white/55">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--kx-accent)]" />
            Listening...
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-end gap-3 px-3 py-4">
        <div className="ml-auto max-w-[82%] rounded-[18px_18px_4px_18px] bg-[#2a2a2a] px-4 py-3 text-sm leading-relaxed text-white">
          我胸口很紧，走路时更明显。
          <div className="mt-1 text-right text-[10px] text-white/40">2:14 PM</div>
        </div>

        <div className="flex max-w-[90%] items-end gap-2">
          <KaiMiniIcon />
          <div className="rounded-[18px_18px_18px_4px] bg-[var(--kx-accent)] px-4 py-3 text-sm leading-relaxed text-black">
            I&apos;m hearing chest tightness that gets worse with movement. How long has this been happening?
          </div>
        </div>

        <div className="ml-auto max-w-[82%] rounded-[18px_18px_4px_18px] bg-[#2a2a2a] px-4 py-3 text-sm leading-relaxed text-white">
          从今天早上开始的。
          <div className="mt-1 text-right text-[10px] text-white/40">2:15 PM</div>
        </div>

        <div className="flex max-w-[90%] items-end gap-2">
          <KaiMiniIcon />
          <div className="rounded-[18px_18px_18px_4px] bg-[var(--kx-accent)] px-4 py-3 text-sm leading-relaxed text-black">
            Got it. Any shortness of breath or pain radiating to your arm or jaw?
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-2 rounded-full bg-white/[0.08] px-3 py-2 text-sm text-white/40">
          <span aria-hidden>🎙</span>
          <span className="flex-1">Speak or type...</span>
          <button
            type="button"
            aria-label="Send message"
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-[var(--kx-accent)] text-black"
          >
            →
          </button>
        </div>
      </div>
    </div>
  )
}

function ReportMockup() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[18px] bg-white text-black">
      <div className="flex items-start justify-between border-b border-[#eeeeee] px-5 py-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#00a77d]">Keiro intake summary</p>
          <h4 className="mt-1 text-lg font-semibold">Medical intake form</h4>
        </div>
        <p className="text-xs text-black/45">June 12, 2025</p>
      </div>

      <div className="flex-1 overflow-hidden px-5">
        {REPORT_FIELDS.map(([label, value]) => (
          <div key={label} className="border-b border-[#eeeeee] py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-black/45">{label}</p>
            <p className="mt-1 text-sm leading-relaxed text-black">{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-[var(--kx-accent)] px-5 py-3 text-center text-xs font-semibold text-black">
        Prepared by Kai · Keiro Health
      </div>
    </div>
  )
}

const VALID_STEPS = new Set([0, 1, 2])

export function PhoneFrame({ step }: { step: number }) {
  const isReport = step === 2

  if (!VALID_STEPS.has(step)) {
    return null
  }

  return (
    <div className="mx-auto w-full max-w-[320px] rounded-3xl border border-white/10 bg-[var(--kx-surface-2)]/90 p-2.5 shadow-2xl shadow-black/60 ring-1 ring-white/5 backdrop-blur-sm">
      {/* notch bar */}
      <div className="relative mx-auto mb-1.5 flex h-5 items-center justify-center">
        <div className="h-1.5 w-14 rounded-full bg-white/15" />
        <span className="absolute right-6 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-white/10" />
      </div>

      <div
        className="min-h-[460px] rounded-[24px] border p-3.5"
        style={{
          background: isReport ? '#ffffff' : 'rgba(0,0,0,0.55)',
          borderColor: isReport ? '#eeeeee' : 'rgba(255,255,255,0.05)',
        }}
      >
        <div className="h-[420px]">
          {step === 0 && <LanguageSelectionMockup />}
          {step === 1 && <ChatMockup />}
          {step === 2 && <ReportMockup />}
        </div>
      </div>
    </div>
  )
}