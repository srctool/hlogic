
import { HLoopNode } from '@hlogic/types';
import { resolveValue } from './utils.js';

export function evaluateLoop(loop: HLoopNode, context: any): void {
  const items = resolveValue(loop.collection, context);

  if (!Array.isArray(items)) {
    throw new Error('Collection must be an array for foreach');
  }

  const itemName = loop.as || 'item';
  const indexName = loop.asIndex || 'index';

  items.forEach((item, index, arr) => {
    const localContext = {
      ...context,
      [itemName]: item,
      [indexName]: index,
      collection: arr,
      parentItem: context.item || null,
      depth: (context.depth || 0) + 1
    };

    // if (loop.action.type === 'expression') {
    // //   evaluateExpression(loop.action.expression, localContext);
    // } else if (loop.action.type === 'condition') {
    // //   evaluateCondition(loop.action.logic, localContext);
    // } else if (loop.action.type === 'loop') {
    // //   evaluateLoop(loop.action.loop, localContext);
    // } else {
    //   throw new Error(`Unknown action type in loop: ${loop.action.type}`);
    // }
  });
}