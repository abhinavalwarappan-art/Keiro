'use client'

import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { FileText } from 'lucide-react'
import TopBar from '@/components/layout/TopBar'
import { KaiState } from '@/components/kai/Kai'
import { pageVariants } from '@/lib/motion'
import ProgressBar from '@/components/chat/ProgressBar'
import ChatBubble from '@/components/chat/ChatBubble'
import ChatInput from '@/components/chat/ChatInput'
import KaiTyping from '@/components/kai/KaiTyping'
import SOSBar from '@/components/ui/SOSBar'
import { SeverityPicker, YesNoPicker } from '@/components/chat/SeverityPicker'
import { ChatMessage } from '@/types'
import { getLanguageByCode } from '@/lib/languages'

type QuickReplyType = 'severity' | 'yesno' | null

function ChatContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [step, setStep] = useState(1)
  const [quickReply, setQuickReply] = useState<QuickReplyType>(null)
  const [showPrepareReport, setShowPrepareReport] = useState(false)
  const [generatingReport, setGeneratingReport] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const initRef = useRef(false)

  const langCode = searchParams.get('lang') || 'en-US'
  const langName = searchParams.get('langName') || 'English'
  const langNative = searchParams.get('langNative') || 'English'
  const roman = searchParams.get('roman') === '1'

  const lang = getLanguageByCode(langCode)

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    }, 100)
  }, [])

  const addKaiMessage = useCallback((content: string) => {
    const msg: ChatMessage = { id: Date.now().toString(), role: 'kai', content, timestamp: new Date() }
    setMessages(prev => [...prev, msg])
    scrollToBottom()

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(content)
      utterance.lang = langCode
      utterance.rate = 0.9
      speechSynthesis.speak(utterance)
    }
  }, [langCode, scrollToBottom])

  const sendMessage = useCallback(async (userText: string) => {
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: userText, timestamp: new Date() }
    setMessages(prev => {
      const updated = [...prev, userMsg]
      sendToKai(updated)
      return updated
    })
    setQuickReply(null)
    scrollToBottom()
  }, []) // eslint-disable-line

  const sendToKai = useCallback(async (currentMessages: ChatMessage[]) => {
    setIsTyping(true)
    scrollToBottom()

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: currentMessages,
          language: langName,
          languageCode: langCode,
          romanization: roman,
        }),
      })

      if (!res.ok) {
        setIsTyping(false)
        return
      }

      const data = await res.json().catch(() => null)
      if (data?.emergency) {
        setIsTyping(false)
        router.push('/emergency')
        return
      }

      // Handle streaming
      const reader = res.body?.getReader()
      if (!reader) { setIsTyping(false); return }

      setIsTyping(false)
      let fullText = ''
      const newMsgId = (Date.now() + 1).toString()
      setMessages(prev => [...prev, { id: newMsgId, role: 'kai', content: '', timestamp: new Date() }])

      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '))

        for (const line of lines) {
          const payload = line.slice(6)
          if (payload === '[DONE]') break
          try {
            const parsed = JSON.parse(payload)
            if (parsed.emergency) { router.push('/emergency'); return }
            if (parsed.text) {
              fullText += parsed.text
              setMessages(prev => prev.map(m => m.id === newMsgId ? { ...m, content: fullText } : m))
            }
          } catch { /* ignore */ }
        }
      }

      scrollToBottom()
      setStep(prev => Math.min(prev + 1, 6))

      const lower = fullText.toLowerCase()
      if (lower.includes('scale of 1') || lower.includes('how bad')) setQuickReply('severity')
      else if (lower.includes('yes or no') || lower.includes('do you have') || lower.includes('are you')) setQuickReply('yesno')
      else setQuickReply(null)

      if (lower.includes('shall i prepare') || lower.includes('prepare your report')) {
        setShowPrepareReport(true)
      }

      if ('speechSynthesis' in window && fullText) {
        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(fullText)
        utterance.lang = langCode
        utterance.rate = 0.9
        speechSynthesis.speak(utterance)
      }
    } catch {
      setIsTyping(false)
    }
  }, [langName, langCode, roman, router, scrollToBottom])

  useEffect(() => {
    if (initRef.current) return
    initRef.current = true
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      addKaiMessage(`Hello! I'm Kai. I'm here to help you communicate with your doctor today. Do you already know what condition you have, or are you unsure what's wrong today?`)
    }, 1500)
  }, [addKaiMessage])

  const handlePrepareReport = async () => {
    setGeneratingReport(true)
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, language: langName, languageCode: langCode }),
      })
      const data = await res.json()
      if (data.reportId) {
        const params = new URLSearchParams({ reportId: data.reportId, lang: langCode, langName })
        router.push(`/report?${params.toString()}`)
      }
    } catch {
      setGeneratingReport(false)
    }
  }

  const kaiState: KaiState = generatingReport || isTyping ? 'thinking' : 'idle'

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="flex flex-col h-screen max-w-[430px] mx-auto bg-off-white"
    >
      <TopBar kaiState={kaiState} language={langNative} />
      <ProgressBar step={step} total={6} />

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {messages.map(msg => (
          <ChatBubble key={msg.id} message={msg} langCode={langCode} />
        ))}

        {isTyping && <KaiTyping />}

        <AnimatePresence>
          {showPrepareReport && !generatingReport && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-2 mt-4"
            >
              <motion.button
                onClick={handlePrepareReport}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-semibold text-white"
                style={{ background: '#1a3d2b' }}
                whileTap={{ scale: 0.97 }}
              >
                <FileText size={16} /> Yes, prepare my report
              </motion.button>
              <motion.button
                onClick={() => setShowPrepareReport(false)}
                className="w-full py-3.5 rounded-2xl font-semibold text-sm"
                style={{ background: '#f8fffe', border: '1.5px solid #c5edd8', color: '#1a3d2b' }}
                whileTap={{ scale: 0.97 }}
              >
                I have more to add
              </motion.button>
            </motion.div>
          )}

          {generatingReport && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-3 py-8"
            >
              <motion.div
                className="w-12 h-12 rounded-full border-4 border-t-transparent"
                style={{ borderColor: '#c5edd8', borderTopColor: '#2da866' }}
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              />
              <p className="text-sm" style={{ color: '#3B6D11' }}>Preparing your report...</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="h-4" />
      </div>

      <div style={{ background: 'white', borderTop: '1px solid #c5edd8' }}>
        {quickReply === 'severity' && !isTyping && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="pt-2">
            <SeverityPicker onSelect={sendMessage} />
          </motion.div>
        )}
        {quickReply === 'yesno' && !isTyping && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="pt-2 px-3">
            <YesNoPicker onSelect={sendMessage} />
          </motion.div>
        )}
        <SOSBar />
        <ChatInput
          onSend={sendMessage}
          disabled={isTyping}
          placeholder="Type your message..."
          langCode={langCode}
        />
      </div>
    </motion.div>
  )
}

export default function ChatPage() {
  return (
    <Suspense>
      <ChatContent />
    </Suspense>
  )
}
