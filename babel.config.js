module.exports = function (api) {
  api.cache(true)
  const presets = [
    ['@babel/preset-env', { targets: { node: '16' } }]
  ]
  const plugins = [
    // ['@babel/plugin-transform-runtime', { helpers: false }],
    // ['@babel/plugin-proposal-class-properties'],
    // ['@babel/plugin-proposal-private-methods'],
    ['@babel/plugin-proposal-optional-chaining'],
    ['@babel/plugin-proposal-nullish-coalescing-operator'],
    ['@babel/plugin-proposal-pipeline-operator', { proposal: 'minimal' }]
  ]
  const ignore = ['node_modules/**']
  return {
    presets,
    plugins,
    ignore
  }
}
