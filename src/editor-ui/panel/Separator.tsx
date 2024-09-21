'use client'

import s from './panel.module.css'

export function Separator() {
  return (
    <div className={s.Separator}>
      <div
        style={{
          backgroundColor: '#fff3',
          height: '1px',
        }} />
    </div>
  )
}
