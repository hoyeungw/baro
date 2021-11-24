import { Escape }   from '../util/Escape'
import { Terminal } from '../util/Terminal'
import { Config }   from './Config'
import { Layout }   from './Layout'
import { State }    from './State'

// Baro constructor
export class Baro {
  /** @type {Config|object} store config */
  config
  /** @type {Terminal|object} store terminal instance */
  terminal
  /** @type {boolean} progress bar active ? */
  active = false
  /** @type {function} use default format or custom one ? */
  format
  /** @type {[State]}  */
  states

  /**
   *
   * @param {Config} config
   * @param {Layout} layout
   */
  constructor(config, layout) {
    this.config = config
    this.layout = layout
    this.states = []
    this.escape = Escape.build({
      fn: this.#renderStates,
      ctx: this,
      arg: this.states
    })
    this.terminal = this.config.terminal ?? new Terminal(this.config)
  }

  static build(config, layout) {
    config = Config.build(config)
    layout = Layout.build(layout)
    return new Baro(config, layout)
  }

  get active() { return !!this.escape.timer }

  get forceRedraw() {
    return this.config.forceRedraw || ( this.config.noTTYOutput && !this.terminal.isTTY ) // force redraw in noTTY-mode!
  }

  get noTTY() { return this.config.noTTYOutput && !this.terminal.isTTY }

  boot() {
    if (this.config.hideCursor) this.terminal.showCursor(false) // hide the cursor ?
    if (!this.config.lineWrap) this.terminal.setLineWrap(false) // disable line wrapping ?
    this.escape.loop(this.config.throttle) // initialize update timer
  }

  /**
   * add a new bar to the stack
   * @param total
   * @param value
   * @param payload
   * @returns {State}
   */
  create(total, value, payload) {
    // progress updates are only visible in TTY mode!
    if (this.noTTY) return void 0
    const state = new State(total, value, payload, this.config.eta)
    state.last = Number.NEGATIVE_INFINITY
    this.states.push(state)
    if (!this.escape.active && this.states.length) this.boot()
    return state
  }

  // remove a bar from the stack
  remove(state) {
    const index = this.states.indexOf(state) // find element
    if (index < 0) { return false } // element found ?
    this.states.splice(index, 1) // remove element
    this.terminal.newline()
    this.terminal.clearDown()
    return true
  }

  stop() {
    this.escape.stop() // stop timer
    if (this.config.hideCursor) { this.terminal.showCursor(true) } // cursor hidden ?
    if (!this.config.lineWrap) { this.terminal.setLineWrap(true) } // re-enable line wrapping ?
    if (this.config.autoClear) {
      this.terminal.resetCursor() // reset cursor
      this.terminal.clearDown()
    } // clear all bars or show final progress
    else {
      for (let state of this.states) { state.stop() }
      this.#renderStates(this.states)
    }
  }

  #renderStates(states) {
    this.terminal.resetCursor() // reset cursor
    for (let i = 0, hi = states.length; i < hi; i++) {
      const state = states[i] // update each bar
      if (this.forceRedraw || ( state.value !== state.last )) {
        this.terminal.cleanWrite(this.layout.format(state))
      } // string updated, only trigger redraw on change
      this.terminal.newline()
      state.last = state.value
    }
    if (this.noTTY) {
      this.terminal.newline()
      this.terminal.newline()
    } // add new line in noTTY mode
    if (this.config.autoStop && states.every(state => state.reachLimit)) {
      this.stop()
    } // stop if autoStop and all bars stopped
  }
}
