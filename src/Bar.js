import { FUN, NUM, OBJ, UND }            from '@typen/enum-data-types'
import { nullish }                       from '@typen/nullish'
import EventEmitter                      from 'events'
import { ETA }                           from '../util/ETA'
import { Terminal }                      from '../util/Terminal'
import { defaultFormatter as formatter } from './formatters/formatter'
// Progress-Bar constructor
export class Bar extends EventEmitter {

  constructor(options) {
    super()

    // store options
    this.options = options

    // store terminal instance
    this.terminal = this.options.terminal ?? new Terminal(this.options)

    // the current bar value
    this.value = 0

    // the end value of the bar
    this.total = 100

    // last drawn string - only render on change!
    this.lastDrawnString = null

    // start time (used for eta calculation)
    this.startTime = null

    // stop time (used for duration calculation)
    this.stopTime = null

    // last update time
    this.lastRedraw = Date.now()

    // default eta calculator (will be re-create on start)
    this.eta = new ETA(this.options.etaBufferLength, 0, 0)

    // payload data
    this.payload = {}

    // progress bar active ?
    this.isActive = false

    // use default formatter or custom one ?
    this.formatter = ( typeof this.options.format === FUN ) ? this.options.format : formatter
  }

  // internal render function
  render() {
    // calculate the normalized current progress
    let progress = ( this.value / this.total )

    // handle NaN Errors caused by total=0. Set to complete in this case
    if (isNaN(progress)) {
      progress = this.options?.emptyOnZero ? 0.0 : 1.0
    }

    // limiter
    progress = Math.min(Math.max(progress, 0.0), 1.0)

    // formatter params
    const params = {
      progress: progress,
      eta: this.eta.getTime(),
      startTime: this.startTime,
      stopTime: this.stopTime,
      total: this.total,
      value: this.value,
      maxWidth: this.terminal.width
    }

    // automatic eta update ? (long running processes)
    if (this.options.etaAsynchronousUpdate) {
      this.updateETA()
    }

    // format string
    const s = this.formatter(this.options, params, this.payload)

    const forceRedraw = this.options.forceRedraw || ( this.options.noTTYOutput && !this.terminal.isTTY ) // force redraw in notty-mode!

    // string changed ? only trigger redraw on change!
    if (forceRedraw || this.lastDrawnString !== s) {
      // trigger event
      this.emit('redraw-pre')

      // set cursor to start of line
      this.terminal.cursorTo(0, null)

      // write output
      this.terminal.write(s)

      // clear to the right from cursor
      this.terminal.clearRight()

      // store string
      this.lastDrawnString = s

      // set last redraw time
      this.lastRedraw = Date.now()

      // trigger event
      this.emit('redraw-post')
    }
  }

  // start the progress bar
  start(total, startValue, payload) {
    // set initial values
    this.value = startValue || 0
    this.total = ( typeof total !== UND && total >= 0 ) ? total : 100

    // store payload (optional)
    this.payload = payload || {}

    // store start time for duration+eta calculation
    this.startTime = Date.now()

    // reset stop time for 're-start' scenario (used for duration calculation)
    this.stopTime = null

    // reset string line buffer (redraw detection)
    this.lastDrawnString = ''

    // initialize eta buffer
    this.eta = new ETA(this.options.etaBufferLength, this.startTime, this.value)

    // set flag
    this.isActive = true

    // start event
    this.emit('start', total, startValue)
  }

  // stop the bar
  stop() {
    // set flag
    this.isActive = false

    // store stop timestamp to get total duration
    this.stopTime = Date.now()

    // stop event
    this.emit('stop', this.total, this.value)
  }

  // update the bar value
  // update(value, payload)
  // update(payload)
  update(value, payload = {}) {
    // value set ?
    // update(value, [payload]);
    if (typeof value === NUM) {
      // update value
      this.value = value

      // add new value; recalculate eta
      this.eta.update(Date.now(), value, this.total)
    }

    // extract payload
    // update(value, payload)
    // update(payload)
    const payloadData = ( ( typeof value === OBJ ) ? value : payload ) || {}

    // update event (before stop() is called)
    this.emit('update', this.total, this.value)

    // merge payload
    for (const key in payloadData) {
      this.payload[key] = payloadData[key]
    }

    // limit reached ? autostop set ?
    if (this.value >= this.getTotal() && this.options.stopOnComplete) {
      this.stop()
    }
  }

  // update the bar value
  // increment(delta, payload)
  // increment(payload)
  increment(arg0 = 1, arg1 = {}) {
    // increment([payload]) => step=1
    // handle the use case when `step` is omitted but payload is passed
    if (typeof arg0 === OBJ) {
      this.update(this.value + 1, arg0)
      // increment([step=1], [payload={}])
    }
    else {
      this.update(this.value + arg0, arg1)
    }
  }

  // get the total (limit) value
  getTotal() { return this.total }

  // set the total (limit) value
  setTotal(total) {
    if (!nullish(total) && total >= 0) {
      this.total = total
    }
  }

  // force eta calculation update (long running processes)
  updateETA() {
    // add new value; recalculate eta
    this.eta.update(Date.now(), this.value, this.total)
  }
}
