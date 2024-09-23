import '@fontsource/fira-code'
import '@fontsource/inter'
import { useMemo } from 'react'
import { BufferGeometry, Vector3 } from 'three'

import { useEffects } from 'some-utils-react/hooks/effects'
import { Observable } from 'some-utils-ts/observables'
import { onTick } from 'some-utils-ts/ticker'

import { useEditor, useEditorRenderOnRefresh } from '../../editor-provider'
import { Foldable } from '../components/foldable'
import { Separator } from '../panel/Separator'

import { InlineInput } from './inputs/inline-input'
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

function UserDataPanel() {
  // TODO: Implement custom properties inspection!
  const dummy = useMemo(() => ({ transition: 0 }), [])
  useEffects(function* () {
    const obs = new Observable(dummy.transition)
    obs.onChange(value => console.log(`transition: ${value}`))
    yield onTick({ timeInterval: 1 / 12 }, () => {
      obs.value = dummy.transition
    })
  }, [])

  return (
    <Foldable
      title='User Data'
      content={() => (
        <>
          <InlineInput
            label='position'
            value={[new Vector3(1, 2, 3)]}
          />
          <InlineInput
            label='transition'
            mode='slider'
            onInput={(_, value) => dummy.transition = Number.parseFloat(value)}
            value={[dummy]}
          />
        </>
      )}
    />
  )
}

export function Inspector() {
  return (
    <>
      <Title />
      <Separator />
      <TransformPanel />
      <AutoPanel />
      <Separator />
      <UserDataPanel />
    </>
  )
}