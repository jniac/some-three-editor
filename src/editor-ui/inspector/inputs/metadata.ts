import { parseSliderProps } from './slider'

export type InputMode =
  | null
  | 'slider'

export type InputMetadata = {
  mode: InputMode
  props: Record<string, any>
}

export const defaultMetadata: InputMetadata = {
  mode: null,
  props: {},
}

export function parseInputMetadata(str: string): InputMetadata {
  str = str.trim()

  if (/^slider/i.test(str)) {
    const paramsStr = str.slice('Slider'.length + 1, -1).trim()
    const props = parseSliderProps(paramsStr)
    return { mode: 'slider', props }
  }

  throw new Error(`Invalid property metadata: ${str}`)
}

