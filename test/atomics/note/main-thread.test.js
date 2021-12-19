import { Worker } from 'worker_threads'
import { Lock }   from './Lock.js'

const WORKER_ADDRESS = process.cwd() + '/test/atomics/note/worker.js'

const sharedData = new SharedArrayBuffer(1 * Int32Array.BYTES_PER_ELEMENT)
const sharedView = new Int32Array(sharedData)
let worker = new Worker(WORKER_ADDRESS, { workerData: sharedData })
Lock.initialize(sharedView, 0)
const lock = new Lock(sharedView, 0)
// 获取锁
lock.lock()

// 3s后释放锁
setTimeout(() => {
  lock.unlock() // (B)
}, 3000)