'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Globe, Volume2, Type, LogOut, Trash2, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types'
import VoicePicker from '@/components/ui/VoicePicker'
import { getLanguageByCode } from '@/lib/languages'

export default function SettingsPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [showVoicePicker, setShowVoicePicker] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) setProfile(data)
    }
    load()
  }, []) // eslint-disable-line

  const handleVoiceSelect = async (voiceName: string) => {
    if (!profile) return
    await supabase.from('profiles').update({ preferred_voice: voiceName }).eq('id', profile.id)
    setProfile(p => p ? { ...p, preferred_voice: voiceName } : p)
  }

  const handleRomanizationToggle = async () => {
    if (!profile) return
    const next = !profile.romanization_enabled
    await supabase.from('profiles').update({ romanization_enabled: next }).eq('id', profile.id)
    setProfile(p => p ? { ...p, romanization_enabled: next } : p)
  }

  const handleDeleteAllData = async () => {
    if (!profile) return
    setDeleting(true)
    await supabase.from('reports').delete().eq('user_id', profile.id)
    await supabase.from('sessions').delete().eq('user_id', profile.id)
    await supabase.from('profiles').delete().eq('id', profile.id)
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const lang = profile ? getLanguageByCode(profile.language_code) : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col min-h-screen"
      style={{ maxWidth: 430, margin: '0 auto', background: '#f8fffe' }}
    >
      <div className="flex items-center gap-3 px-4 py-3" style={{ background: 'white', borderBottom: '1px solid #c5edd8' }}>
        <button onClick={() => router.back()} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#f8fffe' }}>
          <ArrowLeft size={16} style={{ color: '#1a3d2b' }} />
        </button>
        <h1 className="font-bold text-base" style={{ color: '#0f2419' }}>Settings</h1>
      </div>

      <div className="flex-1 p-4 flex flex-col gap-4">
        {/* Language */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1.5px solid #c5edd8' }}>
          <div className="px-4 py-2.5 border-b" style={{ borderColor: '#edfaf4', background: '#f8fffe' }}>
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#3B6D11' }}>Language</span>
          </div>
          <motion.button
            onClick={() => router.push('/onboarding')}
            className="w-full flex items-center gap-3 px-4 py-4"
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#edfaf4' }}>
              <Globe size={16} style={{ color: '#2da866' }} />
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm font-medium" style={{ color: '#0f2419' }}>
                {lang ? `${lang.flag} ${lang.en}` : 'Not set'}
              </div>
              {lang && <div className="text-xs" style={{ color: '#3B6D11' }}>{lang.native}</div>}
            </div>
            <ChevronRight size={16} style={{ color: '#3B6D11' }} />
          </motion.button>
        </div>

        {/* Voice */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1.5px solid #c5edd8' }}>
          <div className="px-4 py-2.5 border-b" style={{ borderColor: '#edfaf4', background: '#f8fffe' }}>
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#3B6D11' }}>Kai&apos;s Voice</span>
          </div>
          <motion.button
            onClick={() => setShowVoicePicker(p => !p)}
            className="w-full flex items-center gap-3 px-4 py-4"
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#edfaf4' }}>
              <Volume2 size={16} style={{ color: '#2da866' }} />
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm font-medium" style={{ color: '#0f2419' }}>Voice preference</div>
              <div className="text-xs" style={{ color: '#3B6D11' }}>{profile?.preferred_voice || 'Default'}</div>
            </div>
            <ChevronRight size={16} style={{ color: '#3B6D11', transform: showVoicePicker ? 'rotate(90deg)' : 'none', transition: '0.2s' }} />
          </motion.button>

          <AnimatePresence>
            {showVoicePicker && profile && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4">
                  <VoicePicker
                    langCode={profile.language_code}
                    selected={profile.preferred_voice}
                    onSelect={handleVoiceSelect}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Romanization */}
        {profile && (
          <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1.5px solid #c5edd8' }}>
            <div className="px-4 py-2.5 border-b" style={{ borderColor: '#edfaf4', background: '#f8fffe' }}>
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#3B6D11' }}>Display</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#edfaf4' }}>
                <Type size={16} style={{ color: '#2da866' }} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium" style={{ color: '#0f2419' }}>Show romanized text</div>
                <div className="text-xs" style={{ color: '#3B6D11' }}>Phonetic spelling below native script</div>
              </div>
              <motion.div
                onClick={handleRomanizationToggle}
                className="w-11 h-6 rounded-full relative cursor-pointer"
                style={{ background: profile.romanization_enabled ? '#2da866' : '#c5edd8' }}
                animate={{ background: profile.romanization_enabled ? '#2da866' : '#c5edd8' }}
              >
                <motion.div
                  className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow"
                  animate={{ left: profile.romanization_enabled ? '22px' : '2px' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </motion.div>
            </div>
          </div>
        )}

        {/* Legal */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1.5px solid #c5edd8' }}>
          <div className="px-4 py-2.5 border-b" style={{ borderColor: '#edfaf4', background: '#f8fffe' }}>
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#3B6D11' }}>Legal</span>
          </div>
          {[
            { label: 'Terms of Service', href: '/terms' },
            { label: 'Privacy Policy', href: '/privacy' },
          ].map(item => (
            <motion.button
              key={item.label}
              onClick={() => router.push(item.href)}
              className="w-full flex items-center justify-between px-4 py-4 border-b last:border-0"
              style={{ borderColor: '#edfaf4' }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-sm" style={{ color: '#0f2419' }}>{item.label}</span>
              <ChevronRight size={15} style={{ color: '#3B6D11' }} />
            </motion.button>
          ))}
        </div>

        {/* Account actions */}
        <div className="flex flex-col gap-2 mt-2">
          <motion.button
            onClick={handleSignOut}
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-sm"
            style={{ background: '#f8fffe', border: '1.5px solid #c5edd8', color: '#1a3d2b' }}
            whileTap={{ scale: 0.97 }}
          >
            <LogOut size={15} /> Sign out
          </motion.button>

          <motion.button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-sm"
            style={{ background: '#fff5f5', border: '1.5px solid #fecaca', color: '#A32D2D' }}
            whileTap={{ scale: 0.97 }}
          >
            <Trash2 size={15} /> Delete all my data
          </motion.button>
        </div>
      </div>

      {/* Delete confirm modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ y: 40, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 40, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl p-6"
              style={{ background: 'white' }}
            >
              <h3 className="font-bold text-lg mb-2" style={{ color: '#0f2419' }}>Delete all data?</h3>
              <p className="text-sm mb-6" style={{ color: '#3B6D11' }}>
                This will permanently delete your account, all reports, and all data. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm"
                  style={{ background: '#f8fffe', border: '1.5px solid #c5edd8', color: '#1a3d2b' }}
                >
                  Cancel
                </button>
                <motion.button
                  onClick={handleDeleteAllData}
                  disabled={deleting}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm text-white"
                  style={{ background: '#A32D2D' }}
                  whileTap={{ scale: 0.97 }}
                >
                  {deleting ? 'Deleting...' : 'Delete everything'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
