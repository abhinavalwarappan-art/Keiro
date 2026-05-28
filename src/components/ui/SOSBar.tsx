'use client'

import { motion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SOSBar() {
  const router = useRouter()

  return (
    <motion.button
      onClick={() => router.push('/emergency')}
      className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-all"
      style={{ background: '#fff5f5', borderTop: '1px solid #fecaca', color: '#A32D2D' }}
      whileTap={{ scale: 0.99 }}
    >
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <AlertCircle size={15} />
      </motion.div>
      This is an emergency
    </motion.button>
  )
}
