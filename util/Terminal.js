import readline from 'readline'

// low-level terminal interactions
export class Terminal {

  /**
   *
   * @param {Object} configs
   * @param {node::WriteStream} configs.stream
   * @param {boolean} [configs.lineWrap]
   * @param {number} [configs.dy]
   *
   */
  constructor(configs) {
    this.stream = configs.stream

    // default: line wrapping enabled
    this.lineWrap = configs.lineWrap ?? true

    // current, relative y position
    this.dy = configs.dy ?? 0
    // Xr().isTTY(this.isTTY).width(this.width) |> says['terminal']
  }

  // tty environment ?
  get isTTY() { return this.stream.isTTY }

  // get terminal width
  get width() {
    // set max width to 80 in tty-mode and 200 in notty-mode
    return this.stream.columns || ( this.stream.isTTY ? 80 : 200 )
  }

  // write content to output stream
  // @TODO use string-width to strip length
  write(tx) {
    this.stream.write(this.lineWrap ? tx.slice(0, this.width) : tx)
  }

  // save cursor position + settings
  cursorSave() {
    if (!this.isTTY) return void 0
    // save position
    this.stream.write('\x1B7')
  }

  // restore last cursor position + settings
  cursorRestore() {
    if (!this.isTTY) return void 0
    // restore cursor
    this.stream.write('\x1B8')
  }

  // show/hide cursor
  cursor(enabled) {
    if (!this.isTTY) return void 0
    enabled
      ? this.stream.write('\x1B[?25h')
      : this.stream.write('\x1B[?25l')
  }

  // change cursor positionn
  cursorTo(x = null, y = null) {
    if (!this.isTTY) return void 0
    // move cursor absolute
    readline.cursorTo(this.stream, x, y)
  }

  // change relative cursor position
  cursorRelative(dx = null, dy = null) {
    if (!this.isTTY) return void 0
    // store current position
    this.dy = this.dy + dy
    // move cursor relative
    readline.moveCursor(this.stream, dx, dy)
  }

  // relative reset
  cursorRelativeReset() {
    if (!this.isTTY) return void 0
    // move cursor to initial line
    readline.moveCursor(this.stream, 0, -this.dy)
    // first char
    readline.cursorTo(this.stream, 0, null)
    // reset counter
    this.dy = 0
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

  // clear everyting beyond the current line
  clearBottom() {
    if (!this.isTTY) return void 0
    readline.clearScreenDown(this.stream)
  }

  // add new line; increment counter
  newline() {
    this.stream.write('\n')
    this.dy++
  }

  // control line wrapping
  lineWrapping(enabled) {
    if (!this.isTTY) return void 0
    // store state
    this.lineWrap = enabled
    enabled
      ? this.stream.write('\x1B[?7h')
      : this.stream.write('\x1B[?7l')
  }


}