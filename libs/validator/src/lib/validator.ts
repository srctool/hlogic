export function validate(input: any): void {
  if (typeof input !== 'object' || input === null) {
    throw new Error('Input must be an object');
  }

  // Validasi extension
  if (input.extension !== 'hscript') {
    throw new Error(`Invalid extension: ${input.extension}, expected 'hscript'`);
  }

  // Validasi type
  const validTypes = ['condition', 'expression'];
  if (!validTypes.includes(input.type)) {
    throw new Error(`Invalid type: ${input.type}, expected one of ${validTypes.join(', ')}`);
  }

  // Validasi berdasarkan type
  if (input.type === 'condition') {
    validateConditionNode(input.condition, 'condition');
  } else if (input.type === 'expression') {
    validateExpressionNode(input.expression);
  }

  // Optional: Validasi context
  if (input.context !== undefined && typeof input.context !== 'object') {
    throw new Error('Context must be an object or undefined');
  }
}

function validateConditionNode(node: any, fieldName: string): void {
  if (!node) {
    throw new Error(`Missing required field: ${fieldName}`);
  }

  if (typeof node !== 'object') {
    throw new Error(`${fieldName} must be an object`);
  }

  // Validasi 'if'
  if (!node.if) {
    throw new Error(`Missing required field: ${fieldName}.if`);
  }
  validateCondition(node.if, `${fieldName}.if`);

  // Validasi 'then'
  if (node.then === undefined) {
    throw new Error(`Missing required field: ${fieldName}.then`);
  }
  // Tambahkan validasi untuk 'else' dan 'elseIf' jika perlu
}

function validateCondition(condition: any, fieldName: string): void {
  if (typeof condition !== 'object' || !condition.operator) {
    throw new Error(`Invalid condition at ${fieldName}: missing operator`);
  }

  const { left, right } = condition;

  if (left === undefined) {
    throw new Error(`Missing left operand at ${fieldName}`);
  }

  if (right === undefined) {
    throw new Error(`Missing right operand at ${fieldName}`);
  }

  // Bisa tambahkan validasi lebih dalam untuk HValue jika diperlukan
}

function validateExpressionNode(expr: any): void {
  if (!expr || typeof expr !== 'object') {
    throw new Error('Expression must be a non-null object');
  }

  if (typeof expr.fn !== 'string') {
    throw new Error('Expression must have a "fn" property of type string');
  }

  if (expr.args !== undefined && !Array.isArray(expr.args)) {
    throw new Error('Expression args must be an array or undefined');
  }
}