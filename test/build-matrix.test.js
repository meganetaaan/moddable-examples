import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

import { buildMatrix } from '../scripts/build-examples.mjs'

const repositoryRoot = fileURLToPath(new URL('../', import.meta.url))
const componentManifests = new Set([
  'theremin/client/vl53l0x/manifest.json'
])

function findManifests (directory) {
  const manifests = []
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue

    const path = join(directory, entry.name)
    if (entry.isDirectory()) {
      manifests.push(...findManifests(path))
    } else if (entry.name === 'manifest.json') {
      manifests.push(relative(repositoryRoot, path).split(sep).join('/'))
    }
  }
  return manifests
}

test('build matrix covers every application manifest and declared platform', () => {
  const names = buildMatrix.map(([name]) => name)
  const pairs = buildMatrix.map(([, directory, platform]) => `${directory}:${platform}`)
  assert.equal(new Set(names).size, names.length, 'build names must be unique')
  assert.equal(new Set(pairs).size, pairs.length, 'directory/platform pairs must be unique')

  const matrixDirectories = new Set()
  const platformsByDirectory = new Map()
  for (const [, directory, platform] of buildMatrix) {
    const manifestPath = resolve(repositoryRoot, directory, 'manifest.json')
    assert.ok(existsSync(manifestPath), `${directory} must contain manifest.json`)
    matrixDirectories.add(directory)
    const platforms = platformsByDirectory.get(directory) ?? new Set()
    platforms.add(platform)
    platformsByDirectory.set(directory, platforms)
  }

  const manifests = findManifests(repositoryRoot)
    .filter(path => !componentManifests.has(path))
  const applicationDirectories = manifests.map(path => dirname(path))
  assert.deepEqual(
    [...matrixDirectories].sort(),
    applicationDirectories.sort()
  )

  for (const manifestPath of manifests) {
    const manifest = JSON.parse(
      readFileSync(resolve(repositoryRoot, manifestPath), 'utf8')
    )
    const declared = Object.keys(manifest.platforms ?? {})
      .filter(platform => platform !== '...')
    const covered = platformsByDirectory.get(dirname(manifestPath))
    for (const platform of declared) {
      assert.ok(covered.has(platform), `${manifestPath} must build ${platform}`)
    }
  }
})
