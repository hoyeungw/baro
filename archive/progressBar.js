/*!
 * node-progress
 * Copyright(c) 2011 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

import { lange } from '@texting/lange'

/**
 * Expose `ProgressBar`.
 */


export class ProgressBar {
  /**
   * Initialize a `ProgressBar` with the given `verbatim` string and `config` or
   * `total`.
   *
   * Options:
   *
   *   - `value` current completed index
   *   - `total` total number of ticks to solid
   *   - `width` the displayed width of the progress bar defaulting to total
   *   - `stream` the output stream defaulting to stderr
   *   - `head` head character defaulting to solid character
   *   - `solid` completion character defaulting to "="
   *   - `blank` blank character defaulting to "-"
   *   - `renderThrottle` minimum time between updates in milliseconds defaulting to 16
   *   - `callback` optional function to call when the progress bar completes
   *   - `clear` will clear the progress bar upon termination
   *
   * Tokens:
   *
   *   - `:bar` the progress bar itself
   *   - `:current` current tick number
   *   - `:total` total ticks
   *   - `:elapsed` time elapsed in seconds
   *   - `:percent` completion progress
   *   - `:eta` eta in seconds
   *   - `:rate` rate of ticks per second
   *
   * @param {string} verbatim
   * @param {object|number} config or total
   * @api public
   */
  constructor(verbatim, config) {
    this.stream = config.stream || process.stderr

    if (typeof ( config ) == 'number') {
      const total = config
      config = {}
      config.total = total
    }
    else {
      config = config || {}
      if ('string' != typeof verbatim) throw new Error('sentence required')
      if ('number' != typeof config.total) throw new Error('total required')
    }

    this.verbatim = verbatim
    this.value = config.value || 0
    this.total = config.total
    this.width = config.width || this.total
    this.clear = config.clear
    this.chars = {
      solid: config.solid || '=',
      blank: config.blank || '-',
      head: config.head || ( config.solid || '=' )
    }
    this.renderThrottle = config.renderThrottle !== 0 ? ( config.renderThrottle || 16 ) : 0
    this.lastRender = -Infinity
    this.callback = config.callback || function () {}
    this.payload = {}
    this.lastDraw = ''
  }
  /**
   * "tick" the progress bar with optional `value` and optional `payload`.
   *
   * @param {number} value
   * @param {object} payload
   * @api public
   */
  tick(value, payload) {
    if (value !== 0) value = value || 1
    if (payload) this.payload = payload

    // start time for eta
    if (!this.value) this.start = new Date()

    this.value = value

    // try to render
    this.render()

    // progress solid
    if (this.value >= this.total) {
      this.render(undefined, true)
      this.complete = true
      this.terminate()
      this.callback(this)
      return void 0
    }
  }
  /**
   * Method to render the progress bar with optional `payload` to place in the
   * progress bar's `verbatim` field.
   *
   * @param {object} payload
   * @param {boolean} force
   * @api public
   */
  render(payload, force = false) {
    if (payload) this.payload = payload

    if (!this.stream.isTTY) return

    const now = Date.now()
    const delta = now - this.lastRender
    if (!force && ( delta < this.renderThrottle )) {
      return
    }
    else {
      this.lastRender = now
    }

    let ratio = this.value / this.total
    ratio = Math.min(Math.max(ratio, 0), 1)

    const percent = ~~( ratio * 100 )
    let blank, solid, completeLength
    const elapsed = new Date - this.start
    const eta = ( percent === 100 ) ? 0 : elapsed * ( this.total / this.value - 1 )
    const rate = this.value / ( elapsed / 1000 )

    /* populate the bar template with progresss and timestamps */
    let draw = this.verbatim
      .replace(':current', this.value)
      .replace(':total', this.total)
      .replace(':elapsed', isNaN(elapsed) ? '0.0' : ( elapsed / 1000 ).toFixed(1))
      .replace(':eta', ( isNaN(eta) || !isFinite(eta) ) ? '0.0' : ( eta / 1000 ).toFixed(1))
      .replace(':percent', percent.toFixed(0) + '%')
      .replace(':rate', Math.round(rate))

    /* compute the available space (non-zero) for the bar */
    let availableSpace = Math.max(0, this.stream.columns - lange(draw.replace(':bar', '')))
    if (availableSpace && process.platform === 'win32') {availableSpace = availableSpace - 1}

    const width = Math.min(this.width, availableSpace)

    /* TODO: the following assumes the user has one ':bar' token */
    completeLength = Math.round(width * ratio)
    solid = Array(Math.max(0, completeLength + 1)).join(this.chars.solid)
    blank = Array(Math.max(0, width - completeLength + 1)).join(this.chars.blank)

    /* add head to the solid string */
    if (completeLength > 0) solid = solid.slice(0, -1) + this.chars.head

    /* fill in the actual progress bar */
    draw = draw.replace(':bar', solid + blank)

    /* replace the extra payload */
    if (this.payload) for (let key in this.payload) draw = draw.replace(':' + key, this.payload[key])

    if (this.lastDraw !== draw) {
      this.stream.cursorTo(0)
      this.stream.write(draw)
      this.stream.clearLine(1)
      this.lastDraw = draw
    }
  }
  /**
   * "update" the progress bar to represent an exact progress.
   * The ratio (between 0 and 1) specified will be multiplied by `total` and
   * floored, representing the closest available "tick." For example, if a
   * progress bar has a length of 3 and `update(0.5)` is called, the progress
   * will be set to 1.
   *
   * A ratio of 0.5 will attempt to set the progress to halfway.
   *
   * @param {number} ratio The ratio (between 0 and 1 inclusive) to set the overall completion to.
   * @param {object} payload The object containing key-value to be replaced in verbatim
   * @api public
   */
  update(ratio, payload) {
    const goal = ~~( ratio * this.total )
    const delta = goal - this.value
    this.tick(delta, payload)
  }
  /**
   * "interrupt" the progress bar and write a message above it.
   * @param {string} message The message to write.
   * @api public
   */
  interrupt(message) {
    // clear the current line
    this.stream.clearLine()
    // move the cursor to the start of the line
    this.stream.cursorTo(0)
    // write the message text
    this.stream.write(message)
    // terminate the line after writing the message
    this.stream.write('\n')
    // re-display the progress bar with its lastDraw
    this.stream.write(this.lastDraw)
  }
  /**
   * Terminates a progress bar.
   *
   * @api public
   */
  terminate() {
    if (this.clear) {
      if (this.stream.clearLine) {
        this.stream.clearLine()
        this.stream.cursorTo(0)
      }
    }
    else {
      this.stream.write('\n')
    }
  }
}

