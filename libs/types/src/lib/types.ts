// Jenis DSL utama
// export interface HScriptNode {
//   extension: 'hlscript';
//   id?: string;
//   label?: string;
//   type: 'condition' | 'expression';
//   context?: unknown;
//   version?: string;

//   // wrapper
//   condition?: HConditionNode;
//   expression?: HExpressionNode<unknown>;
// }

export type HScriptType = 'condition' | 'expression' | 'loop' | 'query';

export type ScriptBodyMap = {
  condition: HConditionNode;
  expression: HExpressionNode<unknown>;
  // loop: HLoopNode;
  // query: HQueryNode;
};

export type ScriptBody = ScriptBodyMap[keyof ScriptBodyMap];
export interface HScriptNode<
  TType extends keyof ScriptBodyMap = keyof ScriptBodyMap
> {
  extension: 'hlscript';
  type: TType;
  context?: unknown;
  id?: string;
  label?: string;
  version?: string | number;
  body?: ScriptBodyMap[TType];
}

export interface HLoopNode {
  type: 'foreach';
  collection: HValue;
  as?: string; // alias untuk item
  asIndex?: string; // alias untuk index
  action: HAction; // bisa expression/logic/loop
}

// Struktur node logika `if`
export interface HConditionNode {
  if: HCondition;
  then: HAction;
  else?: HAction;
  elseIf?: HConditionNode[];
  label?: string;
  id?: string;
}

// Node expression (digunakan dalam `then`, `else`, atau mandiri)
export interface HExpressionNode<T = unknown> {
  fn: string;
  args?: T[];
  id?: string;
  label?: string;
}

// Struktur kondisi utama
export interface HConditionBase {
  operator: string;
}
export type HConditionValue = HValue | HCondition;

// Bentuk Biner (kompatibel lama & baru
export interface HConditionBinary extends HConditionBase {
  operator: string;
  left: HConditionValue;
  right?: HConditionValue;
}

// Bentuk Array (baru, untuk and/or)
export interface HConditionArray extends HConditionBase {
  operator: 'and' | 'or';
  conditions: HCondition[];
}

// Bentuk Unary (untuk not)
export interface HConditionUnary extends HConditionBase {
  operator: 'not';
  condition: HCondition;
}

// Union type
export type HCondition = HConditionBinary | HConditionArray | HConditionUnary;

// export interface HCondition {
//   operator: string;
//   left: HValue;
//   right: HValue;
// }

// Jenis nilai (literal, referensi, nested expression)
export type HValue =
  | { var: unknown }
  | { value: unknown } // untuk literal eksplisit
  | { expression: HExpressionNode }
  | string
  | number
  | boolean;

// Apa yang boleh dijalankan sebagai aksi (ekspresi atau logic lagi)
export type HAction =
  | HWrapper
  | string
  | number
  | boolean
  | { [key: string]: unknown };

export interface WrapperMap {
  expression: HExpressionNode;
  logic: HConditionNode;
}

export type HWrapper = {
  [K in keyof WrapperMap]: {
    type: K;
  } & Record<K, WrapperMap[K]>;
}[keyof WrapperMap];
