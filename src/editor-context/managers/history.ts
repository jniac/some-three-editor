import { ObservableNumber } from 'some-utils-ts/observables'

import { CommandArg } from '../types'

export class Command {
  private static nextId = 0
  readonly id = Command.nextId++
  readonly historyIndex: number

  readonly comment: string
  readonly execute: () => void
  readonly undo: () => void

  constructor(historyIndex: number, arg: CommandArg) {
    this.historyIndex = historyIndex
    this.comment = arg.comment ?? `Command ${this.id}`
    this.execute = arg.execute
    this.undo = arg.undo
  }
}

export class HistoryManager {
  private changeObs = new ObservableNumber(0)

  undoStack: Command[] = []
  redoStack: Command[] = []

  get lastHistoryIndex(): number {
    return this.undoStack.length > 0
      ? this.undoStack[this.undoStack.length - 1].historyIndex
      : -1
  }

  get undoCount(): number { return this.undoStack.length }
  get redoCount(): number { return this.redoStack.length }
  get canUndo(): boolean { return this.undoStack.length > 0 }
  get canRedo(): boolean { return this.redoStack.length > 0 }

  push(arg: CommandArg): void {
    const command = new Command(this.lastHistoryIndex + 1, arg)
    command.execute()

    this.undoStack.push(command)

    while (this.undoStack.length > 100) {
      this.undoStack.shift()
    }

    this.redoStack = []

    this.changeObs.increment()
  }

  undo(count = 1): void {
    let hasChanged = false

    while (count-- > 0 && this.undoStack.length > 0) {
      const command = this.undoStack.pop()!
      command.undo()
      this.redoStack.push(command)
      hasChanged = true
    }

    if (hasChanged) {
      this.changeObs.increment()
    }
  }

  redo(count = 1): void {
    let hasChanged = false

    while (count-- > 0 && this.redoStack.length > 0) {
      const command = this.redoStack.pop()!
      command.execute()
      this.undoStack.push(command)
      hasChanged = true
    }

    if (hasChanged) {
      this.changeObs.increment()
    }
  }

  onChange(callback: () => void) {
    return this.changeObs.onChange(callback)
  }
}
