// import Atomics from 'Ato'

const sab = new SharedArrayBuffer(16)
const i32a = new Int32Array(sab)
const result = Atomics.wait(i32a, 0, 0, 1000)
//                                     |  |  ^ timeout (opt)
//                                     |  ^ expected value
//                                     ^ index

if (result.value === 'not-equal') {
  // The value in the SharedArrayBuffer was not the expected one.
}
else {
  console.log('result.value instanceof Promise', result.value instanceof Promise) // true
  result.value.then(
    (value) => {
      if (value === 'ok') {
        console.log('ok')
        /* notified */
      }
      else {
        console.log('not ok')
        /* value is 'timed-out' */
      }
    })
}

// In this thread, or in another thread:
Atomics.notify(i32a, 0);

// In this thread, or in another thread:
Atomics.notify(i32a, 0)