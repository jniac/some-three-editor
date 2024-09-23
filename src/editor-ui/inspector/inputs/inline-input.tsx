

import { useEffects } from 'some-utils-react/hooks/effects'

import { EditorContext } from '../../../editor-context'
import { useEditor } from '../../../editor-provider'

import { AtomicInputHandler } from './AtomicInputHandler'
import { AtomicInputType, defaultInputOptions, InputListeners, InputOptions, InputOptionsDeclaration } from './types'

import { getTemplate, Template } from './template'

import s from './inputs.module.css'

function* handleInlineInput(
  mainLabel: string,
  values: any[],
  template: Template,
  editor: EditorContext,
  container: HTMLDivElement,
  inputOptions: InputOptions,
  inputListeners: Partial<InputListeners>
) {
  const mainLabelElement = document.createElement('div')
  mainLabelElement.className = s.MainLabel
  mainLabelElement.textContent = `• ${mainLabel}`
  container.appendChild(mainLabelElement)

  const wrapper = document.createElement('div')
  container.appendChild(wrapper)

  // const inputs = template
  //   .map(atomType => new AtomicInputHandler(label, atomType, inputOptions, inputListeners))
  const inputs: AtomicInputHandler[] = []
  for (const atomType of template) {
    const input = new AtomicInputHandler(mainLabel, atomType, inputOptions, inputListeners)
    inputs.push(input)

    // Add an extra input for sliders:
    if (atomType[1] === 'slider') {
      const [label, _, options] = atomType
      const extraAtomType = [label, 'number', { ...options, flex: '.3' }] as AtomicInputType
      const extraInput = new AtomicInputHandler(label, extraAtomType, inputOptions, inputListeners)
      inputs.push(extraInput)
    }
  }


  for (const input of inputs) {
    wrapper.appendChild(input.div)
  }

  const update = () => {
    for (const atom of inputs) {
      atom.update(values)
    }
  }

  yield editor.three.onTick({ timeInterval: 1 / 12 }, update)

  yield () => {
    container.textContent = ''
  }
}

type InlineInputProps<T> = Partial<InputListeners & {
  label: string
  mode: 'regular' | 'slider' // Probably not the good name...
  template: Template
  options: InputOptionsDeclaration
  value: (() => Generator<T>) | T[]
}>

export function InlineInput<T extends object>(props: InlineInputProps<T>) {
  const {
    label: mainLabel = '...',
    mode = 'regular',
    template: templateArg,
    options,
    value,
    ...inputListeners
  } = props

  const values = value
    ? (Array.isArray(value) ? value : [...value()])
    : [{ x: 0 }]
  const editor = useEditor()

  const { ref } = useEffects<HTMLDivElement>(function* (div) {
    switch (mode) {
      case 'regular': {
        const template = templateArg ?? getTemplate(values[0])
        yield* handleInlineInput(
          mainLabel,
          values,
          template,
          editor,
          div,
          { ...defaultInputOptions, ...options },
          inputListeners
        )
        break
      }

      case 'slider': {
        yield* handleInlineInput(
          mainLabel,
          values,
          // In this case, the template is only a single slider:
          [[mainLabel, 'slider', { key: null }]],
          editor,
          div,
          { ...defaultInputOptions, ...options },
          inputListeners
        )
        break
      }

      default: {
        throw new Error(`Unknown mode: ${mode}`)
      }
    }
  }, 'always')

  return (
    <div
      ref={ref}
      className={s.InlineInput}
    />
  )
}
