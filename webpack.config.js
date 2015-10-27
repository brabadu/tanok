module.exports = {
    entry: {
      main: "./main.js"
    },
    output: {
        path: __dirname,
        filename: "[name].bundle.js"
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: "style!css" },
            {
              test: /\.jsx?$/,
              exclude: /(node_modules|bower_components)/,
              loader: 'babel'
            }
        ]
    }
};
