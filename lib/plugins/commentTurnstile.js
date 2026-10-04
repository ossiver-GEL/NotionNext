const SITEVERIFY_URL =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify'

const unavailable = () => ({
  ok: false,
  status: 503,
  code: 'verification-unavailable',
  error: 'Human verification is unavailable'
})

const rejected = () => ({
  ok: false,
  status: 403,
  code: 'verification-failed',
  error: 'Human verification failed'
})

const getAllowedHostnames = () => {
  const configured = process.env.TURNSTILE_ALLOWED_HOSTNAMES?.trim()
  if (configured) {
    return configured
      .split(',')
      .map(host => host.trim().toLowerCase())
      .filter(Boolean)
  }
  try {
    const url = new URL(process.env.NEXT_PUBLIC_LINK)
    return ['https:', 'http:'].includes(url.protocol)
      ? [url.hostname.toLowerCase()]
      : []
  } catch {
    return []
  }
}

export async function verifyCommentTurnstile(token) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim()
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim()
  // Existing sites can leave both keys unset. Partial setup must fail closed.
  if (!siteKey && !secret) return { ok: true }

  const hostnames = getAllowedHostnames()
  if (!siteKey || !secret || !hostnames.length) return unavailable()
  if (typeof token !== 'string' || !token.trim() || token.length > 2048) {
    return rejected()
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)
  try {
    const response = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, response: token }),
      signal: controller.signal
    })
    if (!response.ok) return unavailable()
    const result = await response.json()
    if (
      result?.success !== true ||
      result.action !== 'notion-comment' ||
      !hostnames.includes(String(result.hostname || '').toLowerCase())
    ) {
      const serviceErrors = [
        'internal-error',
        'invalid-input-secret',
        'missing-input-secret'
      ]
      return result?.['error-codes']?.some(code => serviceErrors.includes(code))
        ? unavailable()
        : rejected()
    }
    return { ok: true }
  } catch {
    return unavailable()
  } finally {
    clearTimeout(timeout)
  }
}
