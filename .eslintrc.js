module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/essential',
    '@vue/standard'
  ],
  parserOptions: {
    parser: 'babel-eslint'
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'space-before-function-paren': 0, // 函数参数前面要加空格
    'space-before-blocks': 0, // 函数块前面要加空格
    semi: 0, // 分号检查
    "no-irregular-whitespace": "off", // 这禁止掉 空格报错检查
    quotes: [0, "single"]
  }
}
