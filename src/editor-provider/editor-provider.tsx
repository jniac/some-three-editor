import { createContext, memo, useContext, useEffect, useMemo } from 'react'

import { useEffects, UseEffectsReturnable } from 'some-utils-react/hooks/effects'
import { useTriggerRender } from 'some-utils-react/hooks/render'
import { ThreeWebglContext } from 'some-utils-three/contexts/webgl'

import { EditorContext } from '../editor-context/editor'
import { EditorUI, EditorUIProps } from '../editor-ui'
import { ThreeProvider, useThree } from './three-provider'

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
  /**
   * If no three context is provided, the editor will use the one from the
   * ThreeProvider.
   */
  three?: ThreeWebglContext
}

/**
 * Provide the editor context, but not the three context which has to be given
 * via the `three` prop.
 */
export function EditorProvider(props: Props) {
  const {
    three = useThree(),
    ...rest
  } = props
  if (!three) {
    throw new Error('No three context found: Neither provided nor in context.')
  }
  const editor = useMemo(() => new EditorContext(three), [])
  useEffects(function* () {
    // Refresh the editor when the three context is likely to have changed.
    yield three.loader.onAfterLoad(() => {
      editor.requestRefresh()
    })
  }, [])
  return (
    <context.Provider value={editor}>
      <EditorUI {...rest} />
    </context.Provider>
  )
}

/**
 * Provide both the three and editor context.
 */
export function ThreeAndEditorProvider(props: Omit<Props, 'three'>) {
  const EditorProviderWithThree = memo(function () {
    const three = useThree()
    return <EditorProvider {...props} three={three} />
  })

  return (
    <ThreeProvider>
      <EditorProviderWithThree />
    </ThreeProvider>
  )
}
