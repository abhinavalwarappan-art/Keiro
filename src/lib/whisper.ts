// API key loaded from environment — never hardcode
//
// Transcription runs on Groq's OpenAI-compatible Whisper endpoint
// (`whisper-large-v3-turbo`) — same Whisper multilingual coverage as OpenAI, far
// cheaper (~$0.04/hr), with a generous free tier. The request/response shape is
// identical to OpenAI's, so this stays a plain multipart POST.
import { fetchUpstream, UpstreamError } from '@/lib/upstream'

// whisper-large-v3-turbo is fast (a few seconds for a symptom-length clip), but
// the request also carries the audio upload, so allow for a slow mobile network.
const GROQ_TIMEOUT_MS = 30_000

export async function transcribeAudio(
  audioBlob: Blob,
  languageCode: string
): Promise<{ text: string; detectedLanguage?: string }> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    throw new Error('GROQ_API_KEY environment variable is not set')
  }

  const formData = new FormData()
  // Use mp4 extension as fallback for broader browser support
  const ext = audioBlob.type.includes('mp4') ? 'audio.mp4' :
              audioBlob.type.includes('ogg') ? 'audio.ogg' :
              audioBlob.type.includes('wav') ? 'audio.wav' : 'audio.webm'
  formData.append('file', audioBlob, ext)
  formData.append('model', 'whisper-large-v3-turbo')
  formData.append('language', languageCode.split('-')[0])

  const response = await fetchUpstream(
    'groq',
    'https://api.groq.com/openai/v1/audio/transcriptions',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData,
    },
    GROQ_TIMEOUT_MS
  )

  const data = await response.json()

  if (typeof data.text !== 'string') {
    throw new UpstreamError('groq', 'bad_response', 'Groq returned an unexpected response shape')
  }

  return {
    text: data.text,
    detectedLanguage: data.language,
  }
}