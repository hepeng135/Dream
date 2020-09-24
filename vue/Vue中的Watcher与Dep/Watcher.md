在Vue中watcher分两种，第一种是组件模板编译成render函数时进行调用，第二种是用户利用vm.watch创建的。

### 组件模板编译成render函数时调用。

调用代码如下所示，

1：updateComponent为更新渲染DOM的函数，通过render生成vnode，然后新旧vnode进行比较更新渲染，当第一次渲染时，则直接将vnode生成真正的DOM，然后插入到页面中
2：before:用于执行钩子函数beforeUpdate

```
new Watcher(vm, updateComponent, noop, {
    before () {
        if (vm._isMounted && !vm._isDestroyed) {
            callHook(vm, 'beforeUpdate')
        }
    }
}

```
当上述函数执行时

1：首先执行watcher的构造函数，进行一些初始化操作,
```
//因为是Vue自己创建的watcher，属性 deep ，user ,lazy ,sync 都将为false，
this.deep=!!options.deep;
this.user=!!options.user;
this.lazy=!!options.lazy;
this.sync=!!options.sync;
this.before =options.before; 用于执行beforeUpdate钩子函数（数据更新时调用，发生在虚拟DOM比较之前）

this.deps=[];//已经收集了该watcher的dep集合
this.depsid=new Set();

this.newDeps=[]; //最新已经收集了该watcher的dep集合
this.newDepsId:new Set();

//获取我们需要监测的目标  可能为函数或者 表达式
this.getter=typeof expOrFn === 'function' ?  expOrFn : parsePath(expOrFn)
```
2：在构造函数的最后调用this.get()原型方法。
3：在get()方法中，我们将给Dep.target赋值给当前watcher实例，在调用this.getter，访问数据，触发getter，进而收集依赖。
收集完成后将Dep.target设置为null.




```
class Watcher {
    constructor (
        vm: Component,
        expOrFn: string | Function,
        cb: Function,
        options?: ?Object,
        isRenderWatcher?: boolean
    ) {
        this.vm = vm
        if (isRenderWatcher) {//当前是render函数创建的watcher
            vm._watcher = this  //当前组件实例上挂载_watcher属性指向当前watcher实例
        }
        vm._watchers.push(this)//组件实例上挂载_watchers(数组)
        // options
        if (options) {
            this.deep = !!options.deep  //对象深度监测
            this.user = !!options.user //当前watcher实例时用户自己创建的
            this.lazy = !!options.lazy //惰性配置，配置true时，表示当前这个观察者将不加入到vue的响应式中，既当监听的属性变化时，对应的回调不会执行。
            this.sync = !!options.sync  //同步配置，
            this.before = options.before //组件实例watcher自动带有一个before构造函数
        } else {
            this.deep = this.user = this.lazy = this.sync = false
        }
        this.cb = cb
        this.id = ++uid // uid for batching
        this.active = true
        this.dirty = this.lazy // for lazy watchers
        this.deps = []  //存放上一次依赖的dep
        this.newDeps = [] //存放这个实例watch最新的dep实例
        this.depIds = new Set() //存放上一次的depid
        this.newDepIds = new Set() //存放这个实例对应的depid
        this.expression = process.env.NODE_ENV !== 'production'
          ? expOrFn.toString()
        : ''
        // 解析expOrFn
        //当是组件渲染更新时实例的watcher时，expOrFn是updateComponent，既创建或者更新vnode
        //当是监测某个属性的时候expOrFn为这个监测的这个属性名，或者一个返回属性名的函数
        if (typeof expOrFn === 'function') { //当是函数时,可能是updateComponent或者是一个返回属性名的函数
            this.getter = expOrFn
        } else {
            //解析属性名  处理'a.b.c' 这种,返回一个函数
            this.getter = parsePath(expOrFn)
            if (!this.getter) {//没有getter的时候处理成一个空函数
                this.getter = noop
            }
        }
        this.、 = this.lazy   //执行原型方法get
          ? undefined
          : this.get()
    }

    //执行pushTarget给Dep.target赋值为当前watcher实例对象
    //执行this.getter，
    //当watcher是监测整个组件渲染的时候，就是去调用updateComponent进行生成vnode或者更新vnode
    get () {
        //给Dep.target赋值为当前watcher的实例，同时targetStack数组中会添加这个实例
        pushTarget(this)
        let value
        const vm = this.vm
        try {
            //更新渲染组件时执行updateComponent生成vnode，同时触发getter，根据之前我们对Dep.target的赋值进行Dep收集。
            //1：生成vnode的过程中会访问data中的属性从而被getter劫持。
            //2：执行dep.depend(),其实是执行当前watcher的addDep方法，将这个属性对应的dep添加到watcher中，让后在执行dep.addSub
                    将这个watcher添加到dep，实现dep和watcher的相互引用
            //3: 看是否存在childOb,同时做以上的二操作

            //监测某个属性时，执行获取到监测的value，一般我们在监测的回调都是改变一个其他的属性值
            //1：执行这个函数，期间会访问属性从而触发getter拦截器。
            //2：收集这个属性对应的dep。
            
            value = this.getter.call(vm, vm)
            
        } catch (e) {
            if (this.user) {
                handleError(e, vm, `getter for watcher "${this.expression}"`)
            } else {
                throw e
            }
        } finally {
            //深度依赖的收集
            if (this.deep) {
                traverse(value)
            }
            //收集一轮dep后，维护targetStack和Dep.target
            popTarget()
            //清除操作，
            this.cleanupDeps()
        }
        return value
    }

    /**
    * 收集dep，收集这个watcher被哪些Dep触发
    */
    addDep (dep: Dep) {
        const id = dep.id
        if (!this.newDepIds.has(id)) { //确保存放的dep不是重复的
            this.newDepIds.add(id) //存放dep的唯一id
            this.newDeps.push(dep)//存放dep
            if (!this.depIds.has(id)) {
                dep.addSub(this)//向dep中添加watcher
            }
        }
    }

    /**
    * 更新deps  和 depsId
    * 循环上次收集这个watcher的dep集合，看是否在这次新dep集合中，否则就将这个watcher从对应dep中删除。
    * 更新deps 和depsId ，新值为收集这个watcher的dep集合， newDeps,newDepsId,更新完毕以后就将newDeps和newDepsId清空
    * 
    */
    cleanupDeps () {
        let i = this.deps.length  
        while (i--) { 
            const dep = this.deps[i]
            if (!this.newDepIds.has(dep.id)) {
                dep.removeSub(this)
            }
        }
        let tmp = this.depIds
        this.depIds = this.newDepIds
        this.newDepIds = tmp
        this.newDepIds.clear()
        tmp = this.deps
        this.deps = this.newDeps
        this.newDeps = tmp
        this.newDeps.length = 0
    }

/**
* 更新操作，当属性发生改变时，对应的依赖调用
*/
    update () {
        if (this.lazy) {
            this.dirty = true
        } else if (this.sync) {
            this.run()
        } else {
            queueWatcher(this)
        }
    }

/**
* Scheduler job interface.
* Will be called by the scheduler.
*/
    run () {
        if (this.active) {
            const value = this.get()
            if (value !== this.value || isObject(value) || this.deep) {
                // set new value
                const oldValue = this.value
                this.value = value
                if (this.user) {
                    try {
                        this.cb.call(this.vm, value, oldValue)
                    } catch (e) {
                        handleError(e, this.vm, `callback for watcher "${this.expression}"`)
                    }
                } else {
                    this.cb.call(this.vm, value, oldValue)
                }
            }
        }
    }

/**
* Evaluate the value of the watcher.
* This only gets called for lazy watchers.
*/
    evaluate () {
        this.value = this.get()
        this.dirty = false
    }

/**
* Depend on all deps collected by this watcher.
*/
    depend () {
        let i = this.deps.length
        while (i--) {
            this.deps[i].depend()
        }
    }

/**
* Remove self from all dependencies' subscriber list.
*/
    teardown () {
        if (this.active) {
            // remove self from vm's watcher list
            // this is a somewhat expensive operation so we skip it
            // if the vm is being destroyed.
            if (!this.vm._isBeingDestroyed) {
                remove(this.vm._watchers, this)
            }
            let i = this.deps.length
            while (i--) {
                this.deps[i].removeSub(this)
            }
                this.active = false
            }
        }
    }

}


```