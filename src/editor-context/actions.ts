import { Object3D } from 'three'

import { EditorContext } from './editor'

export function selectParents(editor: EditorContext) {
  const objects = new Set<Object3D>()

  for (const object of editor.sceneSelection.objects) {
    const parent = object.parent

    // Skip the root scene
    if (parent && parent.parent) {
      objects.add(parent)
    }
  }

  editor.sceneSelection.set('Select Parents', objects)
}

export function selectChildren(editor: EditorContext) {
  const objects = new Set<Object3D>()

  for (const object of editor.sceneSelection.objects) {
    for (const child of object.children) {
      objects.add(child)
    }
  }

  editor.sceneSelection.set('Select Children', objects)
}
