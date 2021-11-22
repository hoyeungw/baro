import { ProgressBar } from './progressBar'

export class ParallelBar {
  constructor(stream) {
    this.stream = stream || process.stderr
    this.cursor = 0
    this.bars = []
    this.terminates = 0
  }
  make(schema, config) {
    config.stream = this.stream
    const bar = new ProgressBar(schema, config)
    this.bars.push(bar)
    const index = this.bars.length - 1

    // alloc line
    this.move(index)
    this.stream.write('\n')
    this.cursor++

    // replace original
    const self = this
    bar.otick = bar.tick
    bar.oterminate = bar.terminate
    bar.tick = function (value, config) {
      self.tick(index, value, config)
    }
    bar.terminate = function () {
      self.terminates++
      if (self.terminates == self.bars.length) {
        self.terminate()
      }
    }
    return bar
  }
  terminate() {
    this.move(this.bars.length)
    this.stream.clearLine()
    this.stream.cursorTo(0)
  }
  move(index) {
    if (!this.stream.isTTY) return
    this.stream.moveCursor(0, index - this.cursor)
    this.cursor = index
  }
  tick(index, value, config) {
    const bar = this.bars[index]
    if (bar) {
      this.move(index)
      bar.otick(value, config)
    }
  }
}