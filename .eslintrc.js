module.exports = {
  'env': {
    'es2021': true,
    'node': true,
  },
  'extends': [
    'google',
    'plugin:flowtype/recommended',
  ],
  'parserOptions': {
    'ecmaVersion': 12,
    'sourceType': 'module',
  },
  'rules': {
    'semi': [2, 'never'],
    'max-len': ['error', {'code': 140}],
  },
}
