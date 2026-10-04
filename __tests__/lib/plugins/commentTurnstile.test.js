import { verifyCommentTurnstile } from '@/lib/plugins/commentTurnstile'

describe('Comment Turnstile verification', () => {
  const previousEnv = { ...process.env }
  const cloudflareResponse = result => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => result })
  }

  beforeEach(() => {
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = 'test-site-key'
    process.env.TURNSTILE_SECRET_KEY = 'test-secret'
    process.env.TURNSTILE_ALLOWED_HOSTNAMES = 'blog.example.com'
    global.fetch.mockReset()
  })

  afterAll(() => {
    process.env = previousEnv
  })

  test('leaves existing sites unchanged when both keys are unset', async () => {
    delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
    delete process.env.TURNSTILE_SECRET_KEY
    expect(await verifyCommentTurnstile()).toEqual({ ok: true })
    expect(global.fetch).not.toHaveBeenCalled()
  })

  test.each(['NEXT_PUBLIC_TURNSTILE_SITE_KEY', 'TURNSTILE_SECRET_KEY'])(
    'fails closed when configuration is incomplete (%s)',
    async variable => {
      delete process.env[variable]
      expect(await verifyCommentTurnstile('token')).toMatchObject({
        ok: false,
        status: 503
      })
      expect(global.fetch).not.toHaveBeenCalled()
    }
  )

  test.each([undefined, '', {}, 'x'.repeat(2049)])(
    'rejects invalid token input (%s)',
    async token => {
      expect(await verifyCommentTurnstile(token)).toMatchObject({
        ok: false,
        status: 403
      })
      expect(global.fetch).not.toHaveBeenCalled()
    }
  )

  test('validates the token with Cloudflare and checks its hostname and action', async () => {
    cloudflareResponse({
      success: true,
      hostname: 'blog.example.com',
      action: 'notion-comment'
    })
    expect(await verifyCommentTurnstile('fresh-token')).toEqual({ ok: true })
    expect(global.fetch).toHaveBeenCalledWith(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ secret: 'test-secret', response: 'fresh-token' })
      })
    )
  })

  test.each([
    { success: false, 'error-codes': ['timeout-or-duplicate'] },
    { success: true, hostname: 'other.example.com', action: 'notion-comment' },
    { success: true, hostname: 'blog.example.com', action: 'login' }
  ])('rejects consumed tokens and mismatched challenges (%j)', async result => {
    cloudflareResponse(result)
    expect(await verifyCommentTurnstile('token')).toMatchObject({
      ok: false,
      status: 403
    })
  })

  test('uses the configured blog URL when an explicit hostname list is absent', async () => {
    delete process.env.TURNSTILE_ALLOWED_HOSTNAMES
    process.env.NEXT_PUBLIC_LINK = 'https://blog.example.com/some/path'
    cloudflareResponse({
      success: true,
      hostname: 'blog.example.com',
      action: 'notion-comment'
    })
    expect(await verifyCommentTurnstile('token')).toEqual({ ok: true })
  })

  test('refuses verification without a trusted hostname configuration', async () => {
    delete process.env.TURNSTILE_ALLOWED_HOSTNAMES
    delete process.env.NEXT_PUBLIC_LINK
    expect(await verifyCommentTurnstile('token')).toMatchObject({
      ok: false,
      status: 503
    })
    expect(global.fetch).not.toHaveBeenCalled()
  })

  test('does not accept network failures or malformed responses', async () => {
    global.fetch.mockRejectedValueOnce(new Error('network failure'))
    expect(await verifyCommentTurnstile('token')).toMatchObject({
      ok: false,
      status: 503
    })
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => {
        throw new Error('invalid JSON')
      }
    })
    expect(await verifyCommentTurnstile('token')).toMatchObject({
      ok: false,
      status: 503
    })
  })
})
