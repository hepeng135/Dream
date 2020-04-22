


```
function initExtend (Vue: GlobalAPI) {
  
  Vue.cid = 0
  let cid = 1

  Vue.extend = function (extendOptions: Object): Function {
    //当前传进来的组件选项，没有的话默认为一个空对象
    extendOptions = extendOptions || {}
    //this代表当前这个构造函数,这个是会变的，当前的返回的构造函数也会挂载extend这个方法
    const Super = this
    //获取Vue上的cid属性

    const SuperId = Super.cid
    
    //初始化缓存，判断是否有_ctor对象，有既获取，没有既创建一个空对象用于缓存    
    const cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {})
   
    //SuperId，拥有唯一性，作为缓存的Key，有对应的缓存则直接返回。
    //缓存中放的就是调用extend需要返回的一个构造函数
    if (cachedCtors[SuperId]) {
      return cachedCtors[SuperId]
    }

  
    //创建Vue的子类构造器，继承自Vue这个父类
    const Sub = function VueComponent (options) {
      this._init(options)
    }
    //当前的sub继承vue所有的原型方法
    Sub.prototype = Object.create(Super.prototype)
    Sub.prototype.constructor = Sub
    
    Sub.cid = cid++
    //将Vue的options与当前传进来的组件选项合并，相同的情况下，vue.option的的权重更高
    //Super.options  当前构造函数的option，详情可以查看：Vue.property文件夹下的property了解当前Vue.options
    //extendOptions  当前你传进来的组件选项，不过多呢  _Ctor 和 name 属性
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

    //将component/filter/directive这些构造函数方法同时赋值为新的构造函数
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