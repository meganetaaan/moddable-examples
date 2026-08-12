import js from '@eslint/js'

const readonly = 'readonly'

export default [
  {
    ignores: [
      '**/node_modules/**'
    ]
  },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        Application: readonly,
        AudioContext: readonly,
        Behavior: readonly,
        Content: readonly,
        Image: readonly,
        Label: readonly,
        Skin: readonly,
        Style: readonly,
        TextDecoder: readonly,
        TextEncoder: readonly,
        Texture: readonly,
        WebSocket: readonly,
        application: readonly,
        backlight: readonly,
        button: readonly,
        console: readonly,
        device: readonly,
        document: readonly,
        global: readonly,
        location: readonly,
        navigator: readonly,
        native: readonly,
        screen: readonly,
        trace: readonly
      }
    },
    rules: {
      'no-redeclare': ['error', { builtinGlobals: false }],
      'no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_'
      }]
    }
  },
  {
    files: [
      'ble/web-server.js',
      'test/**/*.js',
      'theremin/server/**/*.js'
    ],
    languageOptions: {
      sourceType: 'module',
      globals: {
        clearTimeout: readonly,
        fetch: readonly,
        process: readonly,
        setTimeout: readonly,
        URL: readonly
      }
    }
  }
]
