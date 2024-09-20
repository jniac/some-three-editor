import type { SVGProps } from 'react'

/**
 * from iconify:LucideMove3d
 */
export function MoveSvg(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}>
        <path d="M5 3v16h16M5 19l6-6"></path><path d="m2 6l3-3l3 3m10 10l3 3l-3 3"></path>
      </g>
    </svg>
  )
}