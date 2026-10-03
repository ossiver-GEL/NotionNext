import { Moon, Sun } from '@/components/HeroIcons'
import SmartLink from '@/components/SmartLink'
import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'

export function Footer() {
  const { isDarkMode, toggleDarkMode } = useGlobal()
  const year = new Date().getFullYear()
  const since = Number(siteConfig('SINCE'))
  return (
    <footer className='reading-footer'>
      <p>
        © {since < year ? `${since}–${year}` : year} {siteConfig('AUTHOR')}
      </p>
      <p>
        Powered by{' '}
        <SmartLink href='https://github.com/notionnext-org/NotionNext'>
          NotionNext
        </SmartLink>
        <span className='reading-footer-dot'>·</span>
        <SmartLink href='/rss/feed.xml'>RSS</SmartLink>
      </p>
      <button
        type='button'
        className='reading-theme-toggle'
        onClick={toggleDarkMode}
        aria-label={isDarkMode ? '切换为浅色模式' : '切换为深色模式'}
      >
        {isDarkMode ? <Sun /> : <Moon />}
      </button>
    </footer>
  )
}
