import { says }    from '@spare/logger'
import { timeout } from '@valjoux/timeout'
import { time }    from '@valjoux/timestamp'
import { range }   from '@vect/vector-init'
import { State }   from '../../src/State'
import { Escape }  from '../../util/Escape'

const test = async () => {
  const layout = {}
  const state = State.build({ value: 0, total: 100 })
  const fn = function (state) {
    const layout = this;
    `${time()} [value] ${state.value} [layout] ${this}` |> says['escape']
  }
  const escape = Escape.build({ fn, ctx: layout, arg: state })
  escape.loop(500)
  for (let i of range(1, 10)) {
    state.value += 10
    await timeout(300)
  }
  // await timeout(500)
  const result = escape.stop()
  result |> says['result']
}

test().then()