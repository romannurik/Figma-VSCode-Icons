import { emit, on, once, showUI } from '@create-figma-plugin/utilities';
import allIcons from "./codicons";
import { CloseHandler, NeedsSetupHandler, SelectionChangeHandler } from './types';

const CODICON_FONT_NAME: FontName = { family: 'codicon', style: 'Regular' };

export default async function () {
  once<CloseHandler>('CLOSE', function () {
    figma.closePlugin()
  })

  on<SelectionChangeHandler>('SELECTION_CHANGE', iconCharacter => {
    if (!iconCharacter) return;
    let iconName = allIcons.find(ic => ic.character === iconCharacter)?.shortName;
    let selectedTextNodes = figma.currentPage.selection.filter(n => n.type === 'TEXT') as TextNode[];
    for (let node of selectedTextNodes) {
      if (node.name.match(/^codicon:/)) {
        node.name = iconName ? `codicon: ${iconName}` : 'codicon';
      }
      node.characters = iconCharacter;
    }
    if (!selectedTextNodes.length) {
      figma.currentPage.selection = [newCodiconNode(iconCharacter, figma.viewport.center, figma.currentPage)];
    }
  });

  figma.on('drop', (event) => {
    let { items, node } = event;
    if (!('children' in node) || node.type === 'DOCUMENT') {
      return false;
    }

    figma.currentPage.selection = [newCodiconNode(items[0]?.data || '', event, node)];
    return true;
  });

  function newCodiconNode(iconCharacter: string, pos: Vector, parent: ChildrenMixin): TextNode {
    const newNode = figma.createText();
    let iconName = allIcons.find(ic => ic.character === iconCharacter)?.shortName;
    newNode.name = iconName ? `codicon: ${iconName}` : 'codicon';
    newNode.fontName = CODICON_FONT_NAME;
    newNode.fontSize = 16;
    newNode.characters = iconCharacter;
    parent.appendChild(newNode);
    newNode.x = pos.x;
    newNode.y = pos.y;
    return newNode;
  }

  figma.on('selectionchange', () => updateFromSelection());

  showUI({
    height: 400,
    width: 300
  });

  try {
    await figma.loadFontAsync(CODICON_FONT_NAME);
  } catch (e) {
    await new Promise(resolve => setTimeout(resolve, 500));
    emit<NeedsSetupHandler>('NEEDS_SETUP');
    return false;
  }

  updateFromSelection();

  function updateFromSelection() {
    let texts = new Set(figma.currentPage.selection.filter(n => n.type === 'TEXT').map(n => (n as TextNode).characters));
    if (texts.size !== 1) {
      emit<SelectionChangeHandler>('SELECTION_CHANGE', null);
      return;
    }
    emit<SelectionChangeHandler>('SELECTION_CHANGE', Array.from(texts)[0]);
  }
}
