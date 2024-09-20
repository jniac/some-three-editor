import { useObservableValue } from 'some-utils-react/hooks/observables'
import { makeClassName } from 'some-utils-react/utils/classname'

import { SpaceMode, ToolType } from '../../editor-context'
import { useEditor } from '../../editor-provider'

import LocalSvg from '../../svg/pure/local.svg'
import RotateSvg from '../../svg/pure/rotate.svg'
import ScaleSvg from '../../svg/pure/scale.svg'
import SelectSvg from '../../svg/pure/select.svg'
import TranslateSvg from '../../svg/pure/translate.svg'
import WorldSvg from '../../svg/pure/world.svg'

import { PanelBackground } from '../panel'
import styles from './styles.module.css'

function SpaceButton() {
  const editor = useEditor()
  const spaceMode = useObservableValue(editor.spaceMode)

  return (
    <button
      className={styles.ToolbarButton}
      style={{ flex: '0 0 3.5em' }}
      onClick={() => {
        editor.spaceMode.set(
          spaceMode === SpaceMode.World
            ? SpaceMode.Local
            : SpaceMode.World
        )
      }}
    >
      {spaceMode === SpaceMode.World
        ? (
          <>
            <WorldSvg />
            <span>World</span>
          </>
        )
        : (
          <>
            <LocalSvg />
            <span>Local</span>
          </>
        )
      }
    </button>
  )
}

function ToolTypeSwitch() {
  const editor = useEditor()
  const toolType = useObservableValue(editor.toolType)

  return (
    <div className={styles.ToolTypeSwitch}>
      <div
        className={makeClassName(styles.Toggle, toolType === ToolType.Select && styles.active)}
        onClick={() => editor.toolType.set(ToolType.Select)}
      >
        <SelectSvg />
      </div>

      <div
        className={makeClassName(styles.Toggle, toolType === ToolType.Move && styles.active)}
        onClick={() => editor.toolType.set(ToolType.Move)}
      >
        <TranslateSvg />
      </div>

      <div
        className={makeClassName(styles.Toggle, toolType === ToolType.Rotate && styles.active)}
        onClick={() => editor.toolType.set(ToolType.Rotate)}
      >
        <RotateSvg />
      </div>

      <div
        className={makeClassName(styles.Toggle, toolType === ToolType.Scale && styles.active)}
        onClick={() => editor.toolType.set(ToolType.Scale)}
      >
        <ScaleSvg />
      </div>
    </div>
  )
}

export function Toolbar() {
  return (
    <div className={styles.Toolbar}>
      <PanelBackground />
      <div className={styles.Wrapper}>
        <SpaceButton />
        <ToolTypeSwitch />
      </div>
    </div>
  )
}