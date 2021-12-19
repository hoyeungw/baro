import { humanScale } from '../util/humanScale.js'

const test = () => {
  const result = humanScale(1960000, true)
  console.error(result)
}

test()