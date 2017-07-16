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
    "presets": [ ["es2015", { "modules": false }], "stage-0", "react" ],
    "plugins": [ "external-helpers", "transform-decorators-legacy",
                 ["transform-es2015-classes", {loose: true}],
                "transform-object-rest-spread"
              ],
    "babelrc": false
  }),
  nodeResolve({
    main: true,
    skip: peerDependencies,
    preferBuiltins: false,
  }),
  commonjs(),
]

entries.forEach((entry) => {
  rollup.rollup({
    entry: entry.entry,
    plugins: plugins,
    external: ['rx', 'react', 'prop-types', 'react-dom'],
    globals: {
      rx: 'Rx',
      react: 'React',
      'react-dom': 'ReactDOM',
    },
  })
  .then(
      (bundle) => bundle.write({
        format: 'umd',
        moduleName: entry.moduleName,
        dest: entry.entry.replace('src', 'lib'),
      }),
      (error) => {
        console.error(error)
      }
  )
});
