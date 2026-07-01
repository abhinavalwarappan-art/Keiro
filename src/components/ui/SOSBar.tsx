'use client'

import { AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SOSBar() {
  const router = useRouter()

  return (
    <button
      onClick={() => router.push('/emergency')}
      aria-label="Emergency SOS - This is an emergency"
      className="flex w-full items-center justify-center gap-2 border-t border-error/20 bg-error-subtle py-2.5 text-sm font-medium text-error-text transition-colors duration-150 hover:bg-error/10 active:scale-[0.99]"
    >
      <AlertCircle size={15} aria-hidden />
      This is an emergency
    </button>
  )
}