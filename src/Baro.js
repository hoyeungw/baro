import { cursor } from '@arpel/escape'
import { Escape } from '../util/Escape.js'
import { IO }     from '../util/IO.js'
import { Config } from './Config.js'
import { Layout } from './Layout.js'
import { State }  from './State.js'

// Baro constructor
export class Baro {
  config
  format
  states = []
  escape = Escape.build({
    fn: this.#renderStates,
    ctx: this,
    arg: this.states
  })
  #locker = null
  offset = 0
  /**
   *
   * @param {Config} config
   * @param {Layout} layout
   */
  constructor(config, layout) {
    this.config = config
    this.layout = layout
    this.io = IO.build(this.config)
  }

  static build(config, layout) {
    config = Config.build(config)
    layout = Layout.build(layout)
    return new Baro(config, layout)
  }

  get active() { return this.escape.active }

  get forceRedraw() {
    return this.config.forceRedraw || ( this.config.noTTYOutput && !this.io.isTTY ) // force redraw in noTTY-mode!
  }

  async start() {
    const { io } = this
    io.input.resume()
    if (this.config.hideCursor) io.showCursor(false) // hide the cursor ?
    if (!this.config.lineWrap) io.setLineWrap(false) // disable line wrapping ?
    // this.io.output.write('\f')
    const height = this.io.height
    this.io.output.write(cursor.nextLine(height) + cursor.prevLine(height))
    // this.io.output.write(scroll.down(height))

    // const [ x, y ] = await io.asyncCursorPos()
    // console.log('x', x, 'y', y, 'offset', this.offset, 'states', this.states.length, 'height', io.height)
    // if (x + this.states.length >= io.height) {
    //   io.output.write('\f')
    //   // io.nextPage()
    // }

    // WARNING: intentionally call loop without await
    this.escape.loop(this.config.throttle) // initialize update timer
  }

  /**
   * add a new bar to the stack
   * @param {State|object} state // const state = new State(total, value, this.config.eta)
   * @returns {State|object}
   */
  async append(state) {
    if (this.#locker) await this.#locker // console.debug('>>', state.agent, 'waiting for occupy')
    const taskPromise = Promise
      .resolve()
      .then(async () => {
        state.last = Number.NEGATIVE_INFINITY
        this.states.push(state)
        if (!this.escape.active && this.states.length) await this.start()
      })
    this.#locker = taskPromise.then(() => this.#locker = null)
    return state
  }

  // remove a bar from the stack
  remove(state) {
    const index = this.states.indexOf(state) // find element
    if (index < 0) return false // element found ?
    this.states.splice(index, 1) // remove element
    this.io.nextLine()
    this.io.clearDown()
    return true
  }

  async stop() {
    this.escape.stop() // stop timer
    if (this.config.hideCursor) { this.io.showCursor(true) } // cursor hidden ?
    if (!this.config.lineWrap) { this.io.setLineWrap(true) } // re-enable line wrapping ?
    if (this.config.autoClear) {
      this.io.resetCursor() // reset cursor
      this.io.clearDown()
    } // clear all bars or show final progress
    else {
      // for (let state of this.states) { state.stop() }
      await this.#renderStates(this.states)
    }

    this.io.input.pause()
  }

  async #renderStates(states) {
    const { io } = this
    const height = io.height - 1
    const [ x, y ] = await io.asyncCursorPos()
    // if (!this.busy && ( x + states.length > height )) {
    //   io.nextPage()
    //   this.offset = 0
    // }
    // else {
    //   this.busy = true
    //
    // }

    io.offsetLines(-Math.min(this.offset, height)) // reset cursor
    this.offset = 0
    if (height) {
      for (const state of states.slice(-( height ))) {
        if (this.forceRedraw || ( state.value !== state.last )) {
          io.writeOff(`CURSOR (${x}, ${y}) OFFSET (${this.offset}) TERM (${io.size}) ` + this.layout.format(state))
          state.last = state.value
        }
        io.nextLine()
        this.offset++
      }
    }
    if (this.config.autoStop && states.every(state => state.reachLimit)) {
      await this.stop()
    } // stop if autoStop and all bars stopped
  }
}
