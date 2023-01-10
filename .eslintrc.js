module.exports = {
  // 继承ESlint 规则
  extends: ["eslint:recommended"],
  // 环境变量
  env: {
    node: true, // 启用node中全局变量
    browser: true, // 启用浏览器中全局变量， 比如window, console
  },
  parserOptions: {
    ecmaVersions: 6, // es6
    ecmaVersion: 2015,
    sourceType: "module", // es module
  },
  rules: {
    "no-var": 2 // 不能使用 var 定义变量, 2表示error
  },
  plugins: ["import"], //解决动态导入语法报错
};