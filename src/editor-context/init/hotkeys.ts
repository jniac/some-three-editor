import { handleKeyboard } from 'some-utils-dom/handle/keyboard'

import { selectChildren, selectParents } from '../actions'
import { EditorContext } from '../editor'
import { SpaceMode, ToolType } from '../types'

export function* initHotkeys(editor: EditorContext) {
  yield handleKeyboard(document.body, { strictTarget: true }, [
    [{ key: 'g', noModifiers: true }, () => editor.spaceMode.set(editor.spaceMode.value === SpaceMode.World ? SpaceMode.Local : SpaceMode.World)],
    [{ key: 'a', noModifiers: true }, () => editor.toolType.set(ToolType.Select)],
    [{ key: 'w', noModifiers: true }, () => editor.toolType.set(ToolType.Move)],
    [{ key: 'r', noModifiers: true }, () => editor.toolType.set(ToolType.Rotate)],
    [{ key: 't', noModifiers: true }, () => editor.toolType.set(ToolType.Scale)],
    [{ key: 'f', modifiers: 'shift' }, () => {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        document.body.requestFullscreen()
      }
    }],

    [{ key: 'z', modifiers: m => m.ctrl || m.meta }, info => {
      info.event.preventDefault()
      if (info.modifiers.shift) {
        editor.history.redo()
      } else {
        editor.history.undo()
      }
    }],

    [{ key: 'Enter' }, info => {
      if (info.modifiers.shift) {
        selectParents(editor)
      } else {
        selectChildren(editor)
      }
    }],
  ])
}
