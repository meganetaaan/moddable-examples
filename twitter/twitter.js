import config from 'mc/config'
import requestText from 'http-client'
import normalizeSearch from 'normalize-search'

const HOST = 'api.x.com'
const PLACEHOLDER = 'YOUR_BEARER_TOKEN_HERE'
const SEARCH_OPTIONS = [
  'tweet.fields=author_id,public_metrics',
  'expansions=author_id',
  'user.fields=name,username',
  'max_results=10'
].join('&')

async function search (query) {
  if (!config.xBearerToken || config.xBearerToken === PLACEHOLDER) {
    throw new Error('Set config.xBearerToken before searching X')
  }

  const body = await requestText(device.network.https, {
    host: HOST,
    path: `/2/tweets/search/recent?query=${encodeURIComponent(query)}&${SEARCH_OPTIONS}`,
    headers: new Map([
      ['authorization', `Bearer ${config.xBearerToken}`],
      ['user-agent', 'moddable-examples/9.0.0']
    ]),
    maxBytes: 96 * 1024
  })

  return normalizeSearch(JSON.parse(body))
}

export default Object.freeze({ search })
