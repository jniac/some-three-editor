'use client'

import { CSSProperties, ReactNode } from 'react'
import { Camera } from 'three'

import { handleKeyboard } from 'some-utils-dom/handle/keyboard'
import { useEffects } from 'some-utils-react/hooks/effects'
import { makeClassName as mc } from 'some-utils-react/utils/classname'

import { InfoSvg } from '../svg/InfoSvg'

import { useEditor, useEditorRenderOnRefresh } from '../editor-provider'
import { Foldable } from './components/foldable'
import { HierachyPanel } from './hierarchy'
import { HistoryPanel } from './history'
import { Inspector } from './inspector'
import { Layout } from './layout/layout'
import { OrbitControlsPanel } from './misc/orbit-controls'
import { Panel } from './panel'
import { SelectionPanel } from './selection'
import { initThreeDisplayNames } from './three-display-names'
import { Toolbar } from './toolbar'

import ms from './main.module.css'

initThreeDisplayNames()

function InfoPanel() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        cursor: 'pointer',
      }}
      onClick={() => alert('coming soon...')}
    >
      <h1>Info</h1>
      <InfoSvg />
    </div>
  )
}

function CameraPanel() {
  useEditorRenderOnRefresh()

  const { three } = useEditor()
  const cameras = [] as Camera[]
  three.scene.traverse(object => {
    if (object instanceof Camera) {
      cameras.push(object)
    }
  })

  return (
    <Foldable
      closedByDefault
      title='Camera'
      content={() => (
        <>
          <OrbitControlsPanel />
          <div className='flex flex-col text-xs'>
            {cameras.map(camera => (
              <div key={camera.uuid}>
                <div>{camera.name}</div>
              </div>
            ))}
          </div>
        </>
      )}
    />
  )
}

const defaultProps = {
  backgroundColor: '#0006',
}

type Props = Partial<typeof defaultProps> & { children?: ReactNode }

export function EditorUI(props: Props) {
  const {
    children,
    backgroundColor,
  } = { ...defaultProps, ...props }
  const editor = useEditor()

  useEffects(function* () {
    yield handleKeyboard([
      [{ code: 'Space', modifiers: 'shift' }, () => {
        editor.uiVisibility.set(!editor.uiVisibility.value)
      }],
    ])
  }, [])

  const style = {
    '--background-color': backgroundColor,
  } as CSSProperties

  return (
    <div className={mc(ms.EditorUI, ms.Abs0, ms.Thru)} style={style}>
      <Layout
        topBar={<Toolbar />}
        leftCol={
          <Panel separators>
            <InfoPanel />
            <CameraPanel />
            <HierachyPanel />
            <HistoryPanel />
            <SelectionPanel />
          </Panel>
        }
        rightCol={
          <Panel>
            <Inspector />
          </Panel>
        }
      >
        {children}
      </Layout>
    </div>
  )
}

export type { Props as EditorUIProps }
