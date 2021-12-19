import { workerData } from 'worker_threads'
import { Lock }       from './Lock.js'

const sharedArray = new Int32Array(workerData)
const lock = new Lock(sharedArray, 0)

console.log('Waiting for lock...') // (A)
// 获取锁
lock.lock() // (B) blocks!
console.log('Unlocked') // (C)