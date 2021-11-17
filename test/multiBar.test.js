import { randBetw }                           from '@aryth/rand'
import { Contractor }                         from '@geia/contractor'
import { deco, decoString, logger, says, Xr } from '@spare/logger'
import { timeout }                            from '@valjoux/timeout'
import { time }                               from '@valjoux/timestamp-pretty'
import { range }                              from '@vect/vector-init'
import { BarFactory }                         from '../src/BarFactory'


const test = async () => {
  Xr()['process.stdout.isTTY'](process.stdout.isTTY) |> logger
  const multiBar = BarFactory.build()
  const service = async function (params) {
    const { agent } = this
    const { status, delay, topic, size, } = params
    const start = time()
    const payload = { start, agent, topic, delay, status }
    const bar = multiBar.create(size, 0, payload)
    await timeout(randBetw(0, 200))
    if (status === 404) return payload
    for (const i of range(0, 10)) {
      await timeout(100)
      bar.update(i * size / 10, payload)
    }
    bar.stop()
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
    { status: 200, topic: 'fau', size: 1960000, delay: 200 },
    { status: 200, topic: 'ion', size: 1600000, delay: 100 },
  ]
  const results = await contractor.takeOrders(jobs)
  multiBar.stop()
  // await timeout(100)
  results |> deco |> says['Q'].p('mission accomplished')
  'well done' |> decoString |> says['M']

}

test().then()