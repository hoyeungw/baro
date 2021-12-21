import { clear, cursor, decset }             from '@arpel/escape'
import { EXIT }                              from '@geia/enum-events'
import { FRESH }                             from '@palett/presets'
import { ProjectorFactory }                  from '@palett/projector-factory'
import { decoString, logger, ros, says, Xr } from '@spare/logger'
import { timeout }                           from '@valjoux/timeout'
import { time }                              from '@valjoux/timestamp-pretty'
import { range }                             from '@vect/vector-init'
import { Baro }                              from '../src/Baro.js'
import { State }                             from '../src/State.js'
import { Contractor }                        from '../util/Contractor.js'
import { base3ToScale, trailZero }           from '../util/humanScale.js'

const projectorFactory = ProjectorFactory.fromHEX({ min: 0, max: 1 }, FRESH)

const BARO_CONFIG = {
  autoClear: false,
  lineWrap: null,
  hideCursor: true,
  stream: process.stdout,
  // forceRedraw: true,
  eta: {},
  fps: 2,
  syncUpdate: true,
}

const BARO_LAYOUT = {
  sentence: ' {bar} {progress}% | ETA: {eta}s | {degree}',
  char: [ '\u2588', '\u2591' ],
  size: 10,
  autoZero: true,
  degree(state) {
    let { value, total } = state
    const BASE3_THRESHOLD = 2
    let currB3Level = 0
    while (currB3Level < BASE3_THRESHOLD) {
      total /= 1024, value /= 1024, currB3Level++
    }
    const t = trailZero(total)
    const v = trailZero(value).padStart(t.length)
    return `${v}/${t} ${base3ToScale(currB3Level, false)}`
  },
  format(state) {
    const { progress, start, total, value, eta, agent, author, work, code } = state
    // Xr().state(state |> decoFlat).progress(state.progress) |> logger
    const dye = projectorFactory.make(progress)
    const barText = this.bar.call(this, state) // ( getBarChars.call(config, progress) )
    const degreeText = this.degree.call(this, state)
    const bar = dye(barText + ' ' + degreeText)
    if (value < total) {
      return `${time()} [${ros(agent)}] [${code}] ${bar} | eta ${eta} | ${author} | ${work}`
    }
    else {
      return `${time()} [${ros(agent)}] [${code}] ${bar} | ${author} | ${work}`
    }
  },
}


const test = async () => {
  process.stdout.write(clear.ENTIRE_SCREEN + cursor.goto(0, 0))
  logger(Xr()['process.stdout.isTTY'](process.stdout.isTTY))
  // multiBar.config |> Deco({depth:1}) |> logger
  const baro = Baro.build(BARO_CONFIG, BARO_LAYOUT)
  const service = async function (params) {
    const { agent } = this
    const state = State.build({ total: params.size, value: 0, eta: { capacity: 48 } })
    state.agent = agent
    await baro.append(state) // start: Date.now(),
    Object.assign(state, params)
    await timeout(state.delay)
    if (state.code === 404) {
      state.done = false
      // baro.remove(state)
      return state
    }
    for (const i of range(0, 11)) {
      await timeout(60)
      state.update(i * state.size / 10)
    }
    state.done = true
    state.stop()
    // state.spin.logs |> decoMatrix |> says['state-logs']
    return state
  }
  let contractor = Contractor.build(service, [ { agent: '006' }, { agent: '007' }, { agent: '008' }, { agent: '009' } ])
  const jobs = [
    { code: 200, size: 1280000, delay: 0, author: 'Leo Tolstoy', work: 'War and Peace', },
    { code: 200, size: 1440000, delay: 400, author: 'Leo Tolstoy', work: 'Anna Karenina', },
    { code: 200, size: 960000, delay: 800, author: 'Dostoevsky', work: 'Crime and Punishment', },
    // { code: 200, size: 1080000, delay: 300, author: 'Dostoevsky', work: 'The Double', },
    { code: 404, size: 720000, delay: 400, author: 'Honoré de Balzac', work: 'La Comédie humaine', },
    { code: 200, size: 840000, delay: 500, author: 'Honoré de Balzac', work: 'Eugénie Grandet', },
    // { code: 404, size: 1960000, delay: 200, author: 'Honoré de Balzac', work: 'La Peau de chagrin', },
    // { code: 200, size: 1600000, delay: 100, author: 'Honoré de Balzac', work: 'Le Père Goriot', },
    { code: 200, size: 1280000, delay: 0, author: 'Victor Hugo', work: 'Les Misérables', },
    // { code: 200, size: 1440000, delay: 400, author: 'Victor Hugo', work: 'Ruy Blas', },
    // { code: 200, size: 960000, delay: 800, author: 'Victor Hugo', work: 'The Hunchback of Notre-Dame', },
    { code: 200, size: 1080000, delay: 300, author: 'Stendhal', work: 'The Red and the Black', },
    // { code: 404, size: 720000, delay: 400, author: 'Émile Zola', work: 'Les Rougon-Macquart', },
    // { code: 200, size: 840000, delay: 500, author: 'Corneille', work: 'Le Cid', },
    // { code: 404, size: 1960000, delay: 200, author: 'Prosper Mérimée', work: 'La Vénus d\'Ille ', },
    // { code: 200, size: 1600000, delay: 100, author: 'Prosper Mérimée', work: 'Carmen', },
    // { code: 200, size: 1280000, delay: 0, author: 'François Rabelais', work: 'Gargantua and Pantagruel', },
    // { code: 200, size: 1440000, delay: 400, author: 'Molière', work: 'Tartuffe', },
    // { code: 200, size: 960000, delay: 800, author: 'Molière', work: 'The Misanthrope', },
    // { code: 200, size: 1080000, delay: 300, author: 'Gustave Flaubert', work: 'Madame Bovary', },
    // { code: 404, size: 720000, delay: 400, author: 'Gustave Flaubert', work: 'Sentimental Education', },
    // { code: 200, size: 840000, delay: 500, author: 'Maupassant', work: 'Bel Ami', },
    // { code: 404, size: 1960000, delay: 200, author: 'Maupassant', work: 'La Parure', },
    // { code: 200, size: 1600000, delay: 100, author: 'Maupassant', work: 'Butterball ', },
  ]
  const results = await contractor.takeOrders(jobs)
  await baro.stop()
  // await timeout(100)
  const read = ({ size, value, agent, author, work, done }) => ( { size, value, agent, author, work, done } )
  // results.map(read) |> decoSamples |> says['Q'].p('mission accomplished')
  says['M'](decoString('well done'))

  baro.io.removeEvents()
}

const consolidate = async () => {
  await test()
  await test()
  await test()
  // process.stdin.pause()
}

process.on(EXIT, (code) => {
  process.stdout.write(cursor.SHOW + decset.WRAP_ON)
})

consolidate().then()
