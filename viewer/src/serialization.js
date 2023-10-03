import * as Blockly from 'blockly/core';

export const load = function(workspace, data) {
  // Don't emit events during loading.
  Blockly.Events.disable();
  Blockly.serialization.workspaces.load(JSON.parse(data), workspace, false);
  Blockly.Events.enable();
};
