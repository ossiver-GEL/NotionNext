import { buildCommentTree, countReplies } from '@/lib/plugins/notionComments'
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import CommentTurnstile from './CommentTurnstile'

const ROOT_PAGE_SIZE = 10
const REPLY_PAGE_SIZE = 2
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim()

const formatTime = value => {
  const date = new Date(value)
  const diff = Date.now() - date.getTime()
  if (Number.isNaN(diff)) return ''
  if (diff < 60 * 1000) return '刚刚'
  if (diff < 60 * 60 * 1000) return `${Math.floor(diff / 60000)} 分钟前`
  if (diff < 24 * 60 * 60 * 1000) {
    return `${Math.floor(diff / 3600000)} 小时前`
  }
  return date.toLocaleDateString()
}

const getInitial = name => (name || '?').trim().slice(0, 1).toUpperCase()

const NotionComments = ({ postId }) => {
  const formId = useId()
  const [comments, setComments] = useState([])
  const [content, setContent] = useState('')
  const [author, setAuthor] = useState('')
  const [nickname, setNickname] = useState('')
  const [website, setWebsite] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [preview, setPreview] = useState(false)
  const [sortOrder, setSortOrder] = useState('newest')
  const [replyTo, setReplyTo] = useState('')
  const [expandedReplies, setExpandedReplies] = useState({})
  const [visibleReplyCounts, setVisibleReplyCounts] = useState({})
  const [visibleRootCount, setVisibleRootCount] = useState(ROOT_PAGE_SIZE)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [verificationReset, setVerificationReset] = useState(0)
  const contentRef = useRef(null)

  const loadComments = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(
        `/api/notion-comments?postId=${encodeURIComponent(postId)}`
      )
      if (!response.ok) throw new Error('Failed to load comments')
      setComments(await response.json())
    } catch (error) {
      setError('评论加载失败，请重试')
    } finally {
      setLoading(false)
    }
  }, [postId])

  useEffect(() => {
    if (!postId) return
    void loadComments()
  }, [loadComments, postId])

  const commentTree = useMemo(() => {
    const direction = sortOrder === 'newest' ? -1 : 1
    return buildCommentTree(comments).sort(
      (a, b) => direction * (new Date(a.createdTime) - new Date(b.createdTime))
    )
  }, [comments, sortOrder])
  const visibleRoots = commentTree.slice(0, visibleRootCount)
  const replyTarget = comments.find(comment => comment.id === replyTo)

  const submitComment = async event => {
    event.preventDefault()
    if (!content.trim() || !author.trim() || !nickname.trim() || submitting)
      return
    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      setError('请先完成人机验证')
      return
    }

    setSubmitting(true)
    setError('')
    setNotice('')
    try {
      const response = await fetch('/api/notion-comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          content,
          author,
          nickname,
          parentId: replyTo,
          website,
          websiteUrl,
          turnstileToken
        })
      })
      const result = await response.json()
      if (!response.ok) {
        const messages = {
          'verification-failed': '人机验证未通过或已过期，请重新验证后提交。',
          'verification-unavailable': '人机验证暂时不可用，请稍后重试。'
        }
        throw new Error(
          messages[result.code] ||
            (response.status === 429
              ? '提交过于频繁，请稍后重试。'
              : '评论提交失败，请稍后重试')
        )
      }
      setContent('')
      setReplyTo('')
      setPreview(false)
      setNotice(
        result.pending ? '评论已提交，审核通过后显示。' : '评论已发布。'
      )
      if (replyTo) {
        setExpandedReplies(current => ({ ...current, [replyTo]: true }))
      }
      await loadComments()
    } catch (error) {
      setError(
        error.message.startsWith('人机验证') ||
          error.message.startsWith('提交过于频繁')
          ? error.message
          : '评论提交失败，请稍后重试'
      )
    } finally {
      if (TURNSTILE_SITE_KEY) {
        setTurnstileToken('')
        setVerificationReset(current => current + 1)
      }
      setSubmitting(false)
    }
  }

  const startReply = comment => {
    setReplyTo(comment.id)
    setPreview(false)
    setExpandedReplies(current => ({ ...current, [comment.id]: true }))
    setVisibleReplyCounts(current => ({
      ...current,
      [comment.id]: current[comment.id] || REPLY_PAGE_SIZE
    }))
    contentRef.current?.focus()
  }

  const toggleReplies = commentId => {
    setExpandedReplies(current => ({
      ...current,
      [commentId]: !current[commentId]
    }))
    setVisibleReplyCounts(current => ({
      ...current,
      [commentId]: current[commentId] || REPLY_PAGE_SIZE
    }))
  }

  const showMoreReplies = commentId => {
    setVisibleReplyCounts(current => ({
      ...current,
      [commentId]: (current[commentId] || REPLY_PAGE_SIZE) + REPLY_PAGE_SIZE
    }))
  }

  const renderComment = (comment, level = 0) => {
    const replies = comment.children || []
    const hasReplies = replies.length > 0
    const repliesOpen = expandedReplies[comment.id] || level > 0
    const replyCount = countReplies(comment)
    const visibleReplyCount = visibleReplyCounts[comment.id] || REPLY_PAGE_SIZE
    const visibleReplies =
      level === 0 ? replies.slice(0, visibleReplyCount) : replies

    return (
      <article
        key={comment.id}
        className={`nc-item flex gap-3 border-gray-200 py-4 dark:border-gray-700 ${
          level === 0 ? 'border-b' : 'border-l pl-3 sm:pl-4'
        }`}
      >
        <div className='nc-avatar flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white dark:bg-gray-100 dark:text-gray-900'>
          {getInitial(comment.author)}
        </div>
        <div className='min-w-0 flex-1'>
          <header className='nc-meta flex flex-wrap items-center gap-2 text-sm'>
            <span className='font-medium text-gray-900 dark:text-gray-100'>
              {comment.websiteUrl ? (
                <a
                  href={comment.websiteUrl}
                  target='_blank'
                  rel='nofollow ugc noopener noreferrer'
                >
                  {comment.author}
                </a>
              ) : (
                comment.author
              )}
            </span>
            <time className='text-gray-500 dark:text-gray-400'>
              {formatTime(comment.createdTime)}
            </time>
          </header>

          <p className='mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-gray-800 dark:text-gray-200'>
            {comment.content}
          </p>

          <div className='mt-2 flex flex-wrap items-center gap-3 text-sm'>
            <button
              type='button'
              className='text-blue-600 hover:underline dark:text-blue-400'
              onClick={() => startReply(comment)}
            >
              回复
            </button>

            {hasReplies && level === 0 && (
              <button
                type='button'
                className='text-gray-600 hover:underline dark:text-gray-300'
                onClick={() => toggleReplies(comment.id)}
              >
                {repliesOpen ? '收起回复' : `查看 ${replyCount} 条回复`}
              </button>
            )}
          </div>

          {hasReplies && repliesOpen && (
            <div className='mt-3 space-y-1'>
              {visibleReplies.map(child => renderComment(child, level + 1))}
              {level === 0 && visibleReplyCount < replies.length && (
                <button
                  type='button'
                  className='ml-12 text-sm text-gray-600 hover:underline dark:text-gray-300'
                  onClick={() => showMoreReplies(comment.id)}
                >
                  展开更多回复
                </button>
              )}
            </div>
          )}
        </div>
      </article>
    )
  }

  return (
    <section className='notion-comments space-y-5' aria-label='评论区'>
      <section className='nc-form rounded-md border border-gray-200 p-4 dark:border-gray-700'>
        <div className='nc-form-heading mb-3 flex items-center justify-between gap-3'>
          <h3 className='text-base font-semibold text-gray-900 dark:text-gray-100'>
            评论
          </h3>
          <span className='text-sm text-gray-500 dark:text-gray-400'>
            {comments.length} 条
          </span>
        </div>

        {replyTarget && (
          <div className='mb-3 flex items-center justify-between gap-3 rounded-md bg-gray-100 px-3 py-2 text-sm dark:bg-gray-800'>
            <span className='truncate'>正在回复 @{replyTarget.author}</span>
            <button
              type='button'
              className='shrink-0 text-gray-600 hover:underline dark:text-gray-300'
              onClick={() => setReplyTo('')}
            >
              取消
            </button>
          </div>
        )}

        <form
          className='space-y-3'
          onSubmit={event => {
            void submitComment(event)
          }}
        >
          <div className='nc-fields grid gap-4 sm:grid-cols-3'>
            <label htmlFor={`${formId}-nickname`} className='nc-field'>
              <span>昵称 *</span>
              <input
                id={`${formId}-nickname`}
                name='nickname'
                autoComplete='nickname'
                className='w-full min-w-0 border-b bg-transparent py-2 outline-none'
                maxLength={40}
                onChange={event => setNickname(event.target.value)}
                required
                value={nickname}
              />
            </label>
            <label htmlFor={`${formId}-email`} className='nc-field'>
              <span>邮箱 *</span>
              <input
                id={`${formId}-email`}
                name='email'
                autoComplete='email'
                className='w-full min-w-0 border-b bg-transparent py-2 outline-none'
                maxLength={254}
                onChange={event => setAuthor(event.target.value)}
                required
                type='email'
                value={author}
              />
            </label>
            <label htmlFor={`${formId}-url`} className='nc-field'>
              <span>网址（选填）</span>
              <input
                id={`${formId}-url`}
                name='url'
                autoComplete='url'
                className='w-full min-w-0 border-b bg-transparent py-2 outline-none'
                maxLength={2048}
                onChange={event => setWebsiteUrl(event.target.value)}
                type='url'
                value={websiteUrl}
                placeholder='https://'
              />
            </label>
          </div>
          <label htmlFor={`${formId}-content`} className='sr-only'>
            评论内容
          </label>
          <textarea
            id={`${formId}-content`}
            ref={contentRef}
            className={`nc-editor w-full bg-transparent text-sm leading-6 outline-none ${preview ? 'hidden' : ''}`}
            maxLength={500}
            onChange={event => setContent(event.target.value)}
            placeholder={
              replyTarget
                ? '写下回复…'
                : '仅支持纯文本。昵称和邮箱为必填项，邮箱不会公开。'
            }
            required
            rows={7}
            value={content}
          />
          {preview && (
            <div
              className='nc-preview whitespace-pre-wrap break-words text-sm leading-6'
              aria-label='评论预览'
            >
              {content || '还没有输入评论内容。'}
            </div>
          )}
          <input
            aria-hidden='true'
            autoComplete='off'
            className='hidden'
            onChange={event => setWebsite(event.target.value)}
            tabIndex={-1}
            value={website}
          />
          <div className='nc-toolbar flex items-center justify-between gap-4 text-sm'>
            <span className='nc-counter' aria-live='polite'>
              {content.length}/500
            </span>
            <div className='flex items-center gap-5'>
              <button
                type='button'
                className='nc-text-button'
                aria-pressed={preview}
                onClick={() => setPreview(value => !value)}
              >
                {preview ? '继续编辑' : '预览'}
              </button>
              <button
                type='submit'
                className='nc-submit rounded-md bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-40'
                disabled={
                  submitting ||
                  loading ||
                  (TURNSTILE_SITE_KEY && !turnstileToken) ||
                  !content.trim() ||
                  !nickname.trim() ||
                  !author.trim()
                }
              >
                {submitting ? '提交中…' : replyTarget ? '发布回复' : '发布'}
              </button>
            </div>
          </div>
          {TURNSTILE_SITE_KEY && (
            <CommentTurnstile
              siteKey={TURNSTILE_SITE_KEY}
              onTokenChange={setTurnstileToken}
              resetKey={verificationReset}
            />
          )}
        </form>
      </section>

      {notice && (
        <div className='rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-200'>
          {notice}
        </div>
      )}

      {error && (
        <div className='flex items-center justify-between gap-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200'>
          <span>{error}</span>
          <button
            type='button'
            className='underline'
            onClick={() => {
              void loadComments()
            }}
          >
            重试
          </button>
        </div>
      )}

      <section className='nc-list'>
        <div className='nc-list-heading flex items-center justify-between gap-4'>
          <h2>{comments.length} 条评论</h2>
          <select
            aria-label='评论排序'
            className='bg-transparent text-sm'
            value={sortOrder}
            onChange={event => {
              setSortOrder(event.target.value)
              setVisibleRootCount(ROOT_PAGE_SIZE)
            }}
          >
            <option value='newest'>最新评论</option>
            <option value='oldest'>最早评论</option>
          </select>
        </div>
        {loading ? (
          <div className='space-y-3'>
            {[0, 1, 2].map(item => (
              <div
                key={item}
                className='h-20 animate-pulse rounded-md bg-gray-100 dark:bg-gray-800'
              />
            ))}
          </div>
        ) : visibleRoots.length ? (
          <>
            <div>{visibleRoots.map(comment => renderComment(comment))}</div>
            {visibleRootCount < commentTree.length && (
              <button
                type='button'
                className='mt-4 w-full rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
                onClick={() =>
                  setVisibleRootCount(count => count + ROOT_PAGE_SIZE)
                }
              >
                加载更多评论
              </button>
            )}
          </>
        ) : (
          <p className='nc-empty py-8 text-sm text-gray-500 dark:text-gray-400'>
            还没有评论，来写第一条吧。
          </p>
        )}
      </section>
    </section>
  )
}

export default NotionComments
