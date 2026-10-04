const mockDatabaseRetrieve = jest.fn()
const mockDatabaseQuery = jest.fn()
const mockPageCreate = jest.fn()

jest.mock('@notionhq/client', () => ({
  Client: jest.fn(() => ({
    databases: { retrieve: mockDatabaseRetrieve, query: mockDatabaseQuery },
    pages: { create: mockPageCreate }
  }))
}))

describe('Notion comment storage', () => {
  let handler
  const previousEnv = { ...process.env }
  const response = () => {
    const res = { status: jest.fn(), json: jest.fn() }
    res.status.mockReturnValue(res)
    res.json.mockReturnValue(res)
    return res
  }
  const request = () => ({
    method: 'POST',
    headers: {},
    body: {
      postId: 'post-1',
      content: 'Hello',
      nickname: 'Reader',
      author: 'private@example.com',
      websiteUrl: 'https://example.com'
    }
  })

  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
    process.env.NOTION_COMMENT_DATABASE_ID = 'test-database'
    process.env.NOTION_TOKEN = 'test-token'
    process.env.NOTION_COMMENT_REQUIRE_APPROVAL = 'true'
    delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
    delete process.env.TURNSTILE_SECRET_KEY
    delete process.env.TURNSTILE_ALLOWED_HOSTNAMES
    global.fetch.mockReset()
    handler = require('@/pages/api/notion-comments').default
  })

  afterAll(() => {
    process.env = previousEnv
  })

  test('requires a moderation field before accepting a comment for approval', async () => {
    mockDatabaseRetrieve.mockResolvedValue({
      properties: { Website: { type: 'url' } }
    })
    const res = response()
    await handler(request(), res)
    expect(res.status).toHaveBeenCalledWith(503)
    expect(mockPageCreate).not.toHaveBeenCalled()
  })

  test('stores a pending comment and profile URL without returning its email', async () => {
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = 'test-site-key'
    process.env.TURNSTILE_SECRET_KEY = 'test-secret'
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        hostname: 'test.com',
        action: 'notion-comment'
      })
    })
    mockDatabaseRetrieve.mockResolvedValue({
      properties: {
        Status: { type: 'select' },
        Nickname: { type: 'rich_text' },
        Website: { type: 'url' }
      }
    })
    mockPageCreate.mockImplementation(async ({ properties }) => ({
      id: 'comment-1',
      properties: {
        ...properties,
        Nickname: { type: 'rich_text', rich_text: [{ plain_text: 'Reader' }] },
        Author: { type: 'email', email: 'private@example.com' },
        Website: { type: 'url', url: properties.Website.url },
        Status: { type: 'select', select: properties.Status.select }
      }
    }))
    const res = response()
    const req = request()
    req.body.turnstileToken = 'fresh-token'
    await handler(req, res)
    expect(mockPageCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        properties: expect.objectContaining({
          Status: { select: { name: 'Pending' } },
          Website: { url: 'https://example.com/' }
        })
      })
    )
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        pending: true,
        comment: expect.objectContaining({
          author: 'Reader',
          websiteUrl: 'https://example.com/'
        })
      })
    )
    expect(JSON.stringify(res.json.mock.calls)).not.toContain(
      'private@example.com'
    )
  })

  test('public reads omit pending comments and private email addresses', async () => {
    const page = status => ({
      id: status,
      properties: {
        Author: { type: 'email', email: 'private@example.com' },
        Nickname: { type: 'rich_text', rich_text: [{ plain_text: 'Reader' }] },
        Status: { type: 'select', select: { name: status } }
      }
    })
    mockDatabaseQuery.mockResolvedValue({
      results: [page('Pending'), page('Approved')],
      has_more: false
    })
    const res = response()
    await handler({ method: 'GET', query: { postId: 'post-1' } }, res)
    expect(res.json.mock.calls[0][0]).toHaveLength(1)
    expect(res.json.mock.calls[0][0][0].id).toBe('Approved')
    expect(JSON.stringify(res.json.mock.calls)).not.toContain(
      'private@example.com'
    )
  })

  test.each([undefined, 'expired-token'])(
    'blocks missing or rejected verification before accessing Notion (%s)',
    async turnstileToken => {
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = 'test-site-key'
      process.env.TURNSTILE_SECRET_KEY = 'test-secret'
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: false })
      })
      const req = request()
      req.body.turnstileToken = turnstileToken
      const res = response()
      await handler(req, res)
      expect(res.status).toHaveBeenCalledWith(403)
      expect(mockDatabaseRetrieve).not.toHaveBeenCalled()
      expect(mockPageCreate).not.toHaveBeenCalled()
    }
  )

  test('does not bypass verification when its service is unavailable', async () => {
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = 'test-site-key'
    process.env.TURNSTILE_SECRET_KEY = 'test-secret'
    global.fetch.mockRejectedValue(new Error('network unavailable'))
    const req = request()
    req.body.turnstileToken = 'fresh-token'
    const res = response()
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(503)
    expect(mockPageCreate).not.toHaveBeenCalled()
  })
})
