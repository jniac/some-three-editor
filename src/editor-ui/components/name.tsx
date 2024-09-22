import { Object3D } from 'three'

export function SpanName({
  prefix = '',
  object,
}: {
  prefix?: string
  object: Object3D
}) {
  return !!object.name
    ? <span>{prefix}{object.name}</span>
    : <span style={{ fontStyle: 'italic' }}>{prefix}{object.constructor.name}</span>
}