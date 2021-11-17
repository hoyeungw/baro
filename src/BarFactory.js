import { Amber, Lime, Teal }       from '@palett/cards'
import { DyeFactory }              from '@palett/dye-factory'
import { FRESH }                   from '@palett/presets'
import { ProjectorFactory }        from '@palett/projector-factory'
import { ros }                     from '@spare/logger'
import { base3ToScale, trailZero } from '../util/humanScale'
import { ParallelBar }             from './ParallelBar'
import { Presets }                 from './presets'


const dyeFactory = DyeFactory.hex()
const Dye = {
  amber: dyeFactory(Amber.base),
  teal: dyeFactory(Teal.base),
  lime: dyeFactory(Lime.base)
}
const projectorFactory = ProjectorFactory.fromHEX({ min: 0, max: 1 }, FRESH)


function getBarChars(progress) {
  const {
          barCompleteString: solidChars,
          barGlue,
          barIncompleteString: emptyChars,
          barsize: totalSize
        } = this
  const solidSize = ~~( progress * totalSize )
  const emptySize = totalSize - solidSize
  return solidChars.slice(0, solidSize) + barGlue + emptyChars.slice(0, emptySize)
}

export function getValueToTotal(value, total, base3, dec) {
  const B10 = dec ? 1000 : 1024
  let level = 0
  while (level <= base3) {
    total /= B10
    value /= B10
    level++
  }
  const totalText = trailZero(total)
  const len = totalText.length
  const valueText = trailZero(value).padStart(len)
  // return { value: valueText, total: totalText, scale: base3ToScale(base3, dec) }
  return `${valueText}/${totalText} ${base3ToScale(level, dec)}`
}

export function formatter(options, params, payload) {
  const { progress, total, value } = params
  const { start, agent, topic, status } = payload
  const dye = projectorFactory.make(progress)
  const barChars = ( getBarChars.call(options, progress) )
  const advance = ( getValueToTotal(value, total, true) )
  const bar = dye(barChars + ' ' + advance)
  if (value < total) {
    return `${start} [${ros(agent)}] ${bar} | ${topic}`
  }
  else {
    return `${start} [${ros(agent)}] ${bar} | ${topic}`
  }
}

export class BarFactory {
  static build(render) {
    // const formatter = (options, params, payload) => {
    //   const { progress, total, value } = params
    //   const dye = projectorFactory.make(progress)
    //   const bar = dye(getBarChars.call(options, progress))
    //   const current = dye(getValueToTotal(value, total))
    //   return render(params, payload)
    // }
    return new ParallelBar(
      {
        format: formatter, // `{start} ${ Dye.amber('{bar}') } | {percentage}% | {value}/{total} m | {agent} | {des}`,
        clearOnComplete: false,
        lineWrap: null,
        hideCursor: true,
        stream: process.stdout,
        forceRedraw: true,
        fps: 12,
        etaAsynchronousUpdate: true,
        synchronousUpdate: true,
        autopadding: true,
        barsize: 10,
        emptyOnZero: true
      },
      Presets.shades_classic
    )
  }
}
