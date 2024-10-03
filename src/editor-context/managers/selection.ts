import { ObservableSet } from 'some-utils-ts/observables'
import { HistoryManager } from './history'

export class SelectionManager<T extends object> {
  private _set = new ObservableSet<T>();
  private _command: HistoryManager
  private _filter: (object: T | null) => boolean

  constructor(command: HistoryManager, { filter }: { filter: (object: T | null) => boolean }) {
    this._command = command
    this._filter = filter
  }

  private _filteredObjects(objects: (T | null)[]): T[] {
    if (objects.findIndex(o => !this._filter(o)) !== -1) {
      const beforeCount = objects.length
      objects = objects.filter(this._filter)
      console.log(`Invalid Object detected. Filtered ${beforeCount - objects.length} / ${beforeCount} objects`)
    }
    return objects as T[]
  }

  get obs() { return this._set }

  onChange = this._set.onChange.bind(this._set)

  equals(objects: T[]): boolean {
    const setA = new Set(objects)
    const setB = this._set.value
    if (setA.size !== setB.size) {
      return false
    }
    for (const object of setA) {
      if (!setB.has(object)) {
        return false
      }
    }
    return true
  }

  set(comment: string, newObjects: Iterable<T>, commandExtraCallbacks?: { execute: () => void, undo: () => void }): this {
    const previousObjects = new Set(this._set.value)
    const objects = this._filteredObjects([...newObjects])

    if (this.equals(objects)) {
      return this
    }

    this._command.push({
      comment,
      execute: () => {
        this._set.set(objects)
        commandExtraCallbacks?.execute()
      },
      undo: () => {
        this._set.set(previousObjects)
        commandExtraCallbacks?.undo()
      },
    })
    return this
  }

  add(comment: string, ...objects: (T | null)[]): this {
    const safeObjects = this._filteredObjects(objects)
    const diff = this._set.otherDifference(safeObjects)
    this._command.push({
      comment,
      execute: () => this._set.add(...diff),
      undo: () => this._set.remove(...diff),
    })
    return this
  }

  remove(comment: string, ...objects: (T | null)[]): this {
    const safeObjects = this._filteredObjects(objects)
    const inter = this._set.intersection(safeObjects)
    this._command.push({
      comment,
      execute: () => this._set.remove(...inter),
      undo: () => this._set.add(...inter),
    })
    return this
  }

  toggle(comment: string, object: T | null): this {
    if (object !== null) {
      if (this._set.has(object)) {
        this.remove(comment, object)
      } else {
        this.add(comment, object)
      }
    }
    return this
  }

  clear(comment: string): this {
    const previousObjects = new Set(this._set.value)
    if (previousObjects.size > 0) {
      this._command.push({
        comment,
        execute: () => this._set.clear(),
        undo: () => this._set.set(previousObjects),
      })
    }
    return this
  }

  get objects(): Set<T> {
    return this._set.value
  }

  has(object: T): boolean {
    return this._set.has(object)
  }

  get count() { return this._set.size }

  at(index: number): T | null {
    return [...this._set.value][index] ?? null
  }

  get size(): number {
    return this._set.size
  }
}
