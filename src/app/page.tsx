'use client'

import { motion } from 'framer-motion'
import Nav from '@/components/landing/Nav'
import Hero from '@/components/landing/Hero'
import Marquee from '@/components/landing/Marquee'
import HowItWorks from '@/components/landing/HowItWorks'
import Languages from '@/components/landing/Languages'
import MeetKai from '@/components/landing/MeetKai'
import ForHospitals from '@/components/landing/ForHospitals'
import Footer from '@/components/landing/Footer'
import { pageVariants } from '@/lib/motion'

export default function LandingPage() {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="min-h-screen bg-off-white">
      <Nav />
      <Hero />
      <Marquee />
      <HowItWorks />
      <Languages />
      <MeetKai />
      <ForHospitals />
      <Footer />
    </motion.div>
  )
}
