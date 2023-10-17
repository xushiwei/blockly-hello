// @ts-nocheck
import * as React from 'react';
import * as Blockly from 'blockly';
import { withStateMutator, selectableMixin, emptyMixin } from './helpers';
import renderer from '../../boockly-react/renderer';

export default {

  /**
   * @this Blockly.Block
   */
  init() {

    this.jsonInit({
      tooltip: 'goplus for each (react)',
      inputsInline: true,
      previousStatement: null,
      nextStatement: null,
      style: 'loop_blocks',
    });

    Blockly.Extensions.apply(withStateMutator, this, true);
    Blockly.Extensions.apply(selectableMixin, this, false);
    Blockly.Extensions.apply(emptyMixin, this, false);

    this.render_();
  },

  onChange_() {
    this.setState_({
      hasKey: !this.isInputFieldEmpty('KEY'),
      hasCond: !this.isValueInputEmpty('COND')
    });
  },

  render_() {
    const isSelected = this.state_.isSelected ?? false;
    const hasKey = this.state_.hasKey ?? false;
    const keyVisible = isSelected || hasKey;
    const hasCond = this.state_.hasCond ?? false;
    const condVisible = isSelected || hasCond;

    renderer.render(
      <>
        <dummy-input name="KV">
          <label-field value="for" />
          <label-field value="..." visible={!keyVisible} />
          <input-field name="KEY" value="" visible={keyVisible} />
          <label-field value="," visible={keyVisible} />
          <input-field name="VALUE" value="v" />
        </dummy-input>
        <value-input name="LIST">
          <label-field value="<-" />
        </value-input>
        <value-input name="COND" visible={condVisible}>
          <label-field value="if" />
        </value-input>
        <dummy-input visible={!condVisible}>
          <label-field value="..." />
        </dummy-input>
        <statement-input name="DO">
          <label-field value="do" />
        </statement-input>
        <dummy-input>
          <label-field value="end" />
        </dummy-input>
      </>,
      this,
      () => this.queueRender()
    );
  },

};
