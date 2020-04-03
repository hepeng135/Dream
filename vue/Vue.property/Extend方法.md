


```
function initExtend (Vue: GlobalAPI) {
  
  Vue.cid = 0
  let cid = 1

  Vue.extend = function (extendOptions: Object): Function {
    extendOptions = extendOptions || {}
    const Super = this
    const SuperId = Super.cid
    const cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {})
   
    if (cachedCtors[SuperId]) {
      return cachedCtors[SuperId]
    }

  

    const Sub = function VueComponent (options) {
      this._init(options)
    }
    //当前的sub继承vue所有的原型方法
    Sub.prototype = Object.create(Super.prototype)
    Sub.prototype.constructor = Sub
    Sub.cid = cid++
    //将Vue的options与当前传进来的组件选项合并，相同的情况下，vue.option的的权重更高
    Sub.options = mergeOptions(
      Super.options,
      extendOptions
    )
    //为当前的sub构造函数添加super属性，指向他的父级构造函数，既Vue构造函数
    Sub['super'] = Super
    //初始化当前组件选项中的props
    if (Sub.options.props) {
      initProps(Sub)
    }
    //初始化当期组件选项中的computed
    if (Sub.options.computed) {
      initComputed(Sub)
    }
    //给当前的构造函数添加extend mixin use  方法
    Sub.extend = Super.extend
    Sub.mixin = Super.mixin
    Sub.use = Super.use

  
    ASSET_TYPES.forEach(function (type) {
      Sub[type] = Super[type]
    })

    if (name) {
      Sub.options.components[name] = Sub
    }

    Sub.superOptions = Super.options
    Sub.extendOptions = extendOptions
    Sub.sealedOptions = extend({}, Sub.options)

    cachedCtors[SuperId] = Sub
    return Sub
  }
}
```