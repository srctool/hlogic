import { HCondition, HConditionNode } from '@hlogic/types';
import { resolve } from './utils.js';
import { evaluateAction } from './evaluate-action.js';

export function evaluateConditionPrimitive(cond: HCondition, context: any): boolean {
  if ('conditions' in cond) {
    const results = cond.conditions.map((c) =>
      evaluateConditionPrimitive(c, context)
    );
    return cond.operator === 'and'
      ? results.every(Boolean)
      : results.some(Boolean);
  }

  if ('condition' in cond && cond.operator === 'not') {
    const result = resolve(cond.condition, context);
    return !result;
  }

  const leftValue = resolve(cond.left, context);
  const rightValue = resolve(cond.right!, context);

  switch (cond.operator) {
    case '==':
      return leftValue == rightValue;
    case '!=':
      return leftValue != rightValue;
    case '===':
      return leftValue === rightValue;
    case '!==':
      return leftValue !== rightValue;
    case '>':
      return leftValue > rightValue;
    case '<':
      return leftValue < rightValue;
    case '>=':
      return leftValue >= rightValue;
    case '<=':
      return leftValue <= rightValue;
    default:
      throw new Error(`Unsupported operator: ${cond.operator}`);
  }
}

export function evaluateCondition(condition: HConditionNode, context: any): unknown {
  const { if: hCondition, then, else: elseAction, elseIf } = condition;

  // Evaluate the current condition
  const isTrue = evaluateConditionPrimitive(hCondition, context);

  if (isTrue) {
    return evaluateAction(then, context);
  }

  // Evaluate elseIf chain
  if (elseIf) {
    for (const elif of elseIf) {
      const result = evaluateCondition(elif, context);
      if (result !== undefined) {
        return result;
      }
    }
  }

  // Evaluate else
  if (elseAction !== undefined) {
    return evaluateAction(elseAction, context);
  }

  return undefined;
}