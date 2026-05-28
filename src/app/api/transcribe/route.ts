import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { transcribeAudio } from '@/lib/whisper'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const audio = formData.get('audio') as Blob
    const langCode = formData.get('langCode') as string || 'en'

    if (!audio) {
      return NextResponse.json({ error: 'No audio provided' }, { status: 400 })
    }

    const result = await transcribeAudio(audio, langCode)

    const selectedLangPrefix = langCode.split('-')[0]
    const detectedPrefix = result.detectedLanguage?.split('-')[0]
    const languageMismatch = detectedPrefix && detectedPrefix !== selectedLangPrefix

    return NextResponse.json({
      text: result.text,
      detectedLanguage: result.detectedLanguage,
      languageMismatch,
    })
  } catch {
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 })
  }
}
