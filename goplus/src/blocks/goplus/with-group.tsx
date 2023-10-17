import * as React from 'react';
import * as Blockly from 'blockly';
import renderer from '../../boockly-react/renderer';
import { Group, tokenizeInterpolationWithGroups } from './parsing';
import { emptyMixin, selectableMixin, uid, withStateMutator } from './helpers';
import type { BlockDefinition } from 'blockly/core/blocks';

export const withGroupMixin = 'with-group-mixin'

Blockly.Extensions.registerMixin(withGroupMixin, {
  inputs_: [] as ParsedInput[],
  groups_: [] as Group[],

  initMessages_(
    this: Blockly.Block,
    { message0, args0 } // TODO: message N
  ) {
    const groups: Group[] = [];
    const tokens = tokenizeInterpolationWithGroups(message0, groups);
    this.validateTokens_(tokens, args0.length);
    const elements = this.interpolateArguments_(tokens, args0);
    const inputs: ParsedInput[] = [];

    function getGroupIdx(start: number, end: number, excludes?: number) {
      for (let i = groups.length - 1; i >= 0; i--) {
        const group = groups[i];
        if (i !== excludes && group.start <= start && group.end > end) return i;
      }
      return null
    }

    const fieldStack: Array<{ idx: number, element: Options }> = [];
    for (let i = 0, element; (element = elements[i]); i++) {
      if (this.isInputKeyword_(element['type'])) {
        const inputGroupIdx = getGroupIdx(fieldStack[0]?.fieldIdx ?? i, i);
        const fields: ParsedField[] = fieldStack.map<ParsedField>(({ idx: fieldIdx, element: fieldElement }) => ({
          options: fieldElement,
          groupIdx: getGroupIdx(fieldIdx, fieldIdx, inputGroupIdx),
        }));
        const input: ParsedInput = {
          options: element,
          fields,
          groupIdx: inputGroupIdx,
        };
        fieldStack.length = 0;
        inputs.push(input);
      } else {
        // All other types, including ones starting with 'input_' get routed here.
        fieldStack.push({ idx: i, element })
      }
    }

    this.groups_ = groups;
    this.inputs_ = inputs;

    this.state_ = {
      ...this.state_,
      groups: groups.map<GroupState>((group, i) => ({
        ids: [],
        shadowId: uid(),
      }))
    }
  },

  getGroupState_(groupIdx: number): GroupState | null {
    return this.state_.groups?.[groupIdx] ?? null
  },

  render_() {
    const isSelected = this.state_.isSelected ?? false;

    const renderFieldGroupInstance = (fields: ParsedField[], group: Group, id: string, isShadow: boolean) => {
      const fieldsView = fields.map((field, i) => {
        const name = getGroupedName(field.options.name, id)
        return <field key={name ?? i} {...field.options} name={name} visible={!isShadow || isSelected} />
      })
      // 未选中 -> shadow instance 隐藏时，展示 placeholder
      const placeholderView = <label-field text="..." visible={isShadow && !isSelected} />
      return (
        <React.Fragment key={id}>
          {fieldsView}
          {placeholderView}
        </React.Fragment>
      )
    }

    const renderFieldsWithGroup = (fields: ParsedField[], groupIdx: number) => {
      const group = this.groups_[groupIdx]
      const groupState = this.getGroupState_(groupIdx)
      if (groupState == null) return []
      const groupInstances = groupState.ids.map(id => renderFieldGroupInstance(fields, group, id, false))
      if (group.tag === '*' || groupState.ids.length === 0) {
        groupInstances.push(renderFieldGroupInstance(fields, group, groupState.shadowId, true))
      }
      return groupInstances
    }

    const renderFields = (fields: ParsedField[]) => {
      const fieldsView = []
      for (let i = 0; i < fields.length;) {
        const field = fields[i]
        const groupIdx = field.groupIdx
        if (groupIdx == null) {
          fieldsView.push(<field key={`field-${i}`} {...field.options} />)
          i++
          continue
        }
        const fieldsWithinGroup: ParsedField[] = [field]
        for (let j = i+1; fields[j]?.groupIdx === groupIdx; j++) {
          fieldsWithinGroup.push(fields[j])
          i = j
        }
        i++
        fieldsView.push(...renderFieldsWithGroup(fieldsWithinGroup, groupIdx))
      }
      return fieldsView
    }

    const renderInputGroupInstance = (inputs: ParsedInput[], group: Group, id: string, isShadow: boolean) => {
      const inputsView = inputs.map((input, i) => {
        const name = getGroupedName(input.options.name, id)
        return (
          <input key={name ?? i} {...input.options} name={name} visible={!isShadow || isSelected}>
            {renderFields(input.fields)}
          </input>
        )
      })
      // 未选中 -> shadow instance 隐藏时，展示 placeholder
      const placeholderView = (
        <dummy-input visible={isShadow && !isSelected}>
          <label-field text="..." />
        </dummy-input>
      )
      return (
        <React.Fragment key={id}>
          {inputsView}
          {placeholderView}
        </React.Fragment>
      )
    }

    const renderInputsWithGroup = (inputs: ParsedInput[], groupIdx: number) => {
      const group = this.groups_[groupIdx]
      const groupState = this.getGroupState_(groupIdx)
      if (groupState == null) return []
      const groupInstances = groupState.ids.map(id => renderInputGroupInstance(inputs, group, id, false))
      if (group.tag === '*' || groupState.ids.length === 0) {
        groupInstances.push(renderInputGroupInstance(inputs, group, groupState.shadowId, true))
      }
      return groupInstances
    }

    const renderInputs = (inputs: ParsedInput[]) => {
      const inputsView = [];
      for (let i = 0; i < inputs.length;) {
        const input = inputs[i]
        const groupIdx = input.groupIdx
        if (groupIdx == null) {
          inputsView.push(<input key={`input-${i}`} {...input.options}>{renderFields(input.fields)}</input>)
          i++
          continue
        }

        const inputsWithinGroup: ParsedField[] = [input]
        for (let j = i+1; inputs[j]?.groupIdx === groupIdx; j++) {
          inputsWithinGroup.push(inputs[j])
          i = j
        }
        i++
        inputsView.push(...renderInputsWithGroup(inputsWithinGroup, groupIdx))
      }
      return inputsView
    }

    renderer.render(
      <>{renderInputs(this.inputs_)}</>,
      this,
      () => this.queueRender()
    );
  },

  onChange_() {
    const inputOptionsByGroup: Record<string, unknown[]> = {}
    const fieldOptionsByGroup: Record<string, unknown[]> = {}
    this.inputs_.forEach(input => {
      if (input.groupIdx != null && input.options.name != null) {
        inputOptionsByGroup[input.groupIdx] = inputOptionsByGroup[input.groupIdx] ?? []
        inputOptionsByGroup[input.groupIdx].push(input.options)
      }
      input.fields.forEach(field => {
        if (field.groupIdx != null && field.options.name != null) {
          fieldOptionsByGroup[field.groupIdx] = fieldOptionsByGroup[field.groupIdx] ?? []
          fieldOptionsByGroup[field.groupIdx].push(field.options)
        }
      })
    })

    const groupsState: GroupState[] = this.state_.groups
    const newGroupsState: GroupState[] = this.groups_.map((group, groupIdx) => {
      const { ids, shadowId } = groupsState[groupIdx]
      const inputOptions = inputOptionsByGroup[groupIdx] ?? []
      const fieldOptions = fieldOptionsByGroup[groupIdx] ?? []

      const isEmpty = (id: string) => {
        const allInputsEmpty = inputOptions.every(io => this.isInputEmpty_(getGroupedName(io.name, id)))
        const allFieldsEmpty = fieldOptions.every(fo => this.isFieldEmpty_(getGroupedName(fo.name, id)))
        return allInputsEmpty && allFieldsEmpty
      }

      const newIds: string[] = []
      for (const id of ids) {
        if (!isEmpty(id)) newIds.push(id)
      }

      let newShadowId = shadowId
      if (!isEmpty(shadowId)) {
        newIds.push(shadowId)
        newShadowId = uid()
      }
      console.debug(`Group[${groupIdx}]`, ids, shadowId, newIds, newShadowId)
      return { ids: newIds, shadowId: newShadowId }
    })

    this.setState_({
      groups: newGroupsState
    })
  },
})

function getGroupedName(name: string | undefined | null, id: string) {
  if (name == null) return name
  return `${name}_${id}`
}

export type Options = unknown

export type GroupState = {
  ids: string[]
  shadowId: string | null
}

export type ParsedField = {
  options: Options
  groupIdx: number | null
}

export type ParsedInput = {
  options: Options
  fields: ParsedField[]
  groupIdx: number | null
}

/** 与 jsonInitFactory 相似，但支持 group */
function jsonInitFactoryWithGroup(jsonDef: any) {
  return function (this: Blockly.Block) {
    // TODO: message N
    const { message0, args0, ...restDef } = jsonDef
    this.jsonInit(restDef);

    Blockly.Extensions.apply(withStateMutator, this, true);
    Blockly.Extensions.apply(selectableMixin, this, false);
    Blockly.Extensions.apply(emptyMixin, this, false);
    Blockly.Extensions.apply(withGroupMixin, this, false);

    this.initMessages_({ message0, args0 });

    window.b = this // TODO: remove me
  };
}

/** 与 Blockly.common.createBlockDefinitionsFromJsonArray 相似，但支持 group */
export function createBlockDefinitionsFromJsonArrayWithGroup(jsonArray: any[]): { [key: string]: BlockDefinition } {
  const blocks: {[key: string]: BlockDefinition} = {};
  for (let i = 0; i < jsonArray.length; i++) {
    const elem = jsonArray[i];
    if (!elem) {
      console.warn(`Block definition #${i} in JSON array is ${elem}. Skipping`);
      continue;
    }
    const type = elem['type'];
    if (!type) {
      console.warn(
        `Block definition #${i} in JSON array is missing a type attribute. ` +
          'Skipping.',
      );
      continue;
    }
    blocks[type] = {init: jsonInitFactoryWithGroup(elem)};
  }
  return blocks;
}
