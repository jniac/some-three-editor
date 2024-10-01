import { BufferGeometry } from 'three'

import { useEditor, useEditorRenderOnRefresh } from '../../editor-provider'
import { Foldable } from '../components/foldable'
import { Separator } from '../panel/Separator'

import { InlineInput } from './inputs/inline-input'
import { defaultMetadata, InputMetadata, parseInputMetadata } from './inputs/metadata'
import { Title } from './title'
import { TransformPanel } from './transform/transform'

import styles from './inspector.module.css'


function GeometryPanel({ geometry }: { geometry: BufferGeometry }) {
  return (
    <div>
      <Foldable
        title='Geometry'
        content={() => (
          <>
            <div style={{ fontSize: 'var(--font-size-tiny)' }}>{geometry.uuid}</div>
            <div className={styles.Geometry} style={{ fontSize: 'var(--font-size-small)' }}>
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
      children.push(<GeometryPanel key='geometry' geometry={(object as any).geometry} />)
    }
  }

  if (object && objects.length === 1) {
    if ('userData' in object) {
      const keys = Object.keys(object.userData)
      if (keys.length > 0) {
        children.push(<Separator key={children.length} />)
        children.push(<UserDataPanel key='userData' userData={object.userData} />)
      }
    }
  }

  return (
    <div>
      {children}
    </div>
  )
}

/**
 * Basic heuristic to extract user data properties from an plain object.
 * 
 * Implementations that must follow:
 * - Class properties with their static metadata counterpart.
 * - ...?
 */
function extractUserDataProperties(userData: any) {
  const properties: { key: string, value: any, meta: InputMetadata }[] = []

  function assignOrCreate(key: string) {
    const property = properties.find(p => p.key === key)
    if (property) {
      return property
    } else {
      const property = { key, value: undefined, meta: defaultMetadata }
      properties.push(property)
      return property
    }
  }

  const keys = Object.keys(userData)
  for (const key of keys) {
    // Metadata entry:
    if (key.endsWith('_meta')) {
      const originalKey = key.slice(0, -5)
      const property = assignOrCreate(originalKey)
      property.meta = parseInputMetadata(userData[key])
    }

    // Value entry:
    else {
      const property = assignOrCreate(key)
      property.value = userData[key]
    }
  }

  return properties
}

function UserDataPanel({ userData }: { userData: any }) {
  function Content() {
    return (
      <>
        {extractUserDataProperties(userData).map(prop => (
          <InlineInput
            key={prop.key}
            mainLabel={prop.key}
            value={[userData]}
            metadata={prop.meta}
            template={[[prop.key, 'number', { key: null }]]}
            onInput={(_, value) => {
              userData[prop.key] = Number.parseFloat(value)
            }}
          />
        ))}
      </>
    )
  }

  return (
    <Foldable
      title='User Data'
      content={Content}
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
    </>
  )
}