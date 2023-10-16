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
      tooltip: 'goplus if else',
      inputsInline: true,
      previousStatement: null,
      nextStatement: null,
      style: 'logic_blocks',
    })

    Blockly.Extensions.apply(withStateMutator, this, true);
    Blockly.Extensions.apply(selectableMixin, this, false);
    Blockly.Extensions.apply(emptyMixin, this, false);

    this.render_();

    window.b = this
  },

  getElseIfCount_() {
    let count = 0;
    for (let i = 1; ; i++) {
      if (
        this.isValueInputEmpty(`ELSE_IF_COND_${i}`)
        && this.isStatementInputEmpty(`ELSE_IF_BODY_${i}`)
      ) {
        console.debug(`else..if ${i} empty`)
        break
      } else {
        console.debug(
          `else..if ${i} not empty`,
          this.isValueInputEmpty(`ELSE_IF_COND_${i}`),
          this.isStatementInputEmpty(`ELSE_IF_BODY_${i}`)
        )
        count = i
      }
    }
    return count
  },

  onChange_() {
    this.setState_({
      elseIfCount: this.getElseIfCount_(),
      hasElse: !this.isStatementInputEmpty('ELSE_BODY'),
    });
  },

  render_() {
    // if %1 %2
    // if %1 %2 else %3
    // if %1 %2 else if %3 %4 else %5

    const isSelected = this.state_.isSelected ?? false;
    const elseIfCount = this.state_.elseIfCount ?? 0;
    const hasElse = this.state_.hasElse ?? false;

    // console.log(this.id, isSelected, elseIfCount, hasElse)

    const elseIfParts = Array.from({ length: elseIfCount }).map((_, i) => (
      <React.Fragment key={i}>
        <value-input key={`ELSE_IF_COND_${i+1}`} name={`ELSE_IF_COND_${i+1}`}>
          <label-field value="else if" />
        </value-input>
        <statement-input key={`ELSE_IF_BODY_${i+1}`} name={`ELSE_IF_BODY_${i+1}`}>
          <label-field value="do" />
        </statement-input>
      </React.Fragment>
    ))

    if (isSelected) {
      elseIfParts.push(
        <React.Fragment key={elseIfCount}>
          <value-input key={`ELSE_IF_COND_${elseIfCount+1}`} name={`ELSE_IF_COND_${elseIfCount+1}`}>
            <label-field value="(else if)" />
          </value-input>
          <statement-input key={`ELSE_IF_BODY_${elseIfCount+1}`} name={`ELSE_IF_BODY_${elseIfCount+1}`}>
            <label-field value="(do)" />
          </statement-input>
        </React.Fragment>
      )
    }

    const elsePart = (hasElse || isSelected) && (
      <>
        <statement-input name="ELSE_BODY">
          <label-field value={hasElse ? 'else' : '(else)'} />
        </statement-input>
      </>
    )

    renderer.render(
      <>
        <value-input name="COND">
          <label-field value="if" />
        </value-input>
        <statement-input name="BODY">
          <label-field value="do" />
        </statement-input>
        {elseIfParts}
        {elsePart}
      </>,
      this,
      () => this.queueRender()
    );
  },

};
