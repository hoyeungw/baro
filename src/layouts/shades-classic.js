// baro legacy style as of 1.x
import { Amber } from '@palett/cards'
import { Dye }   from '@palett/dye'

const D = {
  amber: Dye.hex(Amber.base)
}

export const layout = {
  sentence: `{start} ${D.amber('{bar}')} | {percent}% | {degree} | {agent} | {des}`,
  // sentence: ' {bar} {progress}% | ETA: {eta}s | {value}/{total}',
  proChar: '\u2588',
  negChar: '\u2591',
  size: 10,
  autoZero: true
}