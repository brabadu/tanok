path = require('path')

module.exports = {
    entry: {
      main: "./main.js",
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
