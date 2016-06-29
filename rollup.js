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
    entry: 'src/mixin.js',
    moduleName: 'tanokMixin',
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
    "presets": [ "stage-0", "es2015-rollup", "react" ],
    "plugins": [ "transform-decorators-legacy", "transform-object-rest-spread" ],
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
