# initMixin(Vue)  做以下的事情
### initLifeCyle   src/core/instance/lifecycle.js

把组件实例里的常用属性初始化，比如$parent、$root、$children、$refs.

```
export function initLifecycle (vm: Component) {
  const options = vm.$options

  // locate first non-abstract parent
  let parent = options.parent
  if (parent && !options.abstract) {
    while (parent.$options.abstract && parent.$parent) {
      parent = parent.$parent
    }
    parent.$children.push(vm)
  }
  //判断是否有父级。
  vm.$parent = parent
  vm.$root = parent ? parent.$root : vm

//初始化$children与$refs，  思考什么时候放东西进行。
  vm.$children = []
  vm.$refs = {}

  vm._watcher = null
  vm._inactive = null
  vm._directInactive = false
  vm._isMounted = false
  vm._isDestroyed = false
  vm._isBeingDestroyed = false
}

```

### initEvents  src/core/instance/initEvents.js

父组件传递需要处理的事件。

```
function initEvents (vm: Component) {
  vm._events = Object.create(null)
  vm._hasHookEvent = false
  // 获取父组件的事件。
  const listeners = vm.$options._parentListeners
  if (listeners) {
    updateComponentListeners(vm, listeners)
  }
}
```
主要解决$emit处理的事件，首先“com”组件用$emit分发的事件comEvent是在当前“com”这个组件中触发，下面的列子这个事件定义在com的父级，所以我们需要从父级去获取对应的事件。  
```
//com组件
this.$emit('comEvent');
//调用com组件
<com @comEvent="doSomething"></com>

```
### initRenders  src/core/instance/render.js

初始化渲染器,主要处理插槽  $slots  $scopedSlots
createEelement的声明，声明到这个组件上
$attr,$listenters的响应化。

```
function initRender (vm: Component) {
  vm._vnode = null // the root of the child tree
  vm._staticTrees = null // v-once cached trees
  const options = vm.$options
  const parentVnode = vm.$vnode = options._parentVnode // the placeholder node in parent tree
  const renderContext = parentVnode && parentVnode.context
  vm.$slots = resolveSlots(options._renderChildren, renderContext)
  vm.$scopedSlots = emptyObject
  // bind the createElement fn to this instance
  // so that we get proper render context inside it.
  // args order: tag, data, children, normalizationType, alwaysNormalize
  // internal version is used by render functions compiled from templates
  vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false)
  // normalization is always applied for the public version, used in
  // user-written render functions.
  vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true)

  // $attrs & $listeners are exposed for easier HOC creation.
  // they need to be reactive so that HOCs using them are always updated
  const parentData = parentVnode && parentVnode.data
}
```


# stateMixin(Vue) 做以下的事情
定义$data,$props两个实例属性和$set,$delete,$watch三个实例方法，

core/instance/state.js

# eventsMixin(Vue) 
实现事件相关实例api，如：$on,$emit,$off,$once,

core/instance/events.js

# lifecycleMixin(Vue)
实现组件生命周期相关的三个核心api：_update,$forceUpdate,$destroy

src/core/instance/lifecycle.js

_update  是组件更新周期中的关键方法，组件触发更新该函数就会调用，它执行vnode的diff和path等操作。

# renderMixin(Vue)
 $nextTice  _render(生成虚拟dom)

# 数据响应式
  vue最大的特点是数据响应式，数据的变化会作用于UI而不用进行DOM操作。原理上来讲，是利用js语言特性Object.defineProperty()，通过定义对象属性setter方法拦截对象属性的变更，从而将数值的变化转换为UI的变化。

  具体实现是在VUe初始化时会调用initState,它会初始化data，props等，这里重点关注data初始化，

  src/core/instance/state.js

  ```
  function initState(vm : Component){
    if(opts.data){
      initData(vm)//初始化数据
    }else{
      Observe(vm._data={},true)
    }
  }

  ```
  initData核心代码是将data数据响应化。


  vue中的数据响应化使用呢观察者模式

1：defineReactive中的getter和setter对应着订阅和发布行动

2：Dep的角色相当于主题Subject,维护订阅、通知观察者更新。

3：Watcher的角色相当于观察者Observer,执行更新

4：但是vue中的Observer不是上面说的观察者，他和data中对象一一对应，有内嵌的对象就会有childObserver与之对应。


vue在做更新中是异步更新，将所有更新加入一个队列，在下一次更新操作时，一次批量进行更新。



# vue中数组的响应化 
 可以响应的方法，push pop shift unshift splice sort reverse  ,

 为数组原型中的7个方法定义拦截器   src/core/observer/array.js



# vue异步更新队列

  vue在更新DOM时是异步执行党的，只要侦听到数据变化，vue将开启一个队列，并缓冲在同一事件循环中发生的所有数据变更，如果同一个watcher被多次触发，只会被推入到队列一次，这种在缓冲时去除重复数据对于避免不必要的计算和DOM操作是非常重要的，然后在下一个事件循环tick中，vue刷新队列并执行实际（已去重的）工作。vue内部对异步队列尝试使用原生的Promise.then、MutationObserver和setImmediate,如果执行环境不支持，则采用setTimeout(fn,0)代替。
