import { Euler } from 'three'

import { AtomType } from './atom'

export type Template = AtomType[]

export const templates = new Map<any, Template>()

export function getTemplate(object: any) {
  const existing = templates.get(object.constructor)
  if (existing) {
    return existing
  }
  const template = [] as Template
  for (const key in object) {
    const type = typeof object[key]
    if (type === 'number' || type === 'string') {
      template.push([key, type])
    }
  }
  return template
}

// Initialize templates:

// Euler:
templates.set(Euler, [
  ['x', 'number'],
  ['y', 'number'],
  ['z', 'number'],
  ['order', ['XYZ', 'XZY', 'YXZ', 'YZX', 'ZXY', 'ZYX'], { key: 'or.', flex: '0 0 5.8em' }],
])
