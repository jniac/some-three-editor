import { handlePointer } from 'some-utils-dom/handle/pointer'
import { useEffects, useLayoutEffects } from 'some-utils-react/hooks/effects'

import { NodeInfo } from './NodeInfo'

import HierarchyNodeSvg from './HierarchyNode.svg'

import styles from './hierarchy.module.css'

export function LinkA({
  node,
}: {
  node: NodeInfo
}) {
  const { ref } = useLayoutEffects<HTMLDivElement>(function* (div) {
    const baseSize = 6
    const svgBaseSize = 8

    const svg = div.querySelector('svg')!

    svg.width.baseVal.value = 3 * baseSize + baseSize * node.depth * 2
    svg.height.baseVal.value = 3 * baseSize

    svg.viewBox.baseVal.width = 3 * svgBaseSize + svgBaseSize * node.depth * 2
    svg.viewBox.baseVal.x = -svgBaseSize * node.depth * 2

    const g = svg.querySelector('g')!
    const [closed, child, ending, parent, line, circle, dot] = g.children

    const { children } = node
    const open = children.length > 0 && node.metadata.hierarchyOpen
    const isLastChild = node.isLastChild()
    line.setAttributeNS(null, 'visibility', 'hidden')
    child.setAttributeNS(null, 'visibility', open ? 'visible' : 'hidden')
    closed.setAttributeNS(null, 'visibility', node.isClosed() && node.childCount > 0 ? 'visible' : 'hidden')
    ending.setAttributeNS(null, 'visibility', node.parent && isLastChild ? 'visible' : 'hidden')
    parent.setAttributeNS(null, 'visibility', node.parent && !isLastChild ? 'visible' : 'hidden')

    circle.setAttributeNS(null, 'visibility', node.childCount > 0 ? 'visible' : 'hidden')
    dot.setAttributeNS(null, 'visibility', node.childCount === 0 ? 'visible' : 'hidden')

    for (const child of svg.querySelectorAll('.parent-line')) {
      child.remove()
    }

    {
      let parent = node.parent
      let reverseDepth = 1
      while (parent) {
        const next = parent.getNextSibling()
        if (next) {
          const parentLine = line.cloneNode() as SVGElement
          parentLine.classList.add('parent-line')
          parentLine.setAttributeNS(null, 'visibility', 'visible')
          parentLine.setAttributeNS(null, 'transform', `translate(${-svgBaseSize * reverseDepth * 2}, 0)`)
          svg.appendChild(parentLine)
        }

        parent = parent.parent
        reverseDepth += 1
      }
    }
  }, 'always')

  useEffects(function* () {
    const div = ref.current!
    const dot = div.querySelector('#dot')!
    if (node.childCount > 0) {
      yield handlePointer(div, {
        onEnter() {
          dot.setAttributeNS(null, 'visibility', 'visible')
        },
        onLeave() {
          dot.setAttributeNS(null, 'visibility', 'hidden')
        },
      })
    }
  }, 'always')

  return (
    <div ref={ref} className={styles.Link}>
      <HierarchyNodeSvg />
    </div>
  )
}

