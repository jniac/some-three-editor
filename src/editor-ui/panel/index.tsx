import { Children, HTMLProps, ReactNode } from 'react'

import { Separator } from './Separator'

import styles from './style.module.css'

export function PanelBackground() {
  return (
    <div className={styles.PanelBackground} />
  )
}

function reduceWithSeparators(separatorCreator: (i: number) => ReactNode) {
  return (acc: any[], child: ReactNode, i: number) => {
    if (i > 0) {
      acc.push(<Separator key={i} />)
    }
    acc.push(child)
    return acc
  }
}

export function Panel(props: Partial<{ separators: boolean }> & HTMLProps<HTMLDivElement>) {
  const {
    separators = false,
    children,
    ...divProps
  } = props
  return (
    <div {...divProps}>
      <PanelBackground />
      <div className='z-10 max-h-full max-w-full flex flex-col w-full h-full overflow-hidden'>
        {separators
          ? Children
            .toArray(children)
            .reduce(reduceWithSeparators(i => <Separator key={i} />), [] as any[])
          : children}
      </div>
    </div>
  )
}