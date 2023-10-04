import * as Blockly from 'blockly';

import forRange from './goplus/for-range';
import forEach from './goplus/for-each';

// https://blocklycodelabs.dev/codelabs/custom-generator/index.html#0
//

export const blocksFromJS = {
  'goplus_for_range': forRange,
  'goplus_for_each': forEach
}

export const blocksFromJSON = Blockly.common.createBlockDefinitionsFromJsonArray([{
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
          "",
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
},
{
  "type": "goplus_call_expr",
  "message0": "%1 ( %2 %3 , ... ) %4",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "NAME",
      "options": [
        [
          "fn",
          "NAME1"
        ],
        [
          "...",
          "NAME2"
        ]
      ]
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "input_value",
      "name": "EXPR0"
    },
    {
      "type": "input_end_row"
    }
  ],
  "inputsInline": true,
  "output": null,
  "style": "procedure_blocks",
},
{
  "type": "goplus_call",
  "message0": "%1 %2 %3 , ... %4",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "NAME",
      "options": [
        [
          "fn",
          "NAME1"
        ],
        [
          "...",
          "NAME2"
        ]
      ]
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "input_value",
      "name": "EXPR0"
    },
    {
      "type": "input_end_row"
    }
  ],
  "inputsInline": true,
  "previousStatement": null,
  "nextStatement": null,
  "style": "procedure_blocks",
},
{
  "type": "goplus_lambda_expr",
  "message0": "%1 => %2",
  "args0": [
    {
      "type": "field_input",
      "name": "ARG0",
      "text": ""
    },
    {
      "type": "input_value",
      "name": "NAME"
    }
  ],
  "inputsInline": true,
  "output": null,
  "style": "procedure_blocks",
},
{
  "type": "goplus_lambda",
  "message0": "%1 => %2 %3",
  "args0": [
    {
      "type": "field_input",
      "name": "ARG0",
      "text": ""
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "input_statement",
      "name": "BODY"
    }
  ],
  "inputsInline": true,
  "output": null,
  "style": "procedure_blocks",
},
{
  "type": "goplus_closure",
  "message0": "func ( %1 %2 , %3 ) %4 %5 %6",
  "args0": [
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
  "output": null,
  "style": "procedure_blocks",
},
{
  "type": "goplus_stmt",
  "message0": "stmt %1",
  "args0": [
    {
      "type": "input_value",
      "name": "CODE",
      "text": ""
    }
  ],
  "inputsInline": true,
  "previousStatement": null,
  "nextStatement": null,
  "style": "procedure_blocks",
},
{
  "type": "goplus_expr",
  "message0": "expr %1",
  "args0": [
    {
      "type": "input_value",
      "name": "CODE",
      "text": ""
    }
  ],
  "inputsInline": true,
  "output": null,
  "style": "procedure_blocks",
},
{
  "type": "goplus_var_define",
  "message0": "%1 := %2",
  "args0": [
    {
      "type": "field_input",
      "name": "NAME0",
      "text": "x"
    },
    {
      "type": "input_value",
      "name": "EXPR0"
    }
  ],
  "inputsInline": true,
  "previousStatement": null,
  "nextStatement": null,
  "style": "variable_blocks",
},
{
  "type": "goplus_var_decl",
  "message0": "var %1 %2 = %3 %4",
  "args0": [
    {
      "type": "field_input",
      "name": "NAME0",
      "text": "x"
    },
    {
      "type": "field_dropdown",
      "name": "TYPE0",
      "options": [
        [
          "T",
          "T"
        ],
        [
          "",
          ""
        ],
        [
          "...",
          "T2"
        ]
      ]
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "input_value",
      "name": "EXPR0"
    }
  ],
  "inputsInline": true,
  "previousStatement": null,
  "nextStatement": null,
  "style": "variable_blocks",
},
{
  "type": "goplus_var_assign",
  "message0": "%1 = %2",
  "args0": [
    {
      "type": "input_value",
      "name": "VAR0"
    },
    {
      "type": "input_value",
      "name": "EXPR0"
    }
  ],
  "inputsInline": true,
  "previousStatement": null,
  "nextStatement": null,
  "style": "variable_blocks",
},
{
  "type": "goplus_var_assign_op",
  "message0": "%1 %2 %3",
  "args0": [
    {
      "type": "input_value",
      "name": "NAME"
    },
    {
      "type": "field_dropdown",
      "name": "OP",
      "options": [
        [
          "+=",
          "+="
        ],
        [
          "-=",
          "-="
        ],
        [
          "...",
          "..."
        ]
      ]
    },
    {
      "type": "input_value",
      "name": "EXPR"
    }
  ],
  "inputsInline": true,
  "previousStatement": null,
  "nextStatement": null,
  "style": "variable_blocks",
},
{
  "type": "goplus_var",
  "message0": "%1",
  "args0": [
    {
      "type": "field_variable",
      "name": "NAME",
      "variable": "x"
    }
  ],
  "inputsInline": true,
  "output": null,
  "style": "variable_blocks",
}]);
