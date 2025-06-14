import {
  HCondition,
  HConditionNode,
  HConditionValue,
  HExpressionNode,
  HScriptNode,
  HValue,
} from '@hlogic/types';
import { isObject, resolveValue } from './utils.js';
import { evaluateExpression } from './evaluate-expression.js';
import { evaluateCondition, evaluateConditionPrimitive } from './evaluate-condition.js';


export function evaluate(script: HScriptNode): unknown {
  if (!script.context) {
    // throw new Error('Missing execution context');
  }

  const context = script.context;

  // if (script.type === 'condition' && script.condition) {
  //   return evaluateCondition(script.condition, context);
  // }

  // if (script.type === 'expression' && script.expression) {
  //   return evaluateExpression(script.expression, context);
  // }

  switch (script.type) {
    case 'condition':
      return evaluateCondition(script.body as HConditionNode, context);

    case 'expression':
      return evaluateExpression(script.body as HExpressionNode<unknown>, context);

    // case 'loop':
    //   return evaluateLoop(script.body as HLoopNode, context);

    // case 'query':
    //   return evaluateQuery(script.body as HQueryNode, context);

    default:
      throw new Error(`Unsupported script type: ${script.type}`);
  }

  throw new Error(`Unsupported script type: ${script.type}`);
}
