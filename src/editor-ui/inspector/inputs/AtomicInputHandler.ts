
import { handleKeyboard } from 'some-utils-dom/handle/keyboard'
import { handlePointer } from 'some-utils-dom/handle/pointer'
import { clamp01 } from 'some-utils-ts/math/basic'
import { formatNumber } from 'some-utils-ts/string/number'

import { InputMetadata } from './metadata'
import { sliderNormalize, SliderProps, sliderUnnormalize } from './slider'
import { AtomicInputType, InputListeners, InputOptions } from './types'

import s from './inputs.module.css'

// CSS for the slider gradient:
// console.log(createGradientStops('#fff8', '#fff0', { easing: 'out3', subdivisions: 7 }).join(', '))

export class AtomicInputHandler {
  private static nextId = 0

  id = AtomicInputHandler.nextId++

  atomNamespace: string
  atomType: AtomicInputType
  inputMetadata: InputMetadata
  inputOptions: InputOptions
  inputListeners: Partial<InputListeners>

  div: HTMLDivElement
  inputDiv: HTMLDivElement
  labelElement: HTMLLabelElement | null = null
  element: HTMLInputElement | HTMLSelectElement = null!

  singleValue: any = null
  isMultiple = false
  focused = false

  onExternalUpdate = () => { }

  constructor(
    atomNamespace: string,
    atomType: AtomicInputType,
    inputMetadata: InputMetadata,
    inputOptions: InputOptions,
    inputListeners: Partial<InputListeners> = {},
  ) {
    this.atomNamespace = atomNamespace
    this.atomType = atomType
    this.inputMetadata = inputMetadata
    this.inputOptions = inputOptions
    this.inputListeners = inputListeners

    const [key, type, options] = atomType
    const labelString = (options && 'key' in options) ? options.key : key

    const div = document.createElement('div')
    div.className = s.AtomicInput
    div.style.flex = `${options?.flex ?? 1}`
    this.div = div

    if (labelString) {
      this.createLabel(labelString)
    }

    const inputDiv = document.createElement('div')
    div.appendChild(inputDiv)
    this.inputDiv = inputDiv

    // Select(Enum):
    if (Array.isArray(type)) {
      this.createSelect(type)
    }
    // Slider:
    else if (type === 'slider') {
      this.createSlider()
    }
    // Number or String:
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
    this.labelElement!.classList.add(s.draggable)
    let preventDiv: HTMLDivElement | null = null
    let valueOnDragStart: number = 0
    handlePointer(this.labelElement!, {
      onHorizontalDragStart: () => {
        this.focus()
        this.div.classList.add(s.dragging)

        preventDiv = document.createElement('div')
        preventDiv.classList.add(s.WhileDragging)
        document.body.appendChild(preventDiv)

        valueOnDragStart = this.singleValue

        this.inputListeners.onDragStart?.(this.atomType[0])
      },
      onHorizontalDragStop: () => {
        this.blur()
        this.div.classList.remove(s.dragging)

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

    input.onfocus = () => this.focus()
    input.onblur = () => this.blur()
  }

  createSlider() {
    const sliderDiv = document.createElement('div')
    this.inputDiv.appendChild(sliderDiv)
    sliderDiv.className = s.Slider

    const slider = document.createElement('input')
    sliderDiv.appendChild(slider)
    slider.type = 'range'
    slider.min = '0'
    slider.max = '1'
    slider.step = 'any'
    slider.id = this.getInputId()
    slider.name = this.getInputName()
    this.element = slider

    const progressBar = document.createElement('div')
    sliderDiv.appendChild(progressBar)
    progressBar.className = s.ProgressBar

    const thinBar = document.createElement('div')
    sliderDiv.appendChild(thinBar)
    thinBar.className = s.ThinBar

    const overshootUpperBar = document.createElement('div')
    sliderDiv.appendChild(overshootUpperBar)
    overshootUpperBar.className = `${s.OvershootUpperBar} ${s.hidden}`

    const overshootLowerBar = document.createElement('div')
    sliderDiv.appendChild(overshootLowerBar)
    overshootLowerBar.className = `${s.OvershootLowerBar} ${s.hidden}`

    const updateSliderDivs = (sliderValue: number) => {
      const value = sliderNormalize(sliderValue, this.inputMetadata.props as SliderProps)
      progressBar.style.width = `${clamp01(value) * 100}%`
      thinBar.style.left = `calc(${value} * (100% - 2px))`
      overshootLowerBar.classList.toggle(s.hidden, value >= 0)
      overshootUpperBar.classList.toggle(s.hidden, value <= 1)
    }

    slider.oninput = () => {
      const rawValue = Number.parseFloat(slider.value)
      const value = sliderUnnormalize(rawValue, this.inputMetadata.props as SliderProps)
      updateSliderDivs(value)
      this.inputListeners.onInput?.(this.atomType[0], value.toString())
    }

    slider.onfocus = () => this.focus()
    slider.onblur = () => this.blur()

    this.onExternalUpdate = () => {
      const sliderValue = Number.parseFloat(this.singleValue)
      updateSliderDivs(sliderValue)
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

    select.onfocus = () => this.focus()
    select.onblur = () => this.blur()
  }

  focus() {
    this.focused = true
    this.div.classList.add(s.focus)
  }

  blur() {
    this.focused = false
    this.div.classList.remove(s.focus)
  }

  update(values: any[]) {
    // If the input is focused, don't update it (the user is typing):
    if (this.focused) {
      return
    }

    const [key, type] = this.atomType
    const singleValue = values[0][key]
    const isMultiple = values.length > 1 && values.some(value => value[key] !== singleValue)

    this.singleValue = singleValue
    this.isMultiple = isMultiple

    // Select(Enum):
    if (Array.isArray(type)) {
      const select = this.element as HTMLSelectElement
      if (select.value !== singleValue) {
        select.value = singleValue
      }
    }

    // Slider:
    else if (type === 'slider') {
      const slider = this.element as HTMLInputElement
      slider.value = singleValue
      this.onExternalUpdate()
    }

    // Number or String:
    else if (type === 'number' || type === 'string') {
      const input = this.element as HTMLInputElement

      this.div.classList.toggle(s.multiple, isMultiple)
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
