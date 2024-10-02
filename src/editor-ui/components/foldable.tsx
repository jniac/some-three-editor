import React, { useState } from 'react'

import FoldDownSvg from '../../svg/pure/fold-down.svg'
import FoldLeftSvg from '../../svg/pure/fold-left.svg'

import s from './foldable.module.css'

type Props = Partial<{
  closedByDefault: boolean
  title: string
  content: () => React.ReactNode,
}>

export function Foldable(props: Props) {
  const {
    title = 'Fold Panel',
    closedByDefault,
    content,
  } = props
  const [open, setOpen] = useState(closedByDefault !== undefined ? !closedByDefault : true)
  return (
    <div className={s.Foldable}>
      <div
        onClick={() => setOpen(!open)}>
        {open
          ? <FoldDownSvg />
          : <FoldLeftSvg />
        }
        <span>
          {title}
        </span>
      </div>

      {open && (
        <div>
          {content?.()}
        </div>
      )}
    </div>
  )

}