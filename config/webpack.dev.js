const path = require('path') // node js 核心模块，专门用来处理路径问题

// 引入ESlint插件
const ESLintPlugin = require('eslint-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
module.exports = {
  // 入口
  entry: './src/main.js', //相对路径，默认值为 ./src

  // 输出
  output: {
    // __dirname node.js的变量，代表当前文件夹目录
    //文件输出路径，需要写绝对路径，默认值为 ./dist
    // path: path.resolve(__dirname, "../dist"),
    path: undefined, //开发模式下没有输出，所以path是undefined
    // 文件名
    filename: 'static/js/main.js', //webpack bundle的名称
    clean: true, //自动清空, 原理: 在打包前，path整个内容清空，再进行打包
  },

  // 加载器
  module: {
    rules: [
      // loader的配置
      {
        // 每个文件只能被其中一个loader配置处理
        oneOf: [
          // loader的配置
          {
            test: /\.css$/, //只检测.css文件
            use: [
              // use 的执行顺序： 从右到左（或者从下到上）
              'style-loader', //将js中css通过创建style标签添加到html文件中生效
              'css-loader', //将css资源编译成commonjs的模块到js中
            ],
          },
          {
            test: /\.less$/,
            // loader: xxx, //loader 只能使用一个loader，而use可以使用多个loader
            use: [
              {
                loader: 'style-loader', // creates style nodes from JS strings
              },
              {
                loader: 'css-loader', // translates CSS into CommonJS
              },
              {
                loader: 'less-loader', // compiles Less to CSS
              },
            ],
          },
          {
            test: /\.s[ac]ss$/, //这里sass 和 scss 都可
            use: [
              {
                loader: 'style-loader',
              },
              {
                loader: 'css-loader',
              },
              {
                loader: 'sass-loader', // 将sass编译成css文件
              },
            ],
          },
          {
            test: /\.styl$/, //
            use: [
              'style-loader',
              'css-loader',
              'stylus-loader', // 将stylus 编译成css文件
            ],
          },
          {
            test: /\.png|jpe?g|gif|webp|svg$/,
            type: 'asset',
            parser: {
              dataUrlCondition: {
                // 如果模块源大小小于 maxSize然后模块将作为 Base64 编码的字符串注入到包中，否则模块文件将被发送到输出目录
                maxSize: 10240, // 文件不超过10kb
              },
            },
            generator: {
              publicPath: '/dist/', //公共路径，会从这个路径之后去找对应的图片文件
              filename: 'static/images/[hash:10][ext][query]',
            },
          },
          {
            test: /\.(ttf|woff2?|mp3|mp4|avi)$/,
            type: 'asset/resource', //不会转为base64
            generator: {
              publicPath: '/dist/', //公共路径，会从这个路径之后去找对应的图片文件
              filename: 'static/media/[hash:10][ext][query]',
            },
          },
          {
            test: /\.js$/,
            exclude: /(node_modules)/, // 排除文件不处理
            // include: path.resolve(__dirname, '../src'),  //只处理src下的文件，其他文件不处理
            use: {
              loader: 'babel-loader',

              options: {
                // presets: ['@babel/preset-env']  // 这里预设配置写在babel.config.js里了
                cacheDirectory: true, //开启babel缓存
                cacheCompression: false, //关闭缓存的压缩， 因为压缩需要时间，为了极致的速度，可以不需要压缩
                plugins: ['@babel/plugin-transform-runtime'],
              },
            },
          },
        ],
      },
    ],
  },

  // 插件， 插件中是构造函数，需要new调用
  plugins: [
    // plugins的配置
    new ESLintPlugin({
      context: path.resolve(__dirname, '../src'), // context指定需要检查的文件，指示文件根目录的字符串
    }),
    new HtmlWebpackPlugin({
      // 模板，以public/index.html文件创建新的html文件
      // 新的html文件特点：1、结构和原来一致，2、自动引入打包输出的资源
      template: path.resolve(__dirname, '../public/index.html'),
    }),
  ],

  // 开发服务器. 不会输出资源， 在内存中编译打包的
  devServer: {
    host: 'localhost', //启动服务器域名
    port: '3000', //启动服务器端口号
    open: true, //是否自动打开浏览器
  },

  // 模式
  mode: 'development',
  devtool: 'cheap-module-source-map',
}
