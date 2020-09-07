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
            this.deep = !!options.deep
            this.user = !!options.user
            this.lazy = !!options.lazy
            this.sync = !!options.sync
            this.before = options.before
        } else {
            this.deep = this.user = this.lazy = this.sync = false
        }
        this.cb = cb
        this.id = ++uid // uid for batching
        this.active = true
        this.dirty = this.lazy // for lazy watchers
        this.deps = []
        this.newDeps = []
        this.depIds = new Set()
        this.newDepIds = new Set()
        this.expression = process.env.NODE_ENV !== 'production'
          ? expOrFn.toString()
        : ''
        // parse expression for getter
        if (typeof expOrFn === 'function') {
            this.getter = expOrFn
        } else {
            this.getter = parsePath(expOrFn)
            if (!this.getter) {
                this.getter = noop
            }
        }
        this.value = this.lazy
          ? undefined
          : this.get()
    }

/**
* Evaluate the getter, and re-collect dependencies.
*/
get () {

pushTarget(this)
let value
const vm = this.vm
try {
  /*
  *  updateComponent = () => {
  *     vm._update(vm._render(), hydrating)
  *  }.call(vm, vm)
  *
  *
  * */


  value = this.getter.call(vm, vm)
} catch (e) {
  if (this.user) {
    handleError(e, vm, `getter for watcher "${this.expression}"`)
  } else {
    throw e
  }
} finally {
  // "touch" every property so they are all tracked as
  // dependencies for deep watching
  if (this.deep) {
    traverse(value)
  }
  popTarget()
  this.cleanupDeps()
}
return value
}

/**
* Add a dependency to this directive.
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
/* istanbul ignore else */
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
  if (
    value !== this.value ||
    // Deep watchers and watchers on Object/Arrays should fire even
    // when the value is the same, because the value may
    // have mutated.
    isObject(value) ||
    this.deep
  ) {
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




```