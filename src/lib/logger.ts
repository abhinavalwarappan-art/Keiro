/**
 * Lightweight structured logger for Keiro API routes.
 *
 * Rules enforced here:
 *   • NEVER log message content, patient input, or any PHI.
 *   • NEVER log full API keys or session tokens — tokens are truncated to last 6 chars.
 *   • In development: human-readable console output.
 *   • In production: newline-delimited JSON on stdout (captured by Vercel log drain).
 */

type Severity = 'info' | 'warn' | 'error'

interface LogEntry {
  timestamp: string
  severity: Severity
  event: string
  route: string
  sessionRef?: string  // last-6-chars of the anonymous user ID only — never the full token
  [key: string]: unknown
}

const IS_PROD = process.env.NODE_ENV === 'production'

/**
 * Truncate a token/ID to its last 6 characters for log correlation
 * without exposing the full credential.
 */
function shortRef(id: string | null | undefined): string {
  if (!id) return 'unknown'
  return `…${id.slice(-6)}`
}

function write(entry: LogEntry): void {
  if (IS_PROD) {
    // JSON on stdout — captured by Vercel log drain or any structured log aggregator
    process.stdout.write(JSON.stringify(entry) + '\n')
  } else {
    const { severity, event, route, sessionRef, timestamp, ...rest } = entry
    const prefix = `[${severity.toUpperCase()}] ${event} | ${route} | session=${sessionRef ?? 'unknown'}`
    const extras = Object.keys(rest).length ? ' ' + JSON.stringify(rest) : ''
    const line = `${timestamp} ${prefix}${extras}`
    if (severity === 'error') {
      process.stderr.write(line + '\n')
    } else if (severity === 'warn') {
      process.stderr.write(line + '\n')
    } else {
      process.stdout.write(line + '\n')
    }
  }
}

function buildEntry(
  severity: Severity,
  event: string,
  route: string,
  userId?: string | null,
  extra?: Record<string, unknown>
): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    severity,
    event,
    route,
    sessionRef: shortRef(userId),
    ...extra,
  }
}

export const logger = {
  info(event: string, route: string, userId?: string | null, extra?: Record<string, unknown>): void {
    write(buildEntry('info', event, route, userId, extra))
  },
  warn(event: string, route: string, userId?: string | null, extra?: Record<string, unknown>): void {
    write(buildEntry('warn', event, route, userId, extra))
  },
  error(event: string, route: string, userId?: string | null, extra?: Record<string, unknown>): void {
    write(buildEntry('error', event, route, userId, extra))
  },
}