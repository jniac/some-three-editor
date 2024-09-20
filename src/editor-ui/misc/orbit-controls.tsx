import { Foldable } from '../atoms/foldable'

import styles from './orbit-controls.module.css'

export function OrbitControlsPanel() {
  return (
    <div className={styles.OrbitControlsPanel}>
      <Foldable
        title='Orbit Controls'
        content={() => (
          <>
            <div>eye</div>
            <div>

            </div>
          </>
        )}
      />
    </div>
  )
}