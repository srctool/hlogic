import { simpleBasicConditionalInput } from '@hlogic/sample-input';
import { evaluate } from './evaluator.js';
import { HScriptNode, HConditionNode } from '@hlogic/types';
import { parse } from '@hlogic/parser';
import { registerFunction, unregisterFunction } from './function-registry.js';

const createContext = (data: any): any => data;

// --- Helper untuk membuat script condition ---
const createConditionScript = (
  condition: HConditionNode,
  context?: any
): HScriptNode => ({
  extension: 'hscript',
  type: 'condition',
  condition,
  context,
});

const createExpressionScript = (
  expression: any,
  context?: any
): HScriptNode => ({
  extension: 'hscript',
  type: 'expression',
  expression,
  context,
});

describe('Evaluator - Unit Tests', () => {
  // --- Test Dasar Evaluasi Kondisi ---
  it('should return "then" when condition is true', () => {
    // const script = createConditionScript(
    //   {
    //     if: {
    //       operator: '==',
    //       left: { var: 'user.role' },
    //       right: { value: 'admin' },
    //     },
    //     then: 'Access Granted',
    //   },
    //   createContext({ user: { role: 'admin' } })
    // );

    const input = simpleBasicConditionalInput;

    const result = evaluate(parse(input));
    expect(result).toBe('Access Granted');
  });

  it('should return "else" when condition is false', () => {
    const script = createConditionScript(
      {
        if: {
          operator: '==',
          left: { var: 'user.role' },
          right: { value: 'admin' },
        },
        then: 'Access Granted',
        else: 'Access Denied',
      },
      createContext({ user: { role: 'guest' } })
    );

    const result = evaluate(script);
    expect(result).toBe('Access Denied');
  });

  // --- Test Nested Else If ---
  it('should evaluate elseIf chain correctly', () => {
    const script = createConditionScript(
      {
        if: {
          operator: '==',
          left: { var: 'score' },
          right: { value: 100 },
        },
        then: 'Perfect',
        elseIf: [
          {
            if: {
              operator: '>=',
              left: { var: 'score' },
              right: { value: 90 },
            },
            then: 'A',
          },
          {
            if: {
              operator: '>=',
              left: { var: 'score' },
              right: { value: 80 },
            },
            then: 'B',
          },
        ],
        else: 'Failed',
      },
      createContext({ score: 85 })
    );

    const result = evaluate(script);
    expect(result).toBe('B');
  });

  // --- Test Resolve Value (var, value, expression) ---
  it('should resolve nested expression in condition', () => {
    const script = createConditionScript(
      {
        if: {
          operator: '>',
          left: { var: 'user.age' },
          right: {
            expression: {
              fn: 'getDefaultAge',
              args: [],
            },
          },
        },
        then: 'Older',
      },
      createContext({ user: { age: 25 } })
    );

    // Simulasikan fungsi global
    (global as any).getDefaultAge = () => 18;

    const result = evaluate(script);
    expect(result).toBe('Older');
  });

  // --- Test Action Wrapper (expression & logic) ---
  it('should evaluate action with wrapper expression', () => {
    const script = createConditionScript(
      {
        if: {
          operator: '==',
          left: { var: 'user.role' },
          right: { value: 'admin' },
        },
        then: {
          type: 'expression',
          expression: {
            fn: 'greetAdmin',
            args: [{ var: 'user.name' }],
          },
        },
      },
      createContext({ user: { role: 'admin', name: 'Alice' } })
    );

    (global as any).greetAdmin = (name: string) => `Hello Admin ${name}`;

    const result = evaluate(script);
    expect(result).toBe('Hello Admin Alice');
  });

  it('should evaluate action with wrapper logic', () => {
    const script = createConditionScript(
      {
        if: {
          operator: '==',
          left: { var: 'user.role' },
          right: { value: 'admin' },
        },
        then: {
          type: 'logic',
          logic: {
            if: {
              operator: '==',
              left: { var: 'user.status' },
              right: { value: 'active' },
            },
            then: 'Active Admin',
            else: 'Inactive Admin',
          },
        },
      },
      createContext({ user: { role: 'admin', status: 'inactive' } })
    );

    const result = evaluate(script);
    expect(result).toBe('Inactive Admin');
  });

  // --- Test Expression Eksternal ---
  it('should evaluate expression type with args', () => {
    const script: HScriptNode = {
      extension: 'hscript',
      type: 'expression',
      expression: {
        fn: 'add',
        args: [{ var: 'a' }, { var: 'b' }],
      },
      context: createContext({ a: 5, b: 3 }),
    };

    (global as any).add = (x: number, y: number) => x + y;

    const result = evaluate(script);
    expect(result).toBe(8);
  });

  // --- Error Handling ---
  it('should throw error for unsupported operator', () => {
    const script = createConditionScript(
      {
        if: {
          operator: 'invalid-op',
          left: { var: 'a' },
          right: { var: 'b' },
        },
        then: 'fail',
      },
      createContext({ a: 1, b: 2 })
    );

    expect(() => evaluate(script)).toThrow(`Unsupported operator: invalid-op`);
  });

  it('should throw error for unknown function', () => {
    const script: HScriptNode = {
      extension: 'hscript',
      type: 'expression',
      expression: {
        fn: 'unknownFunction',
        args: [],
      },
      context: {},
    };

    expect(() => evaluate(script)).toThrow(
      `Function not found in registry: unknownFunction`
    );
  });
});

describe('Evaluator - Logical Operators', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should evaluate simple condition', () => {
    const script = createConditionScript(
      {
        if: {
          operator: '==',
          left: { var: 'role' },
          right: { value: 'admin' },
        },
        then: 'Access Granted',
      },
      createContext({ role: 'admin' })
    );

    const result = evaluate(script);
    expect(result).toBe('Access Granted');
  });

  it('should evaluate "and" condition correctly', () => {
    const script = createConditionScript(
      {
        if: {
          operator: 'and',
          conditions: [
            { operator: '>', left: { var: 'age' }, right: { value: 18 } },
            {
              operator: '==',
              left: { var: 'role' },
              right: { value: 'admin' },
            },
          ],
        },
        then: 'Access Granted',
      },
      createContext({ age: 25, role: 'admin' })
    );

    const result = evaluate(script);
    expect(result).toBe('Access Granted');
  });

  it('should evaluate "or" condition correctly', () => {
    const script = createConditionScript(
      {
        if: {
          operator: 'or',
          conditions: [
            { operator: '<', left: { var: 'age' }, right: { value: 13 } },
            { operator: '>', left: { var: 'age' }, right: { value: 60 } },
          ],
        },
        then: 'Special Discount',
      },
      createContext({ age: 65 })
    );

    const result = evaluate(script);
    expect(result).toBe('Special Discount');
  });

  it('should evaluate "not" condition correctly', () => {
    const script = createConditionScript(
      {
        if: {
          operator: 'not',
          condition: {
            operator: '==',
            left: { var: 'role' },
            right: { value: 'guest' },
          },
        },
        then: 'Not Guest',
      },
      createContext({ role: 'admin' })
    );

    const result = evaluate(script);
    expect(result).toBe('Not Guest');
  });

  it('should handle nested logic with "and", "or", and "not"', () => {
    const script = createConditionScript(
      {
        if: {
          operator: 'and',
          conditions: [
            {
              operator: 'or',
              conditions: [
                {
                  operator: '==',
                  left: { var: 'role' },
                  right: { value: 'admin' },
                },
                {
                  operator: '==',
                  left: { var: 'role' },
                  right: { value: 'mod' },
                },
              ],
            },
            {
              operator: 'not',
              condition: {
                operator: '==',
                left: { var: 'blocked' },
                right: { value: true },
              },
            },
          ],
        },
        then: 'Access Allowed',
      },
      createContext({ role: 'admin', blocked: false })
    );

    const result = evaluate(script);
    expect(result).toBe('Access Allowed');
  });

  it('should return undefined when condition is false', () => {
    const script = createConditionScript(
      {
        if: {
          operator: 'and',
          conditions: [
            {
              operator: '==',
              left: { var: 'role' },
              right: { value: 'admin' },
            },
            {
              operator: '==',
              left: { var: 'status' },
              right: { value: 'active' },
            },
          ],
        },
        then: 'Valid User',
      },
      createContext({ role: 'admin', status: 'inactive' })
    );

    const result = evaluate(script);
    expect(result).toBeUndefined();
  });

  it('should evaluate else branch when condition is false', () => {
    const script = createConditionScript(
      {
        if: {
          operator: '==',
          left: { var: 'role' },
          right: { value: 'admin' },
        },
        then: 'Admin',
        else: 'Not Admin',
      },
      createContext({ role: 'user' })
    );

    const result = evaluate(script);
    expect(result).toBe('Not Admin');
  });

  it('should evaluate elseIf chain correctly', () => {
    const script = createConditionScript(
      {
        if: {
          operator: '==',
          left: { var: 'score' },
          right: { value: 100 },
        },
        then: 'Perfect',
        elseIf: [
          {
            if: {
              operator: '>=',
              left: { var: 'score' },
              right: { value: 90 },
            },
            then: 'A',
          },
          {
            if: {
              operator: '>=',
              left: { var: 'score' },
              right: { value: 80 },
            },
            then: 'B',
          },
        ],
        else: 'Failed',
      },
      createContext({ score: 85 })
    );

    const result = evaluate(script);
    expect(result).toBe('B');
  });
});

describe('Evaluator - Expression Type', () => {
  it('should evaluate simple expression with no args', () => {
    // Simulasikan fungsi global
    (global as any).hello = () => 'Hello World';

    const script = createExpressionScript({
      fn: 'hello',
      args: [],
    });

    const result = evaluate(script);
    expect(result).toBe('Hello World');
  });

  it('should evaluate expression with literal args', () => {
    (global as any).add = (a: number, b: number) => a + b;

    const script = createExpressionScript({
      fn: 'add',
      args: [5, 10],
    });

    const result = evaluate(script);
    expect(result).toBe(15);
  });

  it('should resolve variable from context as argument', () => {
    (global as any).greet = (name: string) => `Hello ${name}`;

    const script = createExpressionScript(
      {
        fn: 'greet',
        args: [{ var: 'user.name' }],
      },
      { user: { name: 'Alice' } }
    );

    const result = evaluate(script);
    expect(result).toBe('Hello Alice');
  });

  it('should resolve multiple variables from context', () => {
    (global as any).sum = (a: number, b: number) => a + b;

    const script = createExpressionScript(
      {
        fn: 'sum',
        args: [{ var: 'a' }, { var: 'b' }],
      },
      { a: 20, b: 30 }
    );

    const result = evaluate(script);
    expect(result).toBe(50);
  });

  it('should handle nested expression in args', () => {
    (global as any).multiply = (a: number, b: number) => a * b;

    const script = createExpressionScript(
      {
        fn: 'multiply',
        args: [
          { var: 'x' },
          {
            expression: {
              fn: 'sum',
              args: [{ var: 'y' }, { var: 'z' }],
            },
          },
        ],
      },
      { x: 2, y: 3, z: 4 }
    );

    // sum(y=3, z=4) = 7 → multiply(x=2, 7) = 14
    const result = evaluate(script);
    expect(result).toBe(14);
  });

  it('should throw error for unknown function', () => {
    const script = createExpressionScript({
      fn: 'unknownFunction',
      args: [],
    });

    expect(() => evaluate(script)).toThrow(
      `Function not found in registry: unknownFunction`
    );
  });

  it('should allow optional args', () => {
    (global as any).log = (...args: any[]) => args.join(', ');

    const script = createExpressionScript(
      {
        fn: 'log',
        args: [{ value: 'Hello' }, { var: 'user.name' }],
      },
      { user: { name: 'Bob' } }
    );

    const result = evaluate(script);
    expect(result).toBe('Hello, Bob');
  });
});

describe('Evaluator - Context Checking', () => {
  it('should throw error when context is missing but variable is used', () => {
    const script = createConditionScript({
      if: {
        operator: '==',
        left: { var: 'user.role' },
        right: { value: 'admin' },
      },
      then: 'Access Granted',
    });

    expect(() => evaluate(script)).toThrow(
      'Context is required to resolve variable: user.role'
    );
  });

  it('should throw error when var is not a string', () => {
    const script = createConditionScript(
      {
        if: {
          operator: '==',
          left: { var: 123 },
          right: { value: 'admin' },
        },
        then: 'Access Granted',
      },
      {}
    );

    expect(() => evaluate(script)).toThrow(`expected string, got number`);
  });

  it('should warn when variable not found in context', () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

    const script = createConditionScript(
      {
        if: {
          operator: '==',
          left: { var: 'user.role' },
          right: { value: 'admin' },
        },
        then: 'Access Granted',
      },
      {} // context kosong
    );

    evaluate(script); // tidak error, tapi kasih warning
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Variable not found in context: user.role'
    );

    consoleWarnSpy.mockRestore();
  });
});

describe('Evaluator - Register Expression', () => {
  const add = (a: number, b: number) => a + b;
  const multiply = (a: number, b: number) => a * b;
  const getDummyJson = (id: string) => {
    fetch('https://dummyjson.com/users/1')
      .then((res) => res.json());

      return undefined;
  };

  beforeEach(() => {
    // Daftarkan fungsi sebelum test
    registerFunction('add', add);
    registerFunction('multiply', multiply);
    registerFunction('getDummyJson', getDummyJson);
  });

  afterEach(() => {
    // Hapus fungsi setelah test
    unregisterFunction('add');
    unregisterFunction('multiply');
    unregisterFunction('getDummyJson');
  });

  it('should evaluate registered function "add"', () => {
    const script = createConditionScript({
      if: {
        operator: '==',
        left: {
          expression: {
            fn: 'add',
            args: [{ value: 5 }, { value: 10 }],
          },
        },
        right: { value: 15 },
      },
      then: 'Match',
    });

    const result = evaluate(script);
    expect(result).toBe('Match');
  });

  it('should throw error for unregistered function', () => {
    const script = createConditionScript({
      if: {
        operator: '==',
        left: {
          expression: {
            fn: 'unknownFn',
            args: [],
          },
        },
        right: { value: true },
      },
      then: 'Should not reach here',
    });

    expect(() => evaluate(script)).toThrow(
      'Function not found in registry: unknownFn'
    );
  });

    it('should call api', () => {
    const script = createConditionScript({
      if: {
        operator: '==',
        left: {
          expression: {
            fn: 'getDummyJson',
            args: [{val: 1}],
          },
        },
        right: { value: true },
      },
      then: '1',
    });

    // evaluate(script);


    expect(evaluate(script)).toBeUndefined();
  });
});