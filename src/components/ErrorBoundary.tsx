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
  const handleStartOver = () => {
    window.location.href = '/'
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center bg-transparent px-6 text-center"
      role="alert"
      aria-live="assertive"
    >
      <KaiHead />
      <h1 className="mt-6 text-2xl font-semibold leading-snug tracking-tight text-text-primary">
        Something went wrong.
        <br />
        Please try again.
      </h1>
      <button
        type="button"
        onClick={onReset}
        className="mt-6 min-h-[48px] rounded-md bg-brand-ink px-8 py-3 text-base font-medium text-white shadow-xs transition-colors duration-150 hover:bg-brand-ink-hover active:scale-[0.98]"
      >
        Try again
      </button>
      <button
        type="button"
        className="mt-4 min-h-[44px] rounded-sm text-sm font-medium text-text-secondary underline underline-offset-2 transition-colors duration-150 hover:text-text-primary"
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