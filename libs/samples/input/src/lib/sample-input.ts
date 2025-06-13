export const simpleBasicConditionalInput = {
  extension: 'hscript',
  type: 'condition',
  context: {
    user: {
      id: 123,
      role: 'admin',
    },
  },
  condition: {
    if: {
      operator: '==',
      left: { var: 'user.role' },
      right: { value: 'admin' },
    },
    then: 'Access Granted',
    else: 'Access Denied',
  },
};
