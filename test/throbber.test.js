import { Contractor }                  from '@geia/contractor'
import { FRESH }                       from '@palett/presets'
import { ProjectorFactory }            from '@palett/projector-factory'
import { deco, decoString, ros, says } from '@spare/logger'
import { timeout }                     from '@valjoux/timeout'
import { range }                       from '@vect/vector-init'
import { CHARSET_SHADE }               from '../resources/charset'
import { Baro }                        from '../src/Baro'
import { State }                       from '../src/State'
import { humanScale }                  from '../util/humanScale'
import { Spin }                        from '../util/Spin'

const projectorFactory = ProjectorFactory.fromHEX({ min: 0, max: 2 << 20 }, FRESH)

// 2 << 20 = 2097152 = 2 * 1024 * 1024 = 2mb

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

const LAYOUT_THROBBER = {
  char: CHARSET_SHADE,
  size: 12,
  autoZero: true,
  bar(state) {
    if (state.done) return this.fullBar
    state.spin = !state.spin ? Spin.build(12, 5, 2) : state.spin.next()
    return state.spin.renderBar(this.chars)
  },
  format(state) {
    const { progress, total, value, eta, start, agent, topic, code } = state
    const dye = projectorFactory.make(value)
    const barText = this.bar.call(this, state)
    const bar = dye(barText + ' ' + humanScale(value))
    return `${start} [${ros(agent)}] ${bar} | ${topic}`
  },
}

const baro = Baro.build(BARO_CONFIG, LAYOUT_THROBBER)

const test = async () => {
  const service = async function (params) {
    const { agent } = this
    const state = baro.append(State.build({ start: Date.now(), total: params.size, value: 0, eta: { capacity: 48 } }))
    state.agent = agent
    Object.assign(state, params)
    await timeout(params.delay)
    if (params.code === 404) {
      // baro.remove(state)
      return state
    }
    for (const i of range(0, 11)) {
      await timeout(200)
      state.update(i * state.size / 10)
    }
    state.done = true
    state.stop()
    // state.spin.logs |> decoMatrix |> says['state-logs']
    return state
  }
  const contractor = Contractor.build(service, [ { agent: '006' }, { agent: '007' }, { agent: '008' } ])
  const jobs = [
    { code: 200, topic: 'foo', size: 1280000, delay: 0 },
    { code: 200, topic: 'bar', size: 1440000, delay: 400 },
    { code: 200, topic: 'zen', size: 960000, delay: 800 },
    { code: 200, topic: 'voo', size: 1080000, delay: 300 },
    { code: 404, topic: 'sha', size: 720000, delay: 400 },
    { code: 200, topic: 'mia', size: 840000, delay: 500 },
    { code: 404, topic: 'fau', size: 1960000, delay: 200 },
    { code: 200, topic: 'ion', size: 1600000, delay: 100 },
  ]
  '>> connecting' |> says['throbber-test']
  const results = await contractor.takeOrders(jobs)
  baro.stop()
  // await timeout(100)
  results |> deco |> says['Q'].p('mission accomplished')
  'well done' |> decoString |> says['M']

}

test().then()