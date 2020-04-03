
合并Object;
函数的具体功能：

没写完，需要结合extend这个方法一起去看。

```
/*
parent:当前构造函数上的options函数，

*/
export function mergeOptions (
  parent: Object,
  child: Object,
  vm?: Component
): Object {
    //当前假如是运用extend 或者 component 定义的组件
  if (typeof child === 'function') {
    child = child.options
  }
  normalizeProps(child, vm)
  normalizeInject(child, vm)
  normalizeDirectives(child)

  if (!child._base) {
    if (child.extends) {
      parent = mergeOptions(parent, child.extends, vm)
    }
    if (child.mixins) {
      for (let i = 0, l = child.mixins.length; i < l; i++) {
        parent = mergeOptions(parent, child.mixins[i], vm)
      }
    }
  }

  const options = {}
  let key
  for (key in parent) {
    mergeField(key)
  }
  for (key in child) {
    if (!hasOwn(parent, key)) {
      mergeField(key)
    }
  }
  function mergeField (key) {
    const strat = strats[key] || defaultStrat
    options[key] = strat(parent[key], child[key], vm, key)
  }
  return options
}

//处理props,统一返回
/*
{propName:{type: null | Val,default?:''}}  
*/
function normalizeProps (options: Object, vm: ?Component) {
  const props = options.props
  if (!props) return
  const res = {}
  let i, val, name
  if (Array.isArray(props)) {//=>['name','age']
    i = props.length
    //从尾部开始，相同的值，先定义的生效 
    while (i--) {
      val = props[i]
      if (typeof val === 'string') {
        //将case-ex处理成caseEx
        name = camelize(val)
        res[name] = { type: null }  //res=>{age:{type:null},name:{type:null}}
      }
    }
  } else if (isPlainObject(props)) {
    for (const key in props) {  //=>{name:[String],age:{type:String}}
      val = props[key]
      name = camelize(key)
      res[name] = isPlainObject(val)
        ? val
        : { type: val }  //res=>{name:{type:String},age:{type:String}}
    }
  }
  options.props = res
}

//inject （接口父组件provide提供的数据，详见API  provide/inject）
//inject  可以设置成  数组或者 {}
//数组  inject:['foo','bar']
//json  inject :{foo:{default:'foo'},bar1:{from:'bar',default:()=>[1,2,3]}}


function normalizeInject (options: Object, vm: ?Component) {
  const inject = options.inject//将值存起来
  if (!inject) return
  const normalized = options.inject = {} //重置清空
  if (Array.isArray(inject)) {
    for (let i = 0; i < inject.length; i++) {
        //=>{foo:{from:'foo'}}
      normalized[inject[i]] = { from: inject[i] }  
    }
  } else if (isPlainObject(inject)) {
    for (const key in inject) {
      const val = inject[key]
        // =>{foo:{from:key,default:''}}
      normalized[key] = isPlainObject(val)
        ? extend({ from: key }, val)
        : { from: val }
    }
  }
}

```