export function RotateSvg(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} color="currentColor">
        <circle cx={12} cy={12} r={10}></circle>
        <path d="M2 12c5.185 4.827 14.464 4.388 20 .356"></path>
        <path d="M11.537 2c-4.548 4.5-5.053 15 .457 20"></path>
      </g>
    </svg>
  )
}