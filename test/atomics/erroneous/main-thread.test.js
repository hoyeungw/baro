// main.js
import { MESSAGE } from '@geia/enum-events'
import { LF }      from '@pres/enum-control-chars'
import { ros }     from '@spare/logger'
import { Worker }  from 'worker_threads'

const WORKER_ADDRESS = process.cwd() + '/test/atomics/erroneous/worker.js'

const runFibonacci = (jobs) => {
  // get the length of the array
  let length = jobs.length

  // int32 buffer of each element in the array
  let size = Int32Array.BYTES_PER_ELEMENT * length
  console.debug('>>', '[Int32Array.BYTES_PER_ELEMENT]', Int32Array.BYTES_PER_ELEMENT, LF)

  // Create buffer for the size ofthe input array
  let sharedData = new SharedArrayBuffer(size)
  let sharedView = new Int32Array(sharedData)


  for (let i = 0; i < length; i++) {
    // store each value into the shareArray
    // Atomics.store(sharedView, i, nums[i])
    sharedView[i] = jobs[i]

    // Spin up a new worker thread
    const worker = new Worker(WORKER_ADDRESS)

    // Once calculation is done print out result
    worker.once(MESSAGE, ({ index, value }) => {
      console.debug('>>', 'from', ros('worker-' + worker.threadId), `[${index}] (${value})`)
    })

    // Send array data and index to worker thread.
    worker.postMessage({ view: sharedView, index: i })
    console.debug('>> to', ros('worker-' + worker.threadId), `[${i}] ()`)
  }

  console.debug('>> all sent:', '[sharedView]', sharedView, '[sharedData]', sharedData)
}

runFibonacci([ 50, 20, 21, 24, 4 ])