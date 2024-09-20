import { Object3D } from 'three'

import { EditorContext, MetadataObject, Scope, Visibility } from '../../editor-context'

export class NodeInfo {
  readonly root: NodeInfo
  readonly parent: NodeInfo | null
  readonly allNodes: NodeInfo[] | null = null
  readonly children: NodeInfo[]
  readonly isSelected: boolean

  readonly object: Object3D
  readonly metadata: MetadataObject
  readonly depth: number
  readonly totalChildCount: number

  get isRoot() { return this.root === this }

  get childCount() { return this.children.length }

  constructor(
    editor: EditorContext,
    object: Object3D,
    root: NodeInfo | null = null,
    parent: NodeInfo | null = null,
    metadata: MetadataObject | null = null,
    depth = 0,
  ) {
    this.root = root ?? this
    this.parent = parent
    this.object = object
    this.depth = depth
    this.isSelected = editor.sceneSelection.has(object)

    if (this.isRoot) {
      this.allNodes = []
    }

    this.metadata = metadata ?? editor.metadata.get(object)
    this.children = []

    if (this.parentsAreOpen()) {
      this.root.allNodes!.push(this)
    }

    this.populate(editor, object, depth)
    this.totalChildCount = this.children.reduce((sum, c) => sum + 1 + c.totalChildCount, 0)
  }

  private populate(editor: EditorContext, object: Object3D, depth: number) {
    for (const child of object.children) {
      const metadata = editor.metadata.get(child)
      if (metadata.hierarchyVisibility === Visibility.Visible && metadata.scope !== Scope.Internal) {
        const ni = new NodeInfo(editor, child, this.root, this, metadata, depth + 1)
        this.children.push(ni)
      }
    }
  }

  *parents(): Generator<NodeInfo> {
    let parent = this.parent
    while (parent) {
      yield parent
      parent = parent.parent
    }
  }

  *descendants(): Generator<NodeInfo> {
    for (const child of this.children) {
      yield child
      yield* child.descendants()
    }
  }

  parentsAreOpen() {
    for (const parent of this.parents()) {
      if (!parent.metadata.hierarchyOpen) {
        return false
      }
    }
    return true
  }

  isLastChild() {
    return this.parent ? this.parent.children[this.parent.children.length - 1] === this : false
  }

  isClosed() {
    return this.childCount > 0 && !this.metadata.hierarchyOpen
  }

  getNextSibling() {
    if (this.parent) {
      const index = this.parent.children.indexOf(this)
      if (index !== -1 && index < this.parent.children.length - 1) {
        return this.parent.children[index + 1]
      }
    }
    return null
  }
}
