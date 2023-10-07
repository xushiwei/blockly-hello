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

Blockly.Extensions.registerMutator('goplus-for-range-mutator', mutator);

/**
 * 作为 Variable field 的占位值
 * 该 field variable name 为该值时，意味着当前 Variable field 未被设置
 */
const varPlaceholder = '-';

export default {

  isSelected_: false,

  /**
   * @this Blockly.Block
   */
  init() {
    this.setTooltip('`for...range` for goplus.');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.appendDummyInput('KV');
    this.appendValueInput('LIST')
        .appendField('= range');
    this.appendStatementInput('DO')
        .appendField('do');
    this.appendDummyInput()
        .appendField('end');

    this.setStyle('loop_blocks');
    this.setInputsInline(true);
    this.renderKeyVaue_();
    Blockly.Extensions.apply('goplus-for-range-mutator', this, true);
  },

  renderKeyVaue_() {

    const isSelected = this.isSelected_;
    const fieldValue = this.getField('VALUE');
    const hasValue = fieldValue != null && fieldValue.variable.name !== varPlaceholder;

    const inputKeyValue = this.getInput('KV');
    if (!this.getField('FOR')) {
      inputKeyValue?.appendField('for', 'FOR');
      inputKeyValue?.appendField(new Blockly.FieldVariable('k'), 'VAR_KEY');
    }

    if (isSelected || hasValue) {
      if (this.getField('ETC')) inputKeyValue?.removeField('ETC');
      if (!this.getField('COMMA')) inputKeyValue?.appendField(',', 'COMMA');
      if (!this.getField('VALUE')) {
        const f = new Blockly.FieldVariable(varPlaceholder);
        inputKeyValue?.appendField(f, 'VALUE');
      }
    } else {
      if (this.getField('COMMA')) inputKeyValue?.removeField('COMMA');
      if (this.getField('VALUE')) inputKeyValue?.removeField('VALUE');
      if (!this.getField('ETC')) inputKeyValue?.appendField('...', 'ETC');
    }
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

