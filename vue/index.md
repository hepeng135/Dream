
## Vue.prototype._init(组件初始化)

#### 1. 将子构造函数的options与父构造函数的options进行合并。

```
if (options && options._isComponent) {
    // optimize internal component instantiation
    // since dynamic options merging is pretty slow, and none of the
    // internal component options needs special treatment.
    initInternalComponent(vm, options)
} else {
    //resolveConstructorOptions：将原型链上所有的构造函数options进行合并。
    //
    vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
    )
}


```
#### 2. 初始化生命周期,每个组件在实例时都需要去调用该函数，初始化以下属性，并挂载到当前组件的实例上
* parent.$children.push(vm)  为当前组件的父级创建子集集合，都排除vue内部组件
* vm.$parent   为当前组件实例添加$parent属性，指向当前组件的父级（不会为Vue的内部组件）。
* vm.$root    为当前的组件添加$root,指向当前组件的根组件（祖先组件）。
* vm.$children 为当前组件添加$children，指向当组件的子组件集合
* vm.$refs  为当前组件添加$refs，指向当前组件中注册过ref自定义属性的DOM元素和子组件实例
* vm._watcher=null
* vm._inactive=null
* vm._directInactive=false
* vm._isMounted=false
* vm._isDestroyed=false
* vm._isBeingDestroyed=false

```
initLifecycle(vm)
```

#### 3. initEvents 初始化事件，父组件中运用$on定义的事件，需要在子组件中处理。

```
    vm._events = Object.create(null)
    vm._hasHookEvent = false
    // init parent attached events
    const listeners = vm.$options._parentListeners
    if (listeners) {
        updateComponentListeners(vm, listeners)
    }
```

#### 4. initRender 初始化渲染器，初始化组件的插槽和插槽作用域 $slot $slotScope，vm上挂载创建vnode的函数(createElement),
$attr、$listener响应化。
```
    vm._vnode = null // the root of the child tree
    vm._staticTrees = null // v-once cached trees
    const options = vm.$options
    const parentVnode = vm.$vnode = options._parentVnode // the placeholder node in parent tree
    const renderContext = parentVnode && parentVnode.context
    vm.$slots = resolveSlots(options._renderChildren, renderContext)
    vm.$scopedSlots = emptyObject

    //把createElement函数挂载到当前组件上面。编译器用的。
    vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false)
    //用户编写时使用的渲染函数
    vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true)

    const parentData = parentVnode && parentVnode.data
    
    //$attr $listeners的响应化。
    defineReactive(vm, '$attrs', parentData && parentData.attrs || emptyObject, null, true)
    defineReactive(vm, '$listeners', options._parentListeners || emptyObject, null, true)
```
#### 5. callHook(vm, 'beforeCreate')  调用beforeCreate这个生命周期钩子函数

#### 6. initInjections(vm)  注入(inject)数据的响应化
```
const result = resolveInject(vm.$options.inject, vm)
if (result) {
    //因为inject在定义的时候不存在json中套用json，每个key对应一个String | Number | Boolean
    //既调用toggleObserving将shouldObserver设置为false。
    toggleObserving(false)
    Object.keys(result).forEach(key => {
         defineReactive(vm, key, result[key])
    })
    toggleObserving(true);
}
```
#### 7. initState(vm) 初始化数据状态
* 初始化当前组件的_watchers
* 处理props数据，在vm上
```
vm._watchers = []
const opts = vm.$options
//初始化所有属性
if (opts.props) initProps(vm, opts.props)
//初始化回调函数
if (opts.methods) initMethods(vm, opts.methods)
//数据响应化
if (opts.data) {
    initData(vm)
} else {
    observe(vm._data = {}, true /* asRootData */)
}
//计算属性的初始化
if (opts.computed) initComputed(vm, opts.computed)
//watch的初始化
if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch)
}

```