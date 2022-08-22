const path = require('path');

module.exports = {
  entry: './src/tree2d.ts',
  // 打开后将source map一块打包，方便调试
  devtool: 'source-map',
  mode: "development",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'tree2d.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      type: 'umd',
    },
  },
};