export enum ToolType {
  Select = 'select',
  Rotate = 'rotate',
  Move = 'move',
  Scale = 'scale'
}

export enum SpaceMode {
  World = 'world',
  Local = 'local'
}

export enum Scope {
  Public = 'public',
  Internal = 'internal',
}

export enum Visibility {
  Visible = 'visible',
  Hidden = 'hidden',
}

export type Metadata = {
  scope: Scope
  hierarchyVisibility: Visibility
  hierarchyOpen: boolean
  sceneVisibility: Visibility
  selectable: boolean
}

export type CommandArg = {
  comment?: string
  execute(): void
  undo(): void
}
