import { HCondition, HConditionNode, HExpressionNode, HScriptNode, HValue } from '@hlogic/types';

export function evaluate(script: HScriptNode): unknown {
  if (!script.context) {
    throw new Error('Missing execution context');
  }

  const context = script.context;

  if (script.type === 'condition' && script.condition) {
    return evaluateCondition(script.condition, context);
  }

  if (script.type === 'expression' && script.expression) {
    return evaluateExpression(script.expression, context);
  }

  throw new Error(`Unsupported script type: ${script.type}`);
}

function evaluateCondition(condition: HConditionNode, context: any): unknown {
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

function evaluateConditionPrimitive(cond: HCondition, context: any): boolean {
  const leftValue = resolveValue(cond.left, context);
  const rightValue = resolveValue(cond.right, context);

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

function evaluateExpression(expr: HExpressionNode<any>, context: any): unknown {
  const { fn, args = [] } = expr;

  // Simulasi fungsi global
  if (typeof (globalThis as any)[fn] === 'function') {
    const resolvedArgs = args.map((arg) => resolveValue(arg, context));
    return (globalThis as any)[fn](...resolvedArgs);
  }

  throw new Error(`Function not found: ${fn}`);
}

function resolveValue(value: HValue, context: any): any {
  if (typeof value === 'object' && value !== null) {
    if ('var' in value) {
      return getIn(context, value.var as string);
    }
    if ('value' in value) {
      return value.value;
    }
    if ('expression' in value) {
      return evaluateExpression(value.expression, context);
    }
  }

  return value;
}

function getIn(obj: any, path: string): any {
  return path.split('.').reduce((acc, part) => acc?.[part], obj);
}

function evaluateAction(action: any, context: any): any {
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