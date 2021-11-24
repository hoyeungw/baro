import { CHARSET_SHADE } from '../resources/charset'
import { Spin }          from '../util/Spin'

export const layout = {
  sentence: `{start} {bar} | {degree}`,
  char: CHARSET_SHADE,
  size: 12,
  autoZero: true,
  bar(state) {
    if (state.done) return this.fullBar
    state.spin = !state.spin ? Spin.build(12, 5, 2) : state.spin.next()
    return state.spin.renderBar(this.chars)
  },
}