import { BarFactory }       from './src/BarFactory'
import { formatBar }        from './src/formatters/format-bar'
import { formatTime }       from './src/formatters/format-time'
import { formatValue }      from './src/formatters/format-value'
import { defaultFormatter } from './src/formatters/formatter'
import { ParallelBar }      from './src/ParallelBar'
import { Presets }          from './src/presets'
import { ProgressBar }      from './src/ProgressBar'

export { Presets }
export { ParallelBar }
export { BarFactory }
export { ProgressBar }
export const Format = {
  Formatter: defaultFormatter,
  BarFormat: formatBar,
  ValueFormat: formatValue,
  TimeFormat: formatTime
}
