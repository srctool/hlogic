// Jenis DSL utama
export interface HScriptNode {
  extension: 'hscript';
  id?: string;
  label?: string;
  type: 'condition' | 'expression';
  context?: unknown;
  version?: string;
  condition?: HConditionNode;
  expression?: HExpressionNode<unknown>;
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
export interface HCondition {
  operator: string;
  left: HValue;
  right: HValue;
}

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
