import { Group, InstancedMesh, Mesh, Object3D, Points, Scene } from 'three'

/**
 * Preserves the names of Three.js classes through the `displayName` property.
 */
export function initThreeDisplayNames() {
  // Skip if not in the browser.
  if (typeof window === 'undefined') {
    return
  }

  function set(target: object, displayName: string) {
    // Assigning static "displayName" property to the class.
    Object.defineProperty(target, 'displayName', { value: displayName, writable: true })
  }

  set(Group, 'Group')
  set(InstancedMesh, 'InstancedMesh')
  set(Mesh, 'Mesh')
  set(Object3D, 'Object3D')
  set(Points, 'Points')
  set(Scene, 'Scene')
}
