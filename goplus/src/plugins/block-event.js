import * as Blockly from 'blockly';

/** drag 状态 & 事件总线，用于其他模块消费 drag 状态 */
export const dragBus = {

  draggingId: null,

  listeners: [],

  isDragging() {
    return this.draggingId != null;
  },

  fireStart(blockId) {
    this.draggingId = blockId;
  },

  fireEnd(blockId) {
    if (this.draggingId === blockId) {
      this.draggingId = null;

      const listeners = this.listeners;
      this.listeners = [];
      for (const fn of listeners) {
        fn();
      }
    }
  },

  onceEnd(fn) {
    this.listeners.push(fn);
  }
};

/**
 * Init select / unselect function for blocks
 * Method `onSelect_` / `onUnselect_` of block instance will be called if block selected / unselected
 * @param {Blockly.Workspace} ws Blockly Workspace
 */
export function initBlockSelect(ws) {
  let currId = null;

  ws.addChangeListener(e => {
    if (e.type !== Blockly.Events.SELECTED) return;
    if (e.workspaceId == null) return;
    const workspace = Blockly.Workspace.getById(e.workspaceId);
    if (workspace == null) return;

    let oldId, newId;
    if (e.oldElementId === e.newElementId) {
      oldId = currId;
      newId = e.newElementId;
    } else {
      oldId = e.oldElementId;
      newId = e.newElementId;
    }

    const oldBlock = oldId && workspace.getBlockById(oldId);
    const newBlock = newId && workspace.getBlockById(newId);
    if (oldBlock != null && (typeof oldBlock.onUnselect_ === 'function')) oldBlock.onUnselect_();
    if (newBlock != null && (typeof newBlock.onSelect_ === 'function')) newBlock.onSelect_();

    currId = e.newElementId;
  });

  ws.addChangeListener(e => {
    if (e.type !== Blockly.Events.BLOCK_DRAG) return;
    if (e.isStart) {
      dragBus.fireStart(e.blockId);
    } else {
      dragBus.fireEnd(e.blockId);
    }
  })
}

/**
 * Init change function for blocks
 * Method `onChange_` of block instance will be called if block input or field changed
 * @param {Blockly.Workspace} ws Blockly Workspace
 */
export function initBlockChange(ws) {
  // TODO: 这里是否可使用 setOnChange 替代？
  ws.addChangeListener(e => {

    if (!e.workspaceId) return;

    const workspace = Blockly.Workspace.getById(e.workspaceId);
    if (workspace == null) return;

    // connect / disconnect
    if (e.type === Blockly.Events.MOVE) {
      if (e.reason?.includes('connect')) {
        const parentBlock = workspace.getBlockById(e.newParentId);
        if (parentBlock != null && (typeof parentBlock.onChange_ === 'function')) {
          // 50 的 timeout 是等待 connect 操作完成（block 数据，如 connection 等，完成更新）
          setTimeout(() => {
            parentBlock.onChange_('connect');
          }, 50);
        }
      }
      if (e.reason?.includes('disconnect')) {
        const parentBlock = workspace.getBlockById(e.oldParentId);
        if (parentBlock != null && (typeof parentBlock.onChange_ === 'function')) {
          // 50 的 timeout 是等待 disconnect 操作完成（block 数据，如 connection 等，完成更新）
          setTimeout(() => {
            parentBlock.onChange_('disconnect');
          }, 50);
        }
      }
    }

    // field change
    if (e.type === Blockly.Events.CHANGE && e.element === 'field') {
      const block = e.blockId && workspace.getBlockById(e.blockId);
      if (block != null && (typeof block.onChange_ === 'function')) {
        // 50 的 timeout 是等待 change 操作完成
        setTimeout(() => {
          block.onChange_('field-change');
        }, 50);
      }
    }

  });
}
