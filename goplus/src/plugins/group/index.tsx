import * as React from 'react';
import * as Blockly from 'blockly';
import type { BlockDefinition } from 'blockly/core/blocks';
import renderer from '../../boockly-react/renderer';
import { GROUP_END, GROUP_START, tokenizeInterpolationWithGroups } from './parsing';
import { emptyMixin, selectableMixin, uid, withStateMutator } from './helpers';

export const withGroupMixin = 'with-group-mixin';

const TYPE_GROUP_START = 'group_start'
const TYPE_GROUP_END = 'group_end'

Blockly.Extensions.registerMixin(withGroupMixin, {

  /** block 内容的结构，包括 group、input & field */
  root_: { type: 'root', children: [] } satisfies ParsedRoot,

  /** 同 interpolateArguments_，但支持 group */
  interpolateArgumentsWithGroup_(
    this: Blockly.Block,
    tokens: Array<string | number>,
    args: Array<any | string>,
    implicitAlign: string | undefined,
  ): any[] {
    const elements: any[] = [];
    for (let i = 0; i < tokens.length; i++) {
      let element = tokens[i];
      if (typeof element === 'number') {
        element = args[element - 1];
      }
      // Args can be strings, which is why this isn't elseif.
      if (typeof element === 'string') {
        if (element === '\n') {
          // Convert newline tokens to end-row inputs.
          const newlineInput = {'type': 'input_end_row'};
          if (implicitAlign) {
            (newlineInput as any)['align'] = implicitAlign;
          }
          element = newlineInput as any;
        } else if (element === GROUP_START) {
          element = { type: TYPE_GROUP_START } as any
        } else if (element[0] === GROUP_END) {
          element = { type: TYPE_GROUP_END, tag: element.slice(1) } as any
        } else {
          // any because:  Type '{ text: string; type: string; }
          // | null' is not assignable to type 'string | number'.
          // @ts-ignore
          element = this.stringToFieldJson_(element) as any;
          if (!element) {
            continue;
          }
        }
      }
      elements.push(element);
    }

    const length = elements.length;
    let lastNoneGroupElement: any;
    for (let i = length - 1; i >= 0; i--) {
      if (elements[i].type !== TYPE_GROUP_START && elements[i].type !== TYPE_GROUP_END) {
        lastNoneGroupElement = elements[i];
        break;
      }
    }
    if (
      length &&
      // @ts-ignore
      !this.isInputKeyword_(lastNoneGroupElement.type)
    ) {
      const dummyInput = {'type': 'input_dummy'};
      if (implicitAlign) {
        (dummyInput as any)['align'] = implicitAlign;
      }
      elements.push(dummyInput);
    }

    return elements;
  },

  /** 基于单条 message（及其对应的 args）解析并组装到 root */
  parseMessage_(
    this: Blockly.Block,
    message: string,
    args: any[],
    implicitAlign: string | undefined
  ) {
    const root = this.root_
    const tokens = tokenizeInterpolationWithGroups(message);
    // @ts-ignore
    this.validateTokens_(tokens, args.length);
    // @ts-ignore
    const elements: any[] = this.interpolateArgumentsWithGroup_(tokens, args, implicitAlign);

    const fieldBuffer: Array<ParsedField> = [];
    const stack: Array<ParsedRoot | ParsedGroup> = [root] // 倒序栈，当前 node（root / group） 在第一项

    function flushFieldBuffer(): ParsedInput {
      return {
        type: 'input',
        options: { type: 'input_dummy' },
        children: fieldBuffer.splice(0)
      }
    }

    for (let i = 0, element: any; (element = elements[i]); i++) {
      const type = element.type
      if (type === TYPE_GROUP_START) {
        if (fieldBuffer.length > 0) {
          stack[0].children.push(flushFieldBuffer());
        }
        const idx = stack[0].children.length;
        const group: ParsedGroup = { type: 'group', idx, tag: '?', children: [] };
        stack[0].children.push(group);
        stack.unshift(group);
      } else if (type === TYPE_GROUP_END) {
        const group = stack.shift();
        if (group == null || group.type !== 'group') continue;
        group.tag = element.tag === '*' ? '*' : '?';
        if (fieldBuffer.length > 0) {
          group.children.push(flushFieldBuffer());
        }
      // @ts-ignore
      } else if (this.isInputKeyword_(element['type'])) {
        stack[0].children.push({
          type: 'input',
          options: element,
          children: fieldBuffer.splice(0)
        });
      } else {
        fieldBuffer.push({ type: 'field', options: element, children: [] });
      }
    }
  },

  /** 基于 message & args 构造 root & state */
  parseNodes_(
    this: Blockly.Block,
    jsonDef: any
  ) {
    const root: ParsedRoot = { type: 'root', children: [] };
    this.root_ = root;

    // 同 google/blockly/core/block.ts `jsonInit`
    let i = 0;
    while (jsonDef['message' + i] !== undefined) {
      this.parseMessage_(
        jsonDef['message' + i],
        jsonDef['args' + i] || [],
        // Backwards compatibility: lastDummyAlign aliases implicitAlign.
        jsonDef['implicitAlign' + i] || jsonDef['lastDummyAlign' + i],
      );
      i++;
    }

    const rootGroupStates = this.makeInitialGroupStates_(root.children);
    this.state_ = { ...this.state_, groups: rootGroupStates }
  },

  makeInitialGroupStates_(nodes: ParsedNode[]): GroupStates {
    const states: GroupStates = {}
    nodes.forEach((node, i) => {
      // 基于 input 中不会包 group 的假设，这里只处理 group 的内容
      if (node.type === 'group') {
        const shadowId = uid()
        states[i] = {
          ids: [],
          shadowId,
          nested: {
            [shadowId]: this.makeInitialGroupStates_(node.children)
          }
        }
      }
    })
    return states
  },

  getGroupState_(groupIdx: number, ctx: Context): GroupState | null {
    let groupStates: GroupStates = this.state_.groups
    for (const g of ctx.groups) {
      groupStates = groupStates[g.idx]!.nested[g.instanceId]!
    }
    return groupStates?.[groupIdx] ?? null
  },

  render_() {
    const isSelected = this.state_.isSelected ?? false;

    const renderGroupInstance = (group: ParsedGroup, id: string, isShadow: boolean, ctx: Context) => {
      const groupedId = getGroupedName(id, ctx.groups.map(g => g.instanceId));
      const groupsForChildren: GroupContext[] = [...ctx.groups, { tag: group.tag, idx: ctx.idx, instanceId: id, isShadow }]
      const children = group.children.map((n, i) => {
        const childrenCtx: Context = { idx: i, groups: groupsForChildren };
        return renderNode(n, childrenCtx);
      })
      return <React.Fragment key={groupedId}>{children}</React.Fragment>
    }

    const renderNode = (node: ParsedNode, ctx: Context): React.ReactNode => {
      if (node.type === 'field') {
        const name = getGroupedName(node.options.name, ctx.groups.map(g => g.instanceId));
        const isShadow = ctx.groups.some(g => g.isShadow)
        return <field key={name ?? ctx.idx} {...node.options} name={name} visible={!isShadow || isSelected} />
      } else if (node.type === 'input') {
        const name = getGroupedName(node.options.name, ctx.groups.map(g => g.instanceId));
        const isShadow = ctx.groups.some(g => g.isShadow)
        const children = node.children.map((n, i) => renderNode(n, { ...ctx, idx: i }))
        return (
          <input key={name ?? ctx.idx} {...node.options} name={name} visible={!isShadow || isSelected}>
            {children}
          </input>
        )
      } else if (node.type === 'root') {
        const children = node.children.map((n, i) => renderNode(n, { ...ctx, idx: i }))
        return <React.Fragment key={ctx.idx}>{children}</React.Fragment>
      } else if (node.type === 'group') {
        const groupState: GroupState = this.getGroupState_(node.idx, ctx)
        if (groupState == null) {
          console.warn('Group state not found', node.idx, ctx)
          return null
        }
        const groupInstances = groupState.ids.map(id => renderGroupInstance(node, id, false, ctx))
        const instantiatable = node.tag === '*' || groupState.ids.length === 0
        if (groupState.shadowId != null && instantiatable) {
          groupInstances.push(renderGroupInstance(node, groupState.shadowId, true, ctx))
        }
        const isInShadow = ctx.groups.some(g => g.isShadow)
        const placeholderView = (
          <dummy-input visible={!isInShadow && instantiatable && !isSelected}>
            <label-field text="..." />
          </dummy-input>
        )
        return (
          <React.Fragment key={ctx.idx}>
            {groupInstances}
            {placeholderView}
          </React.Fragment>
        )
      } else {
        throw new Error(`Unexpected node: ${node}`)
      }
    }

    renderer.render(
      renderNode(this.root_, { groups: [], idx: 0 }),
      this,
      () => this.queueRender()
    );
  },

  onChange_() {

    const root: ParsedRoot = this.root_;

    // const groupStack: ParsedGroup = []
    // 这里假设 group 中一定含 input，而不会出现 group 直接套 field 的情况
    const walk = (node: ParsedNode, ctx: Context): [GroupStates, boolean] => {
      if (node.type === 'root') {
        const results = node.children.map((n, idx) => walk(n, { ...ctx, idx }))
        const state: GroupStates = Object.assign({}, ...results.map(r => r[0]))
        return [state, false]
      } else if (node.type === 'input') {
        const name = node.options.name
        const isOwnEmpty: boolean = this.isInputEmpty_(getGroupedName(name, ctx.groups.map(g => g.instanceId)))
        const childrenAllEmpty = node.children.every((n, idx) => {
          const [_, isEmpty] = walk(n, { ...ctx, idx })
          return isEmpty
        })
        return [{}, isOwnEmpty && childrenAllEmpty]
      } else if (node.type === 'field') {
        const name = node.options.name
        const isEmpty = this.isFieldEmpty_(getGroupedName(name, ctx.groups.map(g => g.instanceId)))
        return [{}, isEmpty]
      } else if (node.type === 'group') {
        const groupId = [...ctx.groups.map(g => [g.idx, g.instanceId].join('/')), ctx.idx].join('/')

        const groupState: GroupState = this.getGroupState_(node.idx, ctx)
        if (groupState == null) {
          console.warn('Group state not found', node.idx, ctx)
          return [{}, false]
        }

        const { ids, shadowId } = groupState
        const newGroupState: GroupState = { ids: [], shadowId, nested: {} }

        const checkEmpty = (instanceId: string, isShadow: boolean) => {
          const isEmpties = node.children.map((child, idx) => {
            const [states, isEmpty] = walk(child, { idx, groups: [...ctx.groups, { tag: node.tag, idx: node.idx, instanceId, isShadow }] })
            const instanceNestedStates = newGroupState.nested[instanceId] = newGroupState.nested[instanceId] ?? {}
            Object.assign(instanceNestedStates, states)
            return isEmpty
          })
          return isEmpties.every(isEmpty => isEmpty)
        }

        let allEmpty = true
        for (const id of ids) {
          if (!checkEmpty(id, false)) {
            newGroupState.ids.push(id)
            allEmpty = false
          }
        }
        if (shadowId != null && !checkEmpty(shadowId, true)) {
          newGroupState.ids.push(shadowId)
          newGroupState.shadowId = uid()
          newGroupState.nested[newGroupState.shadowId] = this.makeInitialGroupStates_(node.children)
          allEmpty = false
        }
        return [{ [ctx.idx]: newGroupState }, allEmpty]
      } else {
        // 不会走到这里
        return [{}, false]
      }
    }

    const [newRootGroupStates] = walk(root, { idx: 0, groups: [] })

    this.setState_({
      groups: newRootGroupStates
    })
  },
})

type GroupContext = {
  tag: GroupTag
  idx: number
  instanceId: string
  isShadow: boolean
}

type Context = {
  idx: number
  /** 越外层的在越前面 */
  groups: GroupContext[]
}

function getGroupedName(name: string | undefined | null, instanceIds: string[]) {
  if (name == null) return name
  return [...instanceIds, name].join('_')
}

export type Options = any

export type GroupStates = Record<number, GroupState | undefined>

export type GroupState = {
  ids: string[]
  shadowId: string | null
  nested: Record<string, GroupStates | undefined>
}

export type ParsedField = {
  type: 'field'
  options: Options
  children: ParsedNode[]
}

export type ParsedInput = {
  type: 'input'
  options: Options
  children: ParsedNode[]
}

/**
 * `?`: zero or one
 * `*`: zero or more
 */
export type GroupTag = '*' | '?'

export type ParsedGroup = {
  type: 'group'
  idx: number
  tag: GroupTag
  children: ParsedNode[]
}

export type ParsedRoot = {
  type: 'root'
  children: ParsedNode[]
}

export type ParsedNode = ParsedField | ParsedInput | ParsedGroup | ParsedRoot

const messageArgsPattern = /^(message|args)\d+$/

/** 与 jsonInitFactory 相似，但支持 group */
function jsonInitFactoryWithGroup(jsonDef: any) {
  return function (this: Blockly.Block) {

    // 排除 messageN & argsN，避免 jsonInit 的相应逻辑
    const otherDef: any = {};
    for (const key in jsonDef) {
      if (Object.prototype.hasOwnProperty.call(jsonDef, key)) {
        const value = jsonDef[key];
        if (!messageArgsPattern.test(key)) {
          otherDef[key] = value;
        }
      }
    }
    this.jsonInit(otherDef);

    Blockly.Extensions.apply(withStateMutator, this, true);
    Blockly.Extensions.apply(selectableMixin, this, false);
    Blockly.Extensions.apply(emptyMixin, this, false);
    Blockly.Extensions.apply(withGroupMixin, this, false);

    this.parseNodes_(jsonDef);
    this.render_();
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
