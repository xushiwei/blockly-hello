import * as Blockly from 'blockly';

// https://blocklycodelabs.dev/codelabs/custom-generator/index.html#0
//

export const blocks = Blockly.common.createBlockDefinitionsFromJsonArray([{
  "type": "goplus_if",
  "message0": "if %1 %2",
  "args0": [
    {
      "type": "input_value",
      "name": "COND",
      "check": "Boolean",
      "align": "RIGHT"
    },
    {
      "type": "input_statement",
      "name": "BODY"
    }
  ],
  "inputsInline": true,
  "previousStatement": null,
  "nextStatement": null,
  "style":"logic_blocks",
},
{
  "type": "goplus_for_cond",
  "message0": "for %1 %2",
  "args0": [
    {
      "type": "input_value",
      "name": "COND",
      "check": "Boolean",
      "align": "RIGHT"
    },
    {
      "type": "input_statement",
      "name": "BODY"
    }
  ],
  "inputsInline": true,
  "previousStatement": null,
  "nextStatement": null,
  "style":"loop_blocks",
},
{
  "type": "goplus_for_each",
  "message0": "for %1 <- %2 if %3 %4",
  "args0": [
    {
      "type": "field_input",
      "name": "VAR",
      "text": "v"
    },
    {
      "type": "input_value",
      "name": "LIST",
      "align": "LEFT"
    },
    {
      "type": "input_value",
      "name": "COND",
      "check": "Boolean",
      "align": "RIGHT"
    },
    {
      "type": "input_statement",
      "name": "BODY"
    }
  ],
  "inputsInline": true,
  "previousStatement": null,
  "nextStatement": null,
  "style":"loop_blocks",
},
{
  "type": "goplus_for_count",
  "message0": "for %1 %2 <- %3 : %4 : %5 %6",
  "args0": [
    {
      "type": "field_input",
      "name": "VAR",
      "text": "i"
    },
    {
      "type": "input_dummy"
    },
    {
      'type': 'input_value',
      'name': 'FROM',
      'check': 'Number',
      'align': 'RIGHT',
    },
    {
      'type': 'input_value',
      'name': 'TO',
      'check': 'Number',
      'align': 'RIGHT',
    },
    {
      'type': 'input_value',
      'name': 'BY',
      'check': 'Number',
      'align': 'RIGHT',
    },
    {
      "type": "input_statement",
      "name": "BODY"
    }
  ],
  "inputsInline": true,
  "previousStatement": null,
  "nextStatement": null,
  "style":"loop_blocks",
},
{
  "type": "goplus_func",
  "message0": "func %1 ( %2 %3 , %4 ) %5 %6 %7",
  "args0": [
    {
      "type": "field_input",
      "name": "NAME",
      "text": ""
    },
    {
      "type": "field_input",
      "name": "ARG0",
      "text": "x"
    },
    {
      "type": "field_dropdown",
      "name": "ARG0_TYPE",
      "options": [
        [
          "T",
          "T1"
        ],
        [
          "...",
          "T2"
        ]
      ]
    },
    {
      "type": "field_label_serializable",
      "name": "VARIADIC",
      "text": "..."
    },
    {
      "type": "field_dropdown",
      "name": "RET0_TYPE",
      "options": [
        [
          "RET",
          "R1"
        ],
        [
          "<noreturn>",
          ""
        ],
        [
          "...",
          "R2"
        ]
      ]
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "input_statement",
      "name": "BODY"
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "style": "procedure_blocks",
},
{
  "type": "goplus_return",
  "message0": "return %1",
  "args0": [
    {
      "type": "input_value",
      "name": "RET0"
    }
  ],
  "inputsInline": true,
  "previousStatement": null,
  "style": "procedure_blocks",
}]);
