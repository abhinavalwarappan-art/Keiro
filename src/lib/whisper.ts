// API key loaded from environment — never hardcode
//
// Transcription runs on Groq's OpenAI-compatible Whisper endpoint
// (`whisper-large-v3-turbo`) — same Whisper multilingual coverage as OpenAI, far
// cheaper (~$0.04/hr), with a generous free tier. The request/response shape is
// identical to OpenAI's, so this stays a plain multipart POST.
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

  const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
    body: formData,
  })

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'unknown error')
    throw new Error(`Transcription failed: ${response.status} ${response.statusText} — ${errorBody}`)
  }

  const data = await response.json()

  if (typeof data.text !== 'string') {
    throw new Error('Unexpected response format from transcription API')
  }

  return {
    text: data.text,
    detectedLanguage: data.language,
  }
}