import { handlePointer } from 'some-utils-dom/handle/pointer'
import { Object3D } from 'three'
import { EditorContext } from '../editor'

function keepObject(object: Object3D) {
  // Ignore helpers.
  if (object.constructor.name.endsWith('Helper')) {
    return false
  }

  // Ignore objects that ignore raycast.
  let scope: Object3D | null = object
  while (scope) {
    if (scope.userData.ignoreRaycast === true) {
      return false
    }
    if (scope.userData.pickable === false) {
      return false
    }
    scope = scope.parent
  }

  return true
}

export function* initRaycast(editor: EditorContext) {
  yield handlePointer(editor.three.renderer.domElement, {
    onDown: info => {
      info.event.preventDefault()
    },
    onTap: info => {
      const intersects = editor.three.pointer.raycaster
        .intersectObject(editor.three.scene, true)
        .filter(i => keepObject(i.object))

      const { shiftKey } = info.orignalDownEvent

      let object = null

      if (intersects.length > 0) {
        object = intersects[0].object

        if (object.userData.selectParentOnTap === true) {
          object = object.parent
        }
      }

      if (object) {
        if (shiftKey) {
          editor.sceneSelection.toggle('Scene Raycast Toggle', object)
        } else {
          editor.sceneSelection.set('Scene Raycast Pick', [object])
        }
      } else {
        if (shiftKey === false) {
          editor.sceneSelection.clear('Scene Raycast Clear')
        }
      }
    },
  })
}
