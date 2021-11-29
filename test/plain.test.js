import { Contractor }                                      from '@geia/contractor'
import { deco, decoSamples, decoString, logger, says, Xr } from '@spare/logger'
import { timeout }                                         from '@valjoux/timeout'
import { range }                                           from '@vect/vector-init'
import { CHARSET_SHADE }                                   from '../resources/charset'
import { Baro }                                            from '../src/Baro'
import { State }                                           from '../src/State'

const BARO_CONFIG = {
  autoClear: false,
  lineWrap: null,
  hideCursor: true,
  stream: process.stdout,
  // forceRedraw: true,
  eta: {},
  fps: 12,
  syncUpdate: true,
}

const BARO_LAYOUT = {
  sentence: ' {bar} {percent}% | ETA: {eta}s | {degree}',
  char: CHARSET_SHADE,
  size: 10,
  autoZero: true
}

const baro = Baro.build(BARO_CONFIG, BARO_LAYOUT)

const test = async () => {
  Xr()['process.stdout.isTTY'](process.stdout.isTTY) |> logger
  // multiBar.config |> Deco({depth:1}) |> logger
  const service = async function (params) {
    const state = baro.append(State.build({ total: params.size, value: 0, start: Date.now(), eta: { capacity: 48 } }))
    Object.assign(state, params)
    await timeout(state.delay)
    if (state.code === 404) {
      // baro.remove(state)
      return state
    }
    for (const i of range(0, 10)) {
      await timeout(200)
      state.update(i * state.total / 10)
    }
    state.done = true
    state.stop()

    // state.spin.logs |> decoMatrix |> says['state-logs']
    return state
  }
  const contractor = Contractor.build(service, [ { agent: '006' }, { agent: '007' }, { agent: '008' } ])
  const jobs = [
    { code: 200, mark: 'foo', size: 1280000, delay: 0 },
    { code: 200, mark: 'bar', size: 1440000, delay: 400 },
    { code: 200, mark: 'zen', size: 960000, delay: 800 },
    { code: 200, mark: 'voo', size: 1080000, delay: 300 },
    { code: 404, mark: 'sha', size: 720000, delay: 400 },
    { code: 200, mark: 'mia', size: 840000, delay: 500 },
    { code: 404, mark: 'fau', size: 1960000, delay: 200 },
    { code: 200, mark: 'ion', size: 1600000, delay: 100 },
  ]
  const results = await contractor.takeOrders(jobs)
  baro.stop()
  // await timeout(100)
  results |> deco |> says['Q'].p('mission accomplished')
  'well done' |> decoString |> says['M']

}

test().then()