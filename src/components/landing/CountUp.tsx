'use client'

import { useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'

export function CountUp({
  target,
  suffix = '',
  display,
}: {
  target: number
  suffix?: string
  display?: string
}) {
  const [count, setCount] = useState(0)
  const { ref, inView } = useInView({ triggerOnce: true })

  useEffect(() => {
    if (!inView) return
    if (display) {
      setCount(target)
      return
    }
    let start = 0
    const step = Math.max(1, target / 60)
    const timer = setInterval(() => {
      start += step
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [inView, target, display])

  if (display) {
    return (
      <span ref={ref} className="font-display">
        {display}
      </span>
    )
  }

  return (
    <span ref={ref} className="font-display">
      {count.toLocaleString()}
      {suffix}
    </span>
  )
}
