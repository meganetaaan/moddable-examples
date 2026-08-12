import test from 'node:test'
import assert from 'node:assert/strict'

import { hasIFTTTKey, makeIFTTTPath } from '../shared/ifttt.js'
import normalizeSearch from '../twitter/normalize-search.js'

test('makeIFTTTPath encodes path and query values', () => {
  assert.equal(
    makeIFTTTPath({ event: 'button pressed', key: 'a/b', value: 'A&B' }),
    '/trigger/button%20pressed/with/key/a%2Fb?value1=A%26B'
  )
})

test('hasIFTTTKey rejects the documented placeholder', () => {
  assert.equal(hasIFTTTKey('YOUR_WEBHOOK_KEY_HERE'), false)
  assert.equal(hasIFTTTKey('real-key'), true)
})

test('normalizeSearch maps X API v2 posts to the display model', () => {
  const result = normalizeSearch({
    data: [{
      id: '1',
      author_id: '42',
      text: 'Hello',
      public_metrics: {
        reply_count: 2,
        retweet_count: 3,
        like_count: 5
      }
    }],
    includes: {
      users: [{
        id: '42',
        name: 'Moddable',
        username: 'moddabletech'
      }]
    }
  })

  assert.deepEqual(result, {
    statuses: [{
      text: 'Hello',
      user: {
        name: 'Moddable',
        screen_name: 'moddabletech'
      },
      reply_count: 2,
      retweet_count: 3,
      favorite_count: 5
    }]
  })
})

test('normalizeSearch tolerates missing users and metrics and applies its limit', () => {
  const posts = Array.from({ length: 4 }, (_, index) => ({
    author_id: String(index),
    text: String(index)
  }))
  const result = normalizeSearch({ data: posts })

  assert.equal(result.statuses.length, 3)
  assert.deepEqual(result.statuses[0], {
    text: '0',
    user: {
      name: 'Unknown',
      screen_name: 'unknown'
    },
    reply_count: 0,
    retweet_count: 0,
    favorite_count: 0
  })
})
