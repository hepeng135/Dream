
### normalizeProps函数作用
> 处理当前组件的props，将不同格式的props处理成一样的，得到的结果如下
> ```
> //当前声明组件时的props
> props:[name,age]
> prps:{
>   job:{type:Object,default:'weber'},
>   address:String
> }
> //经过处理后的 
> options.props={
>   name:{type:null},
>   age:{type:null},
>   job:{type:Object,default:'weber'},
>   address:{type:String}
> }
> 
> ```

#### 参数列表
* options：当前组件选项。
* vm ：当前组件的实例

```
function normalizeProps (options: Object, vm: ?Component) {
  //获取当前options上的props
  const props = options.props
  if (!props) return
  const res = {}
  let i, val, name
  //判断当前props是否数组
  if (Array.isArray(props)) {
    i = props.length
    //递减循环，从最后一个开始，最先申明的权重最高
    while (i--) {
      val = props[i]
      if (typeof val === 'string') {
        //camelize：将prop-name 转换成 propName 
        //获取当前props中的值，作为key,然后val为一个json，显示当前字段的类型，没有则用null
        name = camelize(val)
        res[name] = { type: null }
      }
    }
  } else if (isPlainObject(props)) {//判断当前props是否json
    for (const key in props) {
      val = props[key]
      name = camelize(key)
      res[name] = isPlainObject(val)//判断当前val是不是json，比如props:{name:{type:String,default:'hepeng'}}这种
        ? val
        : { type: val }
    }
  }
//将props更新为处理后的结果
  options.props = res
}

```