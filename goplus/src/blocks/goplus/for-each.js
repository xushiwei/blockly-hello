import * as Blockly from 'blockly';
import { plusImage, minusImage } from './helpers';

const mutator = {
  saveExtraState() {
    return {
      'hasKey': this.hasKey_,
    };
  },
  loadExtraState(state) {
    this.updateWith_(state['hasKey']);
  },
}

Blockly.Extensions.registerMutator('goplus-for-each-mutator', mutator);

export default {

  hasKey_: false,

  mutator: 'goplus-for-each-mutator',

  /**
   * @this Blockly.Block
   */
  init() {

    // for %1 <- %2 if %3 %4

    this.setTooltip('for each in goplus.');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.appendDummyInput('INPUT_VAR');
    this.appendValueInput('LIST')
        .appendField('<-');
    this.appendValueInput('COND')
        .appendField('if')
    this.appendStatementInput('DO')
        .appendField('do');
    this.appendDummyInput()
        .appendField('end');

    this.setInputsInline(true);
    this.updateWith_(false);
    Blockly.Extensions.apply('goplus-for-each-mutator', this, true);
  },

  /**
   * Update shape
   * @this Blockly.Block
   * @param {boolean} hasKey 
   */
  updateWith_(hasKey) {

    this.hasKey_ = hasKey

    const inputVar = this.getInput('INPUT_VAR')
    if (!this.getField('FOR')) {
      inputVar?.appendField('for', 'FOR')
    }

    if (hasKey) {
      if (this.getField('PLUS')) inputVar?.removeField('PLUS')
      if (!this.getField('MINUS')) inputVar?.insertFieldAt(1, new Blockly.FieldImage(minusImage, 15, 15, undefined, this.onMinusClick_), 'MINUS')
      if (!this.getField('VAR_KEY')) inputVar?.insertFieldAt(2, new Blockly.FieldVariable('k'), 'VAR_KEY')
      if (!this.getField('COMMA')) inputVar?.insertFieldAt(3, ',', 'COMMA')
    } else {
      if (this.getField('MINUS')) inputVar?.removeField('MINUS')
      if (this.getField('VAR_KEY')) inputVar?.removeField('VAR_KEY')
      if (this.getField('COMMA')) inputVar?.removeField('COMMA')
      if (!this.getField('PLUS')) inputVar?.insertFieldAt(1, new Blockly.FieldImage(plusImage, 15, 15, undefined, this.onPlusClick_), 'PLUS')
    }

    if (!this.getField('VAR_VALUE')) inputVar?.appendField(new Blockly.FieldVariable('v'), 'VAR_VALUE')
    window.t = this
  },

  /**
   * @param {Blockly.FieldImage} minusField
   */
  onMinusClick_(minusField) {
    const block = minusField.getSourceBlock();
    if (block.isInFlyout) return;

    Blockly.Events.setGroup(true);
    const oldExtraState = block.saveExtraState();
    block.updateWith_(false);
    const newExtraState = block.saveExtraState();
    Blockly.Events.fire(new Blockly.Events.BlockChange(block, 'mutation', null, oldExtraState, newExtraState));
    Blockly.Events.setGroup(false);
  },

  /**
   * @param {Blockly.FieldImage} minusField
   */
  onPlusClick_(minusField) {
    const block = minusField.getSourceBlock();
    if (block.isInFlyout) return;

    Blockly.Events.setGroup(true);
    const oldExtraState = block.saveExtraState();
    block.updateWith_(true);
    const newExtraState = block.saveExtraState();
    Blockly.Events.fire(new Blockly.Events.BlockChange(block, 'mutation', null, oldExtraState, newExtraState));
    Blockly.Events.setGroup(false);
  }
};
