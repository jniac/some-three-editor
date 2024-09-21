import { Children, HTMLProps, ReactNode } from 'react'

import { makeClassName as mc } from 'some-utils-react/utils/classname'

import { Separator } from './Separator'

import ms from '../main.module.css'
import s from './panel.module.css'

export function PanelBackground() {
  return (
    <div className={mc(ms.Abs0, s.PanelBackground)} />
  )
}

function reduceWithSeparators(separatorCreator: (i: number) => ReactNode) {
  return (acc: any[], child: ReactNode, i: number) => {
    if (i > 0) {
      acc.push(separatorCreator(i))
    }
    acc.push(child)
    return acc
  }
}

export function Panel(props: Partial<{ separators: boolean }> & HTMLProps<HTMLDivElement>) {
  const {
    separators = false,
    className,
    children,
    ...divProps
  } = props
  return (
    <div className={mc(s.Panel, className)} {...divProps}>
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