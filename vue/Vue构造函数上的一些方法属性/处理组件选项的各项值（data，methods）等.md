###  处理组件的options上的一些选项值
> 代码采集文件:src/core/util/options.js
>
#### 参数列表
>* parentVal：父组件的option对应key的值
>* childVal：当前组件的option对应key的值
>* vm:当前组件的实例
```
strats.data=function (
  parentVal: any,
  childVal: any,
  vm?: Component
): ?Function {
  if (!vm) {
    return mergeDataOrFn(parentVal, childVal)
  }
  return mergeDataOrFn(parentVal, childVal, vm)
}

//ASSET_TYPES=>['component','directive','filter']
//strats上添加 components/directives/filters
ASSET_TYPES.forEach(function (type) {
  strats[type + 's'] = mergeAssets
})

//将传进来的options对应的val作为res的_proto_ 既，res这个实例的原型
function mergeAssets (parentVal: ?Object,childVal: ?Object,vm?: Component,key: string): Object {
  const res = Object.create(parentVal || null)
  if (childVal) {
    return extend(res, childVal)
  } else {
    return res
  }
}


//合并data或者函数
export function mergeDataOrFn (
  parentVal: any,
  childVal: any,
  vm?: Component
): ?Function {
  if (!vm) {
    if (!childVal) {
      return parentVal
    }
    if (!parentVal) {
      return childVal
    }
   
    return function mergedDataFn () {
      return mergeData(
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

function mergeData (to: Object, from: ?Object): Object {
  if (!from) return to
  let key, toVal, fromVal

  const keys = hasSymbol
    ? Reflect.ownKeys(from)
    : Object.keys(from)

  for (let i = 0; i < keys.length; i++) {
    key = keys[i]
    // in case the object is already observed...
    if (key === '__ob__') continue
    toVal = to[key]
    fromVal = from[key]
    if (!hasOwn(to, key)) {
      set(to, key, fromVal)
    } else if (
      toVal !== fromVal &&
      isPlainObject(toVal) &&
      isPlainObject(fromVal)
    ) {
      mergeData(toVal, fromVal)
    }
  }
  return to
}

```