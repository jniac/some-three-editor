import { ButtonHTMLAttributes } from 'react'

import { makeClassName } from 'some-utils-react/utils/classname'

import styles from './buttons.module.css'

export function SmallButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={makeClassName(styles.SmallButton, styles.outlined)} {...props} />
  )
}