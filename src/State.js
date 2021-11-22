import { constraint, round } from '@aryth/math'
import { valid }             from '@typen/nullish'
import { ETA }               from '../util/ETA'

export class State {
  /** @type {number} the current bar value */
  value = 0
  /** @type {number} the end value of the bar */
  total = 100
  /** @type {?number} start time (used for eta calculation) */
  start = null
  /** @type {?number} stop time (used for duration calculation) */
  end = null
  constructor(total, value, payload, eta) {
    this.value = value ?? 0
    this.total = total ?? 100
    this.start = Date.now() // store start time for duration+eta calculation
    this.end = null // reset stop time for 're-start' scenario (used for duration calculation)
    this.calETA = eta
      ? new ETA(eta.capacity ?? 64, this.start, this.value)
      : null // initialize eta buffer
    this.payload = payload ?? {}
    return this
  }

  static build(values) {
    const { total, value, payload, eta } = values
    return new State(total, value, payload, eta)
  }

  initialize(total, value, payload, eta) {
    return Object.assign(this, new State(total, value, payload, eta))
  }

  get eta() { return this.calETA.eta }

  get reachLimit() { return this.value >= this.total }

  get progress() {
    const progress = ( this.value / this.total )
    return isNaN(progress)
      ? 0 // this.preset?.autoZero ? 0.0 : 1.0
      : constraint(progress, 0, 1)
  }

  update(value, payload) {
    // if (payload) for (let key in payload) this[key] = payload[key]
    this.value = value
    if (payload) this.payload = payload
    this.calETA?.update(Date.now(), this) // add new value; recalculate eta
    if (this.reachLimit) this.end = Date.now()
    return this
  }

  stop(value, payload) {
    this.end = Date.now()
    if (valid(value)) this.value = value
    if (payload) this.payload = payload
  }

  get elapsed() { return round(( ( this.end ?? Date.now() ) - this.start ) / 1000) }

  get percent() { return ~~( this.progress * 100 ) }
}