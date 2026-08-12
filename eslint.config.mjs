import js from '@eslint/js'

const readonly = 'readonly'

export default [
  {
    ignores: [
      '**/node_modules/**',
      // XS native bindings use legacy syntax that ESLint cannot parse. These
      // exclusions disappear in the PRs that replace the bindings.
      'ble/line-things/line-things-periferal/mac-address.js',
      'bongo_colorful/cryptdigest/mac-address.js',
      'neomatrix/neomatrix-render.js',
      'neomatrix-flicker/neomatrix-render.js'
    ]
  },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2025,
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
    files: ['theremin/server/**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        __dirname: readonly,
        module: readonly,
        process: readonly,
        require: readonly
      }
    }
  }
]
