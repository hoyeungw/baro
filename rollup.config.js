import babel               from '@rollup/plugin-babel'
import commonjs            from '@rollup/plugin-commonjs'
import nodeResolve         from '@rollup/plugin-node-resolve'
import { decoObject, ros } from '@spare/logger'
import fileInfo            from 'rollup-plugin-fileinfo'

const { name, dependencies, main, module } = require(process.cwd() + '/package.json')

console.log(ros('Executing'), name, process.cwd())
console.log(ros('Dependencies'), decoObject(dependencies || {}, { bracket: true }))

export default [
  {
    input: 'index.js',
    external: Object.keys(dependencies || {}),
    output: [
      { file: main, format: 'cjs' },  // CommonJS (for Node) build.
      { file: module, format: 'esm' }  // ES module (for bundlers) build.
    ],
    plugins: [
      nodeResolve({ preferBuiltins: true }),
      commonjs({ include: /node_modules/ }),
      babel({
        babelrc: false,
        comments: true,
        sourceMap: true,
        exclude: 'node_modules/**',
        babelHelpers: 'bundled',
        presets : [
          ['@babel/preset-env', { targets: { node: '16' } }]
        ],
        plugins: [
          // ['@babel/transform-runtime', { helpers: false }],
          // ['@babel/plugin-proposal-class-properties'],
          // ['@babel/plugin-proposal-private-methods'],
          ['@babel/plugin-proposal-optional-chaining'],
          ['@babel/plugin-proposal-nullish-coalescing-operator'],
          ['@babel/plugin-proposal-pipeline-operator', { proposal: 'minimal' }]
        ]
      }),
      fileInfo()
    ]
  }
]
