import Twitter from 'twitter'
import tweets from 'tweets'
import TweetApplication from 'tweet-application'

// TODO: indicator
import { Label, Skin, Style } from 'piu/MC'

const search = Twitter.search
const QUERY = 'M5Stack'
let isUpdating = false

const app = new TweetApplication({
  tweets
})

const Indicator = Label.template(() => ({
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  skin: new Skin({
    fill: '#00000088'
  }),
  style: new Style({
    font: 'Cica-Regular',
    color: '#FFFFFF',
    horizontal: 'center',
    vertical: 'middle'
  }),
  string: 'updating...'
}))

// M5Stack's target setup owns these pins and exposes its buttons globally.
globalThis.button.a.onChanged = function () {
  if (!isUpdating && this.read()) {
    app.delegate('onPrevious')
  }
}

globalThis.button.b.onChanged = async function () {
  if (!isUpdating && this.read()) {
    isUpdating = true
    const indicator = new Indicator()
    app.add(indicator)
    try {
      const result = await search(QUERY)
      if (result.statuses.length === 0) {
        trace('No recent posts found\n')
      } else {
        app.delegate('onPropsChanged', result)
      }
    } catch (error) {
      trace(`X search failed: ${error}\n`)
    } finally {
      app.remove(indicator)
      isUpdating = false
    }
  }
}

globalThis.button.c.onChanged = function () {
  if (!isUpdating && this.read()) {
    app.delegate('onNext')
  }
}

export default app
