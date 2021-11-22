import readline from 'readline'

// low-level terminal interactions
export class Terminal {
  stream = null
  /** @type {boolean} line wrapping enabled */
  lineWrap = true
  /** @type {number} current, relative y position */
  dy = 0


  /**
   *
   * @param {Config|object} configs
   * @param {node::WriteStream} configs.stream
   * @param {boolean} [configs.lineWrap]
   * @param {number} [configs.dy]
   *
   */
  constructor(configs) {
    this.stream = configs.stream
    this.lineWrap = configs.lineWrap ?? true
    this.dy = configs.dy ?? 0
  }

  // tty environment ?
  get isTTY() { return this.stream.isTTY }

  // get terminal width
  get width() {
    return this.stream.columns ?? ( this.stream.isTTY ? 80 : 200 ) // set max width to 80 in tty-mode and 200 in noTTY-mode
  }

  // write content to output stream
  // @TODO use string-width to strip length
  write(tx) {
    this.stream.write(tx) // this.stream.write(this.lineWrap ? tx.slice(0, this.width) : tx)
  }

  cleanWrite(tx) {
    this.cursorTo(0, null)  // set cursor to start of line
    this.stream.write(tx)    // write output
    this.clearRight()            // clear to the right from cursor
  }

  // save cursor position + settings
  saveCursor() {
    if (!this.isTTY) return void 0
    this.stream.write('\x1B7') // save position
  }

  // restore last cursor position + settings
  restoreCursor() {
    if (!this.isTTY) return void 0
    this.stream.write('\x1B8') // restore cursor
  }

  // show/hide cursor
  showCursor(enabled) {
    if (!this.isTTY) return void 0
    enabled
      ? this.stream.write('\x1B[?25h')
      : this.stream.write('\x1B[?25l')
  }

  // change cursor position
  cursorTo(x, y) {
    if (!this.isTTY) return void 0
    readline.cursorTo(this.stream, x, y) // move cursor absolute
  }

  // change relative cursor position
  moveCursor(dx, dy) {
    if (!this.isTTY) return void 0
    if (dy) this.dy += dy // store current position
    if (dx || dy) readline.moveCursor(this.stream, dx, dy) // move cursor relative
  }

  // reset relative cursor
  resetCursor() {
    if (!this.isTTY) return void 0
    readline.moveCursor(this.stream, 0, -this.dy) // move cursor to initial line
    readline.cursorTo(this.stream, 0, null) // first char
    this.dy = 0 // reset counter
  }

  // clear to the right from cursor
  clearRight() {
    if (!this.isTTY) return void 0
    readline.clearLine(this.stream, 1)
  }

  // clear the full line
  clearLine() {
    if (!this.isTTY) return void 0
    readline.clearLine(this.stream, 0)
  }

  // clear everything beyond the current line
  clearDown() {
    if (!this.isTTY) return void 0
    readline.clearScreenDown(this.stream)
  }

  // add new line; increment counter
  newline() {
    this.stream.write('\n')
    this.dy++
  }

  // control line wrapping
  setLineWrap(enabled) {
    if (!this.isTTY) return void 0
    this.lineWrap = enabled // store state
    enabled
      ? this.stream.write('\x1B[?7h')
      : this.stream.write('\x1B[?7l')
  }


}