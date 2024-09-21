import { useState } from 'react'
import { Object3D } from 'three'

import { useTriggerRender } from 'some-utils-react/hooks/render'

import { useEditor } from '../../editor-provider'

import { Foldable } from '../atoms/foldable'
import { SmallButton } from '../buttons'

import { HierarchySelectionHighlight } from './HierarchySelectionHighlight'
import { NodeInfo } from './NodeInfo'
import { NodeView } from './NodeView'


import ms from '../main.module.css'
import s from './hierarchy.module.css'

function getRange(root: NodeInfo, bounds: [Object3D, Object3D]): Object3D[] {
  const [a, b] = bounds
  const ai = root.allNodes!.findIndex(node => node.object === a)
  const bi = root.allNodes!.findIndex(node => node.object === b)

  if (ai === -1 || bi === -1) {
    if (ai === -1 && bi === -1) {
      return []
    }
    return ai === -1 ? [b] : [a]
  }

  const start = Math.min(ai, bi)
  const end = Math.max(ai, bi)
  return root.allNodes!
    .slice(start, end + 1)
    .filter(node => node.parentsAreOpen())
    .map(node => node.object)
}

function addRange(objects: Set<Object3D>, range: Object3D[]) {
  for (const object of range) {
    objects.add(object)
  }
  return objects
}

function toggleOne(objects: Set<Object3D>, object: Object3D) {
  if (objects.has(object)) {
    objects.delete(object)
  } else {
    objects.add(object)
  }
  return objects
}

function Inner() {
  const render = useTriggerRender()
  const editor = useEditor(function* (editor) {
    yield editor.onRefresh(render)
  })
  const { three } = editor

  const tree = new NodeInfo(editor, three.scene)

  const [state, setState] = useState({
    lastClickTarget: null as Object3D | null,
  })

  function getObjects(node: NodeInfo): Object3D[] {
    const nodeIsSelected = editor.sceneSelection.objects.has(node.object)
    return nodeIsSelected
      // Multiple targets based on selection:
      ? [...editor.sceneSelection.objects].filter(object => object instanceof Object3D)
      // Single target:
      : [node.object]
  }

  return (
    <div className='flex flex-col max-h-full h-full'>
      <div className={ms.Abs} style={{ right: 0, top: -20 }}>
        <SmallButton
          onClick={editor.requestRefreshImmediate}>
          refresh
        </SmallButton>
      </div>
      <div className={s.HierarchyList}>
        <div className={ms.Abs0}>
          <HierarchySelectionHighlight tree={tree} />
        </div>
        {tree.allNodes!.map(node => {
          return (
            <NodeView
              key={node.object.uuid}
              node={node}

              onClick={event => {
                const { lastClickTarget } = state

                const mode = event.shiftKey ? 'add-range' : event.metaKey || event.ctrlKey ? 'toggle-one' : 'set'
                const objects = {
                  'add-range': () =>
                    addRange(editor.sceneSelection.objects, getRange(tree, [lastClickTarget!, node.object])),
                  'toggle-one': () =>
                    toggleOne(editor.sceneSelection.objects, node.object),
                  'set': () =>
                    new Set([node.object]),
                }[mode]()

                const comment = `Change selection in hierarchy (mode "${mode}", ${objects.size} objects selected)`
                editor.sceneSelection.set(comment, objects, {
                  execute: () => {
                    setState({ lastClickTarget: node.object })
                  },
                  undo: () => {
                    setState({ lastClickTarget })
                  },
                })
              }}

              onLinkClick={() => {
                const hierarchyOpen = !node.metadata.hierarchyOpen
                const objects = getObjects(node)
                const execute = () => {
                  for (const object of objects) {
                    editor.metadata.get(object).set({ hierarchyOpen })
                  }
                }

                // editor.history.push({
                //   comment: `Toggle hierarchy open state (${hierarchyOpen ? 'open' : 'closed'} x${objects.length} objects)`,
                //   execute,
                //   undo: () => {
                //     for (const object of objects) {
                //       editor.metadata.get(object).set({ hierarchyOpen: !hierarchyOpen })
                //     }
                //   },
                // })

                // No need to undo/redo hierarchy open state changes.
                execute()
              }}

              onVisibilityClick={() => {
                const visible = !node.object.visible
                const objects = getObjects(node)

                editor.history.push({
                  comment: `Toggle visibility (${visible ? 'visible' : 'hidden'} x${objects.length} objects)`,
                  execute: () => {
                    for (const object of objects) {
                      object.visible = visible
                    }
                  },
                  undo: () => {
                    for (const object of objects) {
                      object.visible = !visible
                    }
                  },
                })
              }}

              onPickableClick={() => {
                let { pickable = true } = node.object.userData
                pickable = !pickable
                const objects = getObjects(node)

                editor.history.push({
                  comment: `Toggle pickable (${pickable ? 'pickable' : 'unpickable'} x${objects.length} objects)`,
                  execute: () => {
                    for (const object of objects) {
                      object.userData.pickable = pickable
                    }
                  },
                  undo: () => {
                    for (const object of objects) {
                      object.userData.pickable = !pickable
                    }
                  },
                })
              }}
            />
          )
        })}
      </div>
    </div >
  )
}

export function HierachyPanel() {
  return (
    <Foldable
      title='Hierarchy'
      content={() => <Inner />}
    />
  )
}

