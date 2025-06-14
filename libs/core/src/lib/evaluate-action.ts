import { evaluateCondition } from './evaluate-condition.js';
import { evaluateExpression } from './evaluate-expression.js';

export function evaluateAction(action: any, context: any): any {
  if (typeof action === 'object' && action !== null && 'type' in action) {
    const wrapper = action as { type: string; [key: string]: any };

    if (wrapper.type === 'expression') {
      return evaluateExpression(wrapper.expression, context);
    }

    if (wrapper.type === 'logic') {
      return evaluateCondition(wrapper.logic, context);
    }

    throw new Error(`Unknown action type: ${wrapper.type}`);
  }

  return action;
}