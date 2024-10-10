import { Object3D } from 'three'

import { EditorContext, Scope, Visibility } from '../../editor-context'

export function computeDepth(object: Object3D) {
  let depth = 0
  while (object.parent) {
    object = object.parent
    depth += 1
  }
  return depth
}

export function computeRoot(object: Object3D) {
  while (object.parent) {
    object = object.parent
  }
  return object

}

export function computeSiblings(object: Object3D, visibleChildren: Object3D[]): [previous: Object3D | null, next: Object3D | null] {
  const { parent } = object
  if (!parent) {
    return [null, null]
  }
  const index = visibleChildren.indexOf(object)
  if (index === -1) {
    // Possible since visibleChildren is a subset of object.children
    return [null, null]
  }
  return [
    index === 0 ? null : visibleChildren[index - 1],
    index === visibleChildren.length - 1 ? null : visibleChildren[index + 1],
  ]
}

export class ChildInfo {
  readonly depth: number = computeDepth(this.object)
  readonly root: Object3D
  readonly visiblePrevious: Object3D | null
  readonly visibleNextnext: Object3D | null

  constructor(
    public readonly object: Object3D,
    public readonly visibleChildren: Object3D[],
  ) {
    [this.root, this.visiblePrevious, this.visibleNextnext] = [computeRoot(object), ...computeSiblings(object, visibleChildren)]
  }
}

export function computeChildInfos(root: Object3D, editor: EditorContext) {
  const infos: ChildInfo[] = []
  const queue = [root]
  while (queue.length > 0) {
    const object = queue.shift()!
    const metadata = editor.metadata.get(object)
    if (metadata.hierarchyVisibility === Visibility.Visible && metadata.scope !== Scope.Internal) {
      const visibleChildren = object.children.filter(child => {
        return metadata.hierarchyVisibility === Visibility.Visible && metadata.scope !== Scope.Internal
      })
      infos.push(new ChildInfo(object, visibleChildren))
      if (metadata.hierarchyOpen) {
        queue.unshift(...object.children)
      }
    }
  }
  return infos
}
