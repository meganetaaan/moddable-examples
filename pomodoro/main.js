/* global trace */
import { Application, Style, Skin, Label } from 'piu/MC'
import Pomodoro, { MODE } from 'pomodoro'

const FONT = 'OpenSans-Regular-52'

const timeLabel = new Label(null, {
  style: new Style({ font: FONT, color: 'black' }),
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  string: ''
})

const titleLabel = new Label(null, {
  style: new Style({ font: FONT, color: 'white'}),
  skin: new Skin({
    fill: ['red', 'green']
  }),
  top: 0,
  height: 60,
  left: 0,
  right: 0,
  string: ''
})

const parrotImage = new Image(null, {
  bottom: 0,
  left: 0,
  path: 'fastparrot.cs',
  loop: true,
})

const application = new Application(null, {
  contents: [parrotImage, timeLabel, titleLabel],
  displayListLength: 4096,
  touchCount: 0,
  skin: new Skin({
    fill: '#FFFFFF'
  })
})

const msecToTime = (msec) => {
  const sec = msec / 1000
  return {
    minutes: Math.floor(sec / 60),
    seconds: Math.floor(sec % 60)
  }
}

const updateTime = (time) => {
  const t = msecToTime(time)
  const m = String(t.minutes).padStart(2, '0')
  const s = String(t.seconds).padStart(2, '0')
  timeLabel.string = `${m}:${s}`
} 

const updateTitle = (mode) => {
  titleLabel.string = mode
  titleLabel.state = mode === MODE.WORK ? 0 : 1
}

const onTick = (time, mode) => {
  if (time === 30000) {
    parrotImage
  }
  updateTime(time)
} 

const onStart = (time, mode) => {
  parrotImage.start()
}

const onPause = (time, mode) => {
  parrotImage.stop()
}

const onReset = (time, mode) => {
  updateTime(time)
  updateTitle(mode)
}

const onFinish = (time, mode) => {

}

const pomodoro = new Pomodoro({
  onStart,
  onPause,
  onTick,
  onReset,
  onFinish
})

if (global.button != null) {
  // button handler for M5Stack
  button.a.onChanged = function () {
    if (this.read()) {
      if (pomodoro.isPlaying) {
        pomodoro.pause(pomodoro.time, pomodoro.mode)
      } else {
        pomodoro.start()
      }
    }
  }
  button.b.onChanged = function () {
    if (this.read()) {
      const isPlaying = pomodoro.isPlaying
      if (isPlaying) {
        pomodoro.reset()
      } else {
        const mode =
          pomodoro.mode === MODE.WORK
          ? MODE.BREAK
          : MODE.WORK
        pomodoro.reset(mode)
      }
    }
  }
}
