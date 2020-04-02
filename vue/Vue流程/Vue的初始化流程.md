## Vue的初始化流程
我们通过断点对下面这段程序进行分析，看看vue到底干呢些什么事

```
 var  vm=new Vue({
     el:'.app',
     data:{
         message:'111'
     }
 })
```

**1:首先进入Vue构造函数，如下**

文件路径：/src/core/instance/index.js

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
通过上面的代码很明显接下来会执行 this._init(options) ，看这个_init应该挂载Vue的原型上
通过命名猜测主要做一些options的初始化工作,接下来我们具体看看

我们将进入文件：\src\core\instance\init.js去看看Vue.prototype._init具体代码
```
export function initMixin (Vue: Class<Component>) {
  Vue.prototype._init = function (options?: Object) {
    const vm: Component = this
    // a uid
    vm._uid = uid++
    vm._isVue = true
    // merge options
    if (options && options._isComponent) {
      initInternalComponent(vm, options)
    } else {
      //整合option选项
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
      )
    }
   
    // expose real self
    vm._self = vm

    initLifecycle(vm)//初始化生命周期
    initEvents(vm)//初始化事件
    initRender(vm)//初始化渲染器，（生成render函数，既虚拟dom）
    callHook(vm, 'beforeCreate')//调用生命周期钩子beforeCreat之前已经初始化的生命周期、初始化事件、初始化渲染器（生成虚拟dom）
    initInjections(vm) // resolve injections before data/props//在data和props之前注入inject。
    initState(vm)//初始化状态
    initProvide(vm) // resolve provide after data/props//
    callHook(vm, 'created')

    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }
}
```




