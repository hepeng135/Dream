vue的原型方法 $watch

源文件路径 ： src/core/instance/state.js

参数列表
@params expOrFn:表示观察的表达式，通常为一个对象的key，或者通过函数返回这个对象的key
@params cb:当前观察的回调函数, 类型为函数 或者  一个 Object
@params ： 配置项   deep：对象深度监听  或者   immediate：立即回调


```
Vue.prototype.$watch = function (expOrFn,cb，options){
    const vm: Component = this
    //检测当前回调函数是不是一个对象json
    if (isPlainObject(cb)) {
        return createWatcher(vm, expOrFn, cb, options)
    }
    options = options || {}
    options.user = true  //当回调函数不是对象时，user为true
    const watcher = new Watcher(vm, expOrFn, cb, options)
    if (options.immediate) { //当配置呢immediate时，直接调用回调
        try {
            cb.call(vm, watcher.value)
        } catch (error) {
            handleError(error, vm, `callback for immediate watcher "${watcher.expression}"`)
        }
    }
    //返回一个取消当前watch的函数
    return function unwatchFn () {
        watcher.teardown()
    }
}

```

Vue实例时的watch选项

1.Vue原型方法_init(初始化阶段)调用initState。
2.在initState中会调用initWatch初始化Watch选项。

```
function initWatch (vm: Component, watch: Object) {
    //循环watch这个对象
    for (const key in watch) {
        const handler = watch[key]
        //判断当前这个watcher选项是不是数组
        if (Array.isArray(handler)) {
            for (let i = 0; i < handler.length; i++) {
                createWatcher(vm, key, handler[i])
            }
        } else {
            createWatcher(vm, key, handler)
        }
    }
}
function createWatcher(vm,expOrFn,handler,options){
    if (isPlainObject(handler)) {
        options = handler
        handler = handler.handler
    }
    if (typeof handler === 'string') {
        handler = vm[handler]
    }
    return vm.$watch(expOrFn, handler, options)
}

```