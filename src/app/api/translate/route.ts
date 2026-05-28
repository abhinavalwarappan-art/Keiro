import { NextRequest, NextResponse } from 'next/server'
import { translateText } from '@/lib/translate'
import { LANGUAGES } from '@/lib/languages'

export async function POST(request: NextRequest) {
  try {
    const { text, targetLangCode, sourceLang } = await request.json()

    if (!text || !targetLangCode) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const lang = LANGUAGES.find(l => l.code === targetLangCode)
    const translated = await translateText(text, targetLangCode, sourceLang || 'en', lang?.deeplCode)

    return NextResponse.json({ translated })
  } catch {
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 })
  }
}
