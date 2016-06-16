import { rollup } from 'rollup'
import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'

const peerDependencies = Object.keys(require('./package.json').peerDependencies)

export default {
  entry: 'tanok.js',
  dest: 'dist/tanok.js',
  format: 'umd',
  moduleName: 'tanok',
  plugins: [
    babel({
      "presets": [ "es2015-rollup" ],
      "plugins": [ "transform-object-rest-spread" ],
    }),
    nodeResolve({
      main: true,
      skip: peerDependencies,
      preferBuiltins: false,
    }),
    commonjs(),
  ]
}
