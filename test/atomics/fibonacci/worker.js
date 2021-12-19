import { isMainThread, parentPort, Worker } from 'worker_threads'



// Listen for message from main thread
parentPort.once('message', (event) => {
  const sharedArray = event.data
  const index = event.index

  const arrValue = Atomics.load(sharedArray, index)
  const fibonacciValue = calculateFibonacci(arrValue)
  parentPort.postMessage(fibonacciValue)

})


const calculateFibonacci = (num) => {
  let a = 1, b = 0, temp

  while (num >= 0) {
    temp = a
    a = a + b
    b = temp
    num--
  }

  return b
}