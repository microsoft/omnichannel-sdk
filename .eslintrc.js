module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:security/recommended'
  ],
  rules: {
    'no-async-promise-executor': 'off',
    '@typescript-eslint/ban-types': 'off',
    'no-restricted-syntax': ['error', {
      selector: ":matches(VariableDeclarator > MemberExpression.init, AssignmentExpression > MemberExpression.right)[object.name='Constants'][property.name=/Headers$/]",
      message: 'Copy shared Constants headers per request ({ ...Constants.defaultHeaders }); never assign them by reference.'
    }]
  }
};
