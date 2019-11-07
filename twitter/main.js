// import Twitter from 'twitter'
import tweets from 'tweets'
import TweetApplication from 'tweet-application'

/* global trace */

/*
const search = Twitter.search

;(async () => {
  const result = await search(QUERY)
  trace(JSON.stringify(result))
})()
*/

const app = new TweetApplication({
  tweets
})

if (global.button != null) {
  // setting callbacks
  global.button.a.onChanged = function () {
    if (this.read()) {
      app.delegate('onPrevious')
    }
  }
  global.button.c.onChanged = function () {
    if (this.read()) {
      app.delegate('onNext')
    }
  }
}
