import count from './js/count.js'
import sum from './js/sum.js'

// 完整引入
// import 'core-js'  // 引入core-js做兼容处理

// 按需引入
// import 'core-js/es/promise'

// 引入该资源，才能让webpack打包该资源
import "./css/index.css"
import "./less/index.less"


// 引入sass资源
import "./sass/index.sass"
import "./sass/index.scss"

// 引入stylus资源
import "./stylus/index.styl"

// 引入字体资源
import "./css/iconfont.css"

// document.getElementById('btn').onclick = function () {
//   // eslint 不能识别动态导入语法，需要额外追加配置
//   // webpackChunkName: "math"   webpack特殊命名规则
//   import(/*webpackChunkName: "math" */'./js/mul.js').then(({ mul }) => {
//     console.log(mul(2, 6));
//   })
// }

// var result = count(2, 1) //eslint测试

console.log(count(2, 1))
console.log(sum(1, 2, 3))


new Promise((resolve) => {
  setTimeout(() => {
    resolve()
  }, 1000)
})

const arr = [1, 2, 3, 4]
console.log(arr.includes(1))

// 注册serviceworker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('SW registered: ', registration);
    }).catch(registrationError => {
      console.log('SW registration failed: ', registrationError);
    });
  });
}