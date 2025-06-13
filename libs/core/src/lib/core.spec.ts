import { simpleBasicConditionalInput } from '@hlogic/sample-input';
import { evaluate } from './evaluator.js';
import {
  HScriptNode,
  HConditionNode,
} from '@hlogic/types';
import { parse } from '@hlogic/parser';

const createContext = (data: any): any => data;

// --- Helper untuk membuat script condition ---
const createScript = (
  condition: HConditionNode,
  context?: any
): HScriptNode => ({
  extension: 'hscript',
  type: 'condition',
  condition,
  context,
});

describe('Evaluator - Unit Tests', () => {

  // --- Test Dasar Evaluasi Kondisi ---
  it('should return "then" when condition is true', () => {
    // const script = createScript(
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
    const script = createScript(
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
    const script = createScript(
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
    const script = createScript(
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
    const script = createScript(
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
    const script = createScript(
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
    const script = createScript(
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

    expect(() => evaluate(script)).toThrow(`Function not found: unknownFunction`);
  });
});

describe('Evaluator - Logical Operators', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should evaluate simple condition', () => {
    const script = createScript(
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
    const script = createScript(
      {
        if: {
          operator: 'and',
          conditions: [
            { operator: '>', left: { var: 'age' }, right: { value: 18 } },
            { operator: '==', left: { var: 'role' }, right: { value: 'admin' } },
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
    const script = createScript(
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
    const script = createScript(
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
    const script = createScript(
      {
        if: {
          operator: 'and',
          conditions: [
            {
              operator: 'or',
              conditions: [
                { operator: '==', left: { var: 'role' }, right: { value: 'admin' } },
                { operator: '==', left: { var: 'role' }, right: { value: 'mod' } },
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
    const script = createScript(
      {
        if: {
          operator: 'and',
          conditions: [
            { operator: '==', left: { var: 'role' }, right: { value: 'admin' } },
            { operator: '==', left: { var: 'status' }, right: { value: 'active' } },
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
    const script = createScript(
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
    const script = createScript(
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