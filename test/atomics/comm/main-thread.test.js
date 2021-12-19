import { Worker } from 'worker_threads'

const WORKER_ADDRESS = process.cwd() + '/test/atomics/comm/worker.js'

const worker = new Worker(WORKER_ADDRESS)

const buffer = new SharedArrayBuffer(1024)
const view = new Uint8Array(buffer)

console.debug('now', view[0], view)

worker.postMessage(buffer)

setTimeout(() => {
  console.debug('later', view[0], view)
  console.log('prop', buffer.foo)
  worker.unref()
}, 500)