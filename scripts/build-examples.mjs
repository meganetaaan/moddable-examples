import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

const repositoryRoot = fileURLToPath(new URL('../', import.meta.url))

export const buildMatrix = [
  ['ble-keyboard', 'ble/keyboard/keyboard_periferal', 'esp32'],
  ['ble-line-m5stack', 'ble/line-things/line-things-periferal', 'esp32/m5stack'],
  ['ble-line-fire', 'ble/line-things/line-things-periferal', 'esp32/m5stack_fire'],
  ['ble-mai5-m5stack', 'ble/mai5/mai5-periferal', 'esp32/m5stack'],
  ['ble-mai5-fire', 'ble/mai5/mai5-periferal', 'esp32/m5stack_fire'],
  ['ble-qr-m5stack', 'ble/qr-ble/qr-ble-periferal', 'esp32/m5stack'],
  ['ble-qr-fire', 'ble/qr-ble/qr-ble-periferal', 'esp32/m5stack_fire'],
  ['bongo-m5stack', 'bongo', 'esp32/m5stack'],
  ['bongo-fire', 'bongo', 'esp32/m5stack_fire'],
  ['bongo-colorful-m5stack', 'bongo_colorful', 'esp32/m5stack'],
  ['bongo-colorful-fire', 'bongo_colorful', 'esp32/m5stack_fire'],
  ['counter-m5stack', 'counter', 'esp32/m5stack'],
  ['counter-fire', 'counter', 'esp32/m5stack_fire'],
  ['files', 'files', 'esp32'],
  ['flame', 'flame', 'esp32'],
  ['jslogo-m5stack', 'jslogo', 'esp32/m5stack'],
  ['jslogo-fire', 'jslogo', 'esp32/m5stack_fire'],
  ['meoow-atom-echo', 'meoow-button-atomecho', 'esp32/m5atom_echo'],
  ['neomatrix-flicker', 'neomatrix-flicker', 'esp32'],
  ['neomatrix', 'neomatrix', 'esp32'],
  ['ifttt-m5stack', 'network/ifttt-client', 'esp32/m5stack'],
  ['ifttt-fire', 'network/ifttt-client', 'esp32/m5stack_fire'],
  ['light-server', 'network/light-server', 'esp32'],
  ['plant-logger', 'network/plant-logger', 'esp32'],
  ['security-logger', 'network/security-logger', 'esp32'],
  ['piu-e-ink', 'piu-e-ink', 'esp32'],
  ['pomodoro-m5stack', 'pomodoro', 'esp32/m5stack'],
  ['pomodoro-fire', 'pomodoro', 'esp32/m5stack_fire'],
  ['psram', 'psram', 'esp32'],
  ['roboto', 'roboto', 'esp32/m5atom_matrix'],
  ['servo', 'servo', 'esp32/m5stack'],
  ['theremin-m5stack', 'theremin/client', 'esp32/m5stack'],
  ['theremin-fire', 'theremin/client', 'esp32/m5stack_fire'],
  ['twitter-m5stack', 'twitter', 'esp32/m5stack'],
  ['twitter-fire', 'twitter', 'esp32/m5stack_fire'],
  ['color-m5stack', 'unit/color', 'esp32/m5stack'],
  ['color-fire', 'unit/color', 'esp32/m5stack_fire'],
  ['color-stick', 'unit/color', 'esp32/m5stick_c'],
  ['env-m5stack', 'unit/env', 'esp32/m5stack'],
  ['env-fire', 'unit/env', 'esp32/m5stack_fire'],
  ['env-stick', 'unit/env', 'esp32/m5stick_c'],
  ['joystick', 'unit/joystick', 'esp32/m5stack'],
  ['neopixel-m5stack', 'unit/neopixel', 'esp32/m5stack'],
  ['neopixel-fire', 'unit/neopixel', 'esp32/m5stack_fire'],
  ['neopixel-stick', 'unit/neopixel', 'esp32/m5stick_c'],
  ['neopixel-esp32', 'unit/neopixel', 'esp32'],
  ['neostrand-m5stack', 'unit/neostrand', 'esp32/m5stack'],
  ['neostrand-fire', 'unit/neostrand', 'esp32/m5stack_fire'],
  ['neostrand-stick', 'unit/neostrand', 'esp32/m5stick_c'],
  ['piano', 'unit/piano', 'esp32/m5stack'],
  ['relay', 'unit/relay', 'esp32/m5stack']
]

function validateEnvironment () {
  const missing = ['MODDABLE', 'IDF_PATH'].filter(name => !process.env[name])
  if (!missing.length) return true

  console.error(`Missing required environment variables: ${missing.join(', ')}`)
  return false
}

export function runBuilds (requestedNames = []) {
  if (!validateEnvironment()) return 1

  const names = new Set(buildMatrix.map(([name]) => name))
  const unknown = requestedNames.filter(name => !names.has(name))
  if (unknown.length) {
    console.error(`Unknown build names: ${unknown.join(', ')}`)
    return 1
  }

  const requested = new Set(requestedNames)
  const builds = requested.size
    ? buildMatrix.filter(([name]) => requested.has(name))
    : buildMatrix

  for (const [index, [name, directory, platform]] of builds.entries()) {
    console.log(`[${index + 1}/${builds.length}] ${name} (${platform})`)
    const result = spawnSync(
      'mcconfig',
      ['-d', '-m', '-p', platform, '-t', 'build'],
      {
        cwd: resolve(repositoryRoot, directory),
        stdio: 'inherit'
      }
    )
    if (result.error) {
      console.error(result.error.message)
      return 1
    }
    if (result.status !== 0) return result.status ?? 1
  }

  console.log(`${builds.length} Moddable builds passed`)
  return 0
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = runBuilds(process.argv.slice(2))
}
