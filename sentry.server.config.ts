import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN,

  enabled: process.env.NODE_ENV !== 'development',

  // Server-side: capture all unhandled errors and promise rejections
  tracesSampleRate: 0.1,

  // Never send PII or request bodies
  sendDefaultPii: false,

  beforeSend(event, hint) {
    // Strip request body so patient input never appears in Sentry
    if (event.request) {
      delete event.request.data
      delete event.request.cookies
      delete event.request.headers
    }
    // Attach safe operational context only
    const err = hint?.originalException
    if (err instanceof Error) {
      event.extra = {
        errorName: err.name,
      }
    }
    return event
  },
})