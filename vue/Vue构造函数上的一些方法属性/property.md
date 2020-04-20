#### initGlobalAPI:初始化构造函数的方法和属性
>当前这个函数执行完毕后，Vue构造函数上会出现如下的方法和属性

* Vue.config :一些Vue的全局配置，config这个属性用defineProperty进行呢数据劫持。

* Vue.util：一些常用的工具类函数。
* Vue.set：全局方法set，向响应式对象中添加一个属性，确保改属性也响应式的，且触发视图更新
* Vue.delete:全局方法delete，删除对象属性，如果当前是响应式属性，确保删除可以触发视图更新
* Vue.nextTick:全局方法nextTick,在下一次DOM更新循环结束之后执行回调。
* Vue.observable:全局方法observable,让一个对象可响应，Vue内部会用它来处理data函数返回的对象。
* Vue.options={
    components:{KeepAlive},//组件
    direvtives:{},//指令
    filters:{},//过滤器
    _base:Vue
  }
  
* Vue.use() 
* Vue.mixin()
* Vue.extend()   <a href="../Vue.property/Extend方法">查看extend方法详情</a>
* 添加Vue.component、vue.directive()、vue.filter方法。<a href="../Vue中的一个函数/initAssetRegisters">查看添加详情</a>

文件路径：\src\core\global-api\index.js
```
//挂载config到Vue上
const configDef = {}
configDef.get = () => config
Object.defineProperty(Vue, 'config', configDef)

//挂载一些公共方法到Vue.util
Vue.util = {
    warn,
    extend,
    mergeOptions,
    defineReactive
}
//Vue构造函数上的一些方法，后期需要看$set  $delete  $nextTick
Vue.set = set      
Vue.delete = del
Vue.nextTick = nextTick

//挂载观察者到Vue构造函数上(重点)
 Vue.observable =(obj)=> {
    observe(obj)
    return obj
}

//挂载options到Vue构造函数上，并在options里写一些属性，并统一设置成json(不继承任何Object方法，纯数据json)
//ASSET_TYPES:['component','direvtive','filter'],
Vue.options = Object.create(null)
ASSET_TYPES.forEach(type => {
Vue.options[type + 's'] = Object.create(null)
})

//向Vue.option.components上挂载keep-live这个方法
extend(Vue.options.components, builtInComponents)

//Vue构造函数上挂载use方法，插件运用方法
 initUse(Vue)

//Vue构造函数上挂载mixin方法，全局混入
initMixin(Vue)

//Vue构造函数上挂载extend方法，创建一个组件的构造函数
initExtend(Vue)

//Vue构造函数上挂载component,directive,filter方法,
//并通过name作为唯一key统一记录到Vue.options.components/directives/filters对象中。
initAssetRegisters(Vue)

```