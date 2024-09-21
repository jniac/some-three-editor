import { createContext, useContext, useEffect, useMemo } from 'react'

import { useEffects, UseEffectsReturnable } from 'some-utils-react/hooks/effects'
import { useTriggerRender } from 'some-utils-react/hooks/render'
import { ThreeWebglContext } from 'some-utils-three/contexts/webgl'

import { EditorContext } from '../editor-context/editor'
import { EditorUI, EditorUIProps } from '../editor-ui'

const context = createContext<EditorContext>(null!)

export function useEditor(
  effects?: (editor: EditorContext) => UseEffectsReturnable,
) {
  const editor = useContext(context)
  useEffects(async function* (_, state) {
    if (effects) {
      const it = effects(editor)
      if (it && typeof it.next === 'function') {
        do {
          const { value, done } = await it.next()
          if (done) break
          yield value
        } while (state.mounted)
      }
    }
  }, [])
  return editor
}

/**
 * This hook will re-render the component when the editor is refreshed.
 */
export function useEditorRenderOnRefresh() {
  const editor = useEditor()
  const render = useTriggerRender()
  useEffect(() => {
    return editor.onRefresh(render).destroy
  }, [])
}

type Props = EditorUIProps & {
  three: ThreeWebglContext
}

export function EditorProvider(props: Props) {
  const { three, ...rest } = props
  const editor = useMemo(() => new EditorContext(three), [])
  return (
    <context.Provider value={editor}>
      <EditorUI {...rest} />
    </context.Provider>
  )
}
