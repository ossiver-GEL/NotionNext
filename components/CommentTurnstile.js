import Script from 'next/script'
import { useEffect, useRef, useState } from 'react'

const CommentTurnstile = ({ siteKey, onTokenChange, resetKey }) => {
  const containerRef = useRef(null)
  const widgetRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [theme, setTheme] = useState('auto')
  const [status, setStatus] = useState('正在加载人机验证…')
  const [canRetry, setCanRetry] = useState(false)

  useEffect(() => {
    const updateTheme = () => {
      setTheme(
        document.documentElement.classList.contains('dark') ? 'dark' : 'light'
      )
    }
    updateTheme()
    const observer = new MutationObserver(updateTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    onTokenChange('')
    if (!ready || !window.turnstile || !containerRef.current) return
    setStatus('请完成人机验证')
    setCanRetry(false)
    const needsRetry = message => {
      onTokenChange('')
      setStatus(message)
      setCanRetry(true)
    }
    try {
      widgetRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        action: 'notion-comment',
        theme,
        size: 'flexible',
        'response-field': false,
        callback: token => {
          onTokenChange(token)
          setStatus('人机验证已通过')
          setCanRetry(false)
        },
        'expired-callback': () => needsRetry('验证已过期，请重新验证'),
        'timeout-callback': () => needsRetry('验证超时，请重试'),
        'error-callback': () => {
          needsRetry('人机验证失败，请重试')
          return true
        }
      })
    } catch {
      needsRetry('人机验证加载失败，请刷新页面重试')
    }
    return () => {
      if (widgetRef.current !== null) {
        window.turnstile?.remove(widgetRef.current)
        widgetRef.current = null
      }
    }
  }, [ready, siteKey, theme, resetKey, onTokenChange])

  return (
    <div className='nc-verification space-y-2' aria-label='人机验证'>
      <Script
        id='notion-comments-turnstile'
        src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
        strategy='afterInteractive'
        onReady={() => setReady(true)}
        onError={() => {
          onTokenChange('')
          setStatus('人机验证加载失败，请刷新页面重试')
        }}
      />
      <div ref={containerRef} />
      <div className='flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400'>
        <span role='status'>{status}</span>
        {canRetry && (
          <button
            type='button'
            className='underline'
            onClick={() => {
              if (widgetRef.current === null || !window.turnstile) return
              onTokenChange('')
              setStatus('请完成人机验证')
              setCanRetry(false)
              window.turnstile.reset(widgetRef.current)
            }}
          >
            重新验证
          </button>
        )}
      </div>
    </div>
  )
}

export default CommentTurnstile
