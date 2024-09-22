
import { HTMLProps } from 'react'

import { makeClassName } from 'some-utils-react/utils/classname'

import { Command } from '../../editor-context'
import { useEditor, useEditorRenderOnRefresh } from '../../editor-provider'

import { Foldable } from '../components/foldable'

// SVGs
import RedoSvg from '../../svg/pure/history-redo.svg'
import UndoSvg from '../../svg/pure/history-undo.svg'

import styles from './history.module.css'

function reverseMap<T1, T2>(values: T1[], fn: (value: T1, index: number) => T2): T2[] {
  const result: T2[] = []
  for (let i = values.length - 1; i >= 0; i--) {
    result.push(fn(values[i], i))
  }
  return result
}

function CommandEntry(props: HTMLProps<HTMLDivElement> & { commandType: 'undo' | 'redo', command: Command }) {
  const {
    commandType,
    command,
    ...rest
  } = props

  return (
    <div
      {...rest}
      className={makeClassName(styles.Command, commandType === 'undo' ? styles.Undo : styles.Redo)}>
      <div>
        <span>
          {command.historyIndex}
        </span>
        <span>
          {command.comment ?? '...'}
        </span>
      </div>
      <div>
        {commandType === 'undo'
          ? <UndoSvg />
          : <RedoSvg />}
      </div>
    </div>
  )
}

function Inner(props: HistoryPanelProps) {
  const { commandCount = 10 } = props

  const editor = useEditor()
  const redoCount = Math.min(editor.history.redoCount, commandCount)
  const undoCount = Math.min(editor.history.undoCount, commandCount - redoCount)
  return (
    <div className={styles.History}>
      <div className={styles.Stack}>
        {undoCount > 0 && editor.history.undoStack.slice(-undoCount).map((command, index) => (
          <CommandEntry
            key={index}
            commandType='undo'
            command={command}
            onClick={() => {
              const count = undoCount - index
              editor.history.undo(count)
            }}
          />
        ))}
        {reverseMap(editor.history.redoStack.slice(0, redoCount), (command, index) => (
          <CommandEntry
            key={index}
            commandType='redo'
            command={command}
            onClick={() => {
              const count = redoCount - index
              editor.history.redo(count)
            }}
          />
        ))}
      </div>
    </div>
  )
}

type HistoryPanelProps = Partial<{
  commandCount: number
}>

export function HistoryPanel(props: HistoryPanelProps) {
  const editor = useEditor()
  useEditorRenderOnRefresh()
  return (
    <div>
      <Foldable
        {...props}
        closedByDefault
        title={`Undo / Redo (${editor.history.undoCount}::${editor.history.redoCount})`}
        content={() => <Inner />}
      />
    </div>
  )
}

