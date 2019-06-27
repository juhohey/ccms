const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { DefinePlugin } = require('webpack')

module.exports = {
  mode: process.env.NODE_ENV || 'development', // "production" | "development" | "none"
  // Chosen mode tells webpack to use its built-in optimizations accordingly.
  entry: './src/app/index.js', // string | object | array
  // defaults to ./src
  // Here the application starts executing
  // and webpack starts bundling
  output: {
    // options related to how webpack emits results
    path: path.resolve(__dirname, 'public/assets/'), // string
    // the target directory for all output files
    // must be an absolute path (use the Node.js path module)
    filename: 'cms.bundle.js' // string
  },
  plugins: [
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: '[name].css',
      chunkFilename: '[id].css'
    }),
    new DefinePlugin({
      '__REACT_DEVTOOLS_GLOBAL_HOOK__': '({ isDisabled: true })'
    })
  ],
  module: {
    // configuration regarding modules
    rules: [
      // rules for modules (configure loaders, parser options, etc.)
      {
        test: /\.jsx?$/,
        include: [
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, 'cms')
        ],
        loader: 'babel-loader',
        resolve: {
          extensions: ['.js', '.jsx']
        },
        options: {
          presets: ['@babel/preset-react'],
          plugins: [
            '@babel/plugin-proposal-class-properties',
            '@babel/plugin-syntax-dynamic-import'
          ]
        }
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              // you can specify a publicPath here
              // by default it uses publicPath in webpackOptions.output
              publicPath: '../',
              hmr: process.env.NODE_ENV === 'development'
            }
          },
          'css-loader'
        ]
      }
    ]
  },

  devtool: 'source-map', // enum
  // enhance debugging by adding meta info for the browser devtools
  // source-map most detailed at the expense of build speed.
  context: __dirname, // string (absolute path!)
  // the home directory for webpack
  // the entry and module.rules.loader option
  //   is resolved relative to this directory
  target: 'web', // enum
  // // Don't follow/bundle these modules, but request them at runtime from the environment
  // serve: { // object
  //   port: 1337,
  //   content: './public/assets'
  //   // ...
  // },
  // lets you provide options for webpack-serve
  stats: 'errors-only',
  // lets you precisely control what bundle information gets displayed
  devServer: {
    proxy: { // proxy URLs to backend development server
      '/c/api': 'http://localhost:8081',
      '/upload': 'http://localhost:8081',
      '/c/login': 'http://localhost:8081',
      '/c/user': 'http://localhost:8081'
    },
    publicPath: '/assets/',
    contentBase: path.join(__dirname, 'public'), // boolean | string | array, static file location
    compress: true, // enable gzip compression
    historyApiFallback: {
      index: 'index.html'
    },
    hot: true, // hot module replacement. Depends on HotModuleReplacementPlugin
    https: false, // true for self-signed, object for cert authority
    noInfo: true // only errors & warns on hot reload
    // ...
  }
}
