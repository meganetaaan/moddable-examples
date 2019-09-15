'use strict'

module.exports = {
  parser: 'babel-eslint',
  extends: 'standard',
  parserOptions: {
    ecmaVersion: 2019,
    babelOptions: {
      configFile: './babel.config.js'
    }
  },
}
