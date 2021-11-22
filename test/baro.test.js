import { Contractor }                              from '@geia/contractor'
import { FRESH }                                   from '@palett/presets'
import { ProjectorFactory }                        from '@palett/projector-factory'
import { deco, decoString, logger, ros, says, Xr } from '@spare/logger'
import { timeout }                                 from '@valjoux/timeout'
import { time }                                    from '@valjoux/timestamp-pretty'
import { range } from '@vect/vector-init'
import { Baro }  from '../src/Baro'

const projectorFactory = ProjectorFactory.fromHEX({ min: 0, max: 1 }, FRESH)

export class BarFactory {
  static build() {
    return Baro.build(
      {
        autoClear: false,
        lineWrap: null,
        hideCursor: true,
        stream: process.stdout,
        // forceRedraw: true,
        eta: {},
        fps: 2,
        etaAutoUpdate: true,
        syncUpdate: true,
      },
      {
        sentence: ' {bar} {progress}% | ETA: {eta}s | {degree}',
        char: [ '\u2588', '\u2591' ],
        size: 10,
        autoZero: true,
        formatter(state) {
          const { progress, total, value, payload, eta } = state
          // Xr().state(state |> decoFlat).progress(state.progress) |> logger
          const { start, agent, topic, status } = payload
          const dye = projectorFactory.make(progress)
          const barChars = this.bar.call(this, state) // ( getBarChars.call(config, progress) )
          const advance = this.degree.call(this, state)

          const bar = dye(barChars + ' ' + advance)
          if (value < total) {
            return `${start} [${ros(agent)}] ${bar} | eta ${eta} |${topic}`
          }
          else {
            return `${start} [${ros(agent)}] ${bar} | ${topic}`
          }
        },
      }
    )
  }
}

const test = async () => {
  Xr()['process.stdout.isTTY'](process.stdout.isTTY) |> logger
  const barFactory = BarFactory.build()
  // multiBar.config |> Deco({depth:1}) |> logger
  const service = async function (params) {
    const { agent } = this
    const { status, delay, topic, size, } = params
    const start = time()
    const payload = { start, agent, topic, delay, status }
    const state = barFactory.create(size, 0, payload)
    await timeout(delay)
    if (status === 404) {
      barFactory.remove(state)
      return payload
    }
    for (const i of range(0, 11)) {
      await timeout(200)
      state.update(i * size / 10, payload)
    }
    state.stop()
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
  barFactory.stop()
  // await timeout(100)
  results |> deco |> says['Q'].p('mission accomplished')
  'well done' |> decoString |> says['M']

}

test().then()