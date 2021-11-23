import { Grey }        from '@palett/cards'
import { Dye }           from '@palett/dye'
import { SHADE_CHARSET } from '../resources/chars'

const grey = Dye.hex(Grey.base)

// baro legacy style as of 1.x
export const layout = {
  sentence: grey(' {bar}') + ' {progress}% | ETA: {eta}s | {value}/{total}',
  size: 16,
  char: SHADE_CHARSET,
}