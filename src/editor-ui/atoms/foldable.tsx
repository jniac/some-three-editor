import { useState } from 'react'

import FoldDownSvg from '../../svg/pure/fold-down.svg'
import FoldLeftSvg from '../../svg/pure/fold-left.svg'

import styles from './foldable.module.css'

export function Foldable({
  title = 'Fold Panel',
  closedByDefault,
  content,
}: Partial<{
  closedByDefault: boolean
  title: string
  content: () => React.ReactNode,
}>) {
  const [open, setOpen] = useState(closedByDefault !== undefined ? !closedByDefault : true)
  return (
    <div className={styles.Foldable}>
      <div className='flex flex-row items-center pb-1'>
        <div
          className='flex flex-row items-center cursor-pointer'
          onClick={() => setOpen(!open)}>
          {open
            ? <FoldDownSvg />
            : <FoldLeftSvg />
          }
          <span>
            {title}
          </span>
        </div>
      </div>

      {open && (
        <div>
          {content?.()}
        </div>
      )}
    </div>
  )

}