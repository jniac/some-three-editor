import { BufferGeometry } from 'three'

import { useEditor, useEditorRenderOnRefresh } from '../../editor-provider'

import { Foldable } from '../atoms/foldable'
import { Separator } from '../panel/Separator'
import { Title } from './title'
import { TransformPanel } from './transform/transform'

import styles from './inspector.module.css'

function GeometryPanel({ geometry }: { geometry: BufferGeometry }) {
  return (
    <div style={{ fontSize: 'var(--font-size-small)' }}>
      <Foldable
        title='Geometry'
        content={() => (
          <>
            <div style={{ fontSize: 'var(--font-size-tiny)' }}>{geometry.uuid}</div>
            <div className={styles.Geometry}>
              <div>vertices: {geometry.attributes.position?.count ?? 'ø'}</div>
              {geometry.index && (
                <div>triangles (index): {geometry.index.count / 3}</div>
              )}
              <div className='flex flex-row gap-1'>
                <span>attributes:</span>
                {Object.keys(geometry.attributes).map(key => (
                  <div
                    key={key}
                    className={styles.SmallButton}
                  >
                    {key} ({geometry.attributes[key].count})
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      />
    </div>
  )
}

function AutoPanel() {
  const editor = useEditor()
  useEditorRenderOnRefresh()
  const objects = [...editor.sceneSelection.objects]
  const object = objects.length > 0 ? objects[0] : null

  const children = []
  if (object) {
    if ('geometry' in (object as any)) {
      children.push(<Separator key={children.length} />)
      children.push(<GeometryPanel key={children.length} geometry={(object as any).geometry} />)
    }
  }

  return (
    <div>
      {children}
    </div>
  )
}

export function Inspector() {
  return (
    <>
      <Title />
      <Separator />
      <TransformPanel />
      <AutoPanel />
    </>
  )
}