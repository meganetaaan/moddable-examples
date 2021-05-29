import { Container, Label, Behavior } from 'piu/MC'
import Timeline from 'piu/Timeline'

class MarqueeBehavior extends Behavior {
  startScroll (it) {
    let label = it.first
    if (label == null || !(label instanceof Label)) {
      return
    }
    if (label.width < it.width - 4) {
      return
    }
    let duration = label.string.length * 500
    let timeline
    if (it.timeline == null) {
      timeline = it.timeline = new Timeline()
      timeline.to(
        label,
        {
          x: -label.width
        },
        duration,
        undefined,
        1000
      )
      it.duration = timeline.duration
    } else {
      timeline = it.timeline
    }
    timeline.seekTo(0)
    it.time = 0
    it.start()
  }
  onDisplaying (it) {
    it.delegate('startScroll')
  }
  onFinished (it) {
    it.bubble('onScrolled')
    it.delegate('startScroll')
  }
  onTimeChanged (it) {
    it.timeline.seekTo(it.time)
  }
}

const MarqueeLabel = Container.template(
  ({ string }) => ({
    clip: true,
    Behavior: MarqueeBehavior,
    contents: [
      new Label(null, {
        top: 0,
        bottom: 0,
        left: 0,
        string
      })
    ]
  })
)

export default MarqueeLabel
