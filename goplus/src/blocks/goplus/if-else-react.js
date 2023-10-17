// @ts-nocheck
import * as React from 'react';
import * as Blockly from 'blockly';
import { withStateMutator, selectableMixin, emptyMixin, uid } from './helpers';
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

    // this.initMessage_({
    //   "message0": "if %1 { %2 } [else [if %3] { %4 }]*",
    //   "args0": [
    //     {
    //       "type": "field_input",
    //       "name": "COND",
    //       "text": "k"
    //     },
    //     {
    //       "type": "input_statement",
    //       "name": "BODY"
    //     },
    //     {
    //       "type": "field_input",
    //       "name": "ELSE_COND",
    //       "text": "k"
    //     },
    //     {
    //       "type": "input_statement",
    //       "name": "ELSE_BODY"
    //     }
    //   ],
    // });

    this.state_.shadowElseId = uid();
    this.render_();

    window.b = this; // TODO: remove me
  },

  checkElsePart_(id) {
    const condEmpty = this.isValueInputEmpty(`ELSE_COND_${id}`);
    const bodyEmpty = this.isStatementInputEmpty(`ELSE_BODY_${id}`);
    const empty = condEmpty && bodyEmpty
    return { empty, condEmpty, bodyEmpty }
  },

  onChange_() {
    const { elseParts = [], shadowElseId } = this.state_;
    const newElseParts = [];

    // filter original else parts
    for (const part of elseParts) {
      const id = part.id;
      const { empty, condEmpty, bodyEmpty } = this.checkElsePart_(id);
      if (empty) {
        console.debug(`else ${id} empty`);
        continue;
      }
      console.debug(`else ${id} not empty`, condEmpty, bodyEmpty);
      newElseParts.push({ id, condEmpty });
    }

    // check is new shadow else should be created
    let newShadowElseId = shadowElseId;
    const shadowElseChecked = this.checkElsePart_(shadowElseId);
    if (shadowElseChecked.empty) {
      console.debug(`shadow else ${newShadowElseId} empty`);
    } else {
      console.debug(`shadow else ${newShadowElseId} not empty`, shadowElseChecked.condEmpty, shadowElseChecked.bodyEmpty);
      newElseParts.push({ id: shadowElseId, condEmpty: shadowElseChecked.condEmpty });
      newShadowElseId = uid();
    }

    this.setState_({
      elseParts: newElseParts,
      shadowElseId: newShadowElseId,
    });
  },

  render_() {
    // if %1 %2
    // if %1 %2 else %3
    // if %1 %2 else if %3 %4 else %5

    const isSelected = this.state_.isSelected ?? false;
    const elseParts = this.state_.elseParts ?? [];
    const shadowElseId = this.state_.shadowElseId;

    const elsePartsView = elseParts.map(part => {
      const { id, condEmpty } = part
      const condVisible = isSelected || !condEmpty;
      return (
        <React.Fragment key={id}>
          <dummy-input>
            <label-field value="else" />
          </dummy-input>
          <value-input name={`ELSE_COND_${id}`} visible={condVisible}>
            <label-field value="if" />
          </value-input>
          <dummy-input visible={!condVisible}>
            <label-field value="..." />
          </dummy-input>
          <statement-input name={`ELSE_BODY_${id}`}>
            <label-field value="do" />
          </statement-input>
        </React.Fragment>
      )
    });

    if (shadowElseId != null) {
      const id = shadowElseId
      elsePartsView.push(
        <React.Fragment key={id}>
          <dummy-input visible={isSelected}>
            <label-field value="else" />
          </dummy-input>
          <value-input name={`ELSE_COND_${id}`} visible={isSelected}>
            <label-field value="if" />
          </value-input>
          <statement-input name={`ELSE_BODY_${id}`} visible={isSelected}>
            <label-field value="do" />
          </statement-input>
        </React.Fragment>
      )
    }

    renderer.render(
      <>
        <value-input name="COND">
          <label-field value="if" />
        </value-input>
        <statement-input name="BODY">
          <label-field value="do" />
        </statement-input>
        {elsePartsView}
        <dummy-input visible={!isSelected}>
          <label-field value="..." />
        </dummy-input>
      </>,
      this,
      () => this.queueRender()
    );
  },

};
