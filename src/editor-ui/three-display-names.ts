import { Group, InstancedMesh, Mesh, Object3D, Points, Scene } from 'three'

/**
 * Preserves the names of Three.js classes through the `displayName` property.
 */
export function initThreeDisplayNames() {
  function set(target: object, displayName: string) {
    Object.defineProperty(target, 'displayName', { value: displayName })
  }

  set(Group, 'Group')
  set(InstancedMesh, 'InstancedMesh')
  set(Mesh, 'Mesh')
  set(Object3D, 'Object3D')
  set(Points, 'Points')
  set(Scene, 'Scene')
}
