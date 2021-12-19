import { roundD2 }    from '@aryth/math'
import { Deco, says } from '@spare/logger'
import { time }   from '@valjoux/timestamp'
import { Bar }    from './Bar'
import { Config } from '../../src/Config'
import { Layout } from '../../src/Layout'

// Progress-Baro constructor
export class ProgressBar extends Bar {

  constructor(config, layout) {
    super(Config.build(config))
    this.layout = Layout.build(layout)
    this.payload = {}
    this.format = this.layout.format.bind(this.layout)
    this.phrase = ''
    // the update timer
    this.timer = null

    // disable synchronous updates in noTTY mode
    if (this.config.noTTYOutput && this.terminal.isTTY === false) {
      this.config.syncUpdate = false
    }

    // update interval
    this.interval = ( this.terminal.isTTY ? this.config.throttle : this.config.notTTYSchedule )

    this.log = {}

    this |> Deco({ depth: 1, vert: 1 }) |> says['progress-bar']
    this.state |> Deco({ depth: 1, vert: 1 }) |> says['progress-bar'].br('state')
    this.layout  |> Deco({ depth: 2 }) |> says['progress-bar'].br('layout')
  }

  // internal render function
  render(payload) {
    this.payload = payload
    // stop timer
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
    super.render(this.layout.format.bind(this.layout), payload) // run internal rendering
    if (this.noTTY) this.terminal.nextLine() // add new line in noTTY mode!
    this.timer = setTimeout(this.render.bind(this, payload), this.interval) // next update
  }


  update(value, payload) {
    const withinThrottle = Date.now() <= ( this.prev + this.config.throttle * 2 )
    this.log[time()] = {
      syncUpdate: this.config.syncUpdate,
      throttled: withinThrottle,
      timer: this.timer,
      scheduleRate: roundD2(this.interval),
      value: value,
    }
    if (!this.timer) return // timer inactive ?
    super.update(value)
    // trigger synchronous update ?
    // check for throttle time
    if (this.config.syncUpdate && withinThrottle) this.render(payload) // force update
  }

  // start the progress bar
  init(total, value, payload) {
    // progress updates are only visible in TTY mode!
    if (this.config.noTTYOutput === false && this.terminal.isTTY === false) return
    // save current cursor settings
    this.terminal.saveCursor()
    // hide the cursor ?
    if (this.config.hideCursor) this.terminal.showCursor(false)
    // disable line wrapping ?
    if (!this.config.lineWrap) this.terminal.setLineWrap(false)
    // initialize bar
    super.init(total, value)
    // redraw on start!
    this.render(payload)
  }

  // stop the bar
  stop(payload) {
    // timer inactive ?
    if (!this.timer) { return }
    this.render(payload ?? this.payload,) // trigger final rendering
    super.stop() // restore state

    clearTimeout(this.timer) // stop timer
    this.timer = null

    // cursor hidden ?
    if (this.config.hideCursor) this.terminal.showCursor(true)

    // re-enable line wrapping ?
    if (!this.config.lineWrap) this.terminal.setLineWrap(true)

    // restore cursor on complete (position + settings)
    this.terminal.restoreCursor()

    // clear line on complete ?
    if (this.config.autoClear) {
      this.terminal.cursorTo(0, null)
      this.terminal.clearLine()
    }
    else {
      // new line on complete
      this.terminal.nextLine()
    }
  }
}