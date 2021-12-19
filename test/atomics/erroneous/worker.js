import { MESSAGE }    from '@geia/enum-events'
import { parentPort } from 'worker_threads'


// Listen for message from main thread
parentPort.once(MESSAGE, (event) => {
  const sharedView = event.view
  const index = event.index

  const valueAtIndex = sharedView[index]
  // const valueAtIndex = Atomics.load(sharedView, index)
  const value = calculateFibonacci(valueAtIndex)
  parentPort.postMessage({ index, value })

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