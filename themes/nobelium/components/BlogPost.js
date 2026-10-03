import SmartLink from '@/components/SmartLink'

export default function BlogPost({ post }) {
  const date = post?.date?.start_date?.slice(0, 10) || post?.publishDay
  return (
    <article className='reading-post-row'>
      <time dateTime={post?.date?.start_date}>{date}</time>
      <h2>
        <SmartLink href={post.href || `/${post.slug}`}>
          {post.title || '无题'}
          {post.password && (
            <svg
              className='reading-lock'
              viewBox='0 0 16 16'
              width='14'
              height='14'
              fill='none'
              stroke='currentColor'
              role='img'
              aria-label='需要密码'
            >
              <rect x='4' y='7' width='8' height='7' rx='1.5' />
              <path d='M5.5 7V5a2.5 2.5 0 0 1 5 0v2' />
            </svg>
          )}
        </SmartLink>
      </h2>
    </article>
  )
}
