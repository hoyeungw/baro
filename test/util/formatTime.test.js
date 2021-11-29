const { logger } = require('@spare/logger')
function formatTime(t, roundToMultipleOf) {
  const config = this
  function round(input) {
    if (roundToMultipleOf) {
      return roundToMultipleOf * Math.round(input / roundToMultipleOf)
    }
    else {
      return input
    }
  }
  // leading zero padding
  function autoPadding(value) { return ( config.padChar + value ).slice(-2) }

  // > 1h ?
  if (t > 3600) { return autoPadding(~~( t / 3600 )) + 'h' + autoPadding(round(( t % 3600 ) / 60)) + 'm' }
  // > 60s ?
  else if (t > 60) { return autoPadding(~~( t / 60 )) + 'm' + autoPadding(round(( t % 60 ))) + 's' }
  // > 10s ?
  else if (t > 10) { return autoPadding(round(t)) + 's' }
  // default: don't apply round to multiple
  else { return autoPadding(t) + 's' }
}

const candidates = [
  3665,
  265
]

const config = { padChar: '   ' }
for (let candidate of candidates) {
  formatTime.call(config, candidate, 1) |> logger
}