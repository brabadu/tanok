const path = require('path')
const rollup = require('rollup')
const babel = require('rollup-plugin-babel')
const commonjs = require('rollup-plugin-commonjs')
const nodeResolve = require('rollup-plugin-node-resolve')

const peerDependencies = Object.keys(require('./package.json').peerDependencies)

const entries = [
  {
    entry: 'src/core.js',
    moduleName: 'core',
  },
  {
    entry: 'src/tanok.js',
    moduleName: 'tanok',
  },
  {
    entry: 'src/helpers.js',
    moduleName: 'tanokHelpers',
  },
  {
    entry: 'src/decorators.js',
    moduleName: 'tanokDecorators',
  },
  {
    entry: 'src/streamWrapper.js',
    moduleName: 'tanokStreamWrapper',
  },
  {
    entry: 'src/component.js',
    moduleName: 'tanokComponent',
  },
]
const external = entries.map((p) => path.resolve(p.entry))
const plugins = [
  babel({
    "presets": [ "es2015-rollup", "stage-0", "react" ],
    "plugins": [ "transform-decorators-legacy", "transform-object-rest-spread" ],
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
    external: external,
    plugins: plugins,
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
