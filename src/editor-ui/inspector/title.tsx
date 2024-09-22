import { useState } from 'react'
import { Object3D } from 'three'

import { useObservableValue } from 'some-utils-react/hooks/observables'

import { useEditor, useEditorRenderOnRefresh } from '../../editor-provider'

import { StateButtons } from '../StateButtons'
import { SpanName } from '../components/name'
import { Separator } from '../panel/Separator'

import styles from './inspector.module.css'

function Parent({ parent }: { parent: Object3D }) {
  const editor = useEditor()
  return (
    <>
      <div
        className={styles.Parent}
        onClick={() => {
          editor.sceneSelection.set('Up To Parent', [parent!])
        }}
      >
        <SpanName object={parent} />
        <span>(parent)</span>
      </div>
      <Separator />
    </>
  )
}

function Children({ objectChildren }: { objectChildren: Object3D[] }) {
  const DEFAULT_MAX = 3
  const editor = useEditor()
  const [max, setMax] = useState(DEFAULT_MAX)
  return (
    <>
      <Separator />
      <div className={styles.Children}>
        {objectChildren.slice(0, max).map((child, index) => (
          <div
            key={child.uuid}
            onClick={() => {
              editor.sceneSelection.set('Down To Child', [child])
            }}
          >
            <SpanName object={child} />
            <span>(child {index})</span>
          </div>
        ))}
        {max < objectChildren.length && (
          <button onClick={() => setMax(Infinity)}>
            Show more children ({objectChildren.length - max})
          </button>
        )}
        {max === Infinity && objectChildren.length > DEFAULT_MAX && (
          <button onClick={() => setMax(DEFAULT_MAX)}>
            Show less children
          </button>
        )}
      </div>
    </>
  )
}

function TitleSingle({
  object,
}: {
  object: Object3D
}) {
  useEditorRenderOnRefresh()

  if (!object) {
    return (
      <div>Error!</div>
    )
  }

  const { name } = object
  return (
    <div className={styles.TitleSingle}>
      {object.parent?.parent && (
        <Parent parent={object.parent} />
      )}
      <h1
        className='require-hover-parent'
        style={{
          position: 'relative',
        }}
      >
        {name
          ? <span>{name}</span>
          : <span style={{ fontStyle: 'italic' }}>{object.constructor.name}</span>
        }

        <div
          className='flex flex-row items-center'
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            height: '100%',
          }}
        >
          <StateButtons
            visible={object.visible}
          />
        </div>
      </h1>

      <div className={styles.UUID}>
        {object.uuid}
      </div>

      {object.children.length > 0 && (
        <Children objectChildren={object.children} />
      )}
    </div>
  )
}

export function Title() {
  const editor = useEditor()
  const objects = [...useObservableValue(editor.sceneSelection.obs)]

  if (objects.length === 0) {
    return (
      <h1>
        <span>Inspector </span>
        <span className={styles.dim}>(No selection)</span>
      </h1>
    )
  }

  if (objects.length === 1) {
    return (
      <TitleSingle object={objects[0]} />
    )
  }

  return (
    <h1
      style={{
        color: 'var(--multiple-color)',
        fontStyle: 'italic',
      }}
    >
      Multiple Objects ({objects.length})
    </h1>
  )
}
