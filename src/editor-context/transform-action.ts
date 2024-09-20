import { Object3D } from 'three'

import { Transform } from 'some-utils-three/transform'

import { EditorContext } from './editor'

/**
 * `TransformAction` is a helper class for creating and executing transform actions.
 */
export class TransformAction {
  objects: Object3D[] = []
  historyComment: string = '...'
  before: Transform[] = []
  after: Transform[] = []

  constructor(objects?: Iterable<Object3D>) {
    if (objects) {
      this.reset(objects)
    }
  }

  reset(objects: Iterable<Object3D>): this {
    this.objects = [...objects]
    return this
  }

  beforeSnapshot(): this {
    this.before = this.objects.map(object => ({
      position: object.position.clone(),
      rotation: object.rotation.clone(),
      scale: object.scale.clone(),
      visible: object.visible,
    }))
    return this
  }

  afterSnapshot(): this {
    this.after = this.objects.map(object => ({
      position: object.position.clone(),
      rotation: object.rotation.clone(),
      scale: object.scale.clone(),
      visible: object.visible,
    }))
    return this
  }

  isNoop(): boolean {
    return this.before.every((before, i) => {
      const after = this.after[i]
      return before.position.equals(after.position) &&
        before.rotation.equals(after.rotation) &&
        before.scale.equals(after.scale)
    })
  }

  comment(value: string): this {
    this.historyComment = value
    return this
  }

  flush(editor: EditorContext): this {
    // Avoid adding no-op actions to the history
    if (this.isNoop()) {
      return this
    }

    editor.history.push({
      comment: this.historyComment,
      execute: () => {
        for (let i = 0; i < this.objects.length; i++) {
          const object = this.objects[i]
          const transform = this.after[i]
          object.position.copy(transform.position)
          object.rotation.copy(transform.rotation)
          object.scale.copy(transform.scale)
        }
      },
      undo: () => {
        for (let i = 0; i < this.objects.length; i++) {
          const object = this.objects[i]
          const transform = this.before[i]
          object.position.copy(transform.position)
          object.rotation.copy(transform.rotation)
          object.scale.copy(transform.scale)
        }
      },
    })
    return this
  }
}
