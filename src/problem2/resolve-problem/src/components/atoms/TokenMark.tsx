import { ReactSVG } from 'react-svg'
import { iconFile } from '@/lib/tokenIcons.ts'

const ICON_BASE =
  'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens'
const SYMBOL = /^[A-Za-z0-9]+$/

type Props = {
  symbol: string
  size?: number
}

function sanitize(svg: SVGSVGElement) {
  const nodes = [svg, ...svg.querySelectorAll('*')]
  for (const node of nodes) {
    for (const attr of [...node.attributes]) {
      const name = attr.name.toLowerCase()
      const href = name === 'href' || name === 'xlink:href'
      if (
        name.startsWith('on') ||
        (href && /^\s*javascript:/i.test(attr.value))
      ) {
        node.removeAttribute(attr.name)
      }
    }
  }
  svg.querySelectorAll('style, script').forEach((node) => node.remove())
}

export function TokenMark({ symbol, size = 24 }: Props) {
  const frame = { width: size, height: size }
  const file = iconFile(symbol)

  if (!SYMBOL.test(file)) {
    return (
      <span
        className="inline-grid shrink-0 place-items-center rounded-full bg-slate-800 font-mono text-[10px] leading-none text-slate-200"
        style={frame}
      >
        {symbol.slice(0, 3)}
      </span>
    )
  }

  return (
    <ReactSVG
      src={`${ICON_BASE}/${file}.svg`}
      wrapper="span"
      className="inline-grid shrink-0 place-items-center overflow-hidden rounded-full bg-slate-800 font-mono text-[10px] leading-none text-slate-200 [&_svg]:block [&_svg]:h-full [&_svg]:w-full"
      style={frame}
      beforeInjection={(svg) => {
        sanitize(svg)
        svg.setAttribute('width', '100%')
        svg.setAttribute('height', '100%')
      }}
      fallback={() => <>{symbol.slice(0, 3)}</>}
    />
  )
}
