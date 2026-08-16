'use client'

/**
 * Re-encode a recorded clip as 16 kHz mono 16-bit PCM WAV before upload.
 *
 * This exists because of a hard incompatibility between what browsers record
 * and what Fish Audio's ASR can decode. Every container MediaRecorder actually
 * produces is rejected by /v1/asr:
 *
 *   • WebM (Chrome, Firefox, Android — the default everywhere)
 *       → 400 "the audio could not be decoded (format not recognised)".
 *         Sniffed from the bytes, so renaming the upload does not help.
 *   • MP4  (Chrome, Safari/iOS)
 *       → 400 "malformed stream: isomp4: missing sl config descriptor".
 *         MediaRecorder emits FRAGMENTED MP4 so the stream can be written
 *         incrementally; Fish's demuxer only reads a plain MP4. The very same
 *         AAC audio, remuxed to a non-fragmented container, transcribes fine —
 *         so this is the container, not the codec.
 *
 * That leaves no native recording format that works on Chrome or Safari, which
 * is nearly every patient. Rather than transcode on the server (a codec
 * dependency in the Lambda) or lock recording to Firefox-only Ogg, the browser
 * decodes its own recording — which it can always do — and we hand Fish plain
 * WAV, which it accepts from every engine.
 *
 * 16 kHz mono is the standard ASR input rate and keeps the upload small: about
 * 32 KB per second, so a minute of speech is ~2 MB. Speech carries no useful
 * information above 8 kHz, so this discards no accuracy.
 */

const TARGET_SAMPLE_RATE = 16_000
const BYTES_PER_SAMPLE = 2
const WAV_HEADER_BYTES = 44

type AudioContextCtor = typeof AudioContext

function getAudioContextCtor(): AudioContextCtor | undefined {
  if (typeof window === 'undefined') return undefined
  return (
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: AudioContextCtor }).webkitAudioContext
  )
}

/** Interleave-free: mono only, so samples are written straight through. */
function encodeWav(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(WAV_HEADER_BYTES + samples.length * BYTES_PER_SAMPLE)
  const view = new DataView(buffer)
  const writeString = (offset: number, value: string) => {
    for (let i = 0; i < value.length; i++) view.setUint8(offset + i, value.charCodeAt(i))
  }

  const dataBytes = samples.length * BYTES_PER_SAMPLE
  writeString(0, 'RIFF')
  view.setUint32(4, 36 + dataBytes, true)
  writeString(8, 'WAVE')
  writeString(12, 'fmt ')
  view.setUint32(16, 16, true) // fmt chunk length
  view.setUint16(20, 1, true) // 1 = uncompressed PCM
  view.setUint16(22, 1, true) // mono
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * BYTES_PER_SAMPLE, true) // byte rate
  view.setUint16(32, BYTES_PER_SAMPLE, true) // block align
  view.setUint16(34, 8 * BYTES_PER_SAMPLE, true) // bits per sample
  writeString(36, 'data')
  view.setUint32(40, dataBytes, true)

  let offset = WAV_HEADER_BYTES
  for (let i = 0; i < samples.length; i++, offset += BYTES_PER_SAMPLE) {
    // Clamp before scaling: decoded audio can sit slightly outside [-1, 1] and
    // would otherwise wrap around into loud noise.
    const s = Math.max(-1, Math.min(1, samples[i]))
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true)
  }

  return new Blob([buffer], { type: 'audio/wav' })
}

/**
 * Decode `blob` with the browser's own codecs and return it as WAV.
 *
 * Throws when the browser has no Web Audio support or cannot decode its own
 * recording; the caller treats that like any other voice failure and tells the
 * patient to type instead.
 */
export async function toWav(blob: Blob): Promise<Blob> {
  const Ctx = getAudioContextCtor()
  if (!Ctx) throw new Error('Web Audio is unavailable')

  const encoded = await blob.arrayBuffer()

  // A plain context is only used to DECODE. It is closed immediately: Safari
  // caps how many can exist at once, and leaking one per recording eventually
  // makes the mic stop working for the rest of the session.
  const decodeCtx = new Ctx()
  let decoded: AudioBuffer
  try {
    decoded = await decodeCtx.decodeAudioData(encoded)
  } finally {
    void decodeCtx.close().catch(() => {})
  }

  // Downmix to mono and resample to 16 kHz in one pass. OfflineAudioContext
  // does both correctly (and with a real anti-aliasing filter, which naive
  // sample-dropping does not).
  const frames = Math.max(1, Math.ceil(decoded.duration * TARGET_SAMPLE_RATE))
  const offline = new OfflineAudioContext(1, frames, TARGET_SAMPLE_RATE)
  const source = offline.createBufferSource()
  source.buffer = decoded
  source.connect(offline.destination)
  source.start()

  const rendered = await offline.startRendering()
  return encodeWav(rendered.getChannelData(0), TARGET_SAMPLE_RATE)
}
