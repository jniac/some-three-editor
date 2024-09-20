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