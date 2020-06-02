
####函数作用
    获取inject中对应key在父级集合中provide的对应value,并对inject的属性添加getter,setter。

####函数内部调用

>* 1：toggleObserving(false) 将shouldObserver设置成false，表示当前的json中的val不会再内嵌json或者array,不用进行递归
>* 2：循环调用defineReactive，给每个key添加getter,setter实现Observer
>* 3：toggleObserving(true)添加完成后将shouldObserver恢复为true
```
export function initInjections (vm: Component) {
//获取一个新的对象，injectKey 与 injectVal
  const result = resolveInject(vm.$options.inject, vm)
  if (result) {
    //因为inject在定义的时候不存在json中套用json，每个key对应一个String | Number | Bollean
    //既调用toggleObserving将shouldObserver设置为false。
    toggleObserving(false)
    Object.keys(result).forEach(key => {
        defineReactive(vm, key, result[key])
    })
    toggleObserving(true)
  }
}

```
#### 参数列表
>* @params inject:当前注入该组件的数据，选项在初始化options时已经统一经过处理成 key:{from:'ProvideKey',default:''} 
>* @params vm:当前组件实例

```
export function resolveInject (inject: any, vm: Component): ?Object {
  if (inject) {
    const result = Object.create(null)
    //获取当前inject的key组成的数组
    const keys = hasSymbol ? Reflect.ownKeys(inject) : Object.keys(inject);

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      //判断当前属性是否__ob__
      if (key === '__ob__') continue
      const provideKey = inject[key].from// 获取inject中key对应的provide
      let source = vm
        //递进查找拥有provideKey的provide，一直到root级
      while (source) {
        if (source._provided && hasOwn(source._provided, provideKey)) {
          result[key] = source._provided[provideKey]
          break
        }
        source = source.$parent
      }
       //如果当前没有找到目标provide,则执行默认的default
      if (!source) {
        if ('default' in inject[key]) {
          const provideDefault = inject[key].default
          result[key] = typeof provideDefault === 'function'
            ? provideDefault.call(vm)
            : provideDefault
        } else if (process.env.NODE_ENV !== 'production') {
          warn(`Injection "${key}" not found`, vm)
        }
      }
    }
    return result
  }
}
```