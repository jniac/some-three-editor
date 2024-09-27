import { Object3D } from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { TransformControls } from 'three/addons/controls/TransformControls.js'
import yaml from 'yaml'

import { ThreeWebglContext } from 'some-utils-three/contexts/webgl'
import { isParentOf } from 'some-utils-three/utils/parenting'
import { destroy } from 'some-utils-ts/misc/destroy'
import { Observable, ObservableNumber } from 'some-utils-ts/observables'
import { Destroyable } from 'some-utils-ts/types'

import { initHotkeys } from './init/hotkeys'
import { initRaycast } from './init/raycast'
import { HistoryManager } from './managers/history'
import { MetadataManager } from './managers/metadata'
import { SelectionManager } from './managers/selection'
import { TransformAction } from './transform-action'
import { SpaceMode, ToolType } from './types'

/**
 * Editor context.
 *
 * Handles editor state and tools.
 */
export class EditorContext {
  static instances: EditorContext[] = []
  static current = () => EditorContext.instances[EditorContext.instances.length - 1]

  destroyables = [] as Destroyable[]

  constructor(public three: ThreeWebglContext) {
    three.gizmoScene.add(this.transformControls)
    this.destroyables.push(...this.init())
    EditorContext.instances.push(this)
  }

  uiVisibility = new Observable(true)
  showUI = () => this.uiVisibility.set(true)
  hideUI = () => this.uiVisibility.set(false)
  toggleUI = () => this.uiVisibility.set(!this.uiVisibility.value)

  history = new HistoryManager()
  metadata = new MetadataManager()
  sceneSelection = new SelectionManager<Object3D>(this.history, {
    filter: object => object instanceof Object3D,
  })

  toolType = new Observable(ToolType.Select)
  spaceMode = new Observable(SpaceMode.Local)

  orbitControls = new OrbitControls(this.three.perspectiveCamera, this.three.renderer.domElement)
  transformControls = new TransformControls(this.three.perspectiveCamera, this.three.renderer.domElement)

  /**
   * Redirects to three.ticker.
   * @deprecated Use three.ticker instead.
   */
  get ticker() { return this.three.ticker }


  private state = {
    refresh: new ObservableNumber(0),
  }

  reset() {
    this.sceneSelection.clear('Editor Context Reset')
    this.transformControls.detach()
  }

  toPlainObject() {
    return {
      toolType: this.toolType.value,
      spaceMode: this.spaceMode.value,
    }
  }

  serialize() {
    return yaml.stringify(this.toPlainObject())
  }

  deserialize(data: string) {
    const obj = yaml.parse(data)
    this.toolType.set(obj.toolType ?? ToolType.Select)
    this.spaceMode.set(obj.spaceMode ?? SpaceMode.Local)
  }

  private *init() {
    const {
      three,
      history,
      metadata,
      sceneSelection,
      toolType,
      spaceMode,
      transformControls,
      orbitControls,
      onRefresh,
      requestRefreshImmediate,
    } = this

    yield history.onChange(requestRefreshImmediate)
    yield metadata.onChange(requestRefreshImmediate)
    yield sceneSelection.onChange(() => {
      three.pipeline.basicPasses.outline.selectedObjects = Array.from(sceneSelection.objects)
      requestRefreshImmediate()
    })
    yield toolType.onChange(requestRefreshImmediate)
    yield spaceMode.onChange(requestRefreshImmediate)

    // pointer event reset / consumed check
    yield three.ticker.onTick({ order: -1 }, () => {
      three.pointer.event.reset()
    })
    yield three.ticker.onTick({ order: 1 }, () => {
      orbitControls.enabled = (three.pointer.event.consumed === false) && userIsEditingTransform.value === false
    })

    // Handling transform + undo/redo
    const userIsEditingTransform = new Observable(false)
    const transformAction = new TransformAction([])
    userIsEditingTransform.onChange(value => {
      if (value) {
        transformAction
          .reset(sceneSelection.objects)
          .comment(`Transform "${toolType.value}" (${spaceMode.value})`)
          .beforeSnapshot()
      } else {
        transformAction
          .afterSnapshot()
          .flush(this)
      }
    })

    // TODO: This has to be fixed.
    // That should not happen. The TransformControls should be detached when the object is removed from the scene. 
    yield three.ticker.onTick(() => {
      if (transformControls.object) {
        if (!isParentOf(three.scene, transformControls.object)) {
          transformControls.detach()
        }
      }
    })

    transformControls.addEventListener('dragging-changed', event => {
      userIsEditingTransform.set(!!event.value)
      orbitControls.enabled = !event.value
    })

    orbitControls.addEventListener('change', () => {
      transformControls.enabled = false
    })
    orbitControls.addEventListener('end', () => updateTransformControls())
    orbitControls.enabled = false

    const updateTransformControls = () => {
      const objects = Array.from(sceneSelection.objects)

      if (objects.length === 1) {
        transformControls.visible = true
        transformControls.attach(objects[0])

        const tool = toolType.value
        const toolIsSelect = tool === ToolType.Select
        transformControls.visible = !toolIsSelect && !!transformControls.object
        transformControls.enabled = !toolIsSelect && !!transformControls.object
        if (!toolIsSelect) {
          const mode = ({
            [ToolType.Rotate]: 'rotate',
            [ToolType.Move]: 'translate',
            [ToolType.Scale]: 'scale',
          } as const)[tool]
          transformControls.setMode(mode)
        }

        transformControls.setSpace(spaceMode.value === SpaceMode.Local ? 'local' : 'world')
      }

      else {
        transformControls.visible = false
      }
    }

    onRefresh(updateTransformControls)

    yield* initHotkeys(this)
    yield* initRaycast(this)
  }

  dispose() {
    this.transformControls.dispose()
    this.orbitControls.dispose()
    destroy(...this.destroyables)
  }

  destroy = () => {
    EditorContext.instances.splice(EditorContext.instances.indexOf(this), 1)
    this.dispose()
  }

  onRefresh = this.state.refresh.onChange.bind(this.state.refresh)

  static requestRefreshDefaultOptions = {
    /** Time to wait in seconds */
    delay: 0,
    /** Frames to wait. If defined, this will be used instead of "delay". */
    frames: undefined as number | undefined,
  }
  requestRefresh = (options?: Partial<typeof EditorContext.requestRefreshDefaultOptions>) => {
    const { delay, frames } = { ...EditorContext.requestRefreshDefaultOptions, ...options }

    let value = this.state.refresh.value + 1

    // Using frames:
    if (frames !== undefined) {
      let count = frames
      const callback = () => {
        if (count-- > 0) {
          if (this.state.refresh.value < value) {
            window.requestAnimationFrame(callback)
          }
        } else {
          this.state.refresh.set(Math.max(value, this.state.refresh.value))
        }
      }
      window.requestAnimationFrame(callback)
    }

    // Using delay:
    else {
      const timeout = window.performance.now() + delay * 1000
      const callback = () => {
        if (window.performance.now() < timeout) {
          if (this.state.refresh.value < value) {
            window.requestAnimationFrame(callback)
          }
        } else {
          this.state.refresh.set(Math.max(value, this.state.refresh.value))
        }
      }
      window.requestAnimationFrame(callback)
    }
  }

  requestRefreshImmediate = () => {
    this.requestRefresh({ delay: 0 })
  }
}

