'use client'

import Kai, { KaiState, KaiSize } from './Kai'

interface KaiRobotProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  speaking?: boolean
  thinking?: boolean
  state?: KaiState
  interactive?: boolean
}

export default function KaiRobot({
  size = 'md',
  speaking = false,
  thinking = false,
  state,
  interactive = false,
}: KaiRobotProps) {
  const resolved: KaiState =
    state ?? (thinking ? 'thinking' : speaking ? 'talking' : 'idle')
  return <Kai size={size as KaiSize} state={resolved} interactive={interactive} />
}