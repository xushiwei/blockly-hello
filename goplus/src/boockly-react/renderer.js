import * as React from 'react';
import * as Blockly from 'blockly';
import * as Reconciler from 'react-reconciler';

const rootHostContext = {};
const childHostContext = {};

function createInstance(type, props, rootContainer) {
  // console.debug('createInstance', type, props.name, props)
  switch (type) {
    case 'dummy-input': {
      const { name, visible } = props
      const instance = new Blockly.inputs.DummyInput(name, rootContainer);
      if (visible != null) instance.setVisible(visible)
      return instance
    }
    case 'end-row-input': {
      const { name, visible } = props
      const instance = new Blockly.inputs.EndRowInput(name, rootContainer);
      if (visible != null) instance.setVisible(visible)
      return instance
    }
    case 'statement-input': {
      const { name, visible } = props
      const instance = new Blockly.inputs.StatementInput(name, rootContainer);
      if (visible != null) instance.setVisible(visible)
      return instance
    }
    case 'value-input': {
      const { name, visible } = props
      const instance = new Blockly.inputs.ValueInput(name, rootContainer);
      if (visible != null) instance.setVisible(visible)
      return instance
    }
    case 'label-field': {
      const { name, value, cssClass, visible, ...config } = props
      const instance = new Blockly.FieldLabel(value, cssClass, config);
      if (visible != null) instance.setVisible(visible)
      if (name != null) instance.name = name
      return instance
    }
    case 'input-field': {
      const { name, value, validator, visible, ...config } = props
      const instance = new Blockly.FieldTextInput(value, validator, config);
      if (visible != null) instance.setVisible(visible)
      if (name != null) instance.name = name
      return instance
    }
    case 'number-field': {
      const { name, value, min, max, precision, validator, visible, ...config } = props
      const instance = new Blockly.FieldNumber(value, min, max, precision, validator, config);
      if (visible != null) instance.setVisible(visible)
      if (name != null) instance.name = name
      return instance
    }
    case 'variable-field': {
      const { name, varName, validator, variableTypes, defaultType, visible, ...config } = props
      const instance = new Blockly.FieldVariable(varName, validator, variableTypes, defaultType, config);
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
  // console.debug('appendChild', parentInstance.constructor.name, child.constructor.name, child.name)
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
  // console.debug('insertBefore', parentInstance.constructor.name, child.constructor.name, child.name, beforeChild.constructor.name, beforeChild.name)
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
    insertField(parentInstance, 0, child)
    return
  }
  throw new Error('Failed to insertBefore')
}

function removeChild(parentInstance, child) {
  // console.debug('removeChild', parentInstance.constructor.name, child.constructor.name, child.name)
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
  // console.debug('commitUpdate', type, instance.name, updatePayload)
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
    console.warn('clearContainer not implemented')
    // throw new Error('clearContainer not implemented')
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
