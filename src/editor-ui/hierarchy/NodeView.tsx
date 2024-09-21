import { makeClassName as mc } from 'some-utils-react/utils/classname'
import { some } from 'some-utils-ts/iteration/high-order'

import { EventWrapper } from '../utils/EventWrapper'

import { LinkA } from './LinkA'
import { NodeInfo } from './NodeInfo'

// SVGs
import PickableOffSvg from '../../svg/pure/pickable-off.svg'
import PickableOnSvg from '../../svg/pure/pickable-on.svg'
import VisibilityOffSvg from '../../svg/pure/visibility-off.svg'
import VisibilityOnSvg from '../../svg/pure/visibility-on.svg'

import ms from '../main.module.css'
import s from './hierarchy.module.css'

export function NodeView({
  node,
  onClick,
  onLinkClick,
  onVisibilityClick,
  onPickableClick,
}: {
  node: NodeInfo
  onClick?: (event: EventWrapper) => void
  onLinkClick?: (event: EventWrapper) => void
  onVisibilityClick?: (event: EventWrapper) => void
  onPickableClick?: (event: EventWrapper) => void
}) {
  const childCount = node.children.length
  const { isSelected } = node
  const { selectable, hierarchyOpen } = node.metadata
  const containsSelectedChild = !hierarchyOpen && some(node.descendants(), n => n.isSelected)
  return (
    <div
      className={mc(
        s.Node,
        isSelected && s.isSelected,
        selectable && s.selectable,
        containsSelectedChild && s.containsSelectedChild,
      )}
      onClick={event => {
        event.preventDefault()
        onClick?.(new EventWrapper(event.nativeEvent))
      }}
    >
      <div className={s.Background} />

      <div onClick={event => {
        event.preventDefault()
        event.stopPropagation()
        onLinkClick?.(new EventWrapper(event.nativeEvent))
      }}>
        <LinkA node={node} />
      </div>

      <div className={s.Label}>
        {!!node.object.name
          ? (
            <span>{node.object.name}</span>
          ) : (
            <span className={s.ConstructorName}>
              {node.object.constructor.name}
            </span>
          )}

        {childCount > 0 && (
          <span className={s.ChildCount}>
            {node.totalChildCount > childCount
              ? <>({childCount}/{node.totalChildCount})</>
              : <>({childCount})</>
            }
          </span>
        )}
      </div>

      <div className={mc(ms.Abs, s.RightButtons)}>
        <div
          onClick={event => {
            event.preventDefault()
            event.stopPropagation()
            onPickableClick?.(new EventWrapper(event.nativeEvent))
          }}
        >
          {node.object.userData.pickable !== false
            ? (
              <div className={s.RequireHover}>
                <PickableOnSvg />
              </div>
            )
            : (
              <div className={s.FadeInHover}>
                <PickableOffSvg />
              </div>
            )}
        </div>

        <div
          onClick={event => {
            event.preventDefault()
            event.stopPropagation()
            onVisibilityClick?.(new EventWrapper(event.nativeEvent))
          }}
        >
          {node.object.visible
            ? (
              <div className={s.RequireHover}>
                <VisibilityOnSvg />
              </div>
            )
            : (
              <div className={s.FadeInHover}>
                <VisibilityOffSvg />
              </div>
            )}
        </div>
      </div>
    </div>
  )
}
