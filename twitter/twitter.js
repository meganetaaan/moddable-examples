import { Request } from 'http'
import SecureSocket from 'securesocket'
import secret from 'secret-token'

const HOST = 'api.twitter.com'
const BEARER_TOKEN = secret.BEARER_TOKEN
const KEYS = [
  'statuses',
  'id',
  'created_at',
  'text',
  'user',
  'name',
  'screen_name',
  'retweet_count',
  'favorite_count',
  'profile_image_url'
]

const search = async (q) => {
  return new Promise((resolve, reject) => {
    let request = new Request({
      host: HOST,
      port: 443,
      path: `/1.1/search/tweets.json?q=${q}&count=3`,
      headers: ['Authorization', `Bearer ${BEARER_TOKEN}`],
      Socket: SecureSocket,
      secure: {
        trace: true,
        protocolVersion: 0x303
      },
      response: String
    })
    request.callback = function (message, value) {
      if (message === -2) {
        reject(new Error('Bad request'))
      }

      if (Request.responseComplete === message) {
        value = JSON.parse(value, KEYS)
        // value = JSON.parse(value)
        resolve(value)
      }
    }
  })
}

const Twitter = {
  search: search
}

export default Twitter
