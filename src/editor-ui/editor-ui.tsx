'use client'

import { Camera } from 'three'


import { makeClassName as mc } from 'some-utils-react/utils/classname'
import { useEditor, useEditorRenderOnRefresh } from '../editor-provider'

import { InfoSvg } from '../svg/InfoSvg'

import { Foldable } from './atoms/foldable'
import { HierachyPanel } from './hierarchy'
import { HistoryPanel } from './history'
import { Inspector } from './inspector'
import { Layout } from './layout/layout'
import { OrbitControlsPanel } from './misc/orbit-controls'
import { Panel } from './panel'
import { SelectionPanel } from './selection'
import { Toolbar } from './toolbar'

import { ReactNode } from 'react'

import { handleKeyboard } from 'some-utils-dom/handle/keyboard'
import { useEffects } from 'some-utils-react/hooks/effects'
import ms from './main.module.css'

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

export function EditorUI({ children }: { children?: ReactNode }) {
  const editor = useEditor()

  useEffects(function* () {
    yield handleKeyboard([
      [{ code: 'Space', modifiers: 'shift' }, () => {
        editor.uiVisibility.set(!editor.uiVisibility.value)
      }]
    ])
  }, [])

  return (
    <div className={mc(ms.EditorUI, ms.Abs0, ms.Thru)}>
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
