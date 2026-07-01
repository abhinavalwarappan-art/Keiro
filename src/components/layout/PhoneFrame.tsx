'use client'

import { motion } from 'framer-motion'

interface PhoneFrameProps {
  children: React.ReactNode
}

export default function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#f0f7f4', padding: '24px 0' }}>
      <motion.div
        className="relative overflow-hidden"
        style={{
          width: '100%',
          maxWidth: 430,
          minHeight: '100vh',
          background: 'white',
          boxShadow: '0 24px 80px rgba(26,61,43,0.18)',
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