import { Euler } from 'three'

import { AtomicInputType } from './types'

export type Template = AtomicInputType[]

export const templates = new Map<any, Template>()

/**
 * Returns a template for the given object.
 * 
 * If there is no template for the object, a new one is created based on the 
 * object's properties.
 */
export function getTemplate(object: any) {
  if (!object) {
    console.log({ object })
    console.trace()
    debugger
  }

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
