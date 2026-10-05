'use client'

import { motion } from 'framer-motion'

interface PhoneFrameProps {
  children: React.ReactNode
}

export default function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-canvas py-6">
      <motion.div
        className="relative overflow-hidden bg-surface shadow-lg"
        style={{
          width: '100%',
          maxWidth: 430,
          minHeight: '100vh',
        }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </div>
  )
}