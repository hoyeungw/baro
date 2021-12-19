export class Config {
  /**
   *
   * @param {object} config
   *
   * @param {ReadStream}   [config.input = process.stdin]   the output stream to read from
   * @param {WriteStream}  [config.output = process.stdout] the output stream to write on
   * @param {number}       [config.fps = 12]                the max update rate in fps (redraw will only triggered on value change)
   * @param {IO|any}       [config.terminal = null]         external terminal provided ?
   * @param {boolean}      [config.autoClear = false]       clear on finish ?
   * @param {boolean}      [config.autoStop = false]        stop on finish ?
   * @param {boolean}      [config.hideCursor = false]      hide the cursor ?
   * @param {boolean}      [config.lineWrap = false]        allow or disable setLineWrap ?
   * @param {string}       [config.sentence = DEFAULT_FORMAT] the bar sentence
   * @param {function}     [config.formatTime = null]       external time-sentence provided ?
   * @param {function}     [config.formatValue = null]      external value-sentence provided ?
   * @param {function}     [config.formatBar = null]        external bar-sentence provided ?
   * @param {boolean}      [config.syncUpdate = true]       allow synchronous updates ?
   * @param {boolean}      [config.noTTYOutput = false]     noTTY mode
   * @param {number}       [config.notTTYSchedule = 2000]   schedule - 2s
   * @param {boolean}      [config.forceRedraw = false]     force bar redraw even if progress did not change
   *
   * @param {object}       [config.eta]                     eta config
   * @param {boolean}      [config.eta.on = false]          switch to turn on eta
   * @param {number}       [config.eta.capacity = 10]       the number of results to average ETA over
   * @param {boolean}      [config.eta.autoUpdate = false]  automatic eta updates based on fps
   * @returns {Config}
   */
  constructor(config) {
    // merge layout
    // the max update rate in fps (redraw will only triggered on value change)
    this.throttle = 1000 / ( config.fps ?? 10 )

    // the output stream to write on
    this.output = config.output ?? process.stdout
    this.input = config.input ?? process.stdin

    this.eta = config.eta
      ? {
        capacity: config.eta?.capacity ?? 10, // the number of results to average ETA over
        autoUpdate: config.eta?.autoUpdate ?? false, // automatic eta updates based on fps
      }
      : null

    this.terminal = config.terminal ?? null // external terminal provided ?
    this.autoClear = config.autoClear ?? false // clear on finish ?
    this.autoStop = config.autoStop ?? false // stop on finish ?
    this.hideCursor = config.hideCursor ?? true // hide the cursor ?
    this.lineWrap = config.lineWrap ?? false // disable setLineWrap ?

    this.syncUpdate = config.syncUpdate ?? true // allow synchronous updates ?
    this.noTTYOutput = config.noTTYOutput ?? false // noTTY mode
    this.notTTYSchedule = config.notTTYSchedule ?? 2000 // schedule - 2s
    this.forceRedraw = config.forceRedraw ?? false // force bar redraw even if progress did not change
    return this
  }

  static build(config) { return new Config(config) }
}