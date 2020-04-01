

```

Vue.prototype._init = function (options?: Object) {
    const vm: Component = this
    
    vm._uid = uid++
    let startTag, endTag
    vm._isVue = true
   
    if (options && options._isComponent) {
      initInternalComponent(vm, options)
    } else {
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
      )
    }
  
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


```