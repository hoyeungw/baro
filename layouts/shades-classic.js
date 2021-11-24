// baro legacy style as of 1.x
import { Amber }         from '@palett/cards'
import { Dye }           from '@palett/dye'
import { CHARSET_SHADE } from '../resources/charset'

const amber = Dye.hex(Amber.base)

export const layout = {
  sentence: `{start} ${amber('{bar}')} | {percent}% | {degree} | ETA: {eta}s`,
  char: CHARSET_SHADE,
  size: 10,
  autoZero: true
}