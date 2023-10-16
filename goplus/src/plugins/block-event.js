import * as Blockly from 'blockly';

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
 * Init input connect / disconnect function for blocks' input
 * Method `onInputConnect_` / `onInputDisconnect_` of block instance will be called if block's input connected / disconnected
 * @param {Blockly.Workspace} ws Blockly Workspace
 */
export function initBlockInputConnect(ws) {
  ws.addChangeListener(e => {
    if (e.type !== Blockly.Events.MOVE) return;
    if (e.workspaceId == null) return;
    const workspace = Blockly.Workspace.getById(e.workspaceId);
    if (workspace == null) return;

    if (e.reason?.includes('connect')) {
      const parentBlock = workspace.getBlockById(e.newParentId)
      const parentInputName = e.newInputName
      const childBlock = workspace.getBlockById(e.blockId)

      if (parentBlock != null && (typeof parentBlock.onInputConnect_ === 'function')) {
        parentBlock.onInputConnect_(parentInputName, childBlock)
      }
    }

    if (e.reason?.includes('disconnect')) {
      const parentBlock = workspace.getBlockById(e.oldParentId)
      const parentInputName = e.oldInputName
      const childBlock = workspace.getBlockById(e.blockId)

      if (parentBlock != null && (typeof parentBlock.onInputDisconnect_ === 'function')) {
        // 事件触发的时候 connection 关系还在
        // TODO: 其他几种情况也加下 timeout？
        setTimeout(() => {
          parentBlock.onInputDisconnect_(parentInputName, childBlock)
        }, 0);
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

    if ( // TODO: remove me
      // e.type !== 'click'
      e.type !== 'change'
    ) {
      console.debug(Date.now() / 1000, e.type, e)
    }

    if (!e.workspaceId) return;

    const workspace = Blockly.Workspace.getById(e.workspaceId);
    if (workspace == null) return;

    // connect / disconnect
    if (e.type === Blockly.Events.MOVE) {
      if (e.reason?.includes('connect')) {
        const parentBlock = workspace.getBlockById(e.newParentId);
        if (parentBlock != null && (typeof parentBlock.onChange_ === 'function')) {
          parentBlock.onChange_('connect');
        }
      }
      if (e.reason?.includes('disconnect')) {
        const parentBlock = workspace.getBlockById(e.oldParentId);
        if (parentBlock != null && (typeof parentBlock.onChange_ === 'function')) {
          // 50 的 timeout 是等待 disconnect 操作完成（block 数据，如 connection 等，完成更新）
          // TODO: 其他几种情况也加下 timeout？
          setTimeout(() => {
            parentBlock.onChange_('disconnect');
          }, 50);
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
