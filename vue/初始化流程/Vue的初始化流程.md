## Vue的初始化流程
我们通过断点对下面这段程序进行分析，看看vue到底干呢些什么事


###1:首先进入Vue构造函数，如下

文件路径：/src/core/instance/index.js

#### 主要代码分析

1:创建Vue的构造函数，并调用_init这个原型方法进行初始化

2:initMixin(Vue)，向Vue原型上添加_init方法,<a href="../Vue原型链上的方法/_init.md">查看_init方法的详情</a>

3:
>
主要代码如下（已省略部分）：

```
function Vue (options) {
  this._init(options)
}
initMixin(Vue)
stateMixin(Vue)
eventsMixin(Vue)
lifecycleMixin(Vue)
renderMixin(Vue)
export default Vue
```






