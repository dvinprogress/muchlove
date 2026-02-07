import { describe, it, expect, beforeEach, vi } from 'vitest'
import { POST } from './route'
import { NextRequest } from 'next/server'

// Mock Supabase
vi.mock('@/lib/supabase/admin', () => ({
  getSupabaseAdmin: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: {
              id: 'test-event-id',
              sequence_id: 'test-sequence-id',
              company_id: 'test-company-id',
              status: 'pending',
            },
            error: null,
          })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          error: null,
        })),
      })),
    })),
  })),
}))

// Créer un mock pour verify qui sera configuré dans chaque test
import type { Mock } from 'vitest'
let mockVerify: Mock

// Mock Svix
vi.mock('svix', () => {
  return {
    Webhook: class MockWebhook {
      constructor(_secret: string) {}
      verify(rawBody: string, headers: Record<string, string>) {
        return mockVerify(rawBody, headers)
      }
    },
  }
})

describe('Resend Webhook Route', () => {
  const mockWebhookSecret = 'test-webhook-secret'

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.RESEND_WEBHOOK_SECRET = mockWebhookSecret
    mockVerify = vi.fn()
  })

  it('should reject webhook with invalid signature', async () => {
    // Mock Svix verify to throw error
    mockVerify.mockImplementation(() => {
      throw new Error('Invalid signature')
    })

    const request = new NextRequest('http://localhost:3000/api/webhooks/resend', {
      method: 'POST',
      headers: {
        'svix-id': 'test-id',
        'svix-timestamp': '1234567890',
        'svix-signature': 'invalid-signature',
      },
      body: JSON.stringify({
        type: 'email.sent',
        created_at: '2024-01-01T00:00:00Z',
        data: {
          created_at: '2024-01-01T00:00:00Z',
          email_id: 'test-email-id',
          from: 'noreply@muchlove.io',
          to: ['test@example.com'],
          subject: 'Test Email',
        },
      }),
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body).toEqual({ error: 'Invalid signature' })
    expect(mockVerify).toHaveBeenCalled()
  })

  it('should accept webhook with valid signature', async () => {
    // Mock Svix verify to return valid event
    const mockEvent = {
      type: 'email.sent',
      created_at: '2024-01-01T00:00:00Z',
      data: {
        created_at: '2024-01-01T00:00:00Z',
        email_id: 'test-email-id',
        from: 'noreply@muchlove.io',
        to: ['test@example.com'],
        subject: 'Test Email',
      },
    }
    mockVerify.mockReturnValue(mockEvent)

    const request = new NextRequest('http://localhost:3000/api/webhooks/resend', {
      method: 'POST',
      headers: {
        'svix-id': 'test-id',
        'svix-timestamp': '1234567890',
        'svix-signature': 'valid-signature',
      },
      body: JSON.stringify(mockEvent),
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({ received: true })
    expect(mockVerify).toHaveBeenCalled()
  })

  it('should reject webhook when RESEND_WEBHOOK_SECRET is not configured', async () => {
    delete process.env.RESEND_WEBHOOK_SECRET

    const request = new NextRequest('http://localhost:3000/api/webhooks/resend', {
      method: 'POST',
      headers: {
        'svix-id': 'test-id',
        'svix-timestamp': '1234567890',
        'svix-signature': 'test-signature',
      },
      body: JSON.stringify({
        type: 'email.sent',
        created_at: '2024-01-01T00:00:00Z',
        data: {
          created_at: '2024-01-01T00:00:00Z',
          email_id: 'test-email-id',
          from: 'noreply@muchlove.io',
          to: ['test@example.com'],
          subject: 'Test Email',
        },
      }),
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body).toEqual({ error: 'Internal error' })
  })

  it('should extract and pass correct Svix headers', async () => {
    mockVerify.mockReturnValue({
      type: 'email.delivered',
      created_at: '2024-01-01T00:00:00Z',
      data: {
        created_at: '2024-01-01T00:00:00Z',
        email_id: 'test-email-id',
        from: 'noreply@muchlove.io',
        to: ['test@example.com'],
        subject: 'Test Email',
      },
    })

    const svixHeaders = {
      'svix-id': 'msg_test123',
      'svix-timestamp': '1234567890',
      'svix-signature': 'v1,signature123',
    }

    const request = new NextRequest('http://localhost:3000/api/webhooks/resend', {
      method: 'POST',
      headers: svixHeaders,
      body: JSON.stringify({
        type: 'email.delivered',
        created_at: '2024-01-01T00:00:00Z',
        data: {
          created_at: '2024-01-01T00:00:00Z',
          email_id: 'test-email-id',
          from: 'noreply@muchlove.io',
          to: ['test@example.com'],
          subject: 'Test Email',
        },
      }),
    })

    await POST(request)

    expect(mockVerify).toHaveBeenCalledWith(
      expect.any(String), // rawBody
      svixHeaders
    )
  })
})
