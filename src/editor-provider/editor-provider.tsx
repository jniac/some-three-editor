import React, { createContext, ReactNode, useContext, useEffect, useMemo } from 'react'

import { useTriggerRender } from 'some-utils-react/hooks/render'
import { ThreeWebglContext } from 'some-utils-three/contexts/webgl'

import { useEffects, UseEffectsReturnable } from 'some-utils-react/hooks/effects'
import { EditorContext } from '../editor-context/editor'

const context = createContext<EditorContext>(null!)

type Props = {
  three: ThreeWebglContext
  children?: ReactNode
}

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

export function EditorProvider(props: Props) {
  const { three, children } = props
  const editor = useMemo(() => new EditorContext(three), [])
  return (
    <context.Provider value={editor}>
      {children}
    </context.Provider>
  )
}
