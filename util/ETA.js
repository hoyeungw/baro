// ETA calculation
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
    const consumed = this.valueSeries.length
    const gap = Math.min(this.capacity, consumed)

    const dValue = this.valueSeries[consumed - 1] - this.valueSeries[consumed - gap]
    const dTime = this.timeSeries[consumed - 1] - this.timeSeries[consumed - gap]

    // get progress per ms
    const marginalRate = dValue / dTime

    // strip past elements
    this.valueSeries = this.valueSeries.slice(-this.capacity)
    this.timeSeries = this.timeSeries.slice(-this.capacity)

    // eq: vt_rate *x = total
    const eta = Math.ceil(remaining / marginalRate / 1000)

    // check values
    return this.eta = isNaN(eta) ? 'NULL'
      : !isFinite(eta) ? 'INF'  // +/- Infinity --- NaN already handled
        : eta > 1e7 ? 'INF'  // > 10M s ? - set upper display limit ~115days (1e7/60/60/24)
          : eta < 0 ? 0  // negative ?
            : eta  // assign
  }
}