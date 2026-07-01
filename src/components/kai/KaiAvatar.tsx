'use client'

import Kai, { KaiState } from './Kai'

interface KaiAvatarProps {
  /** Display width in pixels */
  pixels?: 32 | 40
  state?: KaiState
}

const BASE_SIZE = 56
const BASE_HEIGHT = 75

export default function KaiAvatar({ pixels = 40, state = 'idle' }: KaiAvatarProps) {
  const scale = pixels / BASE_SIZE
  const height = Math.round(BASE_HEIGHT * scale)

  return (
    <div
      className="flex shrink-0 items-end justify-center overflow-visible"
      style={{ width: pixels, height }}
      aria-hidden
    >
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'bottom center' }}>
        <Kai size="xs" state={state} interactive={false} animated={false} />
      </div>
    </div>
  )
}