// main.js
import { Worker } from 'worker_threads'

const WORKER_ADDRESS = process.cwd() + '/test/atomics/fibonacci/worker.js'

const runFibonacci = (nums) => {
  // get the length of the array
  let length = nums.length

  // int32 buffer of each element in the array
  let size = Int32Array.BYTES_PER_ELEMENT * length

  // Create buffer for the size ofthe input array
  let sharedBuffer = new SharedArrayBuffer(size)
  let sharedArray = new Int32Array(sharedBuffer)


  for (let i = 0; i < length; i++) {
    // store each value into the shareArray
    Atomics.store(sharedArray, i, nums[i])

    // Spin up a new worker thread
    let worker = new Worker(WORKER_ADDRESS)

    // Once calculation is done print out result
    worker.once('message', (message) => {
      console.log('Result received --- ', message)
    })

    // Send array data and index to worker thread.
    worker.postMessage({ data: sharedArray, index: i })
  }
}

runFibonacci([ 50, 20, 21, 24, 4 ])