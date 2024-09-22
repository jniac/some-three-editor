
import { evaluate } from 'mathjs'
import { useRef } from 'react'
import { Object3D } from 'three'

import { useEffects } from 'some-utils-react/hooks/effects'

import { EditorContext, TransformAction } from '../../../editor-context'
import { useEditor, useEditorRenderOnRefresh } from '../../../editor-provider'
import { Foldable } from '../../components/foldable'

import { AtomHandler } from '../atoms/atom'
import { defaultInputOptions, InputListeners, InputOptions, InputOptionsDeclaration } from './types'

import { getTemplate, Template } from '../atoms/template'
import s from './transform.module.css'

function* handleInlineInput(
  label: string,
  values: any[],
  template: Template,
  editor: EditorContext,
  container: HTMLDivElement,
  inputOptions: InputOptions,
  inputListeners: Partial<InputListeners>
) {
  const mainLabelElement = document.createElement('div')
  mainLabelElement.className = s.MainLabel
  mainLabelElement.textContent = `• ${label}`
  container.appendChild(mainLabelElement)

  const atomicWrapper = document.createElement('div')
  container.appendChild(atomicWrapper)

  const atoms = template
    .map(atomType => new AtomHandler(label, atomType, inputOptions, inputListeners))

  for (const atom of atoms) {
    atomicWrapper.appendChild(atom.div)
  }

  const update = () => {
    for (const atom of atoms) {
      atom.update(values)
    }
  }

  yield editor.three.onTick({ timeInterval: 1 / 12 }, update)

  yield () => {
    container.textContent = ''
  }
}

type InlineInputProps<T> = Partial<InputListeners & {
  options: InputOptionsDeclaration
  label: string
  value: (() => Generator<T>) | T[]
}>

function InlineInput<T extends object>(props: InlineInputProps<T>) {
  const {
    label = '...',
    options,
    value: valueGenerator,
    ...inputListeners
  } = props

  const values = valueGenerator
    ? (Array.isArray(valueGenerator) ? valueGenerator : [...valueGenerator()])
    : [{ x: 0 }]
  const template = getTemplate(values[0])
  const editor = useEditor()

  const { ref } = useEffects<HTMLDivElement>(function* (div) {
    yield* handleInlineInput(
      label,
      values,
      template,
      editor,
      div,
      { ...defaultInputOptions, ...options },
      inputListeners)
  }, 'always')

  return (
    <div
      ref={ref}
      className={s.InlineInput}
    />
  )
}

function TransformInspector({
  objects,
}: {
  objects: Object3D[]
}) {
  const editor = useEditor()

  const onInput = (tranformKey: string) => (valueKey: string, input: string): void => {
    try {
      const action = new TransformAction(objects)
        .beforeSnapshot()

      for (let i = 0, n = objects.length; i < n; i++) {
        const transformEntry = (objects[i] as any)[tranformKey]
        const t = n === 0 ? 0 : i / (n - 1)
        const value = evaluate(input, { i, n, t })
        if (typeof value === 'number') {
          transformEntry[valueKey] = value
        }
      }

      action
        .afterSnapshot()
        .comment(`Set "${valueKey}" ${tranformKey} (${input})`)
        .flush(editor)

    } catch (error) {
      console.log(error)
    }
  }

  const dragAction = useRef<TransformAction | null>(null)
  const dragStart = (transformKey: string) => (key: string) => {
    dragAction.current = new TransformAction(objects)
      .comment(`Dragging "${key}" ${transformKey}`)
      .beforeSnapshot()
  }
  const dragEnd = () => {
    dragAction.current!
      .afterSnapshot()
      .flush(editor)
  }
  const drag = (transformKey: string) => (key: string, value: number) => {
    for (const object of objects) {
      const transformEntry = (object as any)[transformKey]
      transformEntry[key] = value
    }
  }

  return (
    <div className={s.TransformPanel}>
      <div className={s.Lines}>
        <InlineInput
          label='Position'
          value={objects.map(object => object.position)}
          onInput={onInput('position')}
          onDragStart={dragStart('position')}
          onDrag={drag('position')}
          onDragEnd={dragEnd}
        />
        <InlineInput
          label='Rotation'
          value={objects.map(object => object.rotation)}
          onInput={onInput('rotation')}
          onDragStart={dragStart('rotation')}
          onDrag={drag('rotation')}
          onDragEnd={dragEnd}
        />
        <InlineInput
          label='Scale'
          value={objects.map(object => object.scale)}
          onInput={onInput('scale')}
          onDragStart={dragStart('scale')}
          onDrag={drag('scale')}
          onDragEnd={dragEnd}
        />
      </div>
    </div>
  )
}

export function TransformPanel() {
  const editor = useEditor()
  useEditorRenderOnRefresh()
  const objects = [...editor.sceneSelection.objects]

  if (objects.length === 0) {
    return <div>...</div>
  }

  return (
    <div style={{ fontSize: 'var(--font-size-small)', color: objects.length === 1 ? 'inherit' : 'var(--multiple-color)' }}>
      <Foldable
        title='Transform'
        content={() => (
          <TransformInspector objects={objects} />
        )}
      />
    </div>
  )
}