### 介于组件在beforeMount之后mounted之前做的一些操作，

### 前期回顾
通过解析template，我们生成ASTEelement，然后我们创建出render函数，
    
```
    const { render, staticRenderFns } = compileToFunctions(template, {
        outputSourceRange: process.env.NODE_ENV !== 'production',
        shouldDecodeNewlines,//确定当前浏览器属性值换行是否编码   true：表示在IE中,IE中属性值换行会编码
        shouldDecodeNewlinesForHref,
        delimiters: options.delimiters,
        comments: options.comments
    }, this)
    options.render = render
    options.staticRenderFns = staticRenderFns
```

### 下面我们介绍第一次进行组件渲染

* 当render函数生成后,会创建一个updateComponent函数
```
updateComponent = () => {
    vm._update(vm._render(), hydrating)
}
```
* 创建Watcher实例
实例化Watcher，为当前组件创建一个watcher，在这个watcher中，我们做一下操作。
1：给Dep.target赋值为当前这个watcher实例，并添加到targetStack中，（Dep与watcher联系起来）
2：调用updateComponent函数，生成vnode，在生成vnode的过程中我们会访问属性，这样就触发了getter拦截器，
3：在getter拦截器中，执行当前实例dep的depend方法，将组件的watcher实例添加到这个属性对应的dep中


```
new Watcher(vm, updateComponent, noop, {
    before () {
        if (vm._isMounted && !vm._isDestroyed) {
            callHook(vm, 'beforeUpdate')
        }
    }
}, true)

//vm：Component,expOrFn:String | Function,cb:Function,options?:?Object,isRenderWatcher?:?Boolean
class Watcher {
    constructor(vm,expOrFn,cb,options,isRenderWatcher){
        //初始化一些状态
        this.vm = vm
        if (isRenderWatcher) {//当前是render函数创建的watcher
            vm._watcher = this  //当前组件实例上挂载_watcher属性指向当前watcher实例
        }
        vm._watchers.push(this)//组件实例上挂载_watchers(数组)
        
        this.cb = cb
        this.id = ++uid 
        this.deps = []
        this.newDeps = []
        this.depIds = new Set()
        this.newDepIds = new Set()

        this.getter=typeof expOrFn === 'function' ?  expOrFn : parsePath(expOrFn)
         
        this.get();
        
    }
    get(){
        //调用dep文件中的pushTarget方法，Dep.target=this,targetStack.push(target)
        //实现Dep与watcher相关联
        pushTarget(this)
        //调用传进来的updateComponent函数，生成vnode。 
        value = this.getter.call(vm, vm)
    }
}

```



附属，原型方法_render的介绍：执行原型方法_render将vm.options.render生成vnode
```
Vue.prototype._render = function (): VNode {
    const vm: Component = this
    const { render, _parentVnode } = vm.$options
    //关于组件的作用域插槽处理
    if (_parentVnode) {
        vm.$scopedSlots = normalizeScopedSlots(
            _parentVnode.data.scopedSlots,
            vm.$slots,
            vm.$scopedSlots
        )
    }
    
    //设置父级的Vnode
    vm.$vnode = _parentVnode
    // render self
    let vnode = render.call(vm._renderProxy, vm.$createElement)
    
    // 是数组并且只有一个元素时，直接取出
    if (Array.isArray(vnode) && vnode.length === 1) {
        vnode = vnode[0]
    }
    //设置父级的vnode
    vnode.parent = _parentVnode
    return vnode
}
```






