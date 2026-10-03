import SmartLink from '@/components/SmartLink'
import { siteConfig } from '@/lib/config'
import { useRouter } from 'next/router'
import CONFIG from '../config'

export default function Nav() {
  const router = useRouter()
  const links = siteConfig(
    'NOBELIUM_NAV_LINKS',
    CONFIG.NOBELIUM_NAV_LINKS,
    CONFIG
  )
  return (
    <header className='reading-header'>
      <SmartLink href='/' className='reading-brand'>
        {siteConfig('TITLE')}
      </SmartLink>
      <nav className='reading-nav' aria-label='主导航'>
        {links.map(link => {
          const path = router.asPath.split('?')[0]
          const current =
            link.href === '/archive'
              ? path.startsWith('/archive') || path.startsWith('/article/')
              : path === link.href || path.startsWith(`${link.href}/`)
          return (
            <SmartLink
              key={link.href}
              href={link.href}
              aria-current={current ? 'page' : undefined}
            >
              {link.name}
            </SmartLink>
          )
        })}
      </nav>
    </header>
  )
}
