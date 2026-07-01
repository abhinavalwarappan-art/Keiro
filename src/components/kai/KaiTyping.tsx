'use client'

import Kai from './Kai'

export default function KaiTyping() {
  return (
    <div className="flex items-end gap-2 mb-3">
      <Kai size="sm" state="thinking" interactive={false} />
      <div className="flex gap-1 px-4 py-3 rounded-2xl" style={{ background: '#1a3d2b', borderBottomLeftRadius: 4 }}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-[#5DCAA5] animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  )
}