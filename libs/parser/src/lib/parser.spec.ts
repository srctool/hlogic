import { HScriptNode } from '@hlogic/types';
import { parse } from './parser.js';
import { simpleBasicConditionalInput } from '@hlogic/sample-input';

describe('hLogic Parser - Unit Tests', () => {
  it('should parse a minimal valid condition script with context', () => {

    const input = simpleBasicConditionalInput;

    expect(parse(input)).toEqual<HScriptNode>(
      expect.objectContaining({
        extension: 'hscript',
        type: 'condition',
        condition: {
          if: {
            operator: '==',
            left: { var: 'user.role' },
            right: { value: 'admin' },
          },
          then: 'Access Granted',
          else: 'Access Denied',
        },
      })
    );
  });
});
