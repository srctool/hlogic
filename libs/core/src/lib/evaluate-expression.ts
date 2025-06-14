import { HExpressionNode } from '@hlogic/types';
import { getRegisteredFunction } from './function-registry.js';
import { resolveValue } from './utils.js';

const allowGlobalFunctions = process.env.NODE_ENV !== 'production'; // contoh aktifkan

export function evaluateExpression(expr: HExpressionNode<unknown>, context: any): unknown {
  const { fn, args = [] } = expr;

  let func = getRegisteredFunction(fn);

  if (!func && allowGlobalFunctions && typeof (globalThis as any)[fn] === 'function') {
    func = (globalThis as any)[fn];
  }

  if (!func) {
    throw new Error(`Function not found in registry: ${fn}`);
  }

  const resolvedArgs = args.map((arg) => resolveValue(arg, context));
  return func(...resolvedArgs);
}