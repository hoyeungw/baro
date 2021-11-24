import { Deco, says } from '@spare/logger'
import EventEmitter   from 'events'
import { Config }     from '../../src/Config'
import { Layout }     from '../../src/Layout'
import { Terminal }   from '../../util/Terminal'
import { Bar }        from './Bar'
// Progress-Baro constructor
export class ParallelBar extends EventEmitter {

  constructor(config, layout) {
    super()

    // list of bars
    this.bars = []
    this.payloads = []

    // parse+store config
    this.config = Config.build(config)
    this.layout = Layout.build(layout)
    this.config |> Deco({ depth: 1 }) |> says['parallel-bar']

    // disable synchronous updates
    this.config.syncUpdate = false
    this.config.syncUpdate = false

    // this.config |> Deco({ depth: 1 }) |> logger
    // this.config.stream |> Deco({ depth: 1 })  |> logger

    // store terminal instance
    this.terminal = this.config.terminal ?? new Terminal(this.config)

    // the update timer
    this.timer = null

    // progress bar active ?
    this.active = false

    // update interval
    this.interval = this.terminal.isTTY ? this.config.throttle : this.config.notTTYSchedule
  }

  // add a new bar to the stack
  create(total, value, payload) {
    // progress updates are only visible in TTY mode!
    if (this.config.noTTYOutput === false && this.terminal.isTTY === false) return

    // create new bar element
    const bar = new Bar(this.config)

    // store bar
    this.bars.push(bar)
    this.payloads.push(payload)

    // progress-bar collection already active ?
    if (!this.active) {
      // hide the cursor ?
      if (this.config.hideCursor) this.terminal.showCursor(false)
      // disable line wrapping ?
      if (!this.config.lineWrap) this.terminal.setLineWrap(false)
      // initialize update timer
      this.timer = setTimeout(this.update.bind(this), this.interval)
    }

    // set flag
    this.active = true

    // start progress bar
    bar.init(total, value, payload)

    // trigger event
    this.emit('start')

    // return new instance
    return bar
  }

  // remove a bar from the stack
  remove(bar) {
    // find element
    const index = this.bars.indexOf(bar)
    // element found ?
    if (index < 0) { return false }
    // remove element
    this.bars.splice(index, 1)
    this.payloads.splice(index, 1)
    // force update
    this.update()
    // clear bottom
    this.terminal.newline()
    this.terminal.clearDown()
    return true
  }

  // internal update routine
  update() {
    // stop timer
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }

    // trigger event
    this.emit('update-pre')

    // reset cursor
    this.terminal.resetCursor()

    // trigger event
    this.emit('redraw-pre')

    const format = this.layout.format.bind(this.layout)
    // update each bar
    for (let i = 0; i < this.bars.length; i++) {
      this.bars[i].render(format, this.payloads[i])
      this.terminal.newline()
    }

    // trigger event
    this.emit('redraw-post')

    // add new line in noTTY mode
    if (this.config.noTTYOutput && this.terminal.isTTY === false) {
      this.terminal.newline()
      this.terminal.newline()
    }

    // next update
    this.timer = setTimeout(this.update.bind(this), this.interval)

    // trigger event
    this.emit('update-post')

    // stop if autoStop and all bars stopped
    if (this.config.autoStop && !this.bars.find(bar => bar.active)) {
      this.stop()
    }
  }

  stop() {
    // stop timer
    clearTimeout(this.timer)
    this.timer = null

    // set flag
    this.active = false

    // cursor hidden ?
    if (this.config.hideCursor === true) { this.terminal.showCursor(true) }

    // re-enable line wrapping ?
    if (this.config.lineWrap === false) { this.terminal.setLineWrap(true) }

    // reset cursor
    this.terminal.resetCursor()

    // trigger event
    this.emit('stop-pre-clear')

    // clear line on complete ?
    if (this.config.autoClear) {
      this.terminal.clearDown() // clear all bars or show final progress
    }
    else {
      const format = this.layout.format.bind(this.layout)
      // update each bar
      for (let i = 0; i < this.bars.length; i++) {
        // add new line ?
        // if (i > 0) this.terminal.newline()
        this.bars[i]
          .render(format, this.payloads[i]) // trigger final rendering
          .stop() // stop
        this.terminal.newline()
      }

      // new line on complete
      // this.terminal.newline()
    }

    // trigger event
    this.emit('stop')
  }
}
