import { HCondition, HConditionValue, HValue } from '@hlogic/types';
import { evaluateExpression } from './evaluate-expression.js';
import { evaluateConditionPrimitive } from './evaluate-condition.js';

export function resolveValue(value: unknown, context: any): any {
  // Jika bukan object, langsung kembalikan (primitif)
  if (!isObject(value)) {
    return value;
  }

  // Cek apakah ini referensi variabel
  if ('var' in value) {
    const varPath = value.var;

    // Validasi tipe path
    if (typeof varPath !== 'string') {
      throw new Error(
        `Invalid variable reference: expected string, got ${typeof varPath}`
      );
    }

    // Validasi context tersedia
    if (!context) {
      throw new Error(`Context is required to resolve variable: ${varPath}`);
    }

    // Akses dari context
    const resolved = getIn(context, varPath);

    if (resolved === undefined) {
      console.warn(`Variable not found in context: ${varPath}`);
    }

    return resolved;
  }

  // Cek apakah ini literal
  if ('value' in value) {
    return value.value;
  }

  // Cek apakah ini ekspresi bersarang
  if ('expression' in value) {
    return evaluateExpression(value.expression, context);
  }

  // fallback: kembalikan object mentah
  return value;
}

export function getIn(obj: any, path: string): any {
  return path.split('.').reduce((acc, part) => acc?.[part], obj);
}

export function isObject(value: any): value is Record<string, any> {
  return typeof value === 'object' && value !== null;
}

export function resolve(value: HConditionValue, context: any): any {
  if (isHCondition(value)) {
    return evaluateConditionPrimitive(value, context);
  }

  return resolveValue(value, context);
}

export function isHCondition(value: any): value is HCondition {
  return typeof value === 'object' && 'operator' in value;
}

export function isVarReference(value: HValue): value is { var: string } {
  return isObject(value) && 'var' in value && typeof value.var === 'string';
}