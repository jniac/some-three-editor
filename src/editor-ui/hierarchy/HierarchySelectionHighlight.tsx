import { some } from 'some-utils-ts/iteration/high-order'

import { NodeInfo } from './NodeInfo'

export function HierarchySelectionHighlight({ tree }: { tree: NodeInfo }) {
  class Block {
    nodes: number[] = [];
  }

  class BlockHandler {
    blocks: Block[] = [];
    current: Block | null = null;

    getCurrent() {
      if (this.current) {
        return this.current
      }

      this.current = new Block()
      this.blocks.push(this.current)
      return this.current
    }

    add(node: number) {
      this.getCurrent().nodes.push(node)
    }

    close() {
      this.current = null
    }

    generateSvgContent() {
      return this.blocks.map((block, blockIndex) => {
        if (block.nodes.length === 0) {
          return null
        }

        const x = .5
        const y = block.nodes[0] * 18 + .5
        return (
          <g key={blockIndex}>
            <rect
              x={x}
              y={y}
              width='calc(100% - 1px)'
              height={block.nodes.length * 18 - 1}
              rx='.15em'
            />
            {block.nodes.length > 0 && Array.from({ length: block.nodes.length - 1 }, (_, i) => {
              const ly = y + (i + 1) * 18
              return (
                <line
                  key={i}
                  x1={x + 2}
                  x2={'calc(100% - 2.5px)'}
                  y1={ly}
                  y2={ly}
                />
              )
            })}
          </g>
        )
      })
    }
  }

  const selected = new BlockHandler()
  const containsSelected = new BlockHandler()

  for (const [nodeIndex, node] of tree.allNodes!.entries()) {
    // Skip the root.
    if (nodeIndex === 0) {
      continue
    }

    if (node.isSelected) {
      selected.add(nodeIndex)
    } else {
      selected.close()
    }

    if (node.metadata.hierarchyOpen === false && some(node.descendants(), descendant => descendant.isSelected)) {
      containsSelected.add(nodeIndex)
    } else {
      containsSelected.close()
    }
  }

  return (
    <svg
      width='100%'
      height='100%'
    >
      <g
        fill='#ffffff11'
        stroke='#ffffff33'
        strokeWidth='1'
      >
        {selected.generateSvgContent()}
      </g>

      <g
        fill='none'
        stroke='#ffffff33'
        strokeWidth='1'
      >
        {containsSelected.generateSvgContent()}
      </g>
    </svg>
  )
}
