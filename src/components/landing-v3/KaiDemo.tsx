'use client'

/* ============================================================================
   THE BILINGUAL LEDGER — the hero artifact (DESIGN.md §6)

   One paper document, split by a vertical hairline into the two halves of the
   product: the conversation in the patient's own script on one side, and the
   English intake summary committing itself field by field on the other. Both
   panes are visible the whole time — the translation is not a reveal, it is
   the document's structure.

   Pick العربية and the patient pane mirrors: right-aligned text, the caret
   advancing leftward, the pane labels flipped — while the clinician pane
   stays pinned LTR, because the deliverable is an English clinical note.
   That snap between directions across one hairline IS the pitch.

   Reduced motion / SSR: the ledger renders as the finished document — full
   conversation, every field committed, SUMMARY READY — and the tabs still
   swap languages instantly. The theatre is optional; the document is not.
   ========================================================================== */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence, useInView, useReducedMotion } from 'framer-motion'
import { KaiDot } from './ChatMock'

type Turn = { who: 'kai' | 'patient'; text: string }

type Script = {
  code: string
  native: string
  rtl?: boolean
  /* What the doctor's summary says the patient was speaking. */
  spoken: string
  /* Chrome-level "Kai is listening" in the patient's language. Reviewed
     strings — never machine-translate replacements. */
  listening: string
  turns: Turn[]
}

/* Five languages, chosen to show the range that matters: Latin, Arabic (RTL),
   Devanagari, Han, and Latin-with-diacritics. If the fonts break, they break
   here, in the hero, where we would see it. The turns are reviewed
   translations — do not alter them in a restyle. */
const SCRIPTS: Script[] = [
  {
    code: 'es',
    native: 'Español',
    spoken: 'Spanish (es-ES)',
    listening: 'Kai está escuchando',
    turns: [
      { who: 'kai', text: 'Hola, soy Kai. Cuéntame qué te duele, con tus propias palabras.' },
      { who: 'patient', text: 'Me duele el pecho cuando subo las escaleras.' },
      { who: 'kai', text: '¿Se te quita cuando descansas?' },
      { who: 'patient', text: 'Sí, después de unos minutos. Empezó hace tres días.' },
    ],
  },
  {
    code: 'ar',
    native: 'العربية',
    rtl: true,
    spoken: 'Arabic (ar-SA)',
    listening: 'كاي يستمع',
    turns: [
      { who: 'kai', text: 'مرحبًا، أنا كاي. أخبرني بما يؤلمك، بكلماتك أنت.' },
      { who: 'patient', text: 'أشعر بألم في صدري عندما أصعد الدرج.' },
      { who: 'kai', text: 'هل يزول الألم عندما ترتاح؟' },
      { who: 'patient', text: 'نعم، بعد بضع دقائق. بدأ قبل ثلاثة أيام.' },
    ],
  },
  {
    code: 'hi',
    native: 'हिन्दी',
    spoken: 'Hindi (hi-IN)',
    listening: 'काई सुन रहा है',
    turns: [
      { who: 'kai', text: 'नमस्ते, मैं काई हूँ। अपने शब्दों में बताइए कि क्या दर्द हो रहा है।' },
      { who: 'patient', text: 'सीढ़ियाँ चढ़ते समय मेरे सीने में दर्द होता है।' },
      { who: 'kai', text: 'क्या आराम करने पर यह ठीक हो जाता है?' },
      { who: 'patient', text: 'हाँ, कुछ मिनटों के बाद। तीन दिन पहले शुरू हुआ था।' },
    ],
  },
  {
    code: 'zh',
    native: '中文',
    spoken: 'Mandarin (zh-CN)',
    listening: 'Kai 正在倾听',
    turns: [
      { who: 'kai', text: '你好，我是 Kai。请用你自己的话告诉我哪里不舒服。' },
      { who: 'patient', text: '我上楼梯的时候胸口会痛。' },
      { who: 'kai', text: '休息之后会缓解吗？' },
      { who: 'patient', text: '会的，过几分钟就好了。三天前开始的。' },
    ],
  },
  {
    code: 'vi',
    native: 'Tiếng Việt',
    spoken: 'Vietnamese (vi-VN)',
    listening: 'Kai đang lắng nghe',
    turns: [
      { who: 'kai', text: 'Chào bạn, tôi là Kai. Hãy kể bằng lời của bạn xem bạn đau ở đâu.' },
      { who: 'patient', text: 'Tôi bị đau ngực khi leo cầu thang.' },
      { who: 'kai', text: 'Cơn đau có đỡ khi bạn nghỉ ngơi không?' },
      { who: 'patient', text: 'Có, sau vài phút. Nó bắt đầu ba ngày trước.' },
    ],
  },
]

/* The output. Identical whichever language went in — which IS the product.
   The fifth row ('Patient spoke') is appended per language at render. */
const SUMMARY: { k: string; v: string }[] = [
  { k: 'Chief complaint', v: 'Chest pain on exertion' },
  { k: 'Onset', v: '3 days ago' },
  { k: 'Trigger', v: 'Climbing stairs' },
  { k: 'Relieved by', v: 'Rest, within minutes' },
]

const ROW_TOTAL = SUMMARY.length + 1

/* Timeline, in ms. Typing is per-character and deliberately uneven: CJK and
   Devanagari carry far more meaning per glyph, so each gets more time or the
   line flashes past. All deterministic — no Date.now / Math.random anywhere. */
const LEAD_IN = 400
const KAI_READ = 650 /* pause before a Kai turn appears */
const KAI_PER_CHAR = 8 /* reading time credited per character of a Kai turn */
const PATIENT_PAUSE = 380
const TURN_GAP = 320
const COMMIT_LEAD = 240 /* breath between the last reply and the first commit */
const ROW_STEP = 340 /* per committed summary row */
const READY_HOLD = 3000 /* SUMMARY READY dwell before the next language */

type Phase = {
  turn: number /* turns with index < turn are complete; index == turn may be typing */
  typed: number /* characters typed of the current patient turn */
  committed: number /* clinician rows committed, 0..ROW_TOTAL */
  done: boolean /* SUMMARY READY */
}

/* SSR / pre-hydration frame: the COMPOSED COMPLETE document. The server must
   never emit an empty ledger — everything the timeline would reveal is
   already there, and the timeline (if it runs at all) resets first. */
const COMPOSED: Phase = {
  turn: SCRIPTS[0].turns.length,
  typed: 0,
  committed: ROW_TOTAL,
  done: true,
}

const EASE = [0.22, 1, 0.36, 1] as const

/* The green-fill tick beside SUMMARY READY. Fill-role green only — never a
   text color. */
function ReadyTick() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" className="shrink-0">
      <path
        d="M2.5 6.5 5 9l4.5-5.5"
        fill="none"
        stroke="var(--lx-green-fill)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function KaiDemo() {
  const reduced = useReducedMotion()
  const [active, setActive] = useState(0)
  const [phase, setPhase] = useState<Phase>(COMPOSED)
  /* False until the timeline has actually started once. While false, framer
     entrances stay disabled so the hydration frame matches the server's
     composed document instead of flashing everything in from opacity 0. */
  const [started, setStarted] = useState(false)
  /* Auto-advance stops permanently the moment a human touches the tabs. If
     someone is driving it, the thing must not yank the wheel back. */
  const [driven, setDriven] = useState(false)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  /* GATE THE WHOLE TIMELINE ON VISIBILITY. Offscreen: stop dead, hold the
     frame. Without this, the run loop keeps scheduling timeouts and
     re-rendering forever while the hero is a thousand pixels off the top of
     the screen — a permanent background CPU burn on a page we promise works
     on a five-year-old phone. */
  const root = useRef<HTMLDivElement>(null)
  const onScreen = useInView(root, { amount: 0.15 })

  const script = SCRIPTS[active]
  const rows = [...SUMMARY, { k: 'Patient spoke', v: script.spoken }]

  const clear = useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }, [])

  const after = useCallback((ms: number, fn: () => void) => {
    timers.current.push(setTimeout(fn, ms))
  }, [])

  const perChar = script.code === 'zh' ? 80 : script.code === 'hi' ? 40 : 24

  /* The run loop. Rebuilt from scratch whenever the language changes, which
     is what makes the tabs feel instant rather than queued behind the old
     timeline. Every timeout lands in the ref array; `clear` runs on every
     effect re-run and on unmount. */
  useEffect(() => {
    clear()

    /* Under reduced motion nothing runs at all — the render derives the full
       conversation and every committed row statically, so the demonstration
       keeps its point (the input AND the output); only the theatre goes. */
    if (reduced) return

    /* Offscreen: hold the current frame. Re-entering restarts this language. */
    if (!onScreen) return

    /* The reset rides the timer queue like every other beat — no synchronous
       setState in the effect body, and it clears with the rest on re-run. */
    after(0, () => {
      setStarted(true)
      setPhase({ turn: 0, typed: 0, committed: 0, done: false })
    })

    let t = LEAD_IN
    script.turns.forEach((turn, i) => {
      if (turn.who === 'kai') {
        /* Kai's turns arrive whole — a fade and rise, not typing. */
        after(t, () => setPhase((p) => ({ ...p, turn: i + 1, typed: 0 })))
        t += KAI_READ + turn.text.length * KAI_PER_CHAR
        return
      }
      /* Patient turns type themselves out, character by character. */
      after(t, () => setPhase((p) => ({ ...p, turn: i, typed: 0 })))
      t += PATIENT_PAUSE
      for (let c = 1; c <= turn.text.length; c++) {
        after(t + c * perChar, () => setPhase((p) => ({ ...p, turn: i, typed: c })))
      }
      t += turn.text.length * perChar
      after(t, () => setPhase((p) => ({ ...p, turn: i + 1, typed: 0 })))
      t += TURN_GAP
    })

    /* The hand-off: English fields commit one by one on the clinician pane. */
    t += COMMIT_LEAD
    for (let r = 1; r <= ROW_TOTAL; r++) {
      after(t, () => setPhase((p) => ({ ...p, committed: r })))
      t += ROW_STEP
    }

    after(t, () => setPhase((p) => ({ ...p, done: true })))
    t += READY_HOLD

    if (!driven) {
      after(t, () => setActive((a) => (a + 1) % SCRIPTS.length))
    }

    return clear
  }, [active, driven, reduced, onScreen, script, perChar, clear, after])

  const pick = (i: number) => {
    setDriven(true)
    setActive(i)
  }

  /* Derived conversation frame. The composed initial phase already yields the
     complete exchange, but reduced motion gets its own branch so a stale
     phase can never blank the artifact for a visitor whose timeline will
     never run. */
  const visible = useMemo(() => {
    if (reduced) {
      return script.turns.map((turn, i) => ({ ...turn, i, shown: turn.text, typing: false }))
    }
    return (
      script.turns
        .slice(0, Math.min(phase.turn + 1, script.turns.length))
        .map((turn, i) => {
          const isTyping = i === phase.turn && turn.who === 'patient'
          return {
            ...turn,
            i,
            shown: isTyping ? turn.text.slice(0, phase.typed) : turn.text,
            typing: isTyping,
          }
        })
        /* A patient bubble with nothing typed in it yet reads as a rendering
           fault, not anticipation. Wait for the first character. */
        .filter((turn) => !(turn.who === 'patient' && turn.shown.length === 0))
    )
  }, [script, phase, reduced])

  const committedCount = reduced ? ROW_TOTAL : phase.committed
  const done = reduced ? true : phase.done

  /* Two speakers, two materials — the product's own chat grammar. Kai has no
     bubble: the mark plus plain words on the paper. Only the patient gets the
     filled ink bubble, and its tail is a LOGICAL corner (rounded-ee), so the
     whole exchange genuinely mirrors when the pane is dir="rtl". */
  const conversation = (
    <div className="space-y-3">
      {visible.map((turn) => (
        <motion.div
          key={`${script.code}-${turn.i}`}
          initial={reduced || !started ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          className={turn.who === 'kai' ? 'flex items-start gap-2.5' : 'flex'}
        >
          {turn.who === 'kai' && <KaiDot size={22} />}
          <p
            lang={script.code}
            className={`lx-native text-[0.875rem] leading-[1.55] ${
              turn.who === 'patient'
                ? 'ms-auto w-fit max-w-[86%] rounded-[10px] rounded-ee-[3px] bg-[var(--lx-ink)] px-3.5 py-2.5 text-white'
                : 'max-w-[88%] pt-0.5 text-[var(--lx-body)]'
            }`}
          >
            {turn.shown}
            {turn.typing && (
              <span
                className="ms-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] bg-current"
                aria-hidden="true"
                style={{ animation: 'lx-caret 1s step-end infinite' }}
              />
            )}
          </p>
        </motion.div>
      ))}
    </div>
  )

  return (
    <div ref={root} className="w-full">
      {/* Language tabs — chart tabs, not pills. This is the interaction, and
          it is the whole pitch: pick العربية and watch the ledger mirror. */}
      <div
        role="group"
        aria-label="Choose a language for the intake demonstration"
        className="mb-3 flex flex-wrap gap-1.5"
      >
        {SCRIPTS.map((s, i) => (
          <button
            key={s.code}
            type="button"
            lang={s.code}
            onClick={() => pick(i)}
            aria-pressed={i === active}
            className={`lx-focus lx-native inline-flex min-h-11 items-center rounded-[4px] border px-3 text-sm transition-colors duration-150 ${
              i === active
                ? 'border-transparent bg-[var(--lx-ink)] text-white'
                : 'border-[var(--lx-hairline)] bg-[var(--lx-paper)] text-[var(--lx-body)] hover:border-[var(--lx-green-ink)]'
            }`}
          >
            {s.native}
          </button>
        ))}
      </div>

      {/* THE ARTIFACT — 14px radius, registration marks, the site's one
          ambient shadow. No overflow-hidden on the frame (it would clip the
          regmark ticks); the chrome and the pane grid round their own
          corners. Direction NEVER sits on this frame. */}
      <div className="lx-artifact lx-regmark relative">
        {/* Chart header strip. Direction sits here (the chrome mirrors for
            Arabic) and inside each pane — never on the frame. */}
        <div
          dir={script.rtl ? 'rtl' : 'ltr'}
          className="lx-artifact-chrome flex items-center justify-between gap-3 rounded-t-[13px] border-b border-[var(--lx-hairline)] px-4 py-2.5"
        >
          <span className="flex min-w-0 items-center gap-2">
            <KaiDot size={20} />
            <span className="lx-label text-[0.6rem] text-[var(--lx-ink)]">Keiro · Intake</span>
          </span>

          <span className="flex items-center gap-2.5">
            {script.rtl && (
              <span className="lx-label rounded-[4px] border border-[var(--lx-hairline)] px-1.5 py-0.5 text-[0.55rem] text-[var(--lx-green-ink)]">
                RTL
              </span>
            )}
            {/* Two fixed lines so the chrome never changes height: the EN
                status on top, the native equivalent beneath (the language
                name once the summary is ready). */}
            <span className="flex flex-col items-end gap-0.5">
              <span className="flex items-center gap-1.5">
                <span className="lx-label text-[0.6rem] text-[var(--lx-muted)]">
                  {done ? 'Summary ready' : 'Kai · listening'}
                </span>
                {done ? (
                  <ReadyTick />
                ) : (
                  <span className="lx-listen" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </span>
                )}
              </span>
              <span
                lang={script.code}
                dir={script.rtl ? 'rtl' : undefined}
                className="lx-native text-[0.7rem] leading-none text-[var(--lx-muted)]"
              >
                {done ? script.native : script.listening}
              </span>
            </span>
          </span>
        </div>

        {/* The two panes. Stacked on a phone (patient above, clinician
            below); side by side from sm, split by the vertical hairline
            (border-inline-start on the clinician pane). The patient pane's
            conversation area is fixed-height and the clinician rows are
            always mounted, so nothing reflows as content arrives. */}
        <div className="grid overflow-hidden rounded-b-[13px] sm:grid-cols-[minmax(0,11fr)_minmax(0,9fr)]">
          {/* PATIENT PANE — the only surface allowed the graph-paper grid.
              Each keyed panel owns its own dir, so an outgoing Spanish panel
              never spends its crossfade rendered right-to-left. */}
          <div className="lx-sheet-grid min-w-0">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={script.code}
                dir={script.rtl ? 'rtl' : 'ltr'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduced ? 0 : 0.22 }}
              >
                <div className="flex items-baseline gap-1.5 border-b border-[var(--lx-hairline)] px-4 pb-2 pt-3">
                  <span className="lx-label text-[0.6rem] text-[var(--lx-muted)]">Patient ·</span>
                  <span lang={script.code} className="lx-native text-[0.7rem] text-[var(--lx-ink)]">
                    {script.native}
                  </span>
                </div>
                <div className="h-[310px] overflow-hidden p-4">{conversation}</div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* CLINICIAN PANE — pinned dir="ltr" always: whatever direction the
              conversation ran, the deliverable is an English clinical note,
              and the snap from a mirrored exchange back to a left-to-right
              document IS the product, visible. */}
          <div
            dir="ltr"
            className="min-w-0 border-t border-[var(--lx-hairline)] sm:border-s sm:border-t-0"
          >
            <div className="lx-cc-edge px-4 pb-2 pt-3">
              <span className="lx-label text-[0.6rem] text-[var(--lx-muted)]">
                Clinician · English
              </span>
            </div>

            {/* Every row is always mounted (the pane never changes height);
                committing = the row surfacing while the wash sweeps in behind
                the value. data-swept's CSS resting state is swept, so SSR and
                reduced motion get the finished ledger for free. */}
            <dl className="divide-y divide-[var(--lx-hairline)] px-4 pb-3 pt-0.5">
              {rows.map((row, i) => {
                const shown = committedCount > i
                return (
                  <motion.div
                    key={row.k}
                    initial={false}
                    animate={{ opacity: shown ? 1 : 0, y: shown ? 0 : 6 }}
                    transition={{ duration: 0.32, ease: EASE }}
                    className="py-2.5"
                  >
                    <dt className="lx-label text-[0.6rem] text-[var(--lx-muted)]">{row.k}</dt>
                    {/* `isolate` gives the wash-sweep's z-index:-1 pseudo a
                        local stacking context, so the highlight paints above
                        the card ground instead of vanishing beneath it. */}
                    <dd className="isolate mt-1">
                      <span
                        data-swept={shown ? 'true' : 'false'}
                        className={`lx-wash-sweep lx-title text-[0.85rem] ${
                          row.k === 'Patient spoke'
                            ? 'text-[var(--lx-green-ink)]'
                            : 'text-[var(--lx-ink)]'
                        }`}
                      >
                        {row.v}
                      </span>
                    </dd>
                  </motion.div>
                )
              })}
            </dl>
          </div>
        </div>
      </div>

      {/* Figure caption — the chart detail that makes it a specimen. */}
      <p aria-hidden="true" className="lx-label mt-3 text-[0.625rem] text-[var(--lx-muted)]">
        Fig. 1 — One intake, any script
      </p>
    </div>
  )
}
