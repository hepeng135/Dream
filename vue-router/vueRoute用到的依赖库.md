## [path-to-regExp](https://github.com/pillarjs/path-to-regexp)
安装：npm install path-to-regexp --save
作用：转换路径字符串，例如/user/:name变成正则表达式

使用
```
const { pathToRegexp, match, parse, compile } = require("path-to-regexp");

// pathToRegexp(path, keys?, options?)
// match(path)
// parse(path)
// compile(path)

```
#### pathToRegexp
参数列表
* path:路径字符串，字符串数组，或正正则表达式
* key:用路径中找到的键值填充的数组
* options 选项配置
    * sensitive[Boolean]: true将区分大小写，默认值为false
    * strict [Boolean]: true不允许可选的尾部分隔符匹配， 默认值false
    * end  [Boolean]: true将匹配字符串的末尾， 默认值true
    * start  [Boolean]: true将从字符串的开头开始匹配 ，默认值true
    * delimiter [String] : 默认分隔符 ， 默认值为 '/#?'
    * endsWith :可选字符或字符列表，作为结束字符处理
    * encode : 在插入前对字符串进行编码的函数 如 encodeComponentURI
    * prefixes: 用于在解析时自动考虑前缀的字符列表 默认值./
    
eg
```
const keys = [];
const regexp = pathToRegexp("/foo/:bar", keys);
// regexp = /^\/foo(?:\/([^\/#\?]+?))[\/#\?]?$/i
// keys = [{ name: 'bar', prefix: '/', suffix: '', pattern: '[^\\/#\\?]+?', modifier: '' }]

```
