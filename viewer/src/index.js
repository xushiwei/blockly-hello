import * as Blockly from 'blockly';
// https://google.github.io/blockly-samples/plugins/theme-deuteranopia/test/index
import Theme from '@blockly/theme-deuteranopia';
import {load} from './serialization';
import {data} from './data';
import {blocks} from './blocks/goplus';
import {toolbox} from './toolbox/goplus';
import './index.css';

// Register the blocks and generator with Blockly
Blockly.common.defineBlocks(blocks);

// Set up UI elements and inject Blockly
const blocklyDiv = document.getElementById('blocklyDiv');
const ws = Blockly.inject(blocklyDiv, {
  toolbox: toolbox,
  theme: Theme,
  toolboxPosition: 'end',
});

// Hide toolbox
document.getElementsByClassName('blocklyToolboxDiv').item(0).remove();
document.getElementsByClassName('blocklyDropDownDiv').item(0).remove();

//getElementsByClassName('blocklyToolboxDiv').item(0).setAttribute('style', 'display: none');

// Load the initial state
load(ws, data);