import { describe, it, expect } from 'vitest'
import type { Event, Breadcrumb } from '@sentry/nextjs'

// Inline the beforeSend logic from sentry.client.config.ts so we can unit-test
// the PHI scrubbing contract without initialising Sentry in test.
function beforeSend(event: Event): Event {
  if (event.request) {
    delete event.request.data
    delete event.request.cookies
  }
  return event
}

// Inline the beforeBreadcrumb logic from sentry.client.config.ts
function beforeBreadcrumb(breadcrumb: Breadcrumb): Breadcrumb | null {
  if (breadcrumb.category === 'console') return null
  if (breadcrumb.category === 'xhr' || breadcrumb.category === 'fetch') {
    if (breadcrumb.data) {
      delete breadcrumb.data.body
      delete breadcrumb.data.requestBody
    }
  }
  return breadcrumb
}

describe('Sentry PHI scrubbing — beforeSend', () => {
  it('strips request body from events', () => {
    const event: Event = {
      request: {
        url: '/api/chat',
        data: JSON.stringify({ message: 'I have chest pain' }),
        cookies: { 'sb-token': 'abc123' },
      },
    }
    const result = beforeSend(event)
    expect(result.request?.data).toBeUndefined()
  })

  it('strips cookies from events', () => {
    const event: Event = {
      request: {
        url: '/api/chat',
        cookies: { 'sb-access-token': 'secret' },
      },
    }
    const result = beforeSend(event)
    expect(result.request?.cookies).toBeUndefined()
  })

  it('passes events without request through unchanged', () => {
    const event: Event = { message: 'background error' }
    const result = beforeSend(event)
    expect(result).toEqual(event)
  })
})

describe('Sentry PHI scrubbing — beforeBreadcrumb', () => {
  it('drops all console breadcrumbs (could contain user text)', () => {
    const breadcrumb: Breadcrumb = {
      category: 'console',
      message: 'User said: my symptoms are…',
      level: 'log',
    }
    const result = beforeBreadcrumb(breadcrumb)
    expect(result).toBeNull()
  })

  it('strips body from XHR breadcrumbs', () => {
    const breadcrumb: Breadcrumb = {
      category: 'xhr',
      data: { url: '/api/chat', body: '{"message":"I have diabetes"}', status_code: 200 },
    }
    const result = beforeBreadcrumb(breadcrumb)
    expect(result).not.toBeNull()
    expect(result?.data?.body).toBeUndefined()
  })

  it('strips body from fetch breadcrumbs', () => {
    const breadcrumb: Breadcrumb = {
      category: 'fetch',
      data: { url: '/api/report', requestBody: 'PHI here', method: 'POST' },
    }
    const result = beforeBreadcrumb(breadcrumb)
    expect(result?.data?.requestBody).toBeUndefined()
  })

  it('passes non-sensitive breadcrumbs through', () => {
    const breadcrumb: Breadcrumb = {
      category: 'navigation',
      data: { from: '/', to: '/history' },
    }
    const result = beforeBreadcrumb(breadcrumb)
    expect(result?.category).toBe('navigation')
  })
})