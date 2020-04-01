initGlobalAPI:初始化构造函数的方法和属性

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