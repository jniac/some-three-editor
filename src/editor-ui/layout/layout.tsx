import { ReactNode } from 'react'

import { handleSize } from 'some-utils-dom/handle/size'
import { useEffects } from 'some-utils-react/hooks/effects'
import { makeClassName as mc } from 'some-utils-react/utils/classname'
import { Direction, Space } from 'some-utils-ts/experimental/layout/flex'

import { useEditor } from '../../editor-provider'
import { PanelBackground } from '../panel'

import { Rectangle } from 'some-utils-ts/math/geom/rectangle'
import ms from '../main.module.css'
import s from './layout.module.css'

function Placeholder() {
  // return (
  //   <svg fill='none' stroke='currentColor' strokeWidth={1} width='100%' height='100%'>
  //     <rect width='100%' height='100%' />
  //     <line x1='0' y1='0' x2='100%' y2='100%' />
  //     <line x1='100%' y1='0' x2='0' y2='100%' />
  //   </svg>
  // )
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <PanelBackground />
    </div>
  )
}

/**
 * ╔═══════════╤════════════════════════╤════════════╗
 * ║           │         TopBar         │            ║
 * ║           ├────────────────────────┤            ║
 * ║           │                        │            ║
 * ║           │                        │            ║
 * ║           │                        │            ║
 * ║           │                        │            ║
 * ║  LeftCol  │        Viewport        │  RightCol  ║
 * ║           │                        │            ║
 * ║           │                        │            ║
 * ║           │                        │            ║
 * ╟───────────┴────────────────────────┴────────────╢
 * ║                   BottomBar                     ║
 * ╚═════════════════════════════════════════════════╝
 */
export function Layout(props: Partial<{
  topBar: ReactNode
  leftCol: ReactNode
  rightCol: ReactNode
  bottomBar: ReactNode
  children: ReactNode
}>) {
  const editor = useEditor()

  const { ref } = useEffects<HTMLDivElement>(function* (div) {
    const spacing = 8

    const root = new Space(Direction.Vertical)
      .setPadding(spacing)
      .setSize(div.clientWidth, div.clientHeight)

    const bottomBarOpposite = new Space()
      .setSize('1rel', '1fr')
      .addTo(root)

    const bottomBarGrab = new Space()
      .setSize('1rel', spacing)
      .addTo(root)

    const bottomBar = new Space()
      .setSize('1rel', '200abs')
      .addTo(root)

    const leftCol = new Space()
      .setSize('280abs', '1fr')
      .addTo(bottomBarOpposite)

    const leftColGrab = new Space()
      .setSize(spacing, '1fr')
      .addTo(bottomBarOpposite)

    const middleCol = new Space(Direction.Vertical)
      .setSize('1fr', '1fr')
      .addTo(bottomBarOpposite)

    const rightColGrab = new Space()
      .setSize(spacing, '1fr')
      .addTo(bottomBarOpposite)

    const rightCol = new Space()
      .setSize('280abs', '1fr')
      .addTo(bottomBarOpposite)

    const topBar = new Space()
      .setSize('1fr', '48abs')
      .addTo(middleCol)

    const viewport = new Space()
      .setSize('1fr', '1fr')
      .addTo(middleCol)

    function applyRect(element: HTMLElement, rect: Rectangle) {
      const { width, height, top, left } = rect
      element.style.left = `${left}px`
      element.style.top = `${top}px`
      element.style.width = `${width}px`
      element.style.height = `${height}px`
    }

    /**
     * A closure-class (catching "div" from the current scope) WoW!
     */
    class SpaceBundle {
      element: HTMLDivElement
      constructor(
        public name: string,
        public space: Space,
      ) {
        this.element = div.querySelector<HTMLDivElement>(`.${name}`)!
      }
      show() {
        this.element.style.removeProperty('display')
      }
      hide() {
        this.element.style.setProperty('display', 'none')
      }
      update() {
        applyRect(this.element, this.space.rect)
      }
    }

    const bundles = [
      new SpaceBundle('bottom-bar', bottomBar),
      new SpaceBundle('left-col', leftCol),
      new SpaceBundle('right-col', rightCol),
      new SpaceBundle('top-bar', topBar),
    ]
    // Viewport is special
    const viewportBundle = new SpaceBundle('viewport', viewport)

    const viewportElement = div.querySelector<HTMLDivElement>('.viewport')!
    const viewportFrameElement = div.querySelector<HTMLDivElement>('.viewport-frame')!
    function update() {
      root.computeLayout()

      // Visible:
      if (editor.uiVisibility.is(true)) {
        viewportFrameElement.style.removeProperty('display')
        for (const bundle of bundles) {
          bundle.show()
          bundle.update()
        }
        viewportBundle.update()
      }

      // Hidden:
      else {
        for (const bundle of bundles) {
          bundle.hide()
        }
        viewportFrameElement.style.setProperty('display', 'none')
        applyRect(viewportElement, root.rect)
      }
    }

    update()

    yield editor.uiVisibility.onChange(update)

    yield handleSize(div, {
      onSize: info => {
        root.setSize(info.size.x, info.size.y)
        update()
      }
    })

  }, [])

  return (
    <div ref={ref} className={mc(s.Layout, ms.Abs0, ms.Thru)}>
      <div className='bottom-bar'>{props.bottomBar ?? <Placeholder />}</div>
      <div className='top-bar'>{props.topBar ?? <Placeholder />}</div>
      <div className='left-col'>{props.leftCol ?? <Placeholder />}</div>
      <div className='right-col'>{props.rightCol ?? <Placeholder />}</div>
      <div className={mc('viewport', ms.Thru)}>
        <div
          className={mc('viewport-frame', ms.Abs0, ms.Thru)}
          style={{
            border: '1px solid #fff3',
            borderRadius: '6px',
          }}
        />
        {props.children}
      </div>
    </div>
  )
}