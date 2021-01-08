
install 方法，当Vue调用Vue.use(VueRouter)时(安装VueRouter插件)，会调用VueRouter的install方法，代码如下

```
export function install (Vue) {
    // 首先定义install属性，防止重复调用install方法
    if (install.installed && _Vue === Vue) return
        install.installed = true

        _Vue = Vue

    const isDef = v => v !== undefined

    // 当组件初始化时调用，这里主要调用模式是除根组件之外的所有子组件
    const registerInstance = (vm, callVal) => {
        // 获取当前组件在父级中的标签 既 自定义指令<cc></cc>被模板解析后生成的vNode,既这个组件的_parentVnode
        let i = vm.$options._parentVnode

        /* 判断i是否存在，是否拥有data属性，是否拥有registerRouteInstance方法,拥有registerRouteInstance的组件默认为router-view组件 */
        if (isDef(i) && isDef(i = i.data) && isDef(i = i.registerRouteInstance)) {
            i(vm, callVal)
        }
    }
    //给Vue中每个组件的混入声明周期钩子函数beforeCreate，每个组件初始化时。在beforeCreate被调用之前都会调用如下混入的钩子
    Vue.mixin({
        beforeCreate () {
            // 判断当前vue实例上是否有router实例，表示Vue在初始化的时候传入了router
            // 初始化时的router对象的key一定需要是router
            // 如果有的话表示当前组件是根组件
            if (isDef(this.$options.router)) {
                this._routerRoot = this  // this._routerRoot指向当前组件this
                this._router = this.$options.router  //this._router指向vueRouter的实例
                this._router.init(this)
                Vue.util.defineReactive(this, '_route', this._router.history.current)
            } else { // 当是子组件时，在根组件上添加_routerRoot属性，指向根组件的实例
                this._routerRoot = (this.$parent && this.$parent._routerRoot) || this
            }
            registerInstance(this, this)
        },
        destroyed () {
            registerInstance(this)
        }
    })

    Object.defineProperty(Vue.prototype, '$router', {
        get () { return this._routerRoot._router }
    })
    
    Object.defineProperty(Vue.prototype, '$route', {
        get () { return this._routerRoot._route }
    })
    // 创建 routerView组件和RouterLink组件
    Vue.component('RouterView', View)
    Vue.component('RouterLink', Link)

    const strats = Vue.config.optionMergeStrategies
    // use the same hook merging strategy for route hooks
    // 自定义混入路由的钩子函数 默认处理为created钩子函数的合并策略
    strats.beforeRouteEnter = strats.beforeRouteLeave = strats.beforeRouteUpdate = strats.created
}


```