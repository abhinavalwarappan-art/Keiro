export async function transcribeAudio(
  audioBlob: Blob,
  languageCode: string
): Promise<{ text: string; detectedLanguage?: string }> {
  const formData = new FormData()
  formData.append('file', audioBlob, 'audio.webm')
  formData.append('model', 'whisper-1')
  formData.append('language', languageCode.split('-')[0])

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: formData,
  })

  if (!response.ok) {
    throw new Error('Transcription failed')
  }

  const data = await response.json()
  return {
    text: data.text,
    detectedLanguage: data.language,
  }
}
