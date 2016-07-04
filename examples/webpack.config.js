path = require('path')
var PROJECT_DEPS = process.env.PROJECT_DEPS || __dirname;

module.exports = {
    entry: {
      main: "./main.js",
    },
    output: {
        path: __dirname,
        pathinfo: true,
        filename: "./[name].bundle.js"
    },
    resolve: {
        root: path.resolve(PROJECT_DEPS, '../node_modules'),
    },
    module: {
        loaders: [
          {
            test: /\.jsx?$/,
            loader: 'babel-loader',
            exclude: /node_modules|lib/,
            query: {
                presets: ['es2015',  "stage-0", 'react'],
                plugins: [ //"external-helpers-2",
                "transform-runtime",
                "transform-decorators-legacy", "transform-object-rest-spread" ]
            }
          }
        ]
    }
};
