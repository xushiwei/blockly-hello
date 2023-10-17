import * as Blockly from 'blockly';
import { withStateChange } from './helpers';

const mutator = {
  saveExtraState() {
    return {
      isSelected: this.isSelected_,
    };
  },
  async loadExtraState(state) {
    this.isSelected_ = state.isSelected;

    // 通过 setTimeout 推迟 render，确保 deserialization 已完成（`getFieldValue('KEY')` 能取到正确的值）
    setTimeout(() => {
      this.render_();
    }, 0);
  },
}

Blockly.Extensions.registerMutator('goplus-for-each-mutator', mutator);

/**
 * 作为 Text field 的占位值
 * 该 field value 为该值时，意味着当前 field 未被设置
 */
const textPlaceholder = '';

export default {

  isSelected_: false,

  /**
   * @this Blockly.Block
   */
  init() {

    // for %1 <- %2 if %3 %4

    this.setTooltip('for each in goplus.');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.appendDummyInput('KV')
        .appendField('for', 'FOR')
        .appendField('...', 'KV_ETC')
        .appendField(new Blockly.FieldTextInput(textPlaceholder), 'KEY')
        .appendField(',', 'COMMA')
        .appendField(new Blockly.FieldTextInput('v'), 'VALUE');
    this.appendValueInput('LIST')
        .appendField('<-');
    this.appendValueInput('COND')
        .appendField('if');
    this.appendDummyInput('COND_ETC')
        .appendField('...');
    this.appendStatementInput('DO')
        .appendField('do');
    this.appendDummyInput()
        .appendField('end');

    this.setStyle('loop_blocks');
    this.setInputsInline(true);
    this.render_();
    Blockly.Extensions.apply('goplus-for-each-mutator', this, true);
  },

  renderKeyVaue_() {
    const isSelected = this.isSelected_;
    const valueKey = this.getFieldValue('KEY');
    const hasKey = valueKey != null && valueKey !== textPlaceholder;
    const keyVisible = isSelected || hasKey

    this.getField('KV_ETC').setVisible(!keyVisible)
    this.getField('KEY').setVisible(keyVisible)
    this.getField('COMMA').setVisible(keyVisible)
  },

  renderCond_() {
    const isSelected = this.isSelected_;
    const inputCond = this.getInput('COND');
    const inputCondEtc = this.getInput('COND_ETC');
    const blockCond = inputCond.connection.targetBlock();
    const hasCond = blockCond != null && !blockCond.isShadow();
    const condVisible = isSelected || hasCond

    inputCond.setVisible(condVisible);
    inputCondEtc.setVisible(!condVisible);
  },

  render_() {
    this.renderKeyVaue_();
    this.renderCond_();
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
