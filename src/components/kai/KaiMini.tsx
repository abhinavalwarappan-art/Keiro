'use client'

import Kai, { KaiState } from './Kai'

interface KaiMiniProps {
  speaking?: boolean
  thinking?: boolean
  state?: KaiState
}

export default function KaiMini({ speaking, thinking, state }: KaiMiniProps) {
  const resolved: KaiState =
    state ?? (thinking ? 'thinking' : speaking ? 'talking' : 'idle')
  return <Kai size="sm" state={resolved} interactive={false} />
}