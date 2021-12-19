export default {
  presets: [
    [ '@babel/preset-env', { targets: { node: '16' } } ]
  ],
  plugins: [
    [ '@babel/plugin-proposal-pipeline-operator', { proposal: 'minimal' } ],
  ]
}
