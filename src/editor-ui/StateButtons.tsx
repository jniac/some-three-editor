import VisibilityOffSvg from '../svg/pure/visibility-off.svg'
import VisibilityOnSvg from '../svg/pure/visibility-on.svg'
import { EventWrapper } from './utils/EventWrapper'

import styles from './StateButtons.module.css'

export function StateButtons({
  visible = true,
  onVisibilityClick,
}: Partial<{
  visible: boolean
  onVisibilityClick: (event: EventWrapper) => void
}>) {
  return (
    <div className={styles.StateButtons}>
      <div
        onClick={event => {
          event.stopPropagation()
          onVisibilityClick?.(new EventWrapper(event.nativeEvent))
        }}
      >
        {visible
          ? (
            <div className='require-hover'>
              <VisibilityOnSvg />
            </div>
          )
          : (
            <div className='require-hover-fadein'>
              <VisibilityOffSvg />
            </div>
          )}
      </div>
    </div>

  )
}