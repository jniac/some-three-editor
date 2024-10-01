
import { evaluate } from 'mathjs'
import { useRef } from 'react'
import { Object3D } from 'three'

import { TransformAction } from '../../../editor-context'
import { useEditor, useEditorRenderOnRefresh } from '../../../editor-provider'
import { Foldable } from '../../components/foldable'
import { InlineInput } from '../inputs/inline-input'

import s from './transform.module.css'

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
      <InlineInput
        mainLabel='Position'
        value={objects.map(object => object.position)}
        onInput={onInput('position')}
        onDragStart={dragStart('position')}
        onDrag={drag('position')}
        onDragEnd={dragEnd}
      />
      <InlineInput
        mainLabel='Rotation'
        value={objects.map(object => object.rotation)}
        onInput={onInput('rotation')}
        onDragStart={dragStart('rotation')}
        onDrag={drag('rotation')}
        onDragEnd={dragEnd}
      />
      <InlineInput
        mainLabel='Scale'
        value={objects.map(object => object.scale)}
        onInput={onInput('scale')}
        onDragStart={dragStart('scale')}
        onDrag={drag('scale')}
        onDragEnd={dragEnd}
      />
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
    <div style={{ color: objects.length === 1 ? 'inherit' : 'var(--multiple-color)' }}>
      <Foldable
        title='Transform'
        content={() => (
          <TransformInspector objects={objects} />
        )}
      />
    </div>
  )
}