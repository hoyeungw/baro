import { Grey } from '@palett/cards'
import { Dye }  from '@palett/dye'

const grey = Dye.hex(Grey.base)

// baro legacy style as of 1.x
export const layout = {
  sentence: grey(' {bar}') + ' {progress}% | ETA: {eta}s | {value}/{total}',
  proChar: '\u2588',
  negChar: '\u2591'
}