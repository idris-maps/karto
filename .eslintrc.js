module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    /*
    
    */
  ],
  rules: {
    '@typescript-eslint/member-delimiter-style': ["error", {
      multiline: {
        delimiter: 'none',    // 'none' or 'semi' or 'comma'
        requireLast: true,
      },
      singleline: {
        delimiter: 'semi',    // 'semi' or 'comma'
        requireLast: false,
      },
    }],
    '@typescript-eslint/no-explicit-any': [0],
    '@typescript-eslint/no-empty-interface': [0],
    '@typescript-eslint/ban-ts-ignore': [0],
    '@typescript-eslint/explicit-function-return-type': [0],
  },
}