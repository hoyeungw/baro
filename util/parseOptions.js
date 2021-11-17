// utility to merge defaults

export function parseOptions(rawOptions, preset) {

  // options storage
  const options = {}

  // merge preset
  const opt = Object.assign({}, preset, rawOptions)

  // the max update rate in fps (redraw will only triggered on value change)
  options.throttleTime = 1000 / ( opt.fps ?? 10 )

  // the output stream to write on
  options.stream = opt.stream ?? process.stderr

  // external terminal provided ?
  options.terminal = opt.terminal ?? null

  // clear on finish ?
  options.clearOnComplete = opt.clearOnComplete ?? false

  // stop on finish ?
  options.stopOnComplete = opt.stopOnComplete ?? false

  // size of the progressbar in chars
  options.barsize = opt.barsize ?? 40

  // position of the progress bar - 'left' (default), 'right' or 'center'
  options.align = opt.align ?? 'left'

  // hide the cursor ?
  options.hideCursor = opt.hideCursor ?? false

  // disable linewrapping ?
  options.lineWrap = opt.lineWrap ?? false

  // pre-render bar strings (performance)
  options.barCompleteString = new Array(options.barsize + 1).join(opt.barCompleteChar || '=')
  options.barIncompleteString = new Array(options.barsize + 1).join(opt.barIncompleteChar || '-')

  // glue sequence (control chars) between bar elements ?
  options.barGlue = opt.barGlue ?? ''

  // the bar format
  options.format = opt.format ?? 'progress [{bar}] {percentage}% | ETA: {eta}s | {value}/{total}'

  // external time-format provided ?
  options.formatTime = opt.formatTime ?? null

  // external value-format provided ?
  options.formatValue = opt.formatValue ?? null

  // external bar-format provided ?
  options.formatBar = opt.formatBar ?? null

  // the number of results to average ETA over
  options.etaBufferLength = opt.etaBuffer ?? 10

  // automatic eta updates based on fps
  options.etaAsynchronousUpdate = opt.etaAsynchronousUpdate ?? false

  // allow synchronous updates ?
  options.synchronousUpdate = opt.synchronousUpdate ?? true

  // notty mode
  options.noTTYOutput = opt.noTTYOutput ?? false

  // schedule - 2s
  options.notTTYSchedule = opt.notTTYSchedule ?? 2000

  // emptyOnZero - false
  options.emptyOnZero = opt.emptyOnZero ?? false

  // force bar redraw even if progress did not change
  options.forceRedraw = opt.forceRedraw ?? false

  // automated padding to fixed width ?
  options.autopadding = opt.autopadding ?? false

  // autopadding character - empty in case autopadding is disabled
  options.autopaddingChar = options.autopadding ? opt.autopaddingChar ?? '   ' : ''

  return options
}