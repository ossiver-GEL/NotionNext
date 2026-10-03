import { uuidToId } from 'notion-utils'

export default function Catalog({ toc }) {
  if (!toc?.length) return null
  return (
    <details className='reading-toc'>
      <summary aria-label='展开或收起文章目录'>目录</summary>
      <nav aria-label='文章目录'>
        {toc.map(item => (
          <a
            key={item.id}
            href={`#${uuidToId(item.id)}`}
            style={{ paddingLeft: `${12 + item.indentLevel * 12}px` }}
          >
            {item.text}
          </a>
        ))}
      </nav>
    </details>
  )
}
