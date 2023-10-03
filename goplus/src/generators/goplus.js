// https://blocklycodelabs.dev/codelabs/custom-generator/index.html#0
//

import * as Blockly from 'blockly';
import {Order} from 'blockly/javascript';

export const goplusGenerator = new Blockly.Generator('JSON');

goplusGenerator.forBlock['logic_null'] = function(block) {
    return ['null', Order.ATOMIC];
};

goplusGenerator.forBlock['text'] = function(block) {
    const textValue = block.getFieldValue('TEXT');
    const code = `"${textValue}"`;
    return [code, Order.ATOMIC];
};

goplusGenerator.forBlock['math_number'] = function(block) {
    const code = String(block.getFieldValue('NUM'));
    return [code, Order.ATOMIC];
};

goplusGenerator.forBlock['logic_boolean'] = function(block) {
    const code = (block.getFieldValue('BOOL') === 'TRUE') ? 'true' : 'false';
    return [code, Order.ATOMIC];
};

goplusGenerator.forBlock['member'] = function(block, generator) {
    const name = block.getFieldValue('MEMBER_NAME');
    const value = generator.valueToCode(
        block, 'MEMBER_VALUE', Order.ATOMIC);
    const code = `"${name}": ${value}`;
    return code;
};

goplusGenerator.forBlock['lists_create_with'] = function(block, generator) {
    const values = [];
    for (let i = 0; i < block.itemCount_; i++) {
      const valueCode = generator.valueToCode(block, 'ADD' + i,
          Order.ATOMIC);
      if (valueCode) {
        values.push(valueCode);
      }
    }
    const valueString = values.join(',\n');
    const indentedValueString =
        generator.prefixLines(valueString, generator.INDENT);
    const codeString = '[\n' + indentedValueString + '\n]';
    return [codeString, Order.ATOMIC];
};

goplusGenerator.forBlock['object'] = function(block, generator) {
    const statementMembers =
        generator.statementToCode(block, 'MEMBERS');
    const code = '{\n' + statementMembers + '\n}';
    return [code, Order.ATOMIC];
};

goplusGenerator.scrub_ = function(block, code, thisOnly) {
    const nextBlock =
        block.nextConnection && block.nextConnection.targetBlock();
    if (nextBlock && !thisOnly) {
      return code + ',\n' + goplusGenerator.blockToCode(nextBlock);
    }
    return code;
};
