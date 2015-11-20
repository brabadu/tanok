path = require('path')

module.exports = {
    entry: {
      main: "./main/main.js",
      simple: ['babel-polyfill', "./simple/simple.js"],
      two_counters: "./two_counters/two_counters.js",
    },
    output: {
        path: __dirname,
        filename: "./[name]/[name].bundle.js"
    },
    module: {
        loaders: [
          {
            test: /\.jsx?$/,
            loader: 'babel-loader',
            exclude: /node_modules/,
            query: {
                presets: ['es2015', 'react']
            }
          }
        ]
    }
};
