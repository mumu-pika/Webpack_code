const path = require("path") // node js 核心模块，专门用来处理路径问题
const os = require("os");

// 引入ESlint插件
const ESLintPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

// 引入内置Terser插件
const TerserWebpackPlugin = require('terser-webpack-plugin');

// 引入无损压缩插件
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");
const { assert } = require("console");

// 引入preload预加载插件
const PreloadWebpackPlugin = require('@vue/preload-webpack-plugin');

// 引入workbox插件
const WorkboxPlugin = require('workbox-webpack-plugin');

const threads = os.cpus().length; //CPU核数

// 封装用来获取处理样式的loader
function getStyleLoader(pre) {
  return [
    // use 的执行顺序： 从右到左（或者从下到上）
    // 'style-loader', //将js中css通过创建style标签添加到html文件中生效
    MiniCssExtractPlugin.loader, //提取css为单独的文件
    'css-loader', //将css资源编译成commonjs的模块到js中
    {
      loader: "postcss-loader",
      options: {
        postcssOptions: {
          plugins: [
            "postcss-preset-env", //能解决大多数样式兼容问题
          ]
        }
      }
    },
    pre
  ].filter(Boolean)  //过滤掉空的，比如undefined
}

module.exports = {
  // 入口
  entry: "./src/main.js",  //相对路径，默认值为 ./src

  // 输出
  output: {
    // __dirname node.js的变量，代表当前文件夹目录
    //文件输出路径，需要写绝对路径，默认值为 ./dist
    path: path.resolve(__dirname, "../dist"),
    // 文件名
    filename: 'static/js/[name].js', //webpack bundle的名称
    clean: true, //自动清空, 原理: 在打包前，path整个内容清空，再进行打包
    // 给打包输出的其他文件命名
    chunkFilename: 'static/js/[name].chunk.js',
    // 对静态资源的文件统一命名
    // 图片、字体等通过type:asset处理资源命名方式
    assetModuleFilename: "static/media/[hash:10][ext][query]"
  },

  // 加载器
  module: {
    rules: [
      {
        oneOf: [
          // loader的配置
          {
            test: /\.css$/,   //只检测.css文件
            use: getStyleLoader()
          },
          {
            test: /\.less$/,
            // loader: xxx, //loader 只能使用一个loader，而use可以使用多个loader
            use: getStyleLoader("less-loader")
          },
          {
            test: /\.s[ac]ss$/,  //这里sass 和 scss 都可
            use: getStyleLoader("sass-loader")
          },
          {
            test: /\.styl$/, //
            use: getStyleLoader("stylus-loader")
          },
          {
            test: /\.png|jpe?g|gif|webp|svg$/,
            type: 'asset',
            parser: {
              dataUrlCondition: {
                // 如果模块源大小小于 maxSize然后模块将作为 Base64 编码的字符串注入到包中，否则模块文件将被发送到输出目录
                maxSize: 10240 // 文件不超过10kb
              }
            },
            // generator: {
            //   publicPath: '/dist/', //公共路径，会从这个路径之后去找对应的图片文件
            //   // filename: 'static/images/[hash:10][ext][query]'
            // }
          },
          {
            test: /\.(ttf|woff2?|mp3|mp4|avi)$/,
            type: 'asset/resource',  //不会转为base64
            // generator: {
            //   publicPath: '/dist/', //公共路径，会从这个路径之后去找对应的图片文件
            //   filename: 'static/media/[hash:10][ext][query]'
            // }
          },
          {
            test: /\.js$/,
            exclude: /(node_modules)/,  // 排除文件不处理
            use: [
              {
                loader: 'thread-loader',
                options: {
                  works: threads,  // 进程数量
                }
              },

              {
                loader: 'babel-loader',
                // 这里配置写在babel.config.js里了
                // options: {
                //   presets: ['@babel/preset-env']
                // }
                options: {
                  // presets: ['@babel/preset-env']  // 这里预设配置写在babel.config.js里了
                  cacheDirectory: true, //开启babel缓存
                  cacheCompression: false, //关闭缓存的压缩， 因为压缩需要时间，为了极致的速度，可以不需要压缩
                  plugins: ["@babel/plugin-transform-runtime"]
                }
              }
            ]
          }
        ]
      }
    ]
  },

  // 插件， 插件中是构造函数，需要new调用
  plugins: [
    // plugins的配置
    new ESLintPlugin({
      context: path.resolve(__dirname, '../src'),  // context指定需要检查的文件，指示文件根目录的字符串
      cache: true, //开启缓存
      cacheLocation: path.resolve(__dirname, '../node_modules/.cache/eslintcache'),
      threads, //开启多进程和进程数量
    }),
    new HtmlWebpackPlugin({
      // 模板，以public/index.html文件创建新的html文件
      // 新的html文件特点：1、结构和原来一致，2、自动引入打包输出的资源
      template: path.resolve(__dirname, "../public/index.html")
    }),
    new MiniCssExtractPlugin({
      filename: 'static/css/[name].css',
      chunkFilename: 'static/css/[name].chunk.css'
    }),
    // 压缩图片
    new ImageMinimizerPlugin({
      minimizer: {
        implementation: ImageMinimizerPlugin.imageminGenerate,
        options: {
          plugins: [
            ["gifsicle", { interlaced: true }],
            ["jpegtran", { progressive: true }],
            ["optipng", { optimizationLevel: 5 }],
            [
              "svgo",
              {
                plugins: [
                  "preset-default",
                  "prefixIds",
                  {
                    name: "sortAttrs",
                    params: {
                      xmlnsOrder: "alphabetical",
                    }
                  }
                ]
              }
            ]
          ]
        }
      },
    }),

    new PreloadWebpackPlugin({
      // js文件采用preload方式去加载，作为script标签的优先级去做，如果希望优先级最高，as可以改为style，但是这里改styLe文件解析会出问题
      // rel: 'preload',
      // as: 'script',
      rel: 'prefetch'
    }),
    new WorkboxPlugin.GenerateSW({
      // 这些选项帮助 ServiceWorkers 快速启用
      // 不允许遗留任何“旧的” ServiceWorkers
      clientsClaim: true,
      skipWaiting: true,
      swDest: './sw.js'  //指定输出路径
    })

  ],

  optimization: {
    // 压缩的操作
    minimizer: [
      // 一般放置压缩的东西
      // 压缩css
      new CssMinimizerPlugin(),
      // 压缩js
      new TerserWebpackPlugin({
        parallel: threads, //开启多进程和设置进程数量
      })
    ],
    // 代码分割配置
    splitChunks: {
      chunks: "all",
      // 其他用默认值

    },
    // 运行时输出的chunk, 能够解除js文件的深度依赖，当改了一个js文件，其他依赖这个js文件的文件不会因此改变，还会继续使用缓存
    runtimeChunk: {
      name: entrypoint => `runtime~${entrypoint.name}.js`,

    }
  },

  // 开发服务器. 不会输出资源， 在内存中编译打包的
  // devServer: {
  //   host: "localhost", //启动服务器域名
  //   port: "3000", //启动服务器端口号
  //   open: true, //是否自动打开浏览器
  // },

  // 生产模式不需要devServer
  // 模式
  mode: "production",
  devtool: "source-map"  // 源代码映射
}