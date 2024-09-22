import { Object3D } from 'three'

import { useEditor, useEditorRenderOnRefresh } from '../../editor-provider'

import { Foldable } from '../components/foldable'

import styles from './selection.module.css'

function Inner({ objects }: { objects: Object3D[] }) {
  return (
    <div className={styles.Selection}>
      {objects.map(object => (
        <div key={object.uuid}>
          {!!object.name
            ? <span>{object.name}</span>
            : <span style={{ fontStyle: 'italic' }}>{object.constructor.name}</span>
          }
        </div>
      ))}
    </div>
  )
}

export function SelectionPanel() {
  const editor = useEditor()
  useEditorRenderOnRefresh()
  const objects = [...editor.sceneSelection.objects]
  return (
    <div>
      <Foldable
        closedByDefault
        title={`Selection (${objects.length})`}
        content={() => <Inner objects={objects} />}
      />
    </div>
  )
}

