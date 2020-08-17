我们以data数据为例

1. 获取组件实例选项中对应的data项，是函数的话就进行执行，同时vm._data指向这个函数返回的结果
```
let data = vm.$options.data
  data = vm._data = typeof data === 'function'
    ? getData(data, vm)   //这里的getData就是执行data函数，既data.call(vm,vm)
    : data || {}
```
2：对获取到的data数据进行代理，直接代理到当前的组件的实例上。
```
const keys = Object.keys(data)
let i = keys.length
while (i--) {
    proxy(vm, `_data`, key)
}
function proxy (target: Object, sourceKey: string, key: string) {
    sharedPropertyDefinition.get = function proxyGetter () {
        return this[sourceKey][key]
    }
    sharedPropertyDefinition.set = function proxySetter (val) {
        this[sourceKey][key] = val
    }
    Object.defineProperty(target, key, sharedPropertyDefinition)
}


```
3:对data进行数据劫持
 
 * 调用observer函数，判断当前data是否拥有__ob__属性,没有的话就调用new Observer(data)
    
 * 实例化Observer。记录value，this.value=data,实例化dep：this.dep=new Dep(),
   然后给data上创建一个__ob__属性指向当前实例,判断当前数据类型，看是数组还是json，调用不同的数据劫持方法，
   json->调用walk方法，array->调用observeArray方法
   
   
   
 * json->defineReactive(循环json，每个属性调用defineReactive)  
   
 *   
   
   
```
observe(vm._data = {}, true /* asRootData */)

function observe (value: any, asRootData: ?boolean): Observer | void {
    //判断是否对象  或者 是否Vnode的实例
    if (!isObject(value) || value instanceof VNode) {
        return
    }
    let ob: Observer | void
    //判断当前是否拥有__ob__属性，并且__ob__对应的实例是否Observer的实例
    if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
        ob = value.__ob__
    } else if (
        //shouldObserve:是否必须调用Observer这个构造函数，默认为true，通过toggleObserving函数改变状态
        //isServerRendering:当前是否在服务端
        //Object.isExtensible(target) 判断当前目标对象是否可扩展。
        shouldObserve && !isServerRendering() && 
        (Array.isArray(value) || isPlainObject(value)) 
        && Object.isExtensible(value) && !value._isVue
    ) {
        ob = new Observer(value)
    }
    if (asRootData && ob) {
        ob.vmCount++
    }
    return ob
}
//Observer构造函数
//创建一个dep实例，然后判断当前value是数字还是json，然后添加响应式getter，setter
export class Observer {
       
    constructor (value: any) {
    this.value = value
    this.dep = new Dep()//实例化dep
    this.vmCount = 0
    //给这个属性添加__ob__属性，指向这个Observer实例
    def(value, '__ob__', this)
    if (Array.isArray(value)) {
        if (hasProto) {//兼容处理
            protoAugment(value, arrayMethods)
        } else {
            copyAugment(value, arrayMethods, arrayKeys)
        }
        this.observeArray(value)
    } else {
        this.walk(value)
    }
}
    
/**
* Walk through all properties and convert them into
* getter/setters. This method should only be called when
* value type is Object.
*/
walk (obj: Object) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
        defineReactive(obj, keys[i])
    }
}
//添加getter,setter
export function defineReactive (
  obj: Object,
  key: string,
  val: any,
  customSetter?: ?Function,
  shallow?: boolean
) {
  const dep = new Dep()

  //获取当前对象对应key的属性描述符，并判断当前configurable，表示当前属性是否可以重新定义或者删除。
  const property = Object.getOwnPropertyDescriptor(obj, key)
  if (property && property.configurable === false) {
    return
  }

  // cater for pre-defined getter/setters
  //获取自定义的get和set
  const getter = property && property.get
  const setter = property && property.set
  if ((!getter || setter) && arguments.length === 2) {
    val = obj[key]
  }

  //对象进行递归添加Observer，对象中包括对象的情况
  //1:inject，语法规定呢样式，既不存在需要递归，既shouldObserve为false。
  let childOb = !shallow && observe(val);

  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      const value = getter ? getter.call(obj) : val;
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
```


