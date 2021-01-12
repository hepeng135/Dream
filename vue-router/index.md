## 流程
在Vue中我们主要按一下方式去调用 文件app.js
```
    //安装VueRouter插件
    Vue.use(VueRouter)

    //路由配置，实例化
    const router=new VueRoute({
        mode:'',//模式
        base:'',//公共路径
        routes:[] //路由配置项
    })
    // 实例化Vue，将router传进去
    new Vue({
        router,
        render:h=h(App)
    })

```
## 第一步
首先调用Vue.use(VueRouter)进行安装时，其实是调用VueRouter的install方法，可以看下如下实现方式

```
import View from './components/view'
import Link from './components/link'

// 插件在打包的时候是肯定不希望把 vue 作为一个依赖包打进去的，但是呢又希望使用 Vue 对象本身的一些方法，此时就可以采用上边类似的做法，
// 在 install 的时候把这个变量赋值 Vue ，这样就可以在其他地方使用 Vue 的一些方法而不必引入 vue 依赖包（前提是保证 install 后才会使用）。
export let _Vue

export function install (Vue) {
  if (install.installed && _Vue === Vue) return
  install.installed = true

  _Vue = Vue

  const isDef = v => v !== undefined

  // 当组件初始化时调用，这里主要调用模式是除根组件之外的所有子组件
  const registerInstance = (vm, callVal) => {
    // 获取当前这个子组件在父级中中的标签 既 <router-link></router-link>被模板解析后生成的vNode
    let i = vm.$options._parentVnode

    /* 判断i是否存在，是否拥有data属性，是否拥有registerRouteInstance方法,拥有registerRouteInstance的组件默认为router-view组件 */
    if (isDef(i) && isDef(i = i.data) && isDef(i = i.registerRouteInstance)) {
      i(vm, callVal)
    }
  }

  Vue.mixin({
    beforeCreate () {
      // 判断当前vue实例上是否有router实例，表示Vue在初始化的时候传入了router
      // 初始化时的router对象的key一定需要是router
      // 如果有的话表示当前组件是根组件
      if (isDef(this.$options.router)) {
        this._routerRoot = this  // this._routerRoot重新赋值为当前组件this
        this._router = this.$options.router  // 指向当前vueRouter实例
        this._router.init(this) // 路由初始化
        // 当前组件实例上创建_route的响应式对象，
        Vue.util.defineReactive(this, '_route', this._router.history.current)
        // this._route = _Vue.observable(this._router.history.current)
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

该方法主要做以下事情
1. 首先在每个组件里混入beforeCreate钩子函数，在这个钩子函数很重要，后面我们子具体去看。当组件进行初始化是我们在具体看看

2.Vue原型上定义$router属性和$route属性，确保每个组件都能访问$router和$route

3.注册router-view 和router-link组件

4.自定义混入组件内的路由守卫beforeRouterEnter、beforeRouteUpdate、beforeRoute，合并策略与created钩子函数相同。



## 第二步，传入路由配置项，实例化VueRouter。VueRouter的构造函数如下所示
```
constructor (options: RouterOptions = {}) {
    this.app = null // 当前正在初始化的组件实例
    this.apps = []  // 每次初始化组件后触发beforeCrate钩子函数就会被添加到这个数组， 所有已经初始化过的组件实例
    this.options = options
    this.beforeHooks = []
    this.resolveHooks = []
    this.afterHooks = []
    // 创建 match 匹配函数 { match, addRoutes}
    this.matcher = createMatcher(options.routes || [], this)
    // 根据 mode 实例化具体的 History
    let mode = options.mode || 'hash'
    this.fallback = mode === 'history' && !supportsPushState && options.fallback !== false
    if (this.fallback) {
        mode = 'hash'
    }
    if (!inBrowser) {
        mode = 'abstract'
    }
    this.mode = mode
    /* 几种模式判断*/
    switch (mode) {
        case 'history':
            this.history = new HTML5History(this, options.base)
            break
        case 'hash':
            this.history = new HashHistory(this, options.base, this.fallback)
            break
        case 'abstract':
            this.history = new AbstractHistory(this, options.base)
            break
        default:
            if (process.env.NODE_ENV !== 'production') {
                assert(false, `invalid mode: ${mode}`)
            }
    }
} 
```
首先我们需要看下createMatcher函数做了什么事,具体代码如下
```
//参数列表 routes:路由配置集合    router：路由实例对象
function createMatcher(routes,router){
    const { pathList, pathMap, nameMap } = createRouteMap(routes)
    function addRoutes(rotes){
        //code...
    }
    function match(raw,currentRoute,redirectedFrom){
        //code...
    }
    function redirect(record,location){
        //code...
    }
    function alias(record,location,matchAs){
        //code..
    }
    function _createRoute(record,location,redirectedFrom){
        //code...
    }
    return {
        match,
        addRoutes
    }
}

```
先主要看看createRouteMap函数，他的作用是循环所有的路由配置，用path-to-regExp插件库对path进行转换成对应的正则，转换方式如下

```
//routes配置数组
[
    {name:'home',path:'/',component:Home},
    {
        name:'foo',path:'/foo',component:Foo,
        children:[
            {name:'a',path:'a',component:a}
        ],
    },
    {
        name:'bar',
        path:'/bar',
        components:{
            default:Bar,
            'a':BarA
        }
    }
    
]
//处理后生三个map，如下

pathList [Array] : ['','/foo','/foo/a','/bar']

pathMap [Object] :{
    '':{path: "",regex: /^(?:\/(?=$))?$/i,components: {default: {…}},instances: {},name: "Home",parent: undefined,matchAs: undefined,redirect: undefined,beforeEnter: undefined}
    '/foo':{...}
    '/foo/a':{....,parent:{上面/foo的引用},....}
    '/bar':{....,parent:undefined,components:{default:{...},a:{...}}}
}

```
上面可以看到。对于我们传进去的配置项进行了对应的处理，然后回到createMatcher函数，他返回两个区别函数，match 和 addRoutes，我们这里先不关注，后期过来细看


接着流程来，我们将根据配置项mode选择当前的几种路由模式，这里我们先看H5 History 模式。

对应实例代码  

```
this.history = new HTML5History(this, options.base)
export class HTML5History extends History {
    constructor (router: Router, base: ?string) {
        super(router, base)
    
        const expectScroll = router.options.scrollBehavior// 获取滚动信息
        const supportsScroll = supportsPushState && expectScroll  // 是否支持h5 history
    
        if (supportsScroll) {
            setupScroll()  // 记录当前页面进入时的位置
        }
    
        const initLocation = getLocation(this.base) // 获取当前页面除域名外的所有信息，同时也剔除base
        window.addEventListener('popstate', e => {  // 当点击链接进行跳转时
        const current = this.current
    
        const location = getLocation(this.base)
        if (this.current === START && location === initLocation) {
            return
        }
    
        this.transitionTo(location, route => {
            if (supportsScroll) {
                handleScroll(router, route, current, true)
            }
        })
    })
    go(n){...}
    push(location,onComplete,onAbort){...}
    replace(location,onComplete,onAbsort){...}
    ensureURL(push){...}
    getCurrentLocation(){...}
}


```
首先 实例化HTML5History构造函数，并传入当前的VueRouter实例和options.base作为参数。
在HTML5History构造函数中我们很明显可以看出这个类继承自History。我们需要看看History

````
export class History
    constructor (router: Router, base: ?string) {
        this.router = router  // vueRouter实例
        this.base = normalizeBase(base)  // 处理默认值 默认为/。也可以用户这种/app/=>/app
        // start with a route object that stands for "nowhere"
        this.current = START // 以path为‘/’创建一个起始路由
        this.pending = null
        this.ready = false
        this.readyCbs = []
        this.readyErrorCbs = []
        this.errorCbs = []
    }
    listen (cb: Function)
    onReady (cb: Function, errorCb: ?Function)
    onError (errorCb: Function)
    transitionTo (location: RawLocation, onComplete?: Function, onAbort?: Function) 
    confirmTransition (route: Route, onComplete: Function, onAbort?: Function) 
    updateRoute (route: Route) 
}
````
根类History在构造函数中首先确定了当前的默认路由为'/'的路由对象，和当前base处理后的值,如下
```
eg:配置项设置base为/app，this.base则为 “/app”

this.current默认为当前路由对象既  {name: null,meta: {},path: "/",hash: "",query: {},params: {},fullPath: "/", matched: []}

```
回到HTML5History构造函数中，在构造函数中我们做了以下事情

1. 首先获取路由的滚动配置函数scrollBehavior，并判断当前浏览器是否兼容H5History API。

2. 在兼容H5 History API的浏览器中调用setupScroll函数，调用History API 的replace替换当前history中的状态，{key:当前的时间戳},'',当前的url（去掉协议+域名），
并且监听popstate事件，当历史记录发生变化时存储当前页面的window.pageXOffset和window.pageYOffset到positionStore对象中{x,y}，并更新对应的key
```
export function setupScroll () {

    // 获取当前的页面协议+域名
    const protocolAndPath = window.location.protocol + '//' + window.location.host
    // 去掉协议+域名
    const absolutePath = window.location.href.replace(protocolAndPath, '')
    // 替换当前history栈中的状态
    window.history.replaceState({ key: getStateKey() }, '', absolutePath)
    window.addEventListener('popstate', e => { // 绑定popstate事件，当该事件发生时
        saveScrollPosition() // 存储当前的scrollX scrollY 到对象 positionStore上 {x,y}
        if (e.state && e.state.key) {//获取当前的history对象是否存在state，然后更新对应的key值，用于下次存储。
            setStateKey(e.state.key)//
        }
    })
}
```

3. 调用getLocation函数，获取当前页面的路径 （剔除base），然后监听popstate事件，
```
    const initLocation = getLocation(this.base) // 获取当前页面除域名外的所有信息，同时也剔除base
    window.addEventListener('popstate', e => {  // 当点击链接进行跳转时
        const current = this.current
    
  
        const location = getLocation(this.base)
        if (this.current === START && location === initLocation) {
            return
        }
    
        this.transitionTo(location, route => {
            if (supportsScroll) {
                handleScroll(router, route, current, true)
            }
        })
    })
```

## 第三部，VueRouter实例化完毕，我们将实例化Vue 依次创建根组件，子组件等，在创建的过程中，我们想到VueRouter在install方法中我们混入了
beforeCreate钩子函数，现在Vue组件实例化过程中会被触发，我们来看看

```
export function istall(Vue){
    //code...

     Vue.mixin({
        beforeCreate () {
            // 判断当前vue实例上是否有router实例，表示Vue在初始化的时候传入了router
            // 初始化时的router对象的key一定需要是router
            // 如果有的话表示当前组件是根组件
            if (isDef(this.$options.router)) {
                this._routerRoot = this  // this._routerRoot重新赋值为当前跟组件的实例
                this._router = this.$options.router  // 指向当前vueRouter实例
                this._router.init(this) // 路由初始化
                // 当前组件实例上创建_route的响应式对象，
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
    //code...
    Object.defineProperty(Vue.prototype, '$router', {
        get () { return this._routerRoot._router }
    })
    
    Object.defineProperty(Vue.prototype, '$route', {
        get () { return this._routerRoot._route }
    })
}
```
上面的代码做以下事情
1. 根实例上添加_route属性，值为：this._router.history.current (路由的当前信息，当前根组件->路由实例->history实例->current属性)，并用Vue.util.defineReactive
使其响应化。
2. 除根组件的其他组件实例上添加_routerRoot属性，指向当前根组件，这样我们在每个组件都能访问到$router（路由实例）,通过 this._routerRoot._router 访问，
同时也能访问$route（当前路由信息），通过 this._routerRoot._route访问。
3. 执行this._router.init(this)进行路由初始化
4. 执行registerInstance(this,this) 处理router-view组件，具体后面介绍。

接下来我们看看this._route.init(this),既VueRouter原型上的init方法
```
init(){
    this.apps.push(app) // app 当前组件的实例对象
    // 当前组件销毁时同时也清除apps中的组件实例引用。否则会导致内存溢出
    // https://github.com/vuejs/vue-router/issues/2639
    app.$once('hook:destroyed', () => {
        const index = this.apps.indexOf(app)
        if (index > -1) this.apps.splice(index, 1)
        if (this.app === app) this.app = this.apps[0] || null
    })
    if (this.app) {
        return
    }
    
    this.app = app
    
    const history = this.history // 获取当前history实例
    // history.getCurrentLocation()  获取当前页面的路径，path+location.search+location.hash  eg:/home?a=b
    if (history instanceof HTML5History) {
        history.transitionTo(history.getCurrentLocation())
    } else if (history instanceof HashHistory) {
        const setupHashListener = () => {
            history.setupListeners()
        }
        history.transitionTo(
            history.getCurrentLocation(),
            setupHashListener,
            setupHashListener
        )
    }
    
    history.listen(route => {
        this.apps.forEach((app) => {
            app._route = route
        })
    })
}

```
这段代码，全面在处理一个bug，当前组件销毁时，VueRouter实例属性apps中还保持该组件的实例对象，没有及时销毁，导致内存溢出的危险
后面的主要是调用history.getCurrentLocation()获取当前页面对应的url，然后做完参数传给history.transitionTo。这个时候了解history.transitionTo就
显的非常重要

```
//参数列表 
//location：我们将跳往的目标地址

transitionTo (location: RawLocation, onComplete?: Function, onAbort?: Function) {
    //   调用 match 得到匹配的 route 对象  location：目标地址  this.current : 当前route信息
    const route = this.router.match(location, this.current)
    // 确认过渡
    this.confirmTransition(route, () => {
        this.updateRoute(route)
        onComplete && onComplete(route)
        this.ensureURL()
    
        // fire ready cbs once
        if (!this.ready) {
            this.ready = true
            this.readyCbs.forEach(cb => { cb(route) })
        }
    }, err => {
        if (onAbort) {
            onAbort(err)
        }
        if (err && !this.ready) {
            this.ready = true
            this.readyErrorCbs.forEach(cb => { cb(err) })
        }
    })
}
```
上述代码 调用router实例的match方法而在这个方法中我们其实调用的其实是this.matcher.match函数，记得我们在实例化Router时，在构造函数中创建了matcher属性，他的值
是调用createMatcher返回的，返回两个方法match 和  addRoutes，这个时候我们调用的其实是这个match函数，在这个函数中我们循环pathList，找到对应的pathMap项，然后返回一个和当前目标
location相对于的路由对象 {name: "Home",meta: {}, path: "/",hash: "",query: {} ,params: {},fullPath: "/" ,matched: [对应的pathMap项]}。

在这里我们通过目标路径，确认我们即将要去路由的所有路由对象信息（params,query,component等），接下来就是确认路径，然后渲染该路径对应的组件，接下来我们来看看
确认过渡这个函数 confirmTransition

```
confirmTransition (route: Route, onComplete: Function, onAbort?: Function) {
    const current = this.current
    const abort = err => {
        if (isError(err)) {
            if (this.errorCbs.length) {
                this.errorCbs.forEach(cb => {
                    cb(err)
                })
            } else {
                warn(false, 'uncaught error during route navigation:')
                console.error(err)
            }
        }
        onAbort && onAbort(err)
    }
    // 如果当前的路由信息与将去往的路由信息相同，则直接返回
    if (
        isSameRoute(route, current) &&
        route.matched.length === current.matched.length
    ) {
        this.ensureURL()  // 如果当前地址栏url  与 current不一样  ，则修改为current， 只修改url  不涉及组件更新和页面跳转
        return abort()
    }
    // 每个路由对象都带有matched数组，一个路由对应的可能对应多个matched， 如 /foo/a 则对应两个，因为 /foo对应一个正则  /foo/bar对应一个正则
    // resolveQueue 通过对比目标的matched和现在的matched，确定需要更新哪些组件，eg: 目标：/foo/a  现在：/foo  既我们现在只需要更新foo对应的组件
    // 哪些需要更新  哪些不需要更新 updated:不需要更新的路由配置对象集合（组件） activated:需要重新创建的路由配置对象集合   deactivated：需要销毁的路由配置对象集合
    // eg /foo/a  跳往/foo/b   则 /foo对象的组件不需要更新（保留）  /foo/a 对应的组件需要销毁  /foo/b 对应的组件需要创建
    const {
        updated,
        deactivated,
        activated
    } = resolveQueue(this.current.matched, route.matched)
    // 生命周期队列，用于调用路由的各种钩子函数
    // 1：deactivated 组件调用beforeRouterLeave   2:全局beforeEach守卫   3：
    const queue: Array<?NavigationGuard> = [].concat(
        // 返回要销毁组件集合beforeRouterLeave钩子函数集合，其实返回的是bindGuard函数，
        // bindGuard函数中调用beforeRouterLeave钩子函数，this指向当前组件的实例，参数为调用bindGuard函数的参数
        extractLeaveGuards(deactivated), // 调用beforeRouterLeave钩子
        // global before hooks
        this.router.beforeHooks,  // 全局beforeEach守卫
        // in-component update hooks
        // 返回要更新组件的beforeRouterUpdate钩子函数集合，和上面的组件内独享钩子函数一样的处理方式
        extractUpdateHooks(updated),   // 调用 beforeRouterUpdate钩子函数
        // in-config enter guards
        //  beforeEnter：路独享的钩子函数，直接map这个activated（将要新建的路由配置）获取每个组件独享的beforeEnter
        activated.map(m => m.beforeEnter), // 调用beforeEnter钩子函数
        // async components
        resolveAsyncComponents(activated)  // 异步组件
    )
    // 当前要去往的路由配置项
    this.pending = route
    // hook:当前的路由钩子函数  next:回调runQueue中的step函数
    const iterator = (hook: NavigationGuard, next) => {
        if (this.pending !== route) {
            return abort()
        }
        try {
            // 调用钩子函数，  塞入函数  to:route  from:current  next
            hook(route, current, (to: any) => {
                // 当next都参数为false时，中断导航，调用ensureURL将浏览器地址恢复至current
                if (to === false || isError(to)) {
                    // next(false) -> abort navigation, ensure current URL
                    this.ensureURL(true)
                    abort(to)
                } else if ( typeof to === 'string' || (typeof to === 'object' && ( typeof to.path === 'string' || typeof to.name === 'string'))) {
                    // 跳转到另一个地址。
                    // next('/') or next({ path: '/' }) -> redirect
                    abort()
                    if (typeof to === 'object' && to.replace) {
                        this.replace(to)
                    } else {
                        this.push(to)
                    }
                } else { // 确认导航
                    // confirm transition and pass on the value
                    next(to)
                }
            })
        } catch (e) {
            abort(e)
        }
    }
    // queue 钩子函数队列
    runQueue(queue, iterator, () => {
        const postEnterCbs = []
        const isValid = () => this.current === route
        // wait until async components are resolved before
        // extracting in-component enter guards
        // 获取组件的beforeRouteEnter组件
        const enterGuards = extractEnterGuards(activated, postEnterCbs, isValid)
        const queue = enterGuards.concat(this.router.resolveHooks)
        runQueue(queue, iterator, () => {
            if (this.pending !== route) {
                return abort()
            }
            this.pending = null
            onComplete(route)
            if (this.router.app) {
                this.router.app.$nextTick(() => {
                    postEnterCbs.forEach(cb => {
                        cb()
                    })
                })
            }
        })
    })
}
```
上述函数中，通过resolveQueue函数获取当前需要销毁组件(matched对象中含有对应的组件)deactivated，不需要更新的组件updated,需要重新创建的组件activated，
然后将beforeRouterLeave，beforeEach,beforeRouteUpdate,beforeEnter对应的路由钩子函数取出，然后进行执行，并且用resolveAsyncComponents函数去处理异步组件
，再次调用beforeRouteEnter钩子函数，当beforeRouteEnter钩子调用完毕后，我们进行当前组件，已经当前组件父集合的_route属性，该属性在install方法中被我们作为
响应式对象添加到了每个组件实例上，当他改变时，每个组件下子组件router-view都会重新进行渲染，加载当前路由对应的新组件。










