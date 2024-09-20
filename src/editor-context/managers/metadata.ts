import { CameraHelper, Scene } from 'three'

import { ObservableNumber } from 'some-utils-ts/observables'
import { Metadata, Scope, Visibility } from '../types'

type Setter<T> = {
  [K in keyof T]: T[K] | ((current: T[keyof T]) => T[K])
}

export class MetadataObject implements Readonly<Metadata> {
  private changeObs: ObservableNumber

  readonly scope = Scope.Public
  readonly hierarchyVisibility = Visibility.Visible
  readonly hierarchyOpen = false
  readonly sceneVisibility = Visibility.Visible
  readonly selectable = true

  constructor(changeObs: ObservableNumber) {
    this.changeObs = changeObs
  }

  set<K extends keyof Metadata>(key: K, value: Metadata[K] | ((value: Metadata[K]) => Metadata[K])): this
  set(props: Partial<Setter<Metadata>>): this
  set(...args: any[]): this {
    if (args.length === 2) {
      const [key, value] = args
      return this.set({ [key]: value })
    }

    const [props] = args

    let hasChanged = false

    for (const key of Object.keys(props) as (keyof Metadata)[]) {
      const currentValue = this[key]
      const incomingValue = props[key]
      const newValue = typeof incomingValue === 'function' ? incomingValue(currentValue) : incomingValue
      if (currentValue !== newValue) {
        hasChanged = true
        // @ts-ignore
        this[key] = newValue
      }
    }

    if (hasChanged) {
      this.changeObs.increment()
    }

    return this
  }
}

export class MetadataManager {
  private changeObs = new ObservableNumber(0)
  private map = new WeakMap<object, MetadataObject>()

  onChange(callback: () => void) {
    return this.changeObs.onChange(callback)
  }

  get(object: object) {
    return this.map.get(object) ?? this.map.set(object, this.defaultFor(object)).get(object)!
  }

  defaultFor(object: object) {
    let hierarchyOpen = false
    let selectable = true

    if (object instanceof Scene) {
      hierarchyOpen = true
      selectable = false
    }

    if (object instanceof CameraHelper) {
      selectable = false
    }

    return new MetadataObject(this.changeObs).set({
      hierarchyOpen,
      selectable,
    })
  }
}
