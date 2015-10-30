module.exports = {
    entry: {
      main: "./main/main.js",
      simple: "./simple/simple.js"
    },
    output: {
        path: __dirname,
        filename: "./[name]/[name].bundle.js"
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
