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
