import { Contractor }                         from '@geia/contractor'
import { FRESH }                              from '@palett/presets'
import { ProjectorFactory }                   from '@palett/projector-factory'
import { deco, decoString, logger, says, Xr } from '@spare/logger'
import { timeout }                            from '@valjoux/timeout'
import { time }                               from '@valjoux/timestamp-pretty'
import { range }         from '@vect/vector-init'
import { SHADE_CHARSET } from '../resources/chars'
import { Baro }          from '../src/Baro'

const projectorFactory = ProjectorFactory.fromHEX({ min: 0, max: 1 }, FRESH)

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
  char: SHADE_CHARSET,
  size: 10,
  autoZero: true
}

const baro = Baro.build(BARO_CONFIG, BARO_LAYOUT)

const test = async () => {
  Xr()['process.stdout.isTTY'](process.stdout.isTTY) |> logger
  // multiBar.config |> Deco({depth:1}) |> logger
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
  const results = await contractor.takeOrders(jobs)
  baro.stop()
  // await timeout(100)
  results |> deco |> says['Q'].p('mission accomplished')
  'well done' |> decoString |> says['M']

}

test().then()