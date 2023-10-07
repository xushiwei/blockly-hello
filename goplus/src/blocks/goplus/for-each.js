import * as Blockly from 'blockly';
import { withStateChange } from './helpers';

const mutator = {
  saveExtraState() {
    return {
      isSelected: this.isSelected_,
    };
  },
  loadExtraState(state) {
    this.isSelected_ = state.isSelected;
    this.renderKeyVaue_();
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
    this.appendDummyInput('KV');
    this.appendValueInput('LIST')
        .appendField('<-');
    this.appendValueInput('COND')
        .appendField('if')
    this.appendStatementInput('DO')
        .appendField('do');
    this.appendDummyInput()
        .appendField('end');

    this.setStyle('loop_blocks');
    this.setInputsInline(true);
    this.renderKeyVaue_();
    Blockly.Extensions.apply('goplus-for-each-mutator', this, true);
  },

  renderKeyVaue_() {

    const isSelected = this.isSelected_;
    const fieldKey = this.getField('KEY');
    const hasKey = fieldKey != null && fieldKey.getValue() !== textPlaceholder;

    const inputKeyValue = this.getInput('KV');
    if (!this.getField('FOR')) {
      inputKeyValue?.appendField('for', 'FOR');
    }

    if (isSelected || hasKey) {
      if (this.getField('ETC')) inputKeyValue?.removeField('ETC');
      if (!this.getField('KEY')) inputKeyValue?.insertFieldAt(1, new Blockly.FieldTextInput(textPlaceholder), 'KEY');
      if (!this.getField('COMMA')) inputKeyValue?.insertFieldAt(2, ',', 'COMMA');
    } else {
      if (this.getField('KEY')) inputKeyValue?.removeField('KEY');
      if (this.getField('COMMA')) inputKeyValue?.removeField('COMMA');
      if (!this.getField('ETC')) inputKeyValue?.insertFieldAt(1, '...', 'ETC');
    }

    if (!this.getField('VALUE')) inputKeyValue?.appendField(new Blockly.FieldTextInput('v'), 'VALUE');
  },

  onSelect_() {
    withStateChange(this, () => {
      this.isSelected_ = true;
      this.renderKeyVaue_();
    })
  },

  onUnselect_() {
    withStateChange(this, () => {
      this.isSelected_ = false;
      this.renderKeyVaue_();
    })
  }
};
