
#### 参数列表
>* Ctor: 当前实例的构造函数。

```
export function resolveConstructorOptions (Ctor: Class<Component>) {
  //获取构造函数上的options属性.
  let options = Ctor.options
  //判断当前是否有super属性，Ctor.super指向当前父类的构造函数。
  //当前没有的话就证明当前的Ctor是Vue这个基类的构造函数。
  if (Ctor.super) {
    
    //递归获取当前父类构造函数options,最后获取到Vue构造函数的options
    const superOptions = resolveConstructorOptions(Ctor.super)

    当前父级的options
    const cachedSuperOptions = Ctor.superOptions
    
    if (superOptions !== cachedSuperOptions) {
      
      Ctor.superOptions = superOptions
      
      const modifiedOptions = resolveModifiedOptions(Ctor)
      
      if (modifiedOptions) {
        extend(Ctor.extendOptions, modifiedOptions)
      }
      options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions)

      if (options.name) {
        options.components[options.name] = Ctor
      }
    }
  }
  return options
}


```