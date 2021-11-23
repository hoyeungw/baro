export class Spin {
  max
  value
  width
  step
  constructor(max, width, step) {
    this.max = max
    this.width = width
    this.step = step
    this.value = 0
  }
  static build(max, width, step) {
    return new Spin(max, width, step)
  }
  next() {
    this.value += this.step
    if (this.value >= this.max) this.value -= this.max
    return this
  }
  get sequel() {
    let next = this.value + this.width
    if (next > this.max) next -= this.max
    return next
  }
  get record() {
    const { value, sequel } = this
    if (value <= 0 || value >= this.max) {
      const x = this.width
      const y = this.max - this.width
      return [ 0, 0, x, y ]
    }
    else {
      if (value < sequel) {
        const x = value - 1
        const y = this.width
        const z = this.max - this.width - value + 1
        return [ 0, x, y, z ]
      }
      else {
        const x = sequel
        const y = value - sequel - 1
        const z = this.max - value + 1
        return [ x, y, z, 0 ]
      }
    }
  }

  renderBar([ bar, spc ]) {
    const { value, sequel } = this
    if (value <= 0 || value >= this.max) {
      const x = this.width
      const y = this.max - this.width
      return bar.slice(0, x) + spc.slice(0, y)
    }
    else {
      if (value < sequel) {
        const x = value
        const y = this.width
        const z = this.max - this.width - value
        return spc.slice(0, x) + bar.slice(0, y) + spc.slice(0, z)
      }
      else {
        const x = sequel
        const y = value - sequel
        const z = this.max - value
        return bar.slice(0, x) + spc.slice(0, y) + bar.slice(0, z)
      }
    }
  }
}