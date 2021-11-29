import { CSI }     from '@pres/enum-control-chars'
import { CPL, SU } from '@pres/enum-csi-codes'
import { timeout } from '@valjoux/timeout'
import { time }    from '@valjoux/timestamp-pretty'
import { range }   from '@vect/vector-init'
// import * as rl     from 'readline'

const test = async () => {
  const stream = process.stdout
  console.log(`>> start [test] ${time()} [screen.h] ${stream.rows}`)
  // stream.write(`${CSI}${3};${stream.rows - 1}${DECSTBM}`)
  const hi = 100
  for (let i of range(0, 36)) {
    console.log(i)
  }
  console.log(`>> end [hi] ${hi} [screen.h] ${stream.rows}`)
  await timeout(200)
  const ht = stream.rows - 2
  stream.write(`${CSI}${ht}${SU}${CSI}${ht}${CPL}`)
  await timeout(1000)
}

test()