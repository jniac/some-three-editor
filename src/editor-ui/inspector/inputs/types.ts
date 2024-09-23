


export const defaultInputOptions = {
  step: 1,
  stepSmall: .1,
  stepLarge: 10,
  dragRatio: .1,
}

export type InputOptions = typeof defaultInputOptions

export type InputOptionsDeclaration = Partial<InputOptions>

export type InputListeners = {
  onInput?: (key: string, input: string) => void

  onDragStart?: (key: string) => void
  onDragEnd?: (key: string) => void
  onDrag?: (key: string, value: number) => void
}

/**
 * Represents an atom in the inspector.
 *
 * Eg.:
 * ```
 * ['x', 'number']
 * ['color', ['red', 'green', 'blue']]
 * ['order', ['XYZ', 'YXZ', 'ZXY'], { flex: '0 0 6em' }]
 * ```
 */
export type AtomicInputType = [
  key: string, // sub-label

  type:
  | 'number'
  | 'slider'
  | 'string'
  | string[], // enums

  options?: Partial<{
    key: string | null // Alternative sub-label, `null` means no sub-label
    flex: string
  }>
]

