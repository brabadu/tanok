const path = require('path')
const rollup = require('rollup')
const babel = require('rollup-plugin-babel')
const commonjs = require('rollup-plugin-commonjs')
const nodeResolve = require('rollup-plugin-node-resolve')

const peerDependencies = Object.keys(require('./package.json').peerDependencies)

const entries = [
  {
    entry: 'src/tanok.js',
    moduleName: 'tanok',
  },
  {
    entry: 'src/streamWrapper.js',
    moduleName: 'tanokStreamWrapper',
  },
]
const plugins = [
  babel({
    "presets": [ "es2015-rollup", "stage-0", "react" ],
    "plugins": [ "transform-decorators-legacy",
                 ["transform-es2015-classes", {loose: true}],
                "transform-object-rest-spread"
              ],
    "babelrc": false
  }),
  nodeResolve({
    customResolveOptions: {
      moduleDirectory: 'node_modules'
  }}),
  commonjs(),
]

entries.forEach((entry) => {
  rollup.rollup({
    input: entry.entry,
    plugins: plugins,
    external: peerDependencies
  }).then(
      (bundle) => bundle.write({
          file: entry.entry.replace('src', 'lib'),
          format: 'umd',
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
          },
          name: entry.moduleName
      }),
      (error) => {
        console.error(error)
      }
  )
});
