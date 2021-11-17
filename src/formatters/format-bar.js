// format bar
export function formatBar(progress, options) {
  // calculate barsize
  const completeSize = Math.round(progress * options.barsize)
  const incompleteSize = options.barsize - completeSize

  // generate bar string by stripping the pre-rendered strings
  return options.barCompleteString.slice(0, completeSize) +
    options.barGlue +
    options.barIncompleteString.slice(0, incompleteSize)
}