### normalizeInject函数的作用
> 首先provide/inject是成对出现的，既 provide:父组件向子组件提供数据，inject：子组件注入对应的数据
>
>```
>//在父组件提供(可以是一个Object，或者由一个函数返回的Object)
>
>provide:()=>{name:'hepeng',age:'18',job:'weber'}
>provide:{name:'hepeng',age:'18',job:'weber'}
>
>//在组件中声明时，数组或者json
>
>inject:['name','age']
>inject:{
>   _name:{from:'name',default:'_hp'},
>   _age:{from:'age',default:'0'},
>   job:'job'
>}
>```
>//经过处理后
>option.inject={
>   name:{from:'name'},//当是数组时
>   _age:{from:'age',default:'0'},
>   job:{from:'job'} 
>}
>
>

#### 参数列表
* options：当前组件选项。
* vm ：当前组件的实例

```
function normalizeInject (options: Object, vm: ?Component) {
   //获取inject
  const inject = options.inject
  if (!inject) return//判断是否存在，是否需要处理
  const normalized = options.inject = {}
  if (Array.isArray(inject)) {//判断当前的inject是否数组
    for (let i = 0; i < inject.length; i++) {
      normalized[inject[i]] = { from: inject[i] }
    }
  } else if (isPlainObject(inject)) {
    for (const key in inject) {
      const val = inject[key]
      normalized[key] = isPlainObject(val)
        ? extend({ from: key }, val)
        : { from: val }
    }
  }
}


```