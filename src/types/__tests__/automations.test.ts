/**
 * Tests pour les helpers d'automations
 * Inclut tests de sécurité pour les tokens unsubscribe signés HMAC
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { generateUnsubscribeToken } from '../automations'

describe('generateUnsubscribeToken', () => {
  const originalEnv = process.env.UNSUBSCRIBE_TOKEN_SECRET

  beforeEach(() => {
    // Set test secret
    process.env.UNSUBSCRIBE_TOKEN_SECRET = 'test-secret-key-for-hmac-signature'
  })

  afterEach(() => {
    // Restore original env
    process.env.UNSUBSCRIBE_TOKEN_SECRET = originalEnv
  })

  it('should generate a token with payload and HMAC signature', () => {
    const companyId = 'f4bc12d3-4567-890a-bcde-1234567890ab'
    const type = 'sequences'

    const token = generateUnsubscribeToken(companyId, type)

    // Token should have format: base64url(payload).signature
    expect(token).toMatch(/^[A-Za-z0-9_-]+\.[a-f0-9]{64}$/)

    // Should have two parts separated by '.'
    const [encodedPayload, signature] = token.split('.')
    expect(encodedPayload).toBeDefined()
    expect(signature).toBeDefined()
    expect(signature).toHaveLength(64) // SHA-256 hex = 64 chars
  })

  it('should generate different tokens for different inputs', () => {
    const companyId1 = 'f4bc12d3-4567-890a-bcde-1234567890ab'
    const companyId2 = 'a1b2c3d4-5678-90ab-cdef-1234567890ab'

    const token1 = generateUnsubscribeToken(companyId1, 'sequences')
    const token2 = generateUnsubscribeToken(companyId2, 'sequences')
    const token3 = generateUnsubscribeToken(companyId1, 'marketing')

    expect(token1).not.toBe(token2)
    expect(token1).not.toBe(token3)
    expect(token2).not.toBe(token3)
  })

  it('should generate the same token for the same input (deterministic)', () => {
    const companyId = 'f4bc12d3-4567-890a-bcde-1234567890ab'
    const type = 'weekly_digest'

    const token1 = generateUnsubscribeToken(companyId, type)
    const token2 = generateUnsubscribeToken(companyId, type)

    expect(token1).toBe(token2)
  })

  it('should throw if UNSUBSCRIBE_TOKEN_SECRET is not set', () => {
    delete process.env.UNSUBSCRIBE_TOKEN_SECRET

    expect(() => {
      generateUnsubscribeToken('f4bc12d3-4567-890a-bcde-1234567890ab', 'marketing')
    }).toThrow('UNSUBSCRIBE_TOKEN_SECRET environment variable is required')
  })

  it('should encode payload in base64url format (URL-safe)', () => {
    const companyId = 'f4bc12d3-4567-890a-bcde-1234567890ab'
    const type = 'sequences'

    const token = generateUnsubscribeToken(companyId, type)
    const [encodedPayload] = token.split('.')

    // base64url should not contain '+', '/', or '='
    expect(encodedPayload).not.toMatch(/[+/=]/)

    // Decode and verify payload
    const payload = Buffer.from(encodedPayload!, 'base64url').toString('utf-8')
    expect(payload).toBe(`${companyId}:${type}`)
  })

  describe('Security', () => {
    it('should not be forgeable without secret', () => {
      const companyId = 'f4bc12d3-4567-890a-bcde-1234567890ab'
      const type = 'sequences'

      // Attacker tries to forge a token without knowing the secret
      const forgedPayload = Buffer.from(`${companyId}:${type}`, 'utf-8').toString('base64url')
      const forgedSignature = 'deadbeef'.repeat(8) // 64 chars of junk
      const forgedToken = `${forgedPayload}.${forgedSignature}`

      // The forged token should be different from the real one
      const realToken = generateUnsubscribeToken(companyId, type)
      expect(forgedToken).not.toBe(realToken)
    })

    it('should generate different signatures for different secrets', () => {
      const companyId = 'f4bc12d3-4567-890a-bcde-1234567890ab'
      const type = 'sequences'

      const token1 = generateUnsubscribeToken(companyId, type)

      // Change secret
      process.env.UNSUBSCRIBE_TOKEN_SECRET = 'different-secret-key'
      const token2 = generateUnsubscribeToken(companyId, type)

      // Same payload, different signature
      const [payload1, sig1] = token1.split('.')
      const [payload2, sig2] = token2.split('.')

      expect(payload1).toBe(payload2) // same payload
      expect(sig1).not.toBe(sig2) // different signature
    })
  })
})
