import { constraint, round } from '@aryth/math'
import { valid }             from '@typen/nullish'
import { ETA }               from '../util/ETA.js'
import { pad3 }              from '../util/humanScale.js'

export class State {
  constructor(data) {
    this.value = data.value ?? 0
    this.total = data.total ?? 100
    this.start = data.start ?? Date.now() // store start time for duration+eta calculation
    this.end = data.end ?? null // reset stop time for 're-start' scenario (used for duration calculation)
    this.calETA = data.eta
      ? new ETA(data.eta.capacity ?? 64, this.start, this.value)
      : null // initialize eta buffer
    return this
  }

  static build(data) { return new State(data) }

  get eta() { return this.calETA?.estimate }

  get reachLimit() { return this.value >= this.total }

  get elapsed() { return round(( ( this.end ?? Date.now() ) - this.start ) / 1000) }

  get percent() { return pad3('' + ~~( this.progress * 100 )) }

  get progress() {
    const progress = ( this.value / this.total )
    return isNaN(progress)
      ? 0 // this.preset?.autoZero ? 0.0 : 1.0
      : constraint(progress, 0, 1)
  }

  update(value) {
    if (valid(value)) this.value = value
    this.now = Date.now()
    this.calETA?.update(this) // add new value; recalculate eta
    if (this.reachLimit) this.end = this.now
    return this
  }

  stop(value) {
    if (valid(value)) this.value = value
    this.end = Date.now()
    return this
  }
}