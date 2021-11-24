// ETA: estimated time to completion
export class ETA {
  constructor(capacity, initTime, initValue) {
    // size of eta buffer
    this.capacity = capacity || 100
    // eta buffer with initial values
    this.valueSeries = [ initValue ]
    this.timeSeries = [ initTime ]
    // eta time value
    this.eta = '0'
  }

  // add new values to calculation buffer
  update(time, { value, total }) {
    this.valueSeries.push(value)
    this.timeSeries.push(time)
    // trigger recalculation
    this.calculate(total - value)
  }

  // fetch estimated time
  get value() { return this.eta }

  // eta calculation - request number of remaining events
  calculate(remaining) {
    // get number of samples in eta buffer
    const len = this.valueSeries.length,
          cap = this.capacity,
          lo  = len - 1,
          hi  = len > cap ? len - cap : 0 // consumed-Math.min(cap,len)
    const dValue = this.valueSeries[lo] - this.valueSeries[hi],
          dTime  = this.timeSeries[lo] - this.timeSeries[hi],
          rate   = dValue / dTime // get progress per ms
    if (len > cap) {
      this.valueSeries = this.valueSeries.slice(-cap)
      this.timeSeries = this.timeSeries.slice(-cap)
    } // strip past elements
    const eta = Math.ceil(remaining / rate / 1000)
    return this.eta = isNaN(eta) ? 'NULL'
      : !isFinite(eta) ? 'INF'  // +/- Infinity: NaN already handled
        : eta > 1e7 ? 'INF'  // > 10M s: - set upper display limit ~115days (1e7/60/60/24)
          : eta < 0 ? 0  // negative: 0
            : eta  // assign
  }
}