#### 函数的作用
1：mergeOptions(resolveConstructorOptions(vm.constructor)，options，vm)  初始化options
   >* resolveConstructorOptions 获取当前父组件的options。<a href="">查看resolveConstructorOptions函数详情</a>
   >* mergeOptions：将parent与child(当前组件)的options进行合并。<a href="../Vue中的一些函数/mergeOptions.md">查看mergeOptions函数详情</a>
   
  合并的属性将挂载到当前实例的$options属性上

2:initLifecycle(vm)，初始化当前组件实例上的一些属性，<a href="../初始化流程/初始化过程中的一些函数/initLifecycle初始化一些属性.md">查看initLifecycle方法的详情</a>

3:initEvents(vm),初始化事件,$emit触发与$on兼容的自定义事件<a href="../初始化流程/初始化过程中的一些函数/initEvents初始化事件($emit,$on等).md">查看initEvents方法的详情</a>

4:initRender(vm),初始化渲染器<a href="../初始化流程/初始化过程中的一些函数/initRender初始化渲染.md">查看initRender方法的详情</a>

5:callHook(vm, 'beforeCreate'),调用生命周期的构造函数beforeCreate。

6:initInjections(vm) 初始化inject/provide，确定inject中key对应的provide中的值，并将key添加到当前组件的实例上并添加getter和setter

7：initState(vm) 初始化props，methods，data，computed,watch这些选项。


```

Vue.prototype._init = function (options?: Object) {
    const vm: Component = this
    
    vm._uid = uid++
    let startTag, endTag
    vm._isVue = true
   
    //这个应该是判断当前是否组件？  猜测
    if (options && options._isComponent) {
      initInternalComponent(vm, options)
    } else {

      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
      )
    }
  
    //实例上挂载_self属性指向当前实例
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