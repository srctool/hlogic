import { simpleBasicConditionalInput } from '@hlogic/sample-input';
import { validate } from './validator.js';

describe('Validator - Unit Tests', () => {
  const validScript = simpleBasicConditionalInput;

  it('should validate a correct script without error', () => {
    expect(() => validate(validScript)).not.toThrow();
  });

  it('should throw error when input is not an object', () => {
    expect(() => validate(null)).toThrow('Input must be an object');
    expect(() => validate(123)).toThrow('Input must be an object');
    expect(() => validate('string')).toThrow('Input must be an object');
  });

  it('should throw error for unsupported extension', () => {
    const input = {
      ...validScript,
      extension: 'invalid',
    };

    expect(() => validate(input)).toThrow(`Invalid extension: invalid`);
  });

  it('should throw error for unsupported type', () => {
    const input = {
      ...validScript,
      type: 'invalid-type',
    };

    expect(() => validate(input)).toThrow(`Invalid type: invalid-type`);
  });

  it('should throw error if "condition" is missing for type "condition"', () => {
    const input = {
      ...validScript,
      condition: undefined,
    };

    expect(() => validate(input)).toThrow(`Missing required field: condition`);
  });

  it('should throw error if "if" is missing in condition', () => {
    const input = {
      ...validScript,
      condition: {
        then: 'Access Granted',
      },
    };

    expect(() => validate(input)).toThrow(`Missing required field: condition.if`);
  });

  it('should throw error if "operator" is missing in condition.if', () => {
    const input = {
      ...validScript,
      condition: {
        ...validScript.condition,
        if: {
          left: { var: 'user.role' },
          right: { value: 'admin' },
        },
      },
    };

    expect(() => validate(input)).toThrow(`Invalid condition at condition.if`);
  });

  it('should throw error if "left" is missing in condition.if', () => {
    const input = {
      ...validScript,
      condition: {
        ...validScript.condition,
        if: {
          operator: '==',
          right: { value: 'admin' },
        },
      },
    };

    expect(() => validate(input)).toThrow(`Missing left operand at condition.if`);
  });

  it('should throw error if "right" is missing in condition.if', () => {
    const input = {
      ...validScript,
      condition: {
        ...validScript.condition,
        if: {
          operator: '==',
          left: { var: 'user.role' },
        },
      },
    };

    expect(() => validate(input)).toThrow(`Missing right operand at condition.if`);
  });

  it('should throw error if "then" is missing in condition', () => {
    const input = {
      ...validScript,
      condition: {
        ...validScript.condition,
        then: undefined,
      },
    };

    expect(() => validate(input)).toThrow(`Missing required field: condition.then`);
  });

  it('should allow optional "context" as object', () => {
    const input = {
      ...validScript,
      context: {
        user: { role: 'admin' },
      },
    };

    expect(() => validate(input)).not.toThrow();
  });

  it('should throw error if "context" is not an object', () => {
    const input = {
      ...validScript,
      context: 'not-an-object',
    };

    expect(() => validate(input)).toThrow(`Context must be an object or undefined`);
  });

  it('should validate expression type correctly', () => {
    const input = {
      extension: 'hscript',
      type: 'expression',
      expression: {
        fn: 'add',
        args: [1, 2],
      },
    };

    expect(() => validate(input)).not.toThrow();
  });

  it('should throw error if expression.fn is not string', () => {
    const input = {
      extension: 'hscript',
      type: 'expression',
      expression: {
        fn: 123,
        args: [1, 2],
      },
    };

    expect(() => validate(input)).toThrow(`Expression must have a "fn" property of type string`);
  });

  it('should throw error if expression.args is not array', () => {
    const input = {
      extension: 'hscript',
      type: 'expression',
      expression: {
        fn: 'add',
        args: 'not-array',
      },
    };

    expect(() => validate(input)).toThrow(`Expression args must be an array or undefined`);
  });
});