import SmartLink from '@/components/SmartLink'
import { siteConfig } from '@/lib/config'
import LazyImage from '@/components/LazyImage'
import { resolveContactEmail } from '@/lib/plugins/mailEncrypt'

export default function Profile({ siteInfo }) {
  const github = siteConfig('CONTACT_GITHUB')
  const email = resolveContactEmail(siteConfig('CONTACT_EMAIL')).trim()
  return (
    <section className='reading-profile' aria-label='作者介绍'>
      {siteInfo?.icon && (
        <LazyImage
          src={siteInfo.icon}
          width={64}
          height={64}
          alt=''
          className='reading-avatar'
        />
      )}
      <div>
        <h1>{siteConfig('AUTHOR')}</h1>
        <p>{siteConfig('BIO')}</p>
        <div className='reading-social'>
          {github && (
            <SmartLink href={github} aria-label='GitHub'>
              <svg
                viewBox='0 0 24 24'
                width='22'
                height='22'
                fill='none'
                stroke='currentColor'
                strokeWidth='1.5'
                aria-hidden='true'
              >
                <path d='M9 19c-4 1-4-2-6-2m12 5v-4a3.5 3.5 0 0 0-1-3c3.5-.4 7-1.7 7-6a4.7 4.7 0 0 0-1.3-3.3 4.3 4.3 0 0 0-.1-3.3s-1.2-.4-3.6 1.3a12.3 12.3 0 0 0-6 0C7.6 2 6.4 2.4 6.4 2.4a4.3 4.3 0 0 0-.1 3.3A4.7 4.7 0 0 0 5 9c0 4.3 3.5 5.6 7 6a3.5 3.5 0 0 0-1 3v4' />
              </svg>
            </SmartLink>
          )}
          {email && (
            <a href={`mailto:${email}`} aria-label='发送邮件' title='发送邮件'>
              <svg
                viewBox='0 0 24 24'
                width='22'
                height='22'
                fill='none'
                stroke='currentColor'
                strokeWidth='1.5'
                aria-hidden='true'
              >
                <rect x='3' y='5' width='18' height='14' rx='2' />
                <path d='m3 6 9 7 9-7' />
              </svg>
            </a>
          )}
          <SmartLink href='/rss/feed.xml' aria-label='RSS 订阅'>
            <svg
              viewBox='0 0 24 24'
              width='22'
              height='22'
              fill='none'
              stroke='currentColor'
              strokeWidth='1.5'
              aria-hidden='true'
            >
              <circle cx='5' cy='19' r='1' fill='currentColor' />
              <path d='M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16' />
            </svg>
          </SmartLink>
        </div>
      </div>
    </section>
  )
}
