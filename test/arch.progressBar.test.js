import { randBetw }                           from '@aryth/rand'
import { Deco, decoString, logger, says, Xr } from '@spare/logger'
import { timeout }                            from '@valjoux/timeout'
import { time }                               from '@valjoux/timestamp-pretty'
import { range }                from '@vect/vector-init'
import { Layouts, ProgressBar } from '../index'


const test = async () => {
  Xr()['process.stdout.isTTY'](process.stdout.isTTY) |> logger

  const service = async function (params) {
    const { agent } = this
    const { status, delay, topic, size, } = params
    const start = time()
    const payload = { start, agent, topic, delay, status }
    const bar = new ProgressBar({
      autoClear: false,
      lineWrap: null,
      hideCursor: true,
      stream: process.stdout,
      forceRedraw: true,
      fps: 12,
      etaAutoUpdate: true,
      syncUpdate: true,
      bar: {
        size: 10,
        autoZero: true
      },
    }, Layouts.shades_classic)

    bar.init(size, 0, payload)
    await timeout(randBetw(0, 200))
    if (status === 404) return payload
    for (const i of range(0, 10)) {
      await timeout(500)
      bar.update(i * size / 10, payload)
    }
    bar.stop()

    // await timeout(100)
    bar.log |> Deco({ depth: 2 }) |> says['Q'].br('log')

    return payload
  }
  await service.call({ agent: '007' }, { status: 200, topic: 'foo', size: 1280000, delay: 0 })

  'well done' |> decoString |> says['M']
}

test().then()

