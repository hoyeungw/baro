import { Contractor }                  from '@geia/contractor'
import { FRESH }                       from '@palett/presets'
import { ProjectorFactory }            from '@palett/projector-factory'
import { deco, decoString, ros, says } from '@spare/logger'
import { timeout }                     from '@valjoux/timeout'
import { time }                        from '@valjoux/timestamp-pretty'
import { range }                       from '@vect/vector-init'
import { SHADE_CHARSET }               from '../resources/chars'
import { Baro }                        from '../src/Baro'
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
  char: SHADE_CHARSET,
  size: 12,
  autoZero: true,
  bar(state) {
    if (state.done) return this.fullBar
    state.spin = !state.spin ? Spin.build(12, 5, 2) : state.spin.next()
    return state.spin.renderBar(this.chars)
  },
  formatter(state) {
    const { progress, total, value, payload, eta } = state
    const { start, agent, topic, status } = payload
    const dye = projectorFactory.make(progress)
    const barText = this.bar.call(this, state)
    const bar = dye(barText + ' ' + humanScale(value))
    return `${start} [${ros(agent)}] ${bar} | ${topic}`
  },
}

const baro = Baro.build(BARO_CONFIG, LAYOUT_THROBBER)

const test = async () => {
  const service = async function (params) {
    const { agent } = this
    const { status, delay, topic, size, } = params
    const start = time()
    const payload = { start, agent, topic, delay, status }
    const state = baro.create(size, 0, payload)
    await timeout(delay)
    if (status === 404) {
      // baro.remove(state)
      return payload
    }
    for (const i of range(0, 11)) {
      await timeout(200)
      state.update(i * size / 10, payload)
    }
    state.done = true
    state.stop()
    // state.spin.logs |> decoMatrix |> says['state-logs']
    return payload
  }
  const contractor = Contractor.build(service, [ { agent: '006' }, { agent: '007' }, { agent: '008' } ])
  const jobs = [
    { status: 200, topic: 'foo', size: 1280000, delay: 0 },
    { status: 200, topic: 'bar', size: 1440000, delay: 400 },
    { status: 200, topic: 'zen', size: 960000, delay: 800 },
    { status: 200, topic: 'voo', size: 1080000, delay: 300 },
    { status: 404, topic: 'sha', size: 720000, delay: 400 },
    { status: 200, topic: 'mia', size: 840000, delay: 500 },
    { status: 404, topic: 'fau', size: 1960000, delay: 200 },
    { status: 200, topic: 'ion', size: 1600000, delay: 100 },
  ]
  '>> connecting' |> says['throbber-test']
  const results = await contractor.takeOrders(jobs)
  baro.stop()
  // await timeout(100)
  results |> deco |> says['Q'].p('mission accomplished')
  'well done' |> decoString |> says['M']

}

test().then()