import { babel }           from '@rollup/plugin-babel'
import commonjs            from '@rollup/plugin-commonjs'
import nodeResolve         from '@rollup/plugin-node-resolve'
import { decoObject, ros } from '@spare/logger'
import { readFileSync }    from 'fs'
import { fileInfo }        from 'rollup-plugin-fileinfo'

const packageJson = readFileSync(process.cwd() + '/package.json', { encoding: 'utf-8' })
const { name, dependencies, exports } = JSON.parse(packageJson)

console.log(ros('Executing'), name, process.cwd())
if (dependencies) console.log(ros('Dependencies'), decoObject(dependencies))

export default [
  {
    input: 'index.js',
    external: [ 'timers/promises', ...Object.keys(dependencies || {}) ],
    output: [
      { file: exports['import'], format: 'esm' },  // ES module (for bundlers) build.
      { file: exports['require'], format: 'cjs' }  // CommonJS (for Node) build.
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
        presets: [
          [ '@babel/preset-env', { targets: { node: '16' } } ]
        ],
        plugins: [
          [ '@babel/plugin-proposal-pipeline-operator', { proposal: 'minimal' } ],
        ]
      }),
      fileInfo()
    ]
  }
]
