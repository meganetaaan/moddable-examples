/* global trace */
import { Application, Style, Skin, Label } from 'piu/MC'
import Pomodoro from 'pomodoro'

const FONT = 'OpenSans-Regular-52'

function msecToTime(msec) {
  const sec = msec / 1000
  return {
    minutes: Math.floor(sec / 60),
    seconds: Math.floor(sec % 60)
  }
}

const timeLabel = new Label(null, {
      style: new Style({ font: FONT, color: 'white' }),
      skin: new Skin({ fill: 'black' }),
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      string: '0'
})

const application = new Application(null, {
  contents: [timeLabel]
})

const pomodoro = new Pomodoro()
pomodoro.onTick = function(time) {
  const t = msecToTime(time)
  const m = String(t.minutes).padStart(2, '0')
  const s = String(t.seconds).padStart(2, '0')
  timeLabel.string = `${m}:${s}`
}
pomodoro.start()
