import { decoSamples, says } from '@spare/logger'
import { range }             from '@vect/vector-init'
import { Spin }              from '../../util/Spin'

const test = () => {
  const MAX = 10
  const chars = [ '='.repeat(MAX), '-'.repeat(MAX) ]
  const spin = Spin.build(MAX, 5, 2)
  const logs = []
  for (let i of range(0, 11)) {
    const { value, sequel, record } = spin
    logs.push({ value, sequel, record, bar: spin.renderBar(chars) })
    spin.next()
  }
  logs |> decoSamples |> says['spin-record']
}

test()