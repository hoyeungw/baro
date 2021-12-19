import { NUM }      from '@typen/enum-data-types'
import EventEmitter from 'events'
import { Config }   from '../../src/Config'
import { State } from '../../src/State'
import { IO }    from '../../util/IO'

// Progress-Baro constructor
export class Bar extends EventEmitter {
  /** @type {Config|object} store config */
  config
  /** @type {object} payload data */
  payload = {}
  /** @type {IO|object} store terminal instance */
  terminal
  /** @type {?string} last drawn string - only render on change! */
  phrase = null
  /** @type {number} last update time */
  prev
  /** @type {boolean} progress bar active ? */
  active = false
  /** @type {function} use default format or custom one ? */
  format

  /** @type {State}  */
  state

  /**
   *
   * @param {Config} config
   // * @param {function(code,payload)} format
   */
  constructor(config) {
    super()
    this.config = config
    this.etaConf = config.eta
    this.terminal = this.config.terminal ?? new IO(this.config)
    this.prev = Date.now()
    this.state = State.build({ value: 0, total: 100, start: null, end: null, eta: null })
  }

  get progress() { return this.state.progress }

  get forceRedraw() {
    return this.config.forceRedraw || ( this.config.noTTYOutput && !this.terminal.isTTY ) // force redraw in noTTY-mode!
  }

  get noTTY() { return this.config.noTTYOutput && this.terminal.isTTY === false }

  get reachedLimit() { return this.state.value >= this.state.total && this.config.autoStop }

  // internal render function
  render(format, payload) {
    // automatic eta update ? (long running processes)
    if (this.etaConf.autoUpdate) { this.state.calETA?.update(Date.now(), this.state) }
    let phrase // sentence string
    if (
      this.forceRedraw && ( phrase = format(this.state, payload) ) ||
      this.phrase !== phrase  // string updated ? only trigger redraw on change!
    ) {
      this.emit('redraw-pre')     // trigger event
      this.terminal.cursorTo(0, null)  // set cursor to start of line
      this.terminal.write(phrase)           // write output
      this.terminal.clearRight()            // clear to the right from cursor
      this.phrase = phrase              // store string
      this.prev = Date.now()          // set last redraw time
      this.emit('redraw-post')    // trigger event
    }
    return this
  }

  // start the progress bar
  init(total, value) {
    this.state.initialize(total, value)
    this.phrase = '' // reset string line buffer (redraw detection)
    this.active = true // set flag
    this.emit('start', this.state) // start event
    return this
  }

  // update the bar value
  // update(value)
  update(value) {
    const { state } = this
    if (typeof value !== NUM) return void 0
    state.value = value // update value
    this.state.calETA?.update(Date.now(), state) // add new value; recalculate eta
    // update event (before stop() is called)
    this.emit('update', this.state)
    // limit reached ? autoStop set ?
    if (this.reachedLimit) this.stop()
    return this
  }

  // stop the bar
  stop() {
    const { state } = this  // set flag
    this.active = false   // store stop timestamp to get total duration
    state.end = Date.now()  // stop event
    this.emit('stop', this.state)
    return this
  }


  // update the bar value
  // increment(delta, payload)
  // increment(payload)
  increment(value) {
    const { state } = this
    this.update(state.value += value)
    return this
  }
}
