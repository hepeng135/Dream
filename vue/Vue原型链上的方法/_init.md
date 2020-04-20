
初始化，主要做以下事情
1：生产唯一标识_uid,挂载到当前的组件实例上
2：初始化组件的生命周期，详情请查看
3：初始化组件的事件，详情请查看
4：初始化渲染器，生成render函数，既虚拟DOM
5：调用生命周期钩子beforeCreate函数
6：处理inject
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