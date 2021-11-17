import { roundD2 }      from '@aryth/math'
import { time }         from '@valjoux/timestamp'
import { parseOptions } from '../util/parseOptions'
import { Bar }          from './Bar'

// Progress-Bar constructor
export class ProgressBar extends Bar {

  constructor(options, preset) {
    super(parseOptions(options, preset))

    // the update timer
    this.timer = null

    // disable synchronous updates in notty mode
    if (this.options.noTTYOutput && this.terminal.isTTY === false) {
      this.options.synchronousUpdate = false
    }

    // update interval
    this.interval = ( this.terminal.isTTY ? this.options.throttleTime : this.options.notTTYSchedule )

    this.log = {}
  }

  // internal render function
  render() {
    // stop timer
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }

    // run internal rendering
    super.render()

    // add new line in notty mode!
    if (this.options.noTTYOutput && this.terminal.isTTY === false) {
      this.terminal.newline()
    }

    // next update
    this.timer = setTimeout(this.render.bind(this), this.interval)
  }

  update(current, payload) {

    this.log[time()] = {
      syncUpdate: this.options.synchronousUpdate,
      throttled: Date.now() <= ( this.lastRedraw + this.options.throttleTime * 2 ),
      timer: this.timer,
      scheduleRate: roundD2(this.interval),
      current: current,
    }

    // timer inactive ?
    if (!this.timer) return

    super.update(current, payload)

    // trigger synchronous update ?
    // check for throttle time
    if (this.options.synchronousUpdate && ( this.lastRedraw + this.options.throttleTime * 2 ) < Date.now()) {
      // force update
      this.render()
    }
  }

  // start the progress bar
  start(total, startValue, payload) {
    // progress updates are only visible in TTY mode!
    if (this.options.noTTYOutput === false && this.terminal.isTTY === false) return

    // save current cursor settings
    this.terminal.cursorSave()

    // hide the cursor ?
    if (this.options.hideCursor === true) {
      this.terminal.cursor(false)
    }

    // disable line wrapping ?
    if (this.options.lineWrap === false) {
      this.terminal.lineWrapping(false)
    }

    // initialize bar
    super.start(total, startValue, payload)

    // redraw on start!
    this.render()
  }

  // stop the bar
  stop() {
    // timer inactive ?
    if (!this.timer) {
      return
    }

    // trigger final rendering
    this.render()

    // restore state
    super.stop()

    // stop timer
    clearTimeout(this.timer)
    this.timer = null

    // cursor hidden ?
    if (this.options.hideCursor === true) {
      this.terminal.cursor(true)
    }

    // re-enable line wrapping ?
    if (this.options.lineWrap === false) {
      this.terminal.lineWrapping(true)
    }

    // restore cursor on complete (position + settings)
    this.terminal.cursorRestore()

    // clear line on complete ?
    if (this.options.clearOnComplete) {
      this.terminal.cursorTo(0, null)
      this.terminal.clearLine()
    }
    else {
      // new line on complete
      this.terminal.newline()
    }
  }
}