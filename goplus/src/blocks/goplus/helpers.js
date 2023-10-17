import * as Blockly from 'blockly';
import { dragBus } from '../../plugins/block-event';

export const minusImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEuMSIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0Ij48cGF0aCBkPSJNMTggMTFoLTEyYy0xLjEwNCAwLTIgLjg5Ni0yIDJzLjg5NiAyIDIgMmgxMmMxLjEwNCAwIDItLjg5NiAyLTJzLS44OTYtMi0yLTJ6IiBmaWxsPSJ3aGl0ZSIgLz48L3N2Zz4K';

export const plusImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEuMSIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0Ij48cGF0aCBkPSJNMTggMTBoLTR2LTRjMC0xLjEwNC0uODk2LTItMi0ycy0yIC44OTYtMiAybC4wNzEgNGgtNC4wNzFjLTEuMTA0IDAtMiAuODk2LTIgMnMuODk2IDIgMiAybDQuMDcxLS4wNzEtLjA3MSA0LjA3MWMwIDEuMTA0Ljg5NiAyIDIgMnMyLS44OTYgMi0ydi00LjA3MWw0IC4wNzFjMS4xMDQgMCAyLS44OTYgMi0ycy0uODk2LTItMi0yeiIgZmlsbD0id2hpdGUiIC8+PC9zdmc+Cg==';

/**
 * 包裹 block 的状态变更
 * block 的状态变更通过 `withStateChange` 触发对应的 BlockChange 事件，状态才会被正确地保存
 */
export function withStateChange(block, change) {
  Blockly.Events.setGroup(true);
  const oldExtraState = block.saveExtraState();
  change();
  const newExtraState = block.saveExtraState();
  Blockly.Events.fire(new Blockly.Events.BlockChange(block, 'mutation', null, oldExtraState, newExtraState));
  Blockly.Events.setGroup(false);
}

function deepClone(o) {
  return JSON.parse(JSON.stringify(o));
}

/**
 * 状态维护，需要 Block 自己实现 render_ 方法
 */
export const withStateMutator = 'with-state-mutator'

Blockly.Extensions.registerMutator(withStateMutator, {

  state_: {},

  setState_(changes) {
    withStateChange(this, () => {
      Object.assign(this.state_, changes);
      this.render_();
    });
  },

  saveExtraState() {
    return deepClone(this.state_);
  },

  async loadExtraState(state) {
    withStateChange(this, () => {
      this.state_ = deepClone(state);
      this.render_();
    });
  },
});

/**
 * 选中状态维护，依赖 with-state-mutator
 */
export const selectableMixin = 'selectable-mixin'

Blockly.Extensions.registerMixin(selectableMixin, {

  timer_: null,

  onSelect_() {
    clearTimeout(this.timer_);
    this.setState_({ isSelected: true });
  },

  onUnselect_() {
    clearTimeout(this.timer_);

     // 150 的 timeout 是等待 drag 事件的触发（即便在选中另一个 block 后立即尝试拖动，select 事件跟 drag 事件间也大概有 100ms 间隔）
    this.timer = setTimeout(() => {
      const unselect = () => {
        this.setState_({ isSelected: false });
      }
      if (dragBus.isDragging()) {
        dragBus.onceEnd(() => {
          // 50 的 timeout 是等待 connect 动作完成，否则立刻 unselect 会导致 connect 失败（input 不存在）
          setTimeout(() => {
            unselect();
          }, 50);
        });
      } else {
        unselect();
      }
    }, 150);
  },

});

/**
 * 检查输入（value-input、input-field 等）是否为空的辅助方法
 */
export const emptyMixin = 'empty-mixin'

function isFieldEmpty(field) {
  if (field instanceof Blockly.FieldTextInput) {
    const value = field.getValue()
    return value == null || value === ''
  }
  if (field instanceof Blockly.FieldVariable) {
    throw new Error('TODO')
  }
  return true
}

Blockly.Extensions.registerMixin(emptyMixin, {

  isInputFieldEmpty(fieldName) {
    const value = this.getFieldValue(fieldName);
    return value == null || value === '';
  },
  
  isValueInputEmpty(inputName) {
    const input = this.getInput(inputName);
    const targetBlock = input?.connection?.targetBlock();
    return targetBlock == null || targetBlock.isShadow();
  },
  
  isStatementInputEmpty(inputName) {
    const input = this.getInput(inputName);
    const targetBlock = input?.connection?.targetBlock();
    return targetBlock == null || targetBlock.isShadow();
  },

  isFieldEmpty_(fieldName) {
    const field = this.getField(fieldName)
    if (field == null) return true
    return isFieldEmpty(field)
  },

  isInputEmpty_(inputName) {
    const input = this.getInput(inputName)
    if (input == null) return true
    if (input instanceof Blockly.inputs.ValueInput || input instanceof Blockly.inputs.StatementInput) {
      const targetBlock = input.connection?.targetBlock();
      if (targetBlock != null && !targetBlock.isShadow()) return false;
    }
    for (const field of input.fieldRow) {
      if (!isFieldEmpty(field)) return false;
    }
    return true
  }

});

/**
 * Unique ID
 * TODO: length 较大时会不满足
 */
export function uid(length = 8) {
  const id = (Math.random() + '').slice(2, 2+length)
  return id
}
