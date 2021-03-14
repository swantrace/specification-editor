module.exports = {
  env: {
    commonjs: true,
    browser: true,
    es2021: true,
  },
  extends: [
    'airbnb',
    'plugin:shopify/react',
    'plugin:shopify/polaris',
    'plugin:shopify/jest',
    'plugin:shopify/webpack',
    'prettier',
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['prettier'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'import/no-unresolved': 'off',
    'prettier/prettier': ['error'],
    'no-underscore-dangle': ['error', { allow: ['__APOLLO_CLIENT__'] }],
    'no-console': ['off'],
    'no-debugger': ['off'],
  },
  overrides: [
    {
      files: ['*.test.*'],
      rules: {
        'shopify/jsx-no-hardcoded-content': 'off',
      },
    },
  ],
};
