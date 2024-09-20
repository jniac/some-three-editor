'use client'

import React from 'react'
import { Camera } from 'three'

import { useObservableValue } from 'some-utils-react/hooks/observables'

import { useEditor, useEditorRenderOnRefresh } from '../editor-provider'

import { InfoSvg } from '../svg/InfoSvg'

import { Foldable } from './atoms/foldable'
import { HierachyPanel } from './hierarchy'
import { HistoryPanel } from './history'
import { Inspector } from './inspector'
import { OrbitControlsPanel } from './misc/orbit-controls'
import { Panel } from './panel'
import { SelectionPanel } from './selection'
import { Toolbar } from './toolbar'

import style from './editor-ui.module.css'

function InfoPanel() {
  return (
    <div className='flex flex-row justify-between items-center cursor-pointer' onClick={() => alert('coming soon...')}>
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

export function EditorUI() {
  const showUI = useObservableValue(useEditor().uiVisibility)
  return showUI && (
    <div className={style.EditorUI}>
      <div className='absolute-through p-4 flex flex-row' style={{ color: 'var(--font-color)' }}>
        <div className='basis-[14em] pointer-events-through flex flex-col overflow-hidden gap-1'>
          <Panel separators className='p-2'>
            <InfoPanel />
            <CameraPanel />
            <HierachyPanel />
            <HistoryPanel />
            <SelectionPanel />
          </Panel>
        </div>

        <div className='flex-1 pointer-events-through overflow-hidden'>
          <div className='absolute top-0 w-full flex flex-row justify-center'>
            <Toolbar />
          </div>
        </div>

        <div className='basis-[21em] pointer-events-through overflow-hidden'>
          <Panel className='p-2'>
            <Inspector />
          </Panel>
        </div>
      </div>
    </div>
  )
}
