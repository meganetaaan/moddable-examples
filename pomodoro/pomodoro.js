import Timer from 'timer'

const WORK_TIME = 60 * 1000 * 25
const BREAK_TIME = 60 * 1000 * 5
const TICK = 1000
const MODE = {
  WORK: 'WORK',
  BREAK: 'BREAK',
}

/**
 * Pomodoro Timer
 */
class Pomodoro {
  constructor() {
    this.reset(MODE.WORK)
    this.autoStart = false
  }
  /**
   * start timer
   */
  start() {
    if (this.handler == null) {
      this.handler = Timer.repeat(this.tick.bind(this), TICK)
    }
    if (this.onStart != null) {
      this.onStart()
    }
  }

  /**
   * pause timer
   */
  pause() {
    if (this.handler != null) {
      Timer.clear(this.handler)
      this.handler = null
    }
    if (this.onPause != null) {
      this.onPause()
    }
  }

  /**
   * reset this timer
   * @param {*} mode "WORK" OR "BREAK"
   */
  reset(mode) {
    this.pause()
    this.mode = mode
    switch (this.mode) {
      case MODE.WORK:
        this.time = WORK_TIME
        break
      case MODE.BREAK:
        this.time = BREAK_TIME
        break
      default:
        throw new Error('must specify mode')
    }
    trace(`timer reset: ${this.mode}, ${this.time}`)
    if (this.onReset != null) {
      this.onReset(this.time, this.mode)
    }
    if (this.autoStart) {
      this.start()
    }
  }

  /**
   * tick the timer
   */
  tick() {
    trace(this.time)
    this.time -= TICK
    if (this.time < 0) {
      this.time = 0
    }
    if (this.onTick != null) {
      trace('onTick\n')
      this.onTick(this.time)
    }
    if (this.time === 0) {
      this.pause()
      if (this.onFinish != null) {
        this.onFinish()
      }
    }
  }
}

export default Pomodoro
export {
  MODE
}
