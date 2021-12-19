const sab = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * 100000)
const ia = new Int32Array(sab)

ia[42] = 314159  // 原先的值 191
ia[37] = 123456  // 原先的值 163

// Worker 线程
console.log(ia[37])
console.log(ia[42])