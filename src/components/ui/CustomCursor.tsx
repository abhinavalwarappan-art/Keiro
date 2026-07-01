'use client'

import { useEffect, useState } from 'react'

export function CustomCursor() {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [hovering, setHovering] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches
    if (isTouch) return

    const visibleTimer = setTimeout(() => setVisible(true), 0)

    const move = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY })

    const handleHover = (e: Event) => {
      const target = e.target as HTMLElement
      if (target.closest('a, button, [data-cursor-hover]')) {
        setHovering(true)
      } else {
        setHovering(false)
      }
    }

    window.addEventListener('mousemove', move)
    window.addEventListener('mouseover', handleHover)

    const handleMouseLeave = () => setVisible(false)
    const handleMouseEnter = () => setVisible(true)

    document.documentElement.addEventListener('mouseleave', handleMouseLeave)
    document.documentElement.addEventListener('mouseenter', handleMouseEnter)

    return () => {
      clearTimeout(visibleTimer)
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseover', handleHover)
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave)
      document.documentElement.removeEventListener('mouseenter', handleMouseEnter)
    }
  }, [])

  if (!visible) return null

  return (
    <div
      aria-hidden="true"
      className={`cursor-dot ${hovering ? 'hover' : ''}`}
      style={{ transform: `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)` }}
    />
  )
}