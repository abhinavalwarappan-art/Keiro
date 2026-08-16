import { describe, it, expect, vi, beforeEach } from 'vitest'
import { toWav } from '@/lib/audioWav'

/**
 * The WAV header is a contract with a decoder we don't control: Fish rejects
 * every container a browser records natively, so this re-encode is the only
 * thing standing between a patient's voice and a 400. A header field silently
 * off by one byte fails upstream, far from here, as "voice input failed".
 */

/** Samples the fake render pass will emit. */
let rendered = new Float32Array([0, 0.5, -0.5, 1, -1])

/** Constructor args the code passed to OfflineAudioContext. */
let offlineArgs: number[] = []

function stubWebAudio() {
  offlineArgs = []
  class FakeAudioContext {
    decodeAudioData = vi.fn(async () => ({ duration: rendered.length / 16_000 }) as AudioBuffer)
    close = vi.fn(async () => {})
  }
  class FakeOfflineAudioContext {
    destination = {}
    constructor(channels: number, frames: number, sampleRate: number) {
      offlineArgs = [channels, frames, sampleRate]
    }
    createBufferSource() {
      return { buffer: null, connect: vi.fn(), start: vi.fn() }
    }
    startRendering = vi.fn(async () => ({ getChannelData: () => rendered }))
  }
  vi.stubGlobal('AudioContext', FakeAudioContext)
  vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext)
}

async function wavBytes(): Promise<DataView> {
  const blob = await toWav(new Blob(['recorded'], { type: 'audio/webm' }))
  expect(blob.type).toBe('audio/wav')
  return new DataView(await blob.arrayBuffer())
}

const ascii = (view: DataView, offset: number, length: number) =>
  Array.from({ length }, (_, i) => String.fromCharCode(view.getUint8(offset + i))).join('')

beforeEach(() => {
  vi.unstubAllGlobals()
  rendered = new Float32Array([0, 0.5, -0.5, 1, -1])
})

describe('toWav', () => {
  it('emits a canonical 16 kHz mono 16-bit PCM header', async () => {
    stubWebAudio()
    const view = await wavBytes()

    expect(ascii(view, 0, 4)).toBe('RIFF')
    expect(ascii(view, 8, 4)).toBe('WAVE')
    expect(ascii(view, 12, 4)).toBe('fmt ')
    expect(view.getUint32(16, true)).toBe(16) // fmt chunk length
    expect(view.getUint16(20, true)).toBe(1) // uncompressed PCM
    expect(view.getUint16(22, true)).toBe(1) // mono
    expect(view.getUint32(24, true)).toBe(16_000) // sample rate
    expect(view.getUint32(28, true)).toBe(32_000) // byte rate = rate * blockAlign
    expect(view.getUint16(32, true)).toBe(2) // block align
    expect(view.getUint16(34, true)).toBe(16) // bits per sample
    expect(ascii(view, 36, 4)).toBe('data')
  })

  it('declares chunk sizes that match the bytes actually written', async () => {
    stubWebAudio()
    const view = await wavBytes()

    const dataBytes = rendered.length * 2
    expect(view.getUint32(40, true)).toBe(dataBytes) // data chunk size
    expect(view.getUint32(4, true)).toBe(36 + dataBytes) // RIFF size
    expect(view.byteLength).toBe(44 + dataBytes) // no trailing slack
  })

  it('scales floats to signed 16-bit without wrapping at full scale', async () => {
    stubWebAudio()
    const view = await wavBytes()

    expect(view.getInt16(44, true)).toBe(0)
    expect(view.getInt16(46, true)).toBe(0x3fff) // +0.5
    expect(view.getInt16(48, true)).toBe(-0x4000) // -0.5
    expect(view.getInt16(50, true)).toBe(0x7fff) // +1.0 full scale
    expect(view.getInt16(52, true)).toBe(-0x8000) // -1.0 full scale
  })

  it('clamps out-of-range samples instead of letting them wrap into noise', async () => {
    // decodeAudioData can return values slightly outside [-1, 1]; unclamped,
    // 1.2 would wrap to a large negative and be heard as a click.
    rendered = new Float32Array([1.2, -1.2])
    stubWebAudio()
    const view = await wavBytes()

    expect(view.getInt16(44, true)).toBe(0x7fff)
    expect(view.getInt16(46, true)).toBe(-0x8000)
  })

  it('resamples to 16 kHz mono regardless of what was recorded', async () => {
    stubWebAudio()
    await toWav(new Blob(['x'], { type: 'audio/mp4' }))
    const [channels, , sampleRate] = offlineArgs
    expect(channels).toBe(1)
    expect(sampleRate).toBe(16_000)
  })

  it('releases the decoding AudioContext so Safari does not run out', async () => {
    const closes: Array<() => void> = []
    class TrackingContext {
      decodeAudioData = vi.fn(async () => ({ duration: 0.001 }) as AudioBuffer)
      close = vi.fn(async () => { closes.push(() => {}) })
    }
    vi.stubGlobal('AudioContext', TrackingContext)
    vi.stubGlobal('OfflineAudioContext', class {
      destination = {}
      constructor(..._a: unknown[]) {}
      createBufferSource() { return { buffer: null, connect: vi.fn(), start: vi.fn() } }
      startRendering = async () => ({ getChannelData: () => new Float32Array([0]) })
    })

    await toWav(new Blob(['x'], { type: 'audio/webm' }))
    expect(closes).toHaveLength(1)
  })

  it('closes the context even when the recording cannot be decoded', async () => {
    const close = vi.fn(async () => {})
    vi.stubGlobal('AudioContext', class {
      decodeAudioData = vi.fn(async () => { throw new Error('corrupt') })
      close = close
    })

    await expect(toWav(new Blob(['x'], { type: 'audio/webm' }))).rejects.toThrow()
    expect(close).toHaveBeenCalled()
  })

  it('fails loudly when the browser has no Web Audio at all', async () => {
    vi.stubGlobal('AudioContext', undefined)
    await expect(toWav(new Blob(['x'], { type: 'audio/webm' }))).rejects.toThrow(/Web Audio/i)
  })
})
