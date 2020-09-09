Watcher构造函数，每个组件对应一个Watcher.


```
class Watcher {
    vm: Component;
    expression: string;
    cb: Function;
    id: number;
    deep: boolean;
    user: boolean;
    lazy: boolean;
    sync: boolean;
    dirty: boolean;
    active: boolean;
    deps: Array<Dep>;
    newDeps: Array<Dep>;
    depIds: SimpleSet;
    newDepIds: SimpleSet;
    before: ?Function;
    getter: Function;
    value: any;
    //构造函数，参数列表
    //vm:当前组件实例
    //expOrFn:当前观察的对象，键路径或者一个函数计算结果
    //cb：当前观察对象改变时的回调函数
    //options：当前观察的配置，deep，immediate，
    //isRenderWatcher：是不是组件渲染时创建的watcher
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
            this.user = !!options.user //当前回调函数是不是一个对象
            this.lazy = !!options.lazy //惰性配置，暂时不知道干嘛的
            this.sync = !!options.sync  //同步配置，暂时不知道干嘛的
            this.before = options.before //组件实例watcher自动带有一个before构造函数
        } else {
            this.deep = this.user = this.lazy = this.sync = false
        }
        this.cb = cb
        this.id = ++uid // uid for batching
        this.active = true
        this.dirty = this.lazy // for lazy watchers
        this.deps = []
        this.newDeps = [] //存放这个实例watch对应的dep实例
        this.depIds = new Set()
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
        this.value = this.lazy   //执行原型方法get
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
            //1：去除dep中
            this.cleanupDeps()
        }
        return value
    }

    /**
    * 添加dep，用来收集这个watcher实例中的dep
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
* Clean up for dependency collection.
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
* Subscriber interface.
* Will be called when a dependency changes.
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