/** 
 * Webpack is a packer of code to web projects, as the 
 * browserify. Which it proposes to do the diference and
 * focus in modules of the application.
 * 
 * @see https://tableless.com.br/introducao-ao-webpack/
 * @see https://webpack.github.io/docs/motivation.html
 * ------------------------------------------------------
 */
var webpack = require("webpack");
var path = require("path");
var Dotenv = require('dotenv-webpack');
var glob = require('glob');
var svgToMiniDataURI = require('mini-svg-data-uri');

var minimizeOptions = JSON.stringify({
  removeComments: true,
  removeCommentsFromCDATA: true,
  collapseWhitespace: true,
  conservativeCollapse: false,
  preserveLineBreaks: true,
  removeEmptyAttributes: true,
  keepClosingSlash: true
});

var plugins = [
  new webpack.DefinePlugin({
    'process.env.API_SERVER': "'http://localhost:7000/'"
  }),
  new Dotenv({
    path: './.env', 
    safe: false
  }),
  new webpack.LoaderOptionsPlugin({
    debug: true
  }),
  new webpack.ProvidePlugin({
    moment: "moment",
    "window.moment": "moment",
    $: "jquery",
    "window.jQuery": "jquery"
  }),
  new webpack.SourceMapDevToolPlugin({
    filename: '[name].js.map'
  })
];

var appEntry = [
  './src/app/module.js', 
  './src/app/index.js',
  './src/assets/libs/jquery.dataTables.min',
  './src/assets/libs/angular-daterangepicker',
  'fullcalendar/dist/fullcalendar.js',
  //'./src/assets/libs/fullcalendar-resources.js',
  'angular-toasty/dist/angular-toasty',
  'angular-tour/dist/angular-tour',
  'ng-device-detector/ng-device-detector',
  'ngSweetAlert/SweetAlert',
  're-tree/re-tree',
  'angular-chart.js/dist/angular-chart',
  'angular-ui-calendar/src/calendar',
  'angular-promise-buttons/dist/angular-promise-buttons',
  'ngletteravatar/ngletteravatar',
  'angulartics/dist/angulartics.min',
  'angulartics-google-analytics/dist/angulartics-ga.min'
]
.concat(glob.sync('./src/views/*.html'))
.concat(glob.sync('./src/app/controllers/**/*.js'))
.concat(glob.sync('./src/app/directives/**/*.js'))
.concat(glob.sync('./src/app/filters/**/*.js'))
.concat(glob.sync('./src/app/modals/**/*.js'))
.concat(glob.sync('./src/app/pages/**/*.js'))
.concat(glob.sync('./src/app/resources/**/*.js'))
.concat(glob.sync('./src/app/factories/**/*.js'))
.concat(glob.sync('./src/app/services/**/*.js'))
.concat(glob.sync('./src/app/modals/**/*.html'))
.concat(glob.sync('./src/app/pages/**/*.html'));

module.exports = {
  mode: 'development',

	// Plugins
  plugins: plugins,

  /**
   * SourceMapDevToolPlugin was set up on plugins 
   * 
   * @see https://webpack.js.org/configuration/devtool/
   */ 
  devtool: false,
  
  optimization: {
    minimize: false
  },

  /**
   * Resove extensões e caminhos dos modulos
   * 
   * @see https://github.com/webpack/webpack.js.org/issues/68
   */
  resolve: {
    modules: [path.resolve(__dirname, 'src'), 'node_modules', 'bower_components'],
    extensions: ['.js', '.json', '.css', '.less', '.html'],
    descriptionFiles: ['package.json', 'bower.json']
  },

  // Arquivos de entradas e saida para empacotamento
  entry: {
  	styles: [
			'angular-datatables/dist/css/angular-datatables.min.css',
			'fullcalendar/dist/fullcalendar.min.css',
			'angular-busy/dist/angular-busy.min.css',
			'angular-tooltips/dist/angular-tooltips.css',
			'angular-loading-bar/build/loading-bar.min.css',
			'sweetalert/dist/sweetalert.css',
			'angular-toasty/dist/angular-toasty.min.css',
			'angular-tour/dist/angular-tour.css',
			'bootstrap-daterangepicker/daterangepicker.css',
			'./src/less/style'
  	],
  	app: appEntry
  },
  output: {
    path: path.resolve(__dirname, 'build'), // This ensure absolute path
    filename: `[name].bundle-development.js`
  },

  // Configura um servidor http
  devServer: {
    inline: true,
    port: 7000,
    publicPath: '/dist',
    compress: true,
    index: 'index.html',
    overlay: true,
    writeToDisk: true
  },

  // Transulação dos arquivos JSX
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      { test: /\.css$/, use: [{ loader: "style-loader" }, { loader: "css-loader" }] },
      { test: /\.less$/, use: [{ loader: "style-loader" }, { loader: "css-loader"  }, { loader: "less-loader" }] },
      { test: /\.png$/, use: [{ loader: 'url-loader?name=img/[name].[ext]&mimetype=image/png' }] },
      { test: /\.jpg/, use: [{ loader: 'url-loader?name=img/[name].[ext]&mimetype=image/jpg' }] },
      { test: /\.html$/, use: [{ loader: 'ng-cache-loader?minimizeOptions=' + minimizeOptions + '&conservativeCollapse' }] },
      {
        test: /\.svg$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              generator: function (content) {
                return svgToMiniDataURI(content.toString())
              }
            }
          }
        ],
      }
    ]
  }
};