import Timer from 'Timer'

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
  /**
   * start timer
   */
  start() {
    this.handler = Timer.repeat(tick, TICK)
  }

  /**
   * pause timer
   */
  pause() {
    Timer.clear(this.handler)
  }

  /**
   * reset this timer
   * @param {*} mode "WORK" OR "BREAK"
   */
  reset(mode) {
    this.mode = mode
    switch (this.mode) {
      case MODE.WORK:
        this.time = WORK_TIME
        this.start()
        break
      case MODE.BREAK:
        this.time = BREAK_TIME
        this.start()
        break
      default:
        throw new Error('must specify mode')
    }
  }

  /**
   * tick the timer
   */
  tick() {
    if (this.onTick() != null) {
      this.onTick(this.time)
    }
  }
}
Timer.repeat(() => {}, 1000)

export default Pomodoro
