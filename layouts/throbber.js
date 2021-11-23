import { SHADE_CHARSET } from '../resources/chars'
import { Spin }          from '../util/Spin'

export const layout = {
  sentence: `{start} {bar} | {degree}`,
  char: SHADE_CHARSET,
  size: 12,
  autoZero: true,
  bar(state) {
    if (state.done) return this.fullBar
    state.spin = !state.spin ? Spin.build(12, 5, 2) : state.spin.next()
    return state.spin.renderBar(this.chars)
  },
}