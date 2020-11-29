'use strict'

module.exports = {
  parser: 'babel-eslint',
  extends: ['standard'],
  rules: {
    'space-before-function-paren': ['error', 'never']
  },
  parserOptions: {
    ecmaVersion: 2019,
    babelOptions: {
      configFile: './babel.config.js'
    }
  }
}
