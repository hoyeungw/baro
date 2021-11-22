import { round }                   from '@aryth/math'
import { STR }                     from '@typen/enum-data-types'
import { base3ToScale, trailZero } from '../util/humanScale'

const DEFAULT_SENTENCE = 'progress [{bar}] {progress}% | ETA: {eta}s | {value}/{total}'

export class Layout {
  /**
   * @param {object}                        [options]
   * @param {number}                        [options.size]                size of the progressbar in chars
   * @param {string[]|string}               [options.char]
   * @param {string}                        [options.glue]
   * @param {string}                        [options.sentence]
   * @param {boolean}                       [options.autoZero = false]     autoZero - false
   * @param {function(State):string}        [options.bar]
   * @param {function(State):string}        [options.degree]
   * @param {function(State,object):string} [options.formatter]
   */
  constructor(options) {
    const char = typeof options.char === STR ? [ options.char, ' ' ] : Array.isArray(options.char) ? options.char : [ '=', '-' ]
    const [ x, y ] = char
    this.size = options.size ?? 24
    this.chars = [ x.repeat(this.size + 1), y.repeat(this.size + 1) ]
    this.glue = options.glue ?? ''
    this.autoZero = options.autoZero ?? false // autoZero - false
    this.sentence = options.sentence ?? DEFAULT_SENTENCE
    if (options.bar) this.bar = options.bar.bind(this)
    if (options.degree) this.degree = options.degree.bind(this)
    if (options.formatter) this.formatter = options.formatter.bind(this)

  }

  static build(options) {
    return new Layout(options)
  }
  loadFormatter(formatter) {
    this.formatter = formatter.bind(this)
    return this
  }
  bar(state) {
    const { progress } = state
    const { chars, glue, size } = this
    const
      lenX = round(progress * size),
      lenY = size - lenX
    const [ x, y ] = chars
    // generate bar string by stripping the pre-rendered strings
    return x.slice(0, lenX) + glue + y.slice(0, lenY)
  }
  degree(state) {
    let { value, total } = state
    const { base3 = true, decimal = true } = this
    if (!base3) return `${round(value)}/${total}`
    const thousand = decimal ? 1000 : 1024
    let base3Level = 0
    while (total > thousand) { // base3Level <= base3
      total /= thousand
      value /= thousand
      base3Level++
    }
    const totalText = trailZero(total)
    const valueText = trailZero(value).padStart(totalText.length)
    // return { value: valueText, total: totalText, scale: base3ToScale(base3, dec) }
    return `${valueText}/${totalText} ${base3ToScale(base3Level, decimal)}`
  }
  /**
   *
   * @param {State|object} state
   * @returns {string}
   */
  formatter(state) {
    return this.sentence?.replace(/\{(\w+)\}/g, (match, key) => {
      if (key === 'bar') return this.bar(state)
      if (key === 'degree') return this.degree(state)
      return key in state ? state[key] : match
    })
  }
}