import * as Blockly from 'blockly';

/**
 * Init select / unselect function for blocks
 * Method `onSelect_` / `onUnselect_` of block instance will be called if block selected / unselected
 * @param {Blockly.Workspace} ws Blockly Workspace
 */
export function initBlockSelect(ws) {
  ws.addChangeListener(e => {
    if (e.type !== Blockly.Events.SELECTED) return;
    if (e.workspaceId == null) return;
    const workspace = Blockly.Workspace.getById(e.workspaceId);
    if (workspace == null) return;

    const oldBlock = e.oldElementId && workspace.getBlockById(e.oldElementId);
    const newBlock = e.newElementId && workspace.getBlockById(e.newElementId);
    if (oldBlock != null && (typeof oldBlock.onUnselect_ === 'function')) oldBlock.onUnselect_();
    if (newBlock != null && (typeof newBlock.onSelect_ === 'function')) newBlock.onSelect_();
  });
}

/**
 * Init input connect / disconnect function for blocks' input
 * Method `onInputConnect_` / `onInputDisconnect_` of block instance will be called if block's input connected / disconnected
 * @param {Blockly.Workspace} ws Blockly Workspace
 */
export function initBlockInputConnect(ws) {
  ws.addChangeListener(e => {
    // console.debug(e.type, e) // TODO: remove me

    if (e.type !== Blockly.Events.MOVE) return;
    if (e.workspaceId == null) return;
    const workspace = Blockly.Workspace.getById(e.workspaceId);
    if (workspace == null) return;

    if (e.reason.includes('connect')) {
      const parentBlock = workspace.getBlockById(e.newParentId)
      const parentInputName = e.newInputName
      const childBlock = workspace.getBlockById(e.blockId)

      if (parentBlock != null && (typeof parentBlock.onInputConnect_ === 'function')) {
        parentBlock.onInputConnect_(parentInputName, childBlock)
      }
    }

    if (e.reason.includes('disconnect')) {
      const parentBlock = workspace.getBlockById(e.oldParentId)
      const parentInputName = e.oldInputName
      const childBlock = workspace.getBlockById(e.blockId)

      if (parentBlock != null && (typeof parentBlock.onInputDisconnect_ === 'function')) {
        parentBlock.onInputDisconnect_(parentInputName, childBlock)
      }
    }
  });
}

/**
 * Init field change function for blocks
 * Method `onFieldChange_` of block instance will be called if block field changed
 * @param {Blockly.Workspace} ws Blockly Workspace
 */
export function initBlockFieldChange(ws) {
  ws.addChangeListener(e => {
    if (e.type !== Blockly.Events.CHANGE) return;
    if (e.element !== 'field') return
    if (e.workspaceId == null) return;
    const workspace = Blockly.Workspace.getById(e.workspaceId);
    if (workspace == null) return;

    const block = e.blockId && workspace.getBlockById(e.blockId);
    if (block != null && (typeof block.onFieldChange_ === 'function')) block.onFieldChange_(e.name, e.oldValue, e.newValue);
  });
}

/**
 * Init change function for blocks
 * Method `onChange_` of block instance will be called if block input or field changed
 * @param {Blockly.Workspace} ws Blockly Workspace
 */
export function initBlockChange(ws) {
  ws.addChangeListener(e => {

    if (!e.workspaceId) return;

    const workspace = Blockly.Workspace.getById(e.workspaceId);
    if (workspace == null) return;

    // connect / disconnect
    if (e.type === Blockly.Events.MOVE) {
      if (e.reason.includes('connect')) {
        const parentBlock = workspace.getBlockById(e.newParentId);
        if (parentBlock != null && (typeof parentBlock.onChange_ === 'function')) {
          parentBlock.onChange_('connect');
        }
      }
      if (e.reason.includes('disconnect')) {
        const parentBlock = workspace.getBlockById(e.oldParentId);
        if (parentBlock != null && (typeof parentBlock.onChange_ === 'function')) {
          parentBlock.onChange_('disconnect');
        }
      }
    }

    // field change
    if (e.type === Blockly.Events.CHANGE && e.element === 'field') {
      const block = e.blockId && workspace.getBlockById(e.blockId);
      if (block != null && (typeof block.onChange_ === 'function')) block.onChange_('field-change');
    }

  });
}
