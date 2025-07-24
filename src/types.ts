import { EventHandler } from '@create-figma-plugin/utilities'

export interface SelectionChangeHandler extends EventHandler {
  name: 'SELECTION_CHANGE'
  handler: (iconCharacter: string | null) => void
}

export interface NeedsSetupHandler extends EventHandler {
  name: 'NEEDS_SETUP'
  handler: () => void
}

export interface CloseHandler extends EventHandler {
  name: 'CLOSE'
  handler: () => void
}

// https://www.figma.com/plugin-docs/creating-ui/
// why isn't this in the Figma API types?
export interface PluginDrop {
  // clientX and clientY taken from the browser's DragEvent
  clientX: number
  clientY: number
  items?: DropItem[]
  // array of File objects (https://developer.mozilla.org/en-US/docs/Web/API/File)
  files?: File[]
  dropMetadata?: any // use this to communicate additional data for the drop event
}
