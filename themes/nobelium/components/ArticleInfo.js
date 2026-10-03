import LazyImage from '@/components/LazyImage'
import SmartLink from '@/components/SmartLink'
import { getPageContentText } from '@/lib/db/notion/getPageContentText'
import { useMemo } from 'react'

export function ArticleInfo({ post }) {
  const count = useMemo(() => {
    if (!post?.blockMap) return 0
    return getPageContentText(post, post.blockMap).replace(/\s/g, '').length
  }, [post])
  return (
    <header className='reading-article-header'>
      <h1>{post?.title}</h1>
      {post?.type !== 'Page' && (
        <div className='reading-meta'>
          <time dateTime={post?.date?.start_date}>{post?.publishDay}</time>
          {count > 0 && (
            <span>
              约 {Math.max(1, Math.ceil(count / 400))} 分钟 · {count} 字
            </span>
          )}
          {post?.tags?.map(tag => (
            <SmartLink key={tag} href={`/tag/${encodeURIComponent(tag)}`}>
              #{tag}
            </SmartLink>
          ))}
        </div>
      )}
      {post?.pageCover && (
        <div className='reading-cover'>
          <LazyImage src={post.pageCover} alt='' width={720} height={480} />
        </div>
      )}
    </header>
  )
}
