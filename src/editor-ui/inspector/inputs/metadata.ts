import { parseSliderProps } from './slider'

export type InputMode =
  | null
  | 'slider'

export class InputMetadata {
  name: string | null = null
  mode: InputMode = null
  props: Record<string, any> = {}
}

export const defaultMetadata = new InputMetadata()

export function parseInputMetadata(str: string): InputMetadata {
  str = str.trim()

  const chunks = str.split(/\s*[;\n]\s*/)

  const metadata: InputMetadata = new InputMetadata()

  for (const chunk of chunks) {
    if (/^Slider/i.test(chunk)) {
      const paramsStr = chunk.slice('Slider'.length + 1, -1).trim()
      const props = parseSliderProps(paramsStr)
      metadata.mode = 'slider'
      Object.assign(metadata.props, props)
    }

    else if (/^Name/i.test(chunk)) {
      metadata.name = chunk.slice('Name'.length + 1, -1).trim()
    }

    else {
      throw new Error(`Invalid property metadata: ${str} (chunk: ${chunk})`)
    }
  }

  return metadata
}

