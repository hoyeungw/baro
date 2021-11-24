import { OBJ }   from '@typen/enum-data-types'
import { valid } from '@typen/nullish'

export class Escape {
  constructor(conf) {
    this.ctx = conf.ctx ?? {}
    this.arg = conf.arg ?? null
    this.fn = conf.fn.bind(this.ctx, this.arg)
    this.instant = conf.instant ?? true
    this.timer = null
  }

  static build(conf) { return new Escape(conf) }

  get active() { return valid(this.timer) }

  loop(ms) {
    if (typeof this.timer === OBJ) this.stop()
    if (!this.fn) return void 0
    if (this.instant) this.fn()
    this.timer = setInterval(this.fn, ms)
  }

  stop() {
    clearTimeout(this.timer)
    return this.timer = null
  }
}

