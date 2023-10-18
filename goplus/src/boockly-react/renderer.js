import * as React from 'react';
import * as Blockly from 'blockly';
import * as Reconciler from 'react-reconciler';

const rootHostContext = {};
const childHostContext = {};

function debug(...args) {
  if (false) console.debug(...args);
}

// unique name
function un(prefix = 'Untitled-') {
  return prefix + (Math.random() + '').slice(2, 12)
}

const typesMap = {
  input_value: 'value-input',
  input_statement: 'statement-input',
  input_dummy: 'dummy-input',
  input_end_row: 'end-row-input',
  field_input: 'input-field',
  field_dropdown: 'dropdown-field',
  field_checkbox: 'checkbox-field',
  field_colour: 'colour-field',
  field_number: 'number-field',
  field_angle: 'angle-field',
  field_variable: 'variable-field',
  field_label: 'label-field',
  field_image: 'image-field',
}

function createInstance(type, props, rootContainer) {
  debug('createInstance', type, props.name, props)
  switch (type) {
    case 'input':
    case 'field': {
      const { type, ...rest } = props
      const elementType = typesMap[props.type]
      return createInstance(elementType, rest, rootContainer)
    }
    case 'dummy-input': {
      const { name = un(), visible } = props
      const instance = new Blockly.inputs.DummyInput(name, rootContainer);
      if (visible != null) instance.setVisible(visible)
      return instance
    }
    case 'end-row-input': {
      const { name = un(), visible } = props
      const instance = new Blockly.inputs.EndRowInput(name, rootContainer);
      if (visible != null) instance.setVisible(visible)
      return instance
    }
    case 'statement-input': {
      const { name = un(), visible } = props
      const instance = new Blockly.inputs.StatementInput(name, rootContainer);
      if (visible != null) instance.setVisible(visible)
      return instance
    }
    case 'value-input': {
      const { name = un(), visible } = props
      const instance = new Blockly.inputs.ValueInput(name, rootContainer);
      if (visible != null) instance.setVisible(visible)
      return instance
    }
    case 'label-field': {
      const { name = un(), visible, ...config } = props
      const instance = Blockly.FieldLabel.fromJson(config);
      if (visible != null) instance.setVisible(visible)
      if (name != null) instance.name = name
      return instance
    }
    case 'input-field': {
      const { name = un(), visible, ...config } = props
      const instance = Blockly.FieldTextInput.fromJson(config);
      if (visible != null) instance.setVisible(visible)
      if (name != null) instance.name = name
      return instance
    }
    case 'number-field': {
      const { name = un(), visible, ...config } = props
      const instance = Blockly.FieldNumber.fromJson(config);
      if (visible != null) instance.setVisible(visible)
      if (name != null) instance.name = name
      return instance
    }
    case 'variable-field': {
      const { name = un(), visible, ...config } = props
      const instance = Blockly.FieldVariable.fromJson(config);
      if (visible != null) instance.setVisible(visible)
      if (name != null) instance.name = name
      return instance
    }
  }
}

// 参考 input insertFieldAt 实现，干掉其中不需要的部分
function insertField(input, index, field) {
  const block = input.sourceBlock
  input.fieldRow.splice(index, 0, field)
  field.setSourceBlock(block)
  if (block.rendered) {
    field.init();
    field.applyColour();
  }

  // // TODO: check if required
  // if (block.rendered) {
  //   block.queueRender();
  //   // Adding a field will cause the block to change shape.
  //   block.bumpNeighbours();
  // }
}

function appendChild(parentInstance, child) {
  debug('appendChild', parentInstance.constructor.name, child.constructor.name, child.name)
  if (parentInstance instanceof Blockly.Block && child instanceof Blockly.Input) {
    parentInstance.appendInput(child)
    return
  }
  if (parentInstance instanceof Blockly.Input && child instanceof Blockly.Field) {
    // parentInstance.appendField(child, child.name)
    // parentInstance.fieldRow.splice(parentInstance.fieldRow.length, 0, child)
    insertField(parentInstance, parentInstance.fieldRow.length, child)
    return
  }
  throw new Error('Failed to appendChild')
}

function insertBefore(parentInstance, child, beforeChild) {
  debug('insertBefore', child.value_, beforeChild.value_)
  if (
    parentInstance instanceof Blockly.Block
    && child instanceof Blockly.Input
    && beforeChild instanceof Blockly.Input
  ) {
    parentInstance.appendInput(child)
    parentInstance.moveInputBefore(child.name, beforeChild.name)
    return
  }
  if (
    parentInstance instanceof Blockly.Input
    && child instanceof Blockly.Field
    && beforeChild instanceof Blockly.Field
  ) {
    const idx = parentInstance.fieldRow.indexOf(beforeChild)
    // parentInstance.insertFieldAt(idx, child, child.name)
    // parentInstance.fieldRow.splice(idx, 0, child)
    insertField(parentInstance, idx, child)
    return
  }
  throw new Error('Failed to insertBefore')
}

function removeChild(parentInstance, child) {
  debug('removeChild', parentInstance.constructor.name, child.constructor.name, child.name)
  if (parentInstance instanceof Blockly.Block && child instanceof Blockly.Input) {
    parentInstance.removeInput(child.name)
    return
  }
  if (parentInstance instanceof Blockly.Input && child instanceof Blockly.Field) {
    if (child.name == null) throw new Error('Field name required for removeChild')
    parentInstance.removeField(child.name)
    return
  }
  throw new Error('Failed to appendChild')
}

function updateField(instance, key, value, props) {
  if (props.hasOwnProperty(key)) {
    instance[props[key]](value)
  } else if (key !== 'children') {
    console.warn(`Unknown prop ${key} for input`, value)
  }
}

function commitUpdate(instance, updatePayload, type, prevProps, nextProps, internalHandle) {
  debug('commitUpdate', type, instance.name, updatePayload)
  for (const change of updatePayload) {
    const { key, value } = change
    if (instance instanceof Blockly.Input) {
      switch (key) {
        case 'name':
          instance.name = value;
          break;
        case 'check':
          instance.setCheck(value);
          break;
        case 'align':
          instance.setAlign(value);
          break;
        case 'visible':
          instance.setVisible(value);
          break;
        default:
          if (key !== 'children') console.warn(`Unknown prop ${key} for input`, value)
      }
      return
    }
    if (instance instanceof Blockly.FieldLabel) {
      updateField(instance, key, value, {
        cssClass: 'setClass',
        validator: 'setValidator',
        value: 'setValue',
        visible: 'setVisible'
      })
      return
    }
    if (instance instanceof Blockly.FieldTextInput) {
      updateField(instance, key, value, {
        validator: 'setValidator',
        value: 'setValue',
        visible: 'setVisible'
      })
      return
    }
    if (instance instanceof Blockly.FieldNumber) {
      updateField(instance, key, value, {
        max: 'setMax',
        min: 'setMin',
        precision: 'setPrecision',
        validator: 'setValidator',
        value: 'setValue',
        visible: 'setVisible'
      })
      return
    }
    if (instance instanceof Blockly.FieldVariable) {
      updateField(instance, key, value, {
        validator: 'setValidator',
        value: 'setValue',
        visible: 'setVisible'
      })
      return
    }
  }
}

const myRenderer = Reconciler({
  supportsMutation: true,
  supportsPersistence: false,
  createInstance: createInstance,
  createTextInstance(text, rootContainer) {
    throw new Error('text node not supported')
  },
  appendInitialChild: appendChild,
  finalizeInitialChildren() {
    return false
  },
  prepareUpdate(instance, type, oldProps, newProps, rootContainer, hostContext) {
    const changes = []
    for (const key in newProps) {
      if (Object.hasOwnProperty.call(newProps, key)) {
        if (oldProps[key] !== newProps[key])
        changes.push({ key, value: newProps[key] })
      }
    }
    for (const key in oldProps) {
      if (Object.hasOwnProperty.call(oldProps, key) && !Object.hasOwnProperty.call(oldProps, key)) {
        changes.push({ key, value: undefined })
      }
    }
    return changes
  },
  shouldSetTextContent() {
    return false
    // return typeof props.children === 'string' || typeof props.children === 'number';
  },
  getRootHostContext() {
    return rootHostContext;
  },
  getChildHostContext() {
    return childHostContext;
  },
  getPublicInstance(instance) {
    return instance
  },
  prepareForCommit() {
    return null
  },
  resetAfterCommit() {},
  preparePortalMount() {},
  scheduleTimeout(fn, delay) {
    return setTimeout(fn, delay)
  },
  cancelTimeout(id) {
    return clearTimeout(id)
  },
  noTimeout: -1,
  isPrimaryRenderer: true,
  warnsIfNotActing: true,
  getCurrentEventPriority() {
    return 0b0000000000000000000000000010000; // DefaultEventPriority
  },
  getInstanceFromNode() { return null },
  beforeActiveInstanceBlur() {},
  afterActiveInstanceBlur() {},
  prepareScopeUpdate() {},
  getInstanceFromScope() { return null },
  detachDeletedInstance(node) {
    // TODO
  },
  appendChild: appendChild,
  appendChildToContainer: appendChild,
  insertBefore: insertBefore,
  insertInContainerBefore: insertBefore,
  removeChild: removeChild,
  removeChildFromContainer: removeChild,
  commitUpdate: commitUpdate,
  clearContainer(container) {
    for (const input of container.inputList) {
      if (input.name) {
        const removed = container.removeInput(input.name, true)
        if (!removed) console.warn('remove input failed:', input.name)
      }
    }
  },
  supportsHydration: false
});

export default {
  render(reactElement, containerBlock, callback) {
    // Create a root Container if it doesnt exist
    if (!containerBlock._rootContainer) {
      containerBlock._rootContainer = myRenderer.createContainer(
        containerBlock,
        0, // LegacyRoot
        null,
        false,
        false,
        '',
        e => {
          console.warn('onRecoverableError:', e)
        },
        null
      );
    }

    // update the root Container
    return myRenderer.updateContainer(reactElement, containerBlock._rootContainer, null, callback);
  }
};

/**
 * Create React element
 * @param {'dummy-input'|'end-row-input'|'statement-input'|'value-input'|'label-field'|'input-field'|'number-field'|'variable-field'|React.Fragment} type 
 * @param {*} props 
 * @param  {...React.ReactNode} children 
 * @returns 
 */
export function createElement(type, props, ...children) {
  return React.createElement(type, props, ...children)
}

export const Fragment = React.Fragment
