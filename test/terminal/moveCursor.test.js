import { CSI }              from '@pres/enum-control-chars'
import { CUU, DECSTBM, EL } from '@pres/enum-csi-codes'
import { timeout }          from '@valjoux/timeout'
import { time }             from '@valjoux/timestamp-pretty'
import { range }            from '@vect/vector-init'
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
  await timeout(1000)
  for (let i of range(0, 20)) {
    await timeout(200)
    stream.write(`${CSI}${1}${CUU}`)
    await timeout(200)
    stream.write(`${CSI}${2}${EL}`)
    // await timeout(200)
    // stream.write(`${CSI}${1}${CUU}`)
  }
  // stream.write(`${CSI}H`) // ${CSI}H
  stream.write(`${CSI}${DECSTBM}`)

  let dy = hi, i = 0

  // stream.write(`${CSI}${9}${CUD}`)


  // while(dy>hi){
  //
  // }
  // stream.write(`${CSI}${stream.rows}${CPL}`)
  // rl.moveCursor(stream, 0, -1)
  // stream.write(`${CSI}2J${CSI}3J`) // ${CSI}H
  // stream.write(`${CSI}${stream.rows}${CPL}`)
  // stream.write(`${CSI}M`)
  // stream.write(`${CSI}${stream.rows}${SU}`)

  // stream.write(`${CSI}${1}${SU}`)
  // stream.write(`${CSI}${1}${SU}`)
  // stream.write(`${CSI}${1}${CUU}`)

  // stream.write(`${CSI}${stream.rows}${SU}`)
  // stream.write(`${CSI}${stream.rows}${CUU}`)
  // stream.write(`${CSI}${2}${ED}`)
  // console.log(`>> scroll-up (${i++}) [dy] ${dy} [screen.h] ${stream.rows}`)
  // console.log('>> mark')
  // rl.moveCursor(stream, 0, -dy)
}

test()