
#### 参数列表
>* parent:父级的组件选项，
>* child:子集（当前）的组件选项 
>* vm：当前组件的实例

### 内部重要变量说明，strats：options上的一些key对应val的处理程序
>strats这个对象中的每个属性都对应一个方法函数。
>* strats.data：猜想是处理options.data的，需要进一步看源码
>* strats.beforeCreate/created/beforeMount/mounted/beforeUpdate/updated/beforeDestroy/destroyed/activated/deactivated/errorCaptured/serverPrefetch
    处理钩子函数，也需要进一步查看源码
>* strats.components/directives/filters:处理组件，指令，过滤器，需要进一步看源码
>* strats.watch   :观察变化，需要进一步看源码
>* start.props/methods/inject/computed
>* start.provide


#### 函数内部主要的地方说明
>* normalizeProps：处理当前组件的props，详情<a href="./normalizeProps.md">normalizeProps</a>
>* normalizeInject:处理当前组件的inject,详情<a href="./normalizeInject.md">normalizeInject</a>
>* normalizeDirectives:处理当前组件内的directive,处理后的options.directives.dirName={bind:dirFn,update:dirFn}
>* mergeField:parentOptions与childOptions执行forIn循环进行合并成一个新的options
       
```
export function mergeOptions (
  parent: Object,
  child: Object,
  vm?: Component
): Object {
    
  if (typeof child === 'function') {
    child = child.options
  }
   //处理组件内的props，
  normalizeProps(child, vm)
   //处理组件内的inject
  normalizeInject(child, vm)
   //处理组件内的directives
  normalizeDirectives(child)

  //判断当前的child是否是Vue这个构造函数的options
  if (!child._base) {
    if (child.extends) {//确定当前的options是否有extends
      parent = mergeOptions(parent, child.extends, vm)
    }
    if (child.mixins) {//确定当前的options是否有mixins
      for (let i = 0, l = child.mixins.length; i < l; i++) {
        parent = mergeOptions(parent, child.mixins[i], vm)
      }
    }
  }

  const options = {}
  let key
  //循环parent这个对象，执行mergeField函数
  for (key in parent) {
    mergeField(key)
  }
  for (key in child) {
    if (!hasOwn(parent, key)) {
      mergeField(key)
    }
  }
  //获取对应key的处理函数，当前假如没有话，默认调用defaultStrat函数
   //defaultStrat函数  当前child[key]对应的有值的话直接返回parent[key] 否则 是child[key],然后给options上添加对应的key指向这个val。
  function mergeField (key) {
    const strat = strats[key] || defaultStrat
    options[key] = strat(parent[key], child[key], vm, key)
  }
   
  return options
}
```

### 父组件和子组件的options合并的主要程序。
#### 参数列表
>* parentVal：父组件的option对应key的val
>* childVal：当前组件的option对应key的val
>* vm:当前组件的实例
####对options.data的合并，细节如下。
> 当前没有实例VM的处理

>>1：如果没有child没有data则直接返回parent的data，如果没有parent没有data则直接返回child的data

>>2: 如果child和parent同时存在，则返回mergedDataFn函数，该函数调用mergeData将parentData合并到childData上。

>>3：合并规则，当前key假如parentData和childData同时拥有，则不做处理，当前childData上没有时，则利用set去添加，保持当前属性的响应式。

```
//挂载对应options中data的处理函数
strats.data=function (parentVal: any,childVal: any,vm?: Component): ?Function {
  if (!vm) {
    return mergeDataOrFn(parentVal, childVal)
  }
  return mergeDataOrFn(parentVal, childVal, vm)
}
export function mergeDataOrFn (parentVal: any,childVal: any,vm?: Component): ?Function {
  if (!vm) {
    if (!childVal) return parentVal
    if (!parentVal)  return childVal 
    return function mergedDataFn () {
      return mergeData(
        //当前假如是函数，则改变当前this的指向
        typeof childVal === 'function' ? childVal.call(this, this) : childVal,
        typeof parentVal === 'function' ? parentVal.call(this, this) : parentVal
      )
    }
  } else {
    return function mergedInstanceDataFn () {
      const instanceData = typeof childVal === 'function'
        ? childVal.call(vm, vm)
        : childVal
      const defaultData = typeof parentVal === 'function'
        ? parentVal.call(vm, vm)
        : parentVal
      if (instanceData) {
        return mergeData(instanceData, defaultData)
      } else {
        return defaultData
      }
    }
  }
}
/**
 * @params to :当前child的data
 * @params from :当前parent的data  
 */
function mergeData (to: Object, from: ?Object): Object {
  if (!from) return to
  let key, toVal, fromVal

  //hasSymbol做兼容性判断，获取当前from对象中key组成的数组
  const keys = hasSymbol
    ? Reflect.ownKeys(from)
    : Object.keys(from)

  for (let i = 0; i < keys.length; i++) {
    key = keys[i]
    // 判断当前对象是否已经被观察
    if (key === '__ob__') continue
    toVal = to[key]
    fromVal = from[key]
    //判断当前子级是否有这个key，没有则添加上，并且加上数据响应式
    if (!hasOwn(to, key)) {
      set(to, key, fromVal)
    } else if (
      toVal !== fromVal &&
      isPlainObject(toVal) &&
      isPlainObject(fromVal)
    ) {//假如当前是key对应的是一个json对象，则递归去完成
      mergeData(toVal, fromVal)
    }
  }
  return to
}
```

#### 对父级和子集的options.components/direvtives/filters进行合并，此时的parentVal和childVal都是一个json对象
1.当传入的参数parentVal时将利用Object.created()将父级的components/direvtives/filters对象作为_proto_创建一个新的对象。

2.当传入的参数是childVal时,执行上面第一个步骤，然后将直接将childVal浅拷贝给这个新的对象。

3：将这个新的对象赋值给子集的option.components/direvtives/filters
```
//ASSET_TYPES=>['component','directive','filter']
//挂载对应options上components/directives/filters的处理函数
ASSET_TYPES.forEach(function (type) {
  strats[type + 's'] = mergeAssets
})
function mergeAssets (
  parentVal: ?Object,
  childVal: ?Object,
  vm?: Component,
  key: string
): Object {
  const res = Object.create(parentVal || null)
  if (childVal) {
    return extend(res, childVal)
  } else {
    return res
  }
}

```
#### 对options上所有的声明周期函数进行合并


```
//LIFECYCLE_HOOKS =>['beforeCreate','created','beforeMount','mounted','beforeUpdate','updated','beforeDestroy','destroyed','activated','deactivated','errorCaptured','serverPrefetch']
//挂载对应options上的生命周期钩子名称的处理函数
LIFECYCLE_HOOKS.forEach(hook => {
  strats[hook] = mergeHook
})
function mergeHook (
  parentVal: ?Array<Function>,
  childVal: ?Function | ?Array<Function>
): ?Array<Function> {
    const res ;
    if(childVal){
        if(parentVal){
            res= parentVal.concat(childVal)
        }else{
            if(Array.isArray(childVal)){
                res=  childVal 
            }else{
                res=[childVal]
            }
        }
    }else{
      res=  parentVal
    }
    return res
    ? dedupeHooks(res)
    : res
}
```
#### 对options上的watch选项进行合并
```
//挂载对应options上watch的处理函数
strats.watch = function (parentVal: ?Object,childVal: ?Object,vm?: Component,key: string): ?Object {
  // work around Firefox's Object.prototype.watch...
  if (parentVal === nativeWatch) parentVal = undefined
  if (childVal === nativeWatch) childVal = undefined
  /* istanbul ignore if */
  if (!childVal) return Object.create(parentVal || null)
  if (process.env.NODE_ENV !== 'production') {
    assertObjectType(key, childVal, vm)
  }
  if (!parentVal) return childVal
  const ret = {}
  extend(ret, parentVal)
  for (const key in childVal) {
    let parent = ret[key]
    const child = childVal[key]
    if (parent && !Array.isArray(parent)) {
      parent = [parent]
    }
    ret[key] = parent
      ? parent.concat(child)
      : Array.isArray(child) ? child : [child]
  }
  return ret
}
```
#### 对options上的props/methods/inject/computed进行合并
```
//挂载对应options上props/methods/inject/computed的处理函数
trats.props =strats.methods =strats.inject =strats.computed =function (
   parentVal: ?Object,
   childVal: ?Object,
   vm?: Component,
   key: string
 ): ?Object {
   if (childVal && process.env.NODE_ENV !== 'production') {
     assertObjectType(key, childVal, vm)
   }
   if (!parentVal) return childVal
   const ret = Object.create(null)
   extend(ret, parentVal)
   if (childVal) extend(ret, childVal)
   return ret
 }
```
### 对options上provide进行合并，这个和data的合并差不多
```
//挂载对应options上provide的处理函数
strats.provide = mergeDataOrFn;

export function mergeDataOrFn (
  parentVal: any,
  childVal: any,
  vm?: Component
): ?Function {
  if (!vm) {
    // in a Vue.extend merge, both should be functions
    if (!childVal) {
      return parentVal
    }
    if (!parentVal) {
      return childVal
    }
    // when parentVal & childVal are both present,
    // we need to return a function that returns the
    // merged result of both functions... no need to
    // check if parentVal is a function here because
    // it has to be a function to pass previous merges.
    return function mergedDataFn () {
      return mergeData(
        typeof childVal === 'function' ? childVal.call(this, this) : childVal,
        typeof parentVal === 'function' ? parentVal.call(this, this) : parentVal
      )
    }
  } else {
    return function mergedInstanceDataFn () {
      // instance merge
      const instanceData = typeof childVal === 'function'
        ? childVal.call(vm, vm)
        : childVal
      const defaultData = typeof parentVal === 'function'
        ? parentVal.call(vm, vm)
        : parentVal
      if (instanceData) {
        return mergeData(instanceData, defaultData)
      } else {
        return defaultData
      }
    }
  }
}
```
