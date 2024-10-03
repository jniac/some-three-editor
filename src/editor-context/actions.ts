import { Object3D } from 'three'

import { EditorContext } from './editor'
import { Command } from './types'

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

export function toggleVisibility(editor: EditorContext) {
  const objects = [...editor.sceneSelection.objects]
  if (objects.length > 0) {
    const newVisibility = !objects[0].visible
    const concerned = objects.filter(object => object.visible !== newVisibility)
    const command: Command = {
      comment: newVisibility ? 'Show' : 'Hide',
      execute: () => {
        for (const object of concerned) {
          object.visible = newVisibility
        }
      },
      undo: () => {
        for (const object of concerned) {
          object.visible = !newVisibility
        }
      },
    }
    editor.history.push(command)
  }
}

/**
 * NOTE: hierarchy deploy is not pushed to history.
 */
export function hierarchyDeployAll(editor: EditorContext, scope: Object3D) {
  const queue = [scope]
  while (queue.length > 0) {
    const current = queue.shift()!
    editor.metadata.get(current).set('hierarchyOpen', true)
    queue.push(...current.children)
  }
}

export function hierarchyDeployDownTo(editor: EditorContext, scope: Object3D) {
  scope.traverseAncestors(ancestor => {
    editor.metadata.get(ancestor).set('hierarchyOpen', true)
  })
}