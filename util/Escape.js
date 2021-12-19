import { setInterval } from 'timers/promises'

export class Escape {
  constructor(conf) {
    this.ctx = conf.ctx ?? {}
    this.arg = conf.arg ?? null
    this.fn = conf.fn.bind(this.ctx, this.arg)
    this.instant = conf.instant ?? true
    this.on = false
  }

  static build(conf) { return new Escape(conf) }

  get active() { return this.on }

  async loop(ms) {
    this.on = true
    if (!this.fn) return void 0
    if (this.instant) this.fn()
    for await (const _ of setInterval(ms)) {
      if (!this.on) break
      await this.fn()
    }
  }

  stop() { return this.on = false }
}

