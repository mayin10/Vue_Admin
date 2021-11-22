module.exports = {
  root: true,
  env: {
    node: true
  },
  plugins: [
 
      'vue'
    ],
  extends: [
    'plugin:vue/essential',
    //'@vue/standard'
  ],
  parserOptions: {
    parser: 'babel-eslint'
  },
  rules: {
     "unexpected-character-in-attribute-name": 'off',
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    "vue/no-parsing-error": [
          2,
          {
            "unexpected-solidus-in-tag": false
          }
        ],
  }
}
