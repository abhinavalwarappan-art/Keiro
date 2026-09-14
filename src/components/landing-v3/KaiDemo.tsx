'use client'

/* ============================================================================
   THE HERO ARTIFACT

   Every Stripe product page opens on a piece of working-looking product UI — a
   checkout form assembling itself, an invoice drawer sliding open — rather than
   on a claim about the product. You understand what the thing does before you
   have read a word, and the fact that it MOVES is what makes it read as software
   rather than as a screenshot.

   This is Keiro's. It performs the entire product in about fifteen seconds: a
   patient describes chest pain in their own language, Kai asks the follow-up a
   nurse would ask, and the conversation resolves into the structured English
   summary the doctor actually reads. The language chips are live — pick one and
   the whole thing re-runs in it, right to left where that is correct.

   That last part is the pitch. Nothing we could write in a headline demonstrates
   "45 languages, and the follow-ups are in your language too" as well as letting
   someone click العربية and watch it happen.

   Reduced motion: the whole timeline collapses to its final frame. The chips
   still work, so the demonstration survives; only the theatre goes.
   ========================================================================== */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence, useInView, useReducedMotion } from 'framer-motion'
import { KaiDot } from './ChatMock'

type Turn = { who: 'kai' | 'patient'; text: string }

type Script = {
  code: string
  native: string
  flag: string
  rtl?: boolean
  /* What the doctor's summary says the patient was speaking. */
  spoken: string
  turns: Turn[]
}

/* Six languages, chosen to show the range that matters: Latin, Arabic (RTL),
   Devanagari, Han, and a Latin-with-diacritics. If the fonts break, they break
   here, in the hero, where we would see it. */
const SCRIPTS: Script[] = [
  {
    code: 'es',
    native: 'Español',
    flag: '🇪🇸',
    spoken: 'Spanish (es-ES)',
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
    flag: '🇸🇦',
    rtl: true,
    spoken: 'Arabic (ar-SA)',
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
    flag: '🇮🇳',
    spoken: 'Hindi (hi-IN)',
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
    flag: '🇨🇳',
    spoken: 'Mandarin (zh-CN)',
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
    flag: '🇻🇳',
    spoken: 'Vietnamese (vi-VN)',
    turns: [
      { who: 'kai', text: 'Chào bạn, tôi là Kai. Hãy kể bằng lời của bạn xem bạn đau ở đâu.' },
      { who: 'patient', text: 'Tôi bị đau ngực khi leo cầu thang.' },
      { who: 'kai', text: 'Cơn đau có đỡ khi bạn nghỉ ngơi không?' },
      { who: 'patient', text: 'Có, sau vài phút. Nó bắt đầu ba ngày trước.' },
    ],
  },
]
/* Five, not six. Six wrapped to a second row on desktop and left a single orphan
   chip sitting under the other five — the exact "three then one" that looks like
   a mistake rather than a layout. Five fit on one line, and they still cover
   Latin, Arabic (RTL), Devanagari, Han and Latin-with-diacritics. */

/* The output. Identical whichever language went in — which IS the product. */
const SUMMARY: { k: string; v: string }[] = [
  { k: 'Presenting complaint', v: 'Chest pain on exertion' },
  { k: 'Onset', v: '3 days ago' },
  { k: 'Trigger', v: 'Climbing stairs' },
  { k: 'Relieved by', v: 'Rest, within minutes' },
]

/* Timeline, in ms. Typing speed is per-character and deliberately uneven-looking
   (CJK and Devanagari carry far more meaning per glyph, so they get more time
   per character or they flash past). */
const KAI_READ = 900
const PATIENT_PAUSE = 500
const SUMMARY_DWELL = 3600

type Phase = { turn: number; typed: number; summary: boolean }

export function KaiDemo() {
  const reduced = useReducedMotion()
  const [active, setActive] = useState(0)
  const [phase, setPhase] = useState<Phase>({ turn: 0, typed: 0, summary: false })
  /* Auto-advance stops permanently the moment a human touches the chips. If
     someone is driving it, the thing must not yank the wheel back. */
  const [driven, setDriven] = useState(false)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  /* GATE THE WHOLE TIMELINE ON VISIBILITY.

     Without this, the run loop keeps scheduling timeouts and re-rendering forever
     while the hero is a thousand pixels off the top of the screen — a permanent
     background CPU burn on a page we promise works on a five-year-old phone.

     Worth knowing: stripe.com's own /payments hero ships exactly this bug. Its
     timeline self-recurses with no IntersectionObserver and runs offscreen
     indefinitely. Copying the good parts means noticing which parts are not. */
  const root = useRef<HTMLDivElement>(null)
  const onScreen = useInView(root, { amount: 0.15 })

  const script = SCRIPTS[active]

  const clear = useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }, [])

  const after = useCallback((ms: number, fn: () => void) => {
    timers.current.push(setTimeout(fn, ms))
  }, [])

  const perChar = script.code === 'zh' ? 90 : script.code === 'hi' ? 42 : 34

  /* The run loop. Rebuilt from scratch whenever the language changes, which is
     what makes the chips feel instant rather than queued behind the old timeline. */
  useEffect(() => {
    clear()

    /* Under reduced motion nothing runs at all — see the render, which shows the
       conversation AND the summary together, statically. The old behaviour here
       jumped straight to the summary, which meant a reduced-motion visitor never
       saw a single word of Spanish or Arabic: they got the English output with no
       evidence of the input. That is not "the animation, minus the motion" — it is
       the demonstration with its point removed. */
    if (reduced) return

    /* Offscreen: stop dead and hold the current frame. */
    if (!onScreen) return

    setPhase({ turn: 0, typed: 0, summary: false })

    let t = 400
    script.turns.forEach((turn, i) => {
      if (turn.who === 'kai') {
        after(t, () => setPhase({ turn: i + 1, typed: 0, summary: false }))
        t += KAI_READ + turn.text.length * 12
        return
      }
      // Patient turns type themselves out, character by character.
      after(t, () => setPhase({ turn: i, typed: 0, summary: false }))
      t += PATIENT_PAUSE
      for (let c = 1; c <= turn.text.length; c++) {
        after(t + c * perChar, () =>
          setPhase({ turn: i, typed: c, summary: false })
        )
      }
      t += turn.text.length * perChar
      after(t, () => setPhase({ turn: i + 1, typed: 0, summary: false }))
      t += 420
    })

    after(t, () => setPhase({ turn: script.turns.length, typed: 0, summary: true }))
    t += SUMMARY_DWELL

    if (!driven) {
      after(t, () => setActive((a) => (a + 1) % SCRIPTS.length))
    }

    return clear
  }, [active, driven, reduced, onScreen, script, perChar, clear, after])

  const pick = (i: number) => {
    setDriven(true)
    setActive(i)
  }

  const visible = useMemo(() => {
    /* Reduced motion: every turn, complete, nothing typing. */
    if (reduced) {
      return script.turns.map((turn, i) => ({ ...turn, i, shown: turn.text, typing: false }))
    }
    return (
      script.turns
        .slice(0, Math.min(phase.turn + 1, script.turns.length))
        .map((turn, i) => {
          const isTyping = i === phase.turn && turn.who === 'patient' && !phase.summary
          return {
            ...turn,
            i,
            shown: isTyping ? turn.text.slice(0, phase.typed) : turn.text,
            typing: isTyping,
          }
        })
        /* A patient bubble with nothing typed in it yet renders as a dark empty
           pill with a caret floating in it — which reads as a rendering fault, not
           as anticipation. Wait for the first character. */
        .filter((turn) => !(turn.who === 'patient' && turn.shown.length === 0))
    )
  }, [script, phase, reduced])

  /* Two speakers, two materials — the product's own chat grammar. Kai has no
     bubble: the mark plus plain words on the paper. Only the patient gets the
     filled ink bubble, and its tail corner is a LOGICAL corner (rounded-ee),
     so the whole exchange genuinely mirrors when the frame is dir="rtl". */
  const bubbles = (
    <div className="space-y-3">
      {visible.map((turn) => (
        <motion.div
          key={`${script.code}-${turn.i}`}
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
          className={turn.who === 'kai' ? 'flex items-start gap-2.5' : 'flex'}
        >
          {turn.who === 'kai' && <KaiDot size={24} />}
          <p
            lang={script.code}
            className={`lx-native text-[0.9rem] leading-[1.55] ${
              turn.who === 'patient'
                ? 'ms-auto w-fit max-w-[86%] rounded-[14px] rounded-ee-[4px] bg-[var(--lx-ink)] px-3.5 py-2.5 text-white'
                : 'max-w-[86%] pt-0.5 text-[var(--lx-body)]'
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

  /* The output document. Always LTR — whatever direction the conversation ran,
     the deliverable is an English clinical note, and the snap from a mirrored
     exchange back to a left-to-right document IS the product, visible. Set as a
     letterhead: serif title, one heavier rule, chart-mono field names. */
  const summary = (
    <div dir="ltr">
      <div className="flex items-baseline justify-between gap-3 border-b-[1.5px] border-[var(--lx-ink)] pb-2">
        <span className="lx-heading text-[1.02rem] text-[var(--lx-ink)]">Intake summary</span>
        <span className="lx-label text-[0.625rem] text-[var(--lx-green-ink)]">English</span>
      </div>

      <dl className="divide-y divide-[var(--lx-line)] border-b border-[var(--lx-line)]">
        {[...SUMMARY, { k: 'Patient spoke', v: script.spoken }].map((row, i) => (
          <motion.div
            key={row.k}
            initial={reduced ? false : { opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.07, duration: 0.3 }}
            className="flex items-baseline justify-between gap-4 py-2"
          >
            <dt className="lx-label text-[0.6rem] text-[var(--lx-muted)]">{row.k}</dt>
            <dd
              className={`text-right text-[0.85rem] font-semibold tabular-nums ${
                row.k === 'Patient spoke'
                  ? 'text-[var(--lx-green-ink)]'
                  : 'text-[var(--lx-ink)]'
              }`}
            >
              {row.v}
            </dd>
          </motion.div>
        ))}
      </dl>

      <p className="mt-3 text-xs leading-[1.6] text-[var(--lx-muted)]">
        No diagnosis. No triage score. Just what the patient said, in a form a clinician can read.
      </p>
    </div>
  )

  return (
    <div ref={root} className="lx-demo w-full">
      {/* The chips. This is the interaction — and it is the whole pitch. */}
      <div
        role="group"
        aria-label="Choose a language to see the demonstration in"
        className="mb-3 flex flex-wrap gap-1.5"
      >
        {/* min-h-11 (44px): these chips are THE hero interaction, tapped by
            the exact users with reduced fine motor control this site is for. */}
        {SCRIPTS.map((s, i) => (
          <button
            key={s.code}
            type="button"
            onClick={() => pick(i)}
            aria-pressed={i === active}
            className={`lx-focus lx-native inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3.5 text-sm transition-colors duration-150 ${
              i === active
                ? 'border-transparent bg-[var(--lx-ink)] text-white'
                : 'border-[var(--lx-line)] bg-[var(--lx-paper)]/80 text-[var(--lx-body)] hover:border-[var(--lx-green)]'
            }`}
          >
            <span aria-hidden="true">{s.flag}</span>
            {s.native}
          </button>
        ))}
      </div>

      {/* The surface takes the script's direction — chrome included — so
          picking العربية mirrors it the way the real product does. Direction
          sits on the chrome and INSIDE each keyed panel, never on the frame:
          during the crossfade the outgoing conversation must keep its own
          direction, or Spanish spends 250ms rendered right-to-left.
          The summary pins itself back to LTR: it is an English document. */}
      <div className="lx-demo-frame relative overflow-hidden rounded-[16px] border border-[var(--lx-line)] bg-[var(--lx-paper)]">
        {/* Chrome. A title bar with a live status is most of what separates
            "product" from "div with a border". */}
        <div
          dir={script.rtl ? 'rtl' : 'ltr'}
          className="lx-demo-chrome flex items-center justify-between gap-3 border-b border-[var(--lx-line)] px-4 py-2.5"
        >
          <span className="flex items-center gap-2">
            <KaiDot size={22} />
            <span className="lx-label text-[0.625rem] text-[var(--lx-muted)]">
              {reduced ? 'Conversation and summary' : phase.summary ? 'Summary ready' : 'Kai · listening'}
            </span>
            {!reduced && !phase.summary && (
              <span className="lx-listen" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
            )}
          </span>
          <span className="flex items-center gap-2">
            {script.rtl && (
              <span className="lx-label rounded-[4px] border border-[var(--lx-line)] px-1.5 py-0.5 text-[0.55rem] text-[var(--lx-green-ink)]">
                RTL
              </span>
            )}
            <span className="lx-native text-xs text-[var(--lx-muted)]">{script.native}</span>
          </span>
        </div>

        {reduced ? (
          /* END-STATE PINNING.

             Reduced motion is not "the same thing, slower". The timeline never
             runs, so anything that depended on it to become visible must already
             be visible — otherwise the artifact is permanently blank, which is a
             correctness bug, not a polish one.

             It also swaps the CONTENT rather than merely freezing it: both halves
             at once, in full, so the conversation and the summary can be read side
             by side. The chips still work. Nothing that matters is lost — only the
             theatre. */
          <div className="space-y-5 p-4">
            <div dir={script.rtl ? 'rtl' : 'ltr'}>{bubbles}</div>
            {summary}
          </div>
        ) : (
          /* Fixed height so the chips and the caption below never jump as bubbles
             arrive. A hero that reflows while you read it looks broken.

             Sized to the SUMMARY, the taller of the two states — five rows plus the
             disclaimer. Size it to the chat instead and the summary's last line gets
             guillotined. */
          <div className="relative h-[310px] sm:h-[298px]">
            <AnimatePresence mode="wait">
              {!phase.summary ? (
                <motion.div
                  key={`chat-${script.code}`}
                  dir={script.rtl ? 'rtl' : 'ltr'}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  /* Top-anchored, deliberately.

                     Bottom-anchoring is how a real messaging app behaves and was the
                     obvious call — but the frame has to be tall enough for the summary,
                     so on the opening frame a single bubble ended up pinned to the floor
                     under 200px of nothing. Empty space ABOVE the first message reads as
                     a broken render; empty space BELOW it reads as room for the
                     conversation to grow, which is exactly what it is. */
                  className="absolute inset-0 overflow-hidden p-4"
                >
                  {bubbles}
                </motion.div>
              ) : (
                <motion.div
                  key={`summary-${script.code}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
                  className="absolute inset-0 p-4"
                >
                  {summary}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
