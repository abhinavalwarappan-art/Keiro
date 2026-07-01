import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Must stub process.env before importing the module so IS_PROD is evaluated correctly
describe('logger — PHI safety', () => {
  let writeSpy: ReturnType<typeof vi.spyOn>

  beforeEach(async () => {
    // Reset module registry so IS_PROD const re-evaluates after each env change
    vi.resetModules()
    // The logger writes through process.stdout in every mode — assert against this.
    writeSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
  })

  it('never logs a full user ID — only the last 6 chars', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    const { logger } = await import('@/lib/logger')
    const fullId = 'usr_abcdef123456789xyz'
    logger.info('test_event', '/api/test', fullId)
    const logged = writeSpy.mock.calls[0]?.[0] as string
    expect(logged).not.toContain(fullId)
    expect(logged).toContain('…789xyz') // last 6 chars of fullId
  })

  it('logs "unknown" when user ID is null', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    const { logger } = await import('@/lib/logger')
    logger.info('test_event', '/api/test', null)
    const logged = writeSpy.mock.calls[0]?.[0] as string
    expect(logged).toContain('session=unknown')
  })

  it('outputs valid JSON in production mode', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    const { logger } = await import('@/lib/logger')
    logger.warn('rate_limit_exceeded', '/api/chat', 'user-abc123')
    const rawOutput = (writeSpy.mock.calls[0]?.[0] as string).trim()
    expect(() => JSON.parse(rawOutput)).not.toThrow()
    const entry = JSON.parse(rawOutput)
    expect(entry.severity).toBe('warn')
    expect(entry.event).toBe('rate_limit_exceeded')
    expect(entry.route).toBe('/api/chat')
    expect(entry.sessionRef).toBe('…abc123')
    // Crucially: no full user ID
    expect(rawOutput).not.toContain('user-abc123')
  })

  it('production JSON entry has required fields and no extra PHI keys', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    const { logger } = await import('@/lib/logger')
    logger.error('auth_failed', '/api/report', 'user-xyz')
    const entry = JSON.parse((writeSpy.mock.calls[0]?.[0] as string).trim())
    // Required structural fields
    expect(entry).toHaveProperty('timestamp')
    expect(entry).toHaveProperty('severity', 'error')
    expect(entry).toHaveProperty('event', 'auth_failed')
    expect(entry).toHaveProperty('route', '/api/report')
    expect(entry).toHaveProperty('sessionRef')
    // Must NOT contain raw user identifier
    expect(JSON.stringify(entry)).not.toContain('user-xyz')
  })
})