const MAX_POST_ID_LENGTH = 200
const MAX_CONTENT_LENGTH = 2000
const MAX_EMAIL_LENGTH = 254
const MAX_NICKNAME_LENGTH = 40
const PUBLIC_COMMENT_STATUS = 'Approved'

const getPlainText = property => {
  if (!property) return ''
  const items =
    property.type === 'title'
      ? property.title
      : property.type === 'rich_text'
        ? property.rich_text
        : []
  return items.map(item => item.plain_text || '').join('')
}

const isEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

const normalizeEmail = email => email.trim().toLowerCase()

const normalizeWebsiteUrl = value => {
  if (!value) return ''
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol) &&
      !url.username &&
      !url.password
      ? url.href
      : ''
  } catch {
    return ''
  }
}

const getCommentStatus = props => {
  const status = props.Status
  if (!status) return ''
  if (status.type === 'select') return status.select?.name || ''
  if (status.type === 'status') return status.status?.name || ''
  return ''
}

const validateCommentPayload = body => {
  const postId = String(body?.postId || '').trim()
  const content = String(body?.content || '').trim()
  const author = String(body?.author || '').trim()
  const nickname = String(body?.nickname || '').trim()
  const parentId = body?.parentId ? String(body.parentId).trim() : ''
  const website = String(body?.website || '').trim()
  const websiteInput = String(body?.websiteUrl || '').trim()
  const websiteUrl = normalizeWebsiteUrl(websiteInput)

  if (website) {
    return { ok: true, spam: true, value: {} }
  }
  if (!postId || postId.length > MAX_POST_ID_LENGTH) {
    return { ok: false, error: 'Invalid postId' }
  }
  if (!content || content.length > MAX_CONTENT_LENGTH) {
    return { ok: false, error: 'Invalid content' }
  }
  if (!author || author.length > MAX_EMAIL_LENGTH || !isEmail(author)) {
    return { ok: false, error: 'Invalid author email' }
  }
  if (nickname.length > MAX_NICKNAME_LENGTH) {
    return { ok: false, error: 'Invalid nickname' }
  }
  if (websiteInput && (websiteInput.length > 2048 || !websiteUrl)) {
    return { ok: false, error: 'Invalid website URL' }
  }
  if (parentId && parentId.length > 100) {
    return { ok: false, error: 'Invalid parentId' }
  }

  return {
    ok: true,
    value: {
      postId,
      content,
      author: normalizeEmail(author),
      nickname,
      websiteUrl,
      parentId
    }
  }
}

const formatNotionComment = page => {
  const props = page?.properties || {}
  const author = props.Author?.type === 'email' ? props.Author.email : ''
  const nickname = getPlainText(props.Nickname)

  const comment = {
    id: page.id,
    postId: getPlainText(props.PostId),
    parentId: getPlainText(props.ParentId) || null,
    content: getPlainText(props.Content),
    author: nickname || (author ? author.split('@')[0] : 'anonymous'),
    emailHash: getPlainText(props.EmailHash),
    level: props.Level?.type === 'number' ? props.Level.number || 1 : 1,
    status: getCommentStatus(props),
    createdTime:
      props.CreatedAt?.type === 'date'
        ? props.CreatedAt.date?.start || page.created_time
        : page.created_time
  }
  const websiteUrl = normalizeWebsiteUrl(props.Website?.url || '')
  if (websiteUrl) comment.websiteUrl = websiteUrl
  return comment
}

const isPublicComment = comment =>
  !comment.status || comment.status === PUBLIC_COMMENT_STATUS

const buildCommentTree = comments => {
  const map = new Map()
  const roots = []

  comments.forEach(comment => map.set(comment.id, { ...comment, children: [] }))
  comments.forEach(comment => {
    const node = map.get(comment.id)
    if (comment.parentId && map.has(comment.parentId)) {
      map.get(comment.parentId).children.push(node)
    } else {
      roots.push(node)
    }
  })

  return roots
}

const countReplies = comment =>
  (comment.children || []).reduce(
    (count, child) => count + 1 + countReplies(child),
    0
  )

module.exports = {
  MAX_CONTENT_LENGTH,
  MAX_NICKNAME_LENGTH,
  PUBLIC_COMMENT_STATUS,
  buildCommentTree,
  countReplies,
  formatNotionComment,
  getPlainText,
  isPublicComment,
  normalizeEmail,
  normalizeWebsiteUrl,
  validateCommentPayload
}
