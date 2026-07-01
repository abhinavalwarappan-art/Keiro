import * as Sentry from '@sentry/nextjs'

const isDev = process.env.NODE_ENV === 'development'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Disable in development so local testing doesn't pollute the dashboard
  enabled: !isDev,

  // Capture 10% of sessions for performance profiling in production
  tracesSampleRate: isDev ? 0 : 0.1,

  // Do NOT send full transaction/request URLs that could contain query params with PHI
  sendDefaultPii: false,

  beforeBreadcrumb(breadcrumb) {
    // Strip request body data from fetch/xhr breadcrumbs — never log message content or PHI
    if ((breadcrumb.type === 'http' || breadcrumb.category === 'fetch' || breadcrumb.category === 'xhr') && breadcrumb.data) {
      breadcrumb.data = {
        url: breadcrumb.data['url'],
        status_code: breadcrumb.data['status_code'],
        method: breadcrumb.data['method'],
      }
    }
    // Drop console breadcrumbs entirely (could contain user text)
    if (breadcrumb.category === 'console') return null
    return breadcrumb
  },
})