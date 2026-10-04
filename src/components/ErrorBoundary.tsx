'use client'

import React from 'react'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Stripped of any potential PHI — log only component stack
    // Use a structured logging approach rather than console.error in production
    if (process.env.NODE_ENV === 'development') {
      console.error('[Keiro] Uncaught error:', error.message, info.componentStack?.slice(0, 300))
    }
  }

  reset = () => {
    this.setState({ hasError: false })
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback onReset={this.reset} />
    }
    return this.props.children
  }
}

export function ErrorFallback({ onReset }: { onReset: () => void }) {
  // A full reload on purpose: whatever crashed is still in memory, and a client
  // navigation would carry it along. Absolute so it never resolves against a subpath.
  const handleStartOver = () => {
    window.location.assign(new URL('/', window.location.origin))
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center bg-transparent px-6 text-center"
      role="alert"
      aria-live="assertive"
    >
      <KaiHead />
      <h1 className="mt-6 text-balance text-[2rem] font-semibold leading-[1.1] tracking-[-0.035em] text-text-primary">
        Something didn&apos;t load.
      </h1>
      <p className="mt-3 max-w-sm text-pretty text-lg leading-relaxed text-text-secondary">
        Nothing you said was lost or shared. Try again — or start over from the beginning.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-8 min-h-14 w-full max-w-[20rem] rounded-full bg-brand-ink px-8 text-lg font-semibold text-white transition-[background-color,transform] duration-150 hover:bg-brand-ink-hover active:scale-[0.97]"
      >
        Try again
      </button>
      <button
        type="button"
        className="mt-2 min-h-12 w-full max-w-[20rem] rounded-full text-base font-semibold text-brand-ink transition-colors duration-150 hover:bg-brand-subtle"
        onClick={handleStartOver}
      >
        Start over
      </button>
    </div>
  )
}

function KaiHead() {
  return (
    <svg
      width="100"
      height="65"
      viewBox="60 75 185 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Kai"
      role="img"
    >
      <rect x="72" y="80" width="156" height="110" rx="52" ry="52" fill="#2E9E5B" />
      <ellipse cx="118" cy="96" rx="28" ry="16" fill="#3DB870" opacity="0.22" />
      <rect x="62" y="110" width="18" height="32" rx="9" fill="#269152" />
      <rect x="220" y="110" width="18" height="32" rx="9" fill="#269152" />
      <rect x="88" y="106" width="124" height="58" rx="20" fill="#0D0D0D" />
      <rect x="94" y="111" width="52" height="18" rx="8" fill="white" opacity="0.06" />
      <rect x="100" y="118" width="34" height="36" rx="8" fill="#0B8FAC" />
      <rect x="106" y="124" width="10" height="14" rx="3" fill="#7EEAF5" opacity="0.55" />
      <rect x="166" y="118" width="34" height="36" rx="8" fill="#0B8FAC" />
      <rect x="172" y="124" width="10" height="14" rx="3" fill="#7EEAF5" opacity="0.55" />
    </svg>
  )
}