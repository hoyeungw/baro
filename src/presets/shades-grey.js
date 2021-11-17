import { Grey } from '@palett/cards'
import { Dye }  from '@palett/dye'

const grey = Dye(Grey.base)

// charge-bar legacy style as of 1.x
export const preset = {
  format: grey(' {bar}') + ' {percentage}% | ETA: {eta}s | {value}/{total}',
  barCompleteChar: '\u2588',
  barIncompleteChar: '\u2591'
}