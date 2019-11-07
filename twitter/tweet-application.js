import {
  Container,
  Content,
  Skin,
  Style,
  Die,
  Text,
  Label,
  Port,
  Behavior,
  Texture,
  Application
} from 'piu/MC'
import WipeTransition from 'piu/WipeTransition'

/* global trace */

const HEADER_HEIGHT = 36
const QUERY = 'M5Stack'
// const APPLICATION_WIDTH = 320
// const APPLICATION_HEIGHT = 240
const ParagraphStyle = Style.template({
  font: 'Cica-Regular',
  color: '#222222',
  horizontal: 'left'
})
const TitleStyle = Style.template({
  font: 'Cica-Regular',
  color: '#FFFFFF',
  horizontal: 'left'
})
const IndexStyle = Style.template({
  font: 'Cica-Regular',
  color: '#FFFFFF',
  horizontal: 'right'
})
const NameStyle = Style.template({
  font: 'Cica-Bold',
  color: '#222222',
  horizontal: 'left'
})
const ScreenNameStyle = Style.template({
  font: 'Cica-Regular',
  color: '#888888',
  horizontal: 'left'
})
const CountStyle = Style.template({
  font: 'Cica-Regular',
  color: '#888888',
  horizontal: 'left'
})
const filledPosition = { top: 0, bottom: 0, left: 0, right: 0 }

const SearchTexture = Texture.template({ path: 'search_36x36-alpha.bmp' })
const IconTexture = Texture.template({ path: 'm5stack.png' })

const IconSkin = Skin.template({
  Texture: IconTexture,
  x: 6,
  y: 6,
  width: 36,
  height: 36
})

const SearchSkin = Skin.template({
  color: 'white',
  Texture: SearchTexture,
  width: 36,
  height: 36
})

const SearchIcon = Content.template(({ ...props }) => ({
  Skin: SearchSkin,
  ...props
}))

const TitleLabel = Label.template(({ title, ...props }) => ({
  Style: TitleStyle,
  string: title,
  ...props
}))

const IndexLabel = Label.template(({ current, total, ...props }) => ({
  Style: IndexStyle,
  // zero-beggining to one-beggining
  string: `(${current + 1}/${total})`,
  ...props,
  Behavior: class extends Behavior {
    onCreate (it) {
      it.props = {
        current,
        total
      }
    }
    onPropsChanged (it, props) {
      it.props = props
      it.string = `(${props.current + 1}/${props.total})`
    }
  }
}))

// TODO: remove duplication
const ReplyTexture = Texture.template({ path: 'comment_18x18-alpha.bmp' })
const ReplySkin = Skin.template({
  color: '#888888',
  Texture: ReplyTexture,
  height: 18,
  width: 18
})
const ReplyCount = Container.template(({ count, ...props }) => ({
  height: 20,
  width: 60,
  contents: [
    new Content(null, {
      left: 0,
      top: 2,
      Skin: ReplySkin
    }),
    new Label(null, {
      left: 20,
      Style: CountStyle,
      string: `${count}`
    })
  ],
  ...props
}))

const RetweetTexture = Texture.template({ path: 'retweet_18x18-alpha.bmp' })
const RetweetSkin = Skin.template({
  color: '#888888',
  Texture: RetweetTexture,
  height: 18,
  width: 18
})
const RetweetCount = Container.template(({ count, ...props }) => ({
  height: 20,
  width: 60,
  contents: [
    new Content(null, {
      left: 0,
      top: 2,
      Skin: RetweetSkin
    }),
    new Label(null, {
      left: 20,
      Style: CountStyle,
      string: `${count}`
    })
  ],
  ...props
}))

const FavoriteTexture = Texture.template({ path: 'favorite_18x18-alpha.bmp' })
const FavoriteSkin = Skin.template({
  color: '#888888',
  Texture: FavoriteTexture,
  height: 18,
  width: 18
})
const FavoriteCount = Container.template(({ count, ...props }) => ({
  height: 20,
  width: 60,
  contents: [
    new Content(null, {
      left: 0,
      top: 2,
      Skin: FavoriteSkin
    }),
    new Label(null, {
      left: 20,
      Style: CountStyle,
      string: `${count}`
    })
  ],
  ...props
}))

const Header = Container.template(({ title, icon, current, total, ...props }) => ({
  skin: new Skin({ fill: '#1DA1F2' }),
  contents: [
    new SearchIcon({
      left: 4,
      top: 0,
      icon
    }),
    new TitleLabel({
      left: 44,
      top: 0,
      width: 200,
      height: HEADER_HEIGHT,
      title
    }),
    new IndexLabel({
      right: 4,
      top: 0,
      width: 80,
      height: HEADER_HEIGHT,
      current,
      total
    })
  ], // TODO
  ...props,
  Behavior: class extends Behavior {
    onCreate (it) {
      it.props = {
        title,
        icon,
        current,
        total
      }
    }
    onPropsChanged (it, props) {
      it.props = props
      it.last.delegate('onPropsChanged', {
        current: it.props.current,
        total: it.props.total
      })
    }
  }
}))

const Tweet = Container.template(({ tweet }) => {
  const screenNameStyle = new ScreenNameStyle()
  return {
    ...filledPosition,
    skin: new Skin({ fill: '#FAFAFA' }),
    contents: [
    // screen name
      new Port(null, {
        Skin: IconSkin,
        top: 4,
        left: 4,
        width: 36,
        height: 36,
        Behavior: class extends Behavior {
          onDraw (port) {
          // port.fillColor('blue', 0, 0, port.width, port.height)
            port.drawContent(0, 0, port.width, port.height)
          }
        }
      }),
      new Text(null, {
        top: 20,
        left: 44,
        right: 4,
        height: 24,
        Style: NameStyle,
        blocks: [
          {
            spans: [
              { spans: tweet.user.name },
              { style: screenNameStyle, spans: ` @${tweet.user.screen_name}` }
            ]
          }
        ]
      }),
      // text
      new Die(null, {
        top: 44,
        left: 4,
        right: 4,
        bottom: 24,
        Behavior: class extends Behavior {
          onDisplaying (die) {
            die.fill()
              .and(0, 0, die.width, die.height)
              .cut()
          }
        },
        contents: [
          new Text(null, {
            ...filledPosition,
            Style: ParagraphStyle,
            string: tweet.text
          })
        ]
      }),
      /*
      new Text(null, {
        top: 44,
        left: 4,
        right: 4,
        bottom: 40,
        Style: ParagraphStyle,
        string: tweet.text
      }),
      */
      new ReplyCount({
        count: 0,
        bottom: 4,
        left: 44
      }),
      new RetweetCount({
        count: tweet.retweet_count,
        bottom: 4,
        left: 134
      }),
      new FavoriteCount({
        count: tweet.favorite_count,
        bottom: 4,
        left: 224
      })
    ]
  }
})

const Body = Container.template(({ tweets, current, total, ...props }) => ({
  skin: new Skin({ fill: '#FAFAFA' }),
  contents: [new Tweet({ tweet: tweets.statuses[current] })],
  Behavior: class extends Behavior {
    onCreate (it) {
      it.props = { tweets, current }
    }
    onPropsChanged (it, props) {
      let trBegin, trEnd
      // TODO: concider when tweets changed
      if (props.current === it.props.current) {
        // nothing to do
        return
      } else if (props.current > it.props.current) {
        trBegin = 'left'
        trEnd = 'right'
      } else {
        trBegin = 'right'
        trEnd = 'left'
      }
      // switch tweets
      it.props = props
      const transition = new WipeTransition(
        250,
        Math.quadEaseOut,
        trBegin,
        trEnd
      )
      const tweet = new Tweet({ tweet: it.props.tweets.statuses[it.props.current] })
      it.run(transition, it.first, tweet)
    }
  },
  ...props
}))

const TweetApplication = Application.template(({ tweets }) => ({
  commandListLength: 4096,
  displayListLength: 4096 * 3,
  skin: new Skin({ fill: '#FFFFFF' }),
  ...filledPosition,
  contents: [
    new Header({
      title: QUERY,
      current: 0,
      total: tweets.statuses.length,
      icon: '',
      top: 0,
      left: 0,
      right: 0,
      height: HEADER_HEIGHT
    }),
    new Body({
      tweets: tweets,
      current: 0,
      total: tweets.statuses.length,
      top: HEADER_HEIGHT,
      left: 0,
      right: 0,
      bottom: 0
    })
  ],
  Behavior: class extends Behavior {
    changeIndex (ap, idx) {
      const total = ap.props.total
      if (idx < 0 || idx >= total) {
        trace('invalid index, ignoring\n')
        return
      }
      let props = {
        tweets: ap.props.tweets,
        total: ap.props.total,
        current: idx
      }
      ap.props = props
      ap.first.delegate('onPropsChanged', ap.props)
      ap.last.delegate('onPropsChanged', ap.props)
    }
    onCreate (ap) {
      let props = {
        tweets: tweets,
        total: tweets.statuses.length,
        current: 0
      }
      ap.props = props
    }
    onNext (ap) {
      this.changeIndex(ap, ap.props.current + 1)
    }
    onPrevious (ap) {
      this.changeIndex(ap, ap.props.current - 1)
    }
  }
}))

export default TweetApplication
