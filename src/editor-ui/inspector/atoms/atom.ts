import { handlePointer } from 'some-utils-dom/handle/pointer'

import { handleKeyboard } from 'some-utils-dom/handle/keyboard'
import { formatNumber } from 'some-utils-ts/string/number'
import { InputListeners, InputOptions } from '../transform/types'

import styles from './transform.module.css'

export type AtomType = [
  key: string,
  type: 'number' | 'string' | string[],
  options?: Partial<{ flex: string, key: string | null }>
]

export class AtomHandler {
  private static nextId = 0

  id = AtomHandler.nextId++

  atomNamespace: string
  atomType: AtomType
  inputOptions: InputOptions
  inputListeners: Partial<InputListeners>

  div: HTMLDivElement
  inputDiv: HTMLDivElement
  labelElement: HTMLLabelElement | null = null
  element: HTMLInputElement | HTMLSelectElement = null!

  singleValue: any = null
  isMultiple = false
  focused = false

  constructor(atomNamespace: string, atomType: AtomType, inputOptions: InputOptions, inputListeners: Partial<InputListeners> = {}) {
    this.atomNamespace = atomNamespace
    this.atomType = atomType
    this.inputOptions = inputOptions
    this.inputListeners = inputListeners

    const [key, type, options] = atomType
    const labelString = (options && 'key' in options) ? options.key : key

    const div = document.createElement('div')
    div.className = styles.AtomicInput
    div.style.flex = `${options?.flex ?? 1}`
    this.div = div

    if (labelString) {
      this.createLabel(labelString)
    }

    const inputDiv = document.createElement('div')
    div.appendChild(inputDiv)
    this.inputDiv = inputDiv

    if (Array.isArray(type)) {
      this.createSelect(type)
    }

    else {
      this.createInput()
    }
  }

  getInputId() {
    return `input-${this.id}`
  }

  getInputName(): string {
    return `input-${this.atomNamespace}-${this.atomType[0]}`
  }

  createLabel(label: string) {
    const labelElement = document.createElement('label')
    labelElement.htmlFor = this.getInputId()
    labelElement.textContent = label
    this.div.appendChild(labelElement)
    this.labelElement = labelElement

    const [, type] = this.atomType
    if (type === 'number') {
      this.initDraggable()
    }
  }

  initDraggable() {
    this.labelElement!.classList.add(styles.draggable)
    let preventDiv: HTMLDivElement | null = null
    let valueOnDragStart: number = 0
    handlePointer(this.labelElement!, {
      onHorizontalDragStart: () => {
        this.focus()
        this.div.classList.add(styles.dragging)

        preventDiv = document.createElement('div')
        preventDiv.classList.add(styles.WhileDragging)
        document.body.appendChild(preventDiv)

        valueOnDragStart = this.singleValue

        this.inputListeners.onDragStart?.(this.atomType[0])
      },
      onHorizontalDragStop: () => {
        this.blur()
        this.div.classList.remove(styles.dragging)

        preventDiv?.remove()

        this.inputListeners.onDragEnd?.(this.atomType[0])
      },
      onHorizontalDrag: info => {
        const step =
          info.shiftKey ? this.inputOptions.stepLarge :
            info.altKey ? this.inputOptions.stepSmall :
              this.inputOptions.step

        const value = valueOnDragStart + info.movement.x * this.inputOptions.dragRatio * step
        this.element.value = formatNumber(value)

        this.inputListeners.onDrag?.(this.atomType[0], value)
      },
    })
  }

  createInput() {
    const input = document.createElement('input')
    input.type = 'text'
    input.id = this.getInputId()
    input.name = this.getInputName()
    this.inputDiv.appendChild(input)
    this.element = input

    handleKeyboard(input, [
      ['Enter', () => {
        input.blur()
        this.blur()
        this.inputListeners.onInput?.(this.atomType[0], input.value)
      }],
      ['Escape', () => {
        input.blur()
        this.blur()
      }],
    ])

    input.onfocus = () => {
      this.focus()
    }
    input.onblur = () => {
      this.blur()
    }
  }

  createSelect(options: string[]) {
    const select = document.createElement('select')
    select.id = this.getInputId()
    select.name = this.getInputName()
    this.inputDiv.appendChild(select)
    this.element = select

    for (const option of options) {
      const optionElement = document.createElement('option')
      optionElement.value = option
      optionElement.textContent = option
      select.appendChild(optionElement)
    }

    select.onfocus = () => {
      this.focus()
    }
    select.onblur = () => {
      this.blur()
    }
  }

  focus() {
    this.focused = true
    this.div.classList.add(styles.focus)
  }

  blur() {
    this.focused = false
    this.div.classList.remove(styles.focus)
  }

  update(values: any[]) {
    if (this.focused) {
      return
    }

    const [key, type] = this.atomType
    const singleValue = values[0][key]
    const isMultiple = values.length > 1 && values.some(value => value[key] !== singleValue)

    this.singleValue = singleValue
    this.isMultiple = isMultiple

    if (Array.isArray(type)) {
      const select = this.element as HTMLSelectElement
      if (select.value !== singleValue) {
        select.value = singleValue
      }
    }

    else if (type === 'number' || type === 'string') {
      const input = this.element as HTMLInputElement

      this.div.classList.toggle(styles.multiple, isMultiple)
      if (isMultiple) {
        input.value = ''
      }

      else {
        const newValue = type === 'number' ? formatNumber(singleValue) : singleValue
        if (input.value !== newValue) {
          input.value = newValue
        }
      }
    }
  }
}
