


Vue.prototype._init

    this._uid=uid++   //当前组件的唯一标识
    this.isVue=true   //一个避免被观察到的标志
    if (options && options._isComponent) {
        initInternalComponent(vm, options)
    }else{
        this.$options=mergeOptions(
            resolveConstructorOptions(vm.constructor), //合并当前对象原型链上所有构造函数的方法、属性
            options || {},//当前对象的一些选项
            vm //当前对象
        )
    }
    this._self=vm
    
    initLifecycle函数  初始化实例中的常用属性
        this.$parent = parent
        this.$root = parent ? parent.$root : vm
        
        this.$children = []
        this.$refs = {}
        
        this._watcher = null
        this._inactive = null
        this._directInactive = false
        this._isMounted = false
        this._isDestroyed = false
        this._isBeingDestroyed = false
    
    initRender函数
        const options = vm.$options
        const parentVnode = vm.$vnode = options._parentVnode // the placeholder node in parent tree
        const renderContext = parentVnode && parentVnode.context
        vm._vnode = null 
        vm._staticTrees = null
        vm.$vnode = options._parentVnode
        vm.$slots = resolveSlots(options._renderChildren, renderContext)
        vm.$scopedSlots = emptyObject
        vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false)
        vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true)
        defineReactive(vm, '$attrs', parentData && parentData.attrs || emptyObject, null, true)
        defineReactive(vm, '$listeners', options._parentListeners || emptyObject, null, true)
        
        
        





data中的每个属性都会有一个dep实例

    defineReactive=function(obj,key){
        const dep = new Dep()
        let val = obj[key]
        let childOb = !shallow && observe(val);
        Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: true,
            get: function reactiveGetter () {
                const value = val;
                if (Dep.target) {
                    dep.depend()
                    if (childOb) {
                        childOb.dep.depend()
                        if (Array.isArray(value)) {
                            dependArray(value)
                        }
                    }
                }
                return value
            },
            set: function reactiveSetter (newVal) {
                const value = getter ? getter.call(obj) : val
                /* eslint-disable no-self-compare */
                if (newVal === value || (newVal !== newVal && value !== value)) {
                    return
                }
                /* eslint-enable no-self-compare */
                if (process.env.NODE_ENV !== 'production' && customSetter) {
                    customSetter()
                }
                // #7981: for accessor properties without setter
                if (getter && !setter) return
                if (setter) {
                    setter.call(obj, newVal)
                } else {
                    val = newVal
                }
                childOb = !shallow && observe(newVal)
                dep.notify()
            }
        })
    }
    