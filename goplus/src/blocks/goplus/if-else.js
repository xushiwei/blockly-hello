import * as Blockly from 'blockly';
import { withStateChange } from './helpers';

const mutator = {
  saveExtraState() {
    return {
      isSelected: this.isSelected_,
      elseIfCount: this.elseIfCount_,
      hasElse: this.hasElse_
    };
  },
  async loadExtraState(state) {
    this.isSelected_ = state.isSelected;
    this.elseIfCount_ = state.elseIfCount;
    this.hasElse_ = state.hasElse;

    // 通过 setTimeout 推迟 render，确保 deserialization 已完成（`getFieldValue('KEY')` 能取到正确的值）
    setTimeout(() => {
      this.render_();
    }, 0);
  },
}

Blockly.Extensions.registerMutator('goplus-if-else-mutator', mutator);

/**
 * 作为 Text field 的占位值
 * 该 field value 为该值时，意味着当前 field 未被设置
 */
const textPlaceholder = '';

export default {

  isSelected_: false,

  elseIfCount_: 0,
  renderedElseIfCount_: 0,

  hasElse_: false,
  renderedHasElse_: false,

  /**
   * @this Blockly.Block
   */
  init() {

    // if %1 %2
    // if %1 %2 else %3
    // if %1 %2 else if %3 %4 else %5

    this.setTooltip('for each in goplus.');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    // this.appendDummyInput('KV')
    //     .appendField('for', 'FOR')
    //     .appendField('...', 'KV_ETC')
    //     .appendField(new Blockly.FieldTextInput(textPlaceholder), 'KEY')
    //     .appendField(',', 'COMMA')
    //     .appendField(new Blockly.FieldTextInput('v'), 'VALUE');
    // this.appendValueInput('LIST')
    //     .appendField('<-');
    this.appendValueInput('IF')
        .appendField('if');
    this.appendStatementInput('THEN')
        .appendField('do');
    // this.appendDummyInput('COND_ETC')
    //     .appendField('...');
    // this.appendStatementInput('DO')
    //     .appendField('do');
    // this.appendDummyInput()
    //     .appendField('end');

    this.setStyle('logic_blocks');
    this.setInputsInline(false);
    // this.render_();
    Blockly.Extensions.apply('goplus-if-else-mutator', this, true);
  },

  render_() {
    // render if-else & else

    // setVisible 后需要让当前 block 重新 render 以计算正确的 size
    this.queueRender();
  },

  onSelect_() {
    withStateChange(this, () => {
      this.isSelected_ = true;
      this.render_();
    });
  },

  onUnselect_() {
    withStateChange(this, () => {
      this.isSelected_ = false;
      this.render_();
    });
  }
};
