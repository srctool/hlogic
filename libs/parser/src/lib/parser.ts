// import { HScriptNode } from './../../../core/src/types/types';

import { HAction, HCondition, HConditionNode, HScriptNode } from '@hlogic/types';

export function parse(raw: unknown): HScriptNode {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("Invalid script");
  }

  const input = raw as Record<string, any>;

  console.log(input);

    if (input.extension !== 'hscript') {
    throw new Error('Unsupported extension');
  }

  const result: HScriptNode = {
    extension: 'hscript',
    type: input.type,
    id: input.id,
    label: input.label,
    version: input.version,
    context: input.context,
  };

  // Parse berdasarkan tipe
  if (input.type === 'condition' && input.condition) {
    result.condition = parseCondition(input.condition);
  } else if (input.type === 'expression' && input.expression) {
    result.expression = input.expression; // misalnya ekspresi langsung
  } else {
    throw new Error(`Unknown or unsupported script type: ${input.type}`);
  }

  return result;
}

function parseAction(action: any): HAction {
  // Sesuaikan dengan struktur HAction kamu
  if (typeof action === 'string' || typeof action === 'number' || typeof action === 'boolean') {
    return action;
  }

  if (action && typeof action === 'object') {
    // Misalnya wrapper expression/logic
    return action;
  }

  throw new Error('Invalid action');
}

function parseCondition(condition: any): HConditionNode {
  if (!condition.if) {
    throw new Error('Missing "if" clause in condition');
  }

  const hCondition: HCondition = {
    operator: condition.if.operator,
    left: condition.if.left,
    right: condition.if.right,
  };

  return {
    if: hCondition,
    then: parseAction(condition.then),
    else: condition.else ? parseAction(condition.else) : undefined,
    elseIf: condition.elseIf?.map((elif: any) => parseCondition(elif)),
    label: condition.label,
    id: condition.id,
  };
}
