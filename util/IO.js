import { IO as ArpelIO }         from '@arpel/backend'
import { clear, cursor, decset } from '@arpel/escape'
import { LF }                    from '@pres/enum-control-chars'
import * as rl                   from 'readline'

const ARPEL_IO = ArpelIO.build({})

export class IO extends ArpelIO {
  /** @type {boolean} line wrapping enabled */
  lineWrap = true
  /** @type {number} current, relative y position */
  offset = 0

  /**
   *
   * @param {Config|object} configs
   * @param {ReadStream} configs.input
   * @param {WriteStream} configs.output
   * @param {boolean} [configs.lineWrap]
   * @param {number} [configs.offset]
   *
   */
  constructor(configs) {
    super(configs)
    this.offset = configs.offset ?? 0
    if (!this.isTTY) {
      console.error('>> [baro:IO] stream is not tty. baro:IO functions may not work.')
    }
  }

  static build(configs) { return new IO(configs) }

  // tty environment
  get isTTY() { return this.output.isTTY }

  get excessive() { return this.offset > this.height }

  // CSI n G	CHA	Cursor Horizontal Absolute	Moves the cursor to column n (default 1).
  // write output
  // clear to the right from cursor
  writeOff(text) {
    this.output.write(cursor.charTo(0) + text + clear.RIGHT_TO_CURSOR)
  }

  saveCursor() { this.output.write(cursor.SAVE) } // save cursor position + settings

  restoreCursor() { this.output.write(cursor.RESTORE) } // restore last cursor position + settings

  showCursor(enabled) { this.output.write(enabled ? cursor.SHOW : cursor.HIDE) }   // show/hide cursor

  cursorTo(x, y) { this.output.write(cursor.goto(x, y)) } // change cursor position: rl.cursorTo(this.output, x, y)

  // change relative cursor position
  moveCursor(dx, dy) {
    if (dy) this.offset += dy // store current position
    if (dx || dy) rl.moveCursor(this.output, dx, dy) // move cursor relative
  }

  offsetLines(offset) {
    const cursorMovement = offset >= 0 ? cursor.down(offset) : cursor.up(-offset)
    this.output.write(cursorMovement + cursor.charTo(0))
    // rl.moveCursor(this.output, -this.width, offset) // move cursor to initial line // rl.cursorTo(this.stream, 0, null) // first char
  }

  // reset relative cursor
  resetCursor() {
    this.offsetLines(-this.offset)
    // rl.moveCursor(this.output, -this.width, this.offset) // move cursor to initial line // rl.cursorTo(this.stream, 0, null) // first char
    this.offset = 0 // reset counter
  }

  clearRight() { rl.clearLine(this.output, 1) } // clear to the right from cursor

  clearLine() { rl.clearLine(this.output, 0) } // clear the full line

  clearDown() { rl.clearScreenDown(this.output) } // clear everything beyond the current line

  // add new line; increment counter
  nextLine() {
    this.output.write(LF)
    this.offset++
  }

  // create new page, equivalent to Ctrl+L clear screen
  nextPage() {
    this.output.write(clear.ENTIRE_SCREEN + cursor.goto(0, 0))
    // this.offset = 0
  }

  // store state + control line wrapping
  setLineWrap(enabled) { this.output.write(enabled ? decset.WRAP_ON : decset.WRAP_OFF) }
}